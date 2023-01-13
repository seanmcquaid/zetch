import { setupServer } from 'msw/node';
import { rest } from 'msw';
import { request } from '../request';
import { z } from 'zod';
import { fetch } from 'cross-fetch';
import { ZetchError } from '../createZetchClient';
import { afterEach } from 'vitest';

global.fetch = fetch;

const mswServer = setupServer(
  rest.get(
    'https://jsonplaceholder.typicode.com/posts',
    (req, res, context) => {
      return res(
        context.status(200),
        context.json([{ title: 'example', body: 'body', id: 1, userId: 2 }])
      );
    }
  )
);

describe('request', () => {
  beforeEach(() => {
    mswServer.listen();
  });
  afterEach(() => {
    mswServer.resetHandlers();
  });
  afterAll(() => {
    mswServer.close();
  });
  describe('request failure', () => {
    describe('retries', () => {
      it('calls refresh token when retrying if an auth config is provided', async () => {
        mswServer.use(
          rest.get(
            'https://jsonplaceholder.typicode.com/posts',
            (req, res, context) => {
              return res(context.status(401), context.json({}));
            }
          )
        );

        const refreshToken = vi.fn();

        try {
          await request(
            '/posts',
            {},
            {
              baseUrl: 'https://jsonplaceholder.typicode.com',
              authConfig: {
                refreshToken,
                token: 'token',
                tokenScheme: 'Bearer',
              },
              retriesConfig: {
                retryStatuses: [401],
              },
            },
            'GET'
          );
        } catch (e) {
          expect(e).toBeInstanceOf(ZetchError);
          const error = e as ZetchError;
          expect(error.toObject().request.numberOfRetries).toEqual(1);
          expect(refreshToken).toHaveBeenCalled();
        }
      });
      it('retries if an error happens and it matches the status code', async () => {
        mswServer.use(
          rest.get(
            'https://jsonplaceholder.typicode.com/posts',
            (req, res, context) => {
              return res(context.status(401), context.json({}));
            }
          )
        );

        const refreshToken = vi.fn();

        try {
          await request(
            '/posts',
            {},
            {
              baseUrl: 'https://jsonplaceholder.typicode.com',
              retriesConfig: {
                retryStatuses: [401],
              },
            },
            'GET'
          );
        } catch (e) {
          expect(e).toBeInstanceOf(ZetchError);
          const error = e as ZetchError;
          expect(error.toObject().request.numberOfRetries).toEqual(1);
        }
      });
    });
    it('throws ZetchError if request fails', async () => {
      mswServer.use(
        rest.get(
          'https://jsonplaceholder.typicode.com/posts',
          (req, res, context) => {
            return res(context.status(500), context.json({}));
          }
        )
      );
      try {
        await request(
          '/posts',
          {},
          {
            baseUrl: 'https://jsonplaceholder.typicode.com',
          },
          'GET',
          0
        );
      } catch (e) {
        expect(e).toBeInstanceOf(ZetchError);
      }
    });
  });
  describe('request success', () => {
    it('returns data if successful', async () => {
      const response = await request(
        '/posts',
        {
          validationSchema: z.array(
            z.object({
              title: z.string(),
              body: z.string(),
              id: z.number(),
              userId: z.number(),
            })
          ),
        },
        { baseUrl: 'https://jsonplaceholder.typicode.com' },
        'GET',
        0
      );

      expect(response.data).toEqual([
        { title: 'example', body: 'body', id: 1, userId: 2 },
      ]);
    });
    it('logs api validation error if the schema does not match the data', async () => {
      const logApiValidationError = vi.fn();

      await request(
        '/posts',
        {
          validationSchema: z.object({
            title: z.string(),
            body: z.string(),
            id: z.number(),
            userId: z.number(),
          }),
        },
        {
          baseUrl: 'https://jsonplaceholder.typicode.com',
          logApiValidationError,
        },
        'GET',
        0
      );

      expect(logApiValidationError).toHaveBeenCalled();
    });
  });
});
