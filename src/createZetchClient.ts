import { ZodFirstPartySchemaTypes } from 'zod/lib/types';
import { request } from './request';
import ZetchRequestConfig from './types/ZetchRequestConfig';
import Headers from './types/Headers';
import BaseZetchConfig from './types/BaseZetchConfig';
import { z } from 'zod';

const getData = <ValidationSchema extends ZodFirstPartySchemaTypes>(
  promise: Promise<{
    data: ValidationSchema['_output'];
    requestConfig: ZetchRequestConfig<ValidationSchema>;
    url: string;
    numberOfRetries: number;
    headers: Headers;
  }>
) => {
  return promise.then(response => response.data);
};

const createZetchClient = (zetchConfig: BaseZetchConfig) => {
  return {
    get: <ValidationSchema extends ZodFirstPartySchemaTypes>(
      url: string,
      requestConfig: ZetchRequestConfig<ValidationSchema>
    ) => {
      return getData(request(url, requestConfig, zetchConfig));
    },
    post: <ValidationSchema extends ZodFirstPartySchemaTypes>(
      url: string,
      requestConfig: ZetchRequestConfig<ValidationSchema>
    ) => {
      return getData(request(url, requestConfig, zetchConfig, 'POST'));
    },
    put: <ValidationSchema extends ZodFirstPartySchemaTypes>(
      url: string,
      requestConfig: ZetchRequestConfig<ValidationSchema>
    ) => {
      return getData(request(url, requestConfig, zetchConfig, 'PUT'));
    },
    patch: <ValidationSchema extends ZodFirstPartySchemaTypes>(
      url: string,
      requestConfig: ZetchRequestConfig<ValidationSchema>
    ) => {
      return getData(request(url, requestConfig, zetchConfig, 'PATCH'));
    },
    delete: <ValidationSchema extends ZodFirstPartySchemaTypes>(
      url: string,
      requestConfig: ZetchRequestConfig<ValidationSchema>
    ) => {
      return getData(request(url, requestConfig, zetchConfig, 'DELETE'));
    },
  };
};

const zetchClient = createZetchClient({
  baseUrl: 'https://jsonplaceholder.typicode.com',
});

const postSchema = z.object({
  title: z.string(),
  body: z.string(),
  id: z.number(),
  userId: z.number(),
});

const result = await zetchClient.get('/posts', {
  validationSchema: z.array(postSchema),
});

export default createZetchClient;
