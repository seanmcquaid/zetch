import { ZodFirstPartySchemaTypes } from 'zod/lib/types';
import { request } from './request';
import ZetchRequestConfig, {
  ZetchGetRequestConfig,
} from './types/ZetchRequestConfig';
import Headers from './types/Headers';
import ZetchClientConfig from './types/ZetchClientConfig';
import { z } from 'zod';

const getData = <ValidationSchema extends ZodFirstPartySchemaTypes>(
  promise: Promise<{
    data: z.infer<ValidationSchema>;
    requestConfig?: ZetchRequestConfig<ValidationSchema>;
    url: string;
    numberOfRetries: number;
    headers: Headers;
  }>
) => {
  return promise.then(response => response.data);
};

const createZetchClient = (zetchConfig: ZetchClientConfig) => {
  return {
    get: <ValidationSchema extends ZodFirstPartySchemaTypes>(
      url: string,
      requestConfig?: ZetchGetRequestConfig<ValidationSchema>
    ) => {
      return getData(
        request({
          url,
          requestConfig,
          baseZetchConfig: zetchConfig,
          method: 'GET',
        })
      );
    },
    post: <ValidationSchema extends ZodFirstPartySchemaTypes>(
      url: string,
      requestConfig?: ZetchRequestConfig<ValidationSchema>
    ) => {
      return getData(
        request({
          url,
          requestConfig,
          baseZetchConfig: zetchConfig,
          method: 'POST',
        })
      );
    },
    put: <ValidationSchema extends ZodFirstPartySchemaTypes>(
      url: string,
      requestConfig?: ZetchRequestConfig<ValidationSchema>
    ) => {
      return getData(
        request({
          url,
          requestConfig,
          baseZetchConfig: zetchConfig,
          method: 'PUT',
        })
      );
    },
    patch: <ValidationSchema extends ZodFirstPartySchemaTypes>(
      url: string,
      requestConfig?: ZetchRequestConfig<ValidationSchema>
    ) => {
      return getData(
        request({
          url,
          requestConfig,
          baseZetchConfig: zetchConfig,
          method: 'PATCH',
        })
      );
    },
    delete: <ValidationSchema extends ZodFirstPartySchemaTypes>(
      url: string,
      requestConfig?: ZetchRequestConfig<ValidationSchema>
    ) => {
      return getData(
        request({
          url,
          requestConfig,
          baseZetchConfig: zetchConfig,
          method: 'DELETE',
        })
      );
    },
  };
};

const zetch = {
  get: <ValidationSchema extends ZodFirstPartySchemaTypes>(
    url: string,
    requestConfig?: ZetchGetRequestConfig<ValidationSchema>
  ) => {
    return getData(
      request({
        url,
        requestConfig,
        method: 'GET',
      })
    );
  },
  post: <ValidationSchema extends ZodFirstPartySchemaTypes>(
    url: string,
    requestConfig?: ZetchRequestConfig<ValidationSchema>
  ) => {
    return getData(
      request({
        url,
        requestConfig,
        method: 'POST',
      })
    );
  },
  put: <ValidationSchema extends ZodFirstPartySchemaTypes>(
    url: string,
    requestConfig?: ZetchRequestConfig<ValidationSchema>
  ) => {
    return getData(
      request({
        url,
        requestConfig,
        method: 'PUT',
      })
    );
  },
  patch: <ValidationSchema extends ZodFirstPartySchemaTypes>(
    url: string,
    requestConfig?: ZetchRequestConfig<ValidationSchema>
  ) => {
    return getData(
      request({
        url,
        requestConfig,
        method: 'PATCH',
      })
    );
  },
  delete: <ValidationSchema extends ZodFirstPartySchemaTypes>(
    url: string,
    requestConfig?: ZetchRequestConfig<ValidationSchema>
  ) => {
    return getData(
      request({
        url,
        requestConfig,
        method: 'DELETE',
      })
    );
  },
  create: (zetchConfig: ZetchClientConfig) => createZetchClient(zetchConfig),
} as const;

export default zetch;
