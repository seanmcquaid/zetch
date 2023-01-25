import { setupServer } from 'msw/node';
import { rest } from 'msw';
import { request } from '../request';
import { z } from 'zod';
import { afterEach } from 'vitest';
import ZetchError from '../ZetchError';
import 'isomorphic-fetch';

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
          await request({
            url: '/posts',
            baseZetchConfig: {
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
            method: 'GET',
          });
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

        try {
          await request({
            url: '/posts',
            baseZetchConfig: {
              baseUrl: 'https://jsonplaceholder.typicode.com',
              retriesConfig: {
                retryStatuses: [401],
              },
            },
            method: 'GET',
          });
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
        await request({
          url: '/posts',
          baseZetchConfig: {
            baseUrl: 'https://jsonplaceholder.typicode.com',
          },
          method: 'GET',
        });
      } catch (e) {
        expect(e).toBeInstanceOf(ZetchError);
      }
    });
    it('logs api error if request fails and logApiError func is provided', async () => {
      const logApiError = vi.fn();
      mswServer.use(
        rest.get(
          'https://jsonplaceholder.typicode.com/posts',
          (req, res, context) => {
            return res(context.status(500), context.json({}));
          }
        )
      );
      try {
        await request({
          url: '/posts',
          baseZetchConfig: {
            baseUrl: 'https://jsonplaceholder.typicode.com',
            logApiError,
          },
          method: 'GET',
        });
      } catch (e) {
        expect(logApiError).toHaveBeenCalled();
      }
    });
    it('only retries to the max number of times configured in the baseConfig', async () => {
      mswServer.use(
        rest.get(
          'https://jsonplaceholder.typicode.com/posts',
          (req, res, context) => {
            return res(context.status(500), context.json({}));
          }
        )
      );
      try {
        await request({
          url: '/posts',
          baseZetchConfig: {
            baseUrl: 'https://jsonplaceholder.typicode.com',
            retriesConfig: {
              numberOfRetries: 2,
              retryStatuses: [500],
            },
          },
          method: 'GET',
        });
      } catch (e) {
        const error = e as ZetchError;
        expect(error.requestInfo.numberOfRetries).toEqual(2);
      }
    });
  });
  describe('request success', () => {
    it('returns data if successful', async () => {
      const response = await request({
        url: '/posts',
        requestConfig: {
          validationSchema: z.array(
            z.object({
              title: z.string(),
              body: z.string(),
              id: z.number(),
              userId: z.number(),
            })
          ),
        },
        baseZetchConfig: { baseUrl: 'https://jsonplaceholder.typicode.com' },
        method: 'GET',
      });

      expect(response.data).toEqual([
        { title: 'example', body: 'body', id: 1, userId: 2 },
      ]);
    });
    it('logs api validation error if the schema does not match the data', async () => {
      const logApiValidationError = vi.fn();

      await request({
        url: '/posts',
        requestConfig: {
          validationSchema: z.object({
            title: z.string(),
            body: z.string(),
            id: z.number(),
            userId: z.number(),
          }),
        },
        baseZetchConfig: {
          baseUrl: 'https://jsonplaceholder.typicode.com',
          logApiValidationError,
        },
        method: 'GET',
      });

      expect(logApiValidationError).toHaveBeenCalled();
    });
  });
});
