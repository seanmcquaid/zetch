import { ZodFirstPartySchemaTypes } from 'zod/lib/types';
import { request } from './request';
import ZetchRequestConfig, {
  ZetchGetRequestConfig,
} from './types/ZetchRequestConfig';
import Headers from './types/Headers';
import BaseZetchConfig from './types/BaseZetchConfig';
const getData = <ValidationSchema extends ZodFirstPartySchemaTypes>(
  promise: Promise<{
    data: ValidationSchema['_output'];
    requestConfig?: ZetchRequestConfig<ValidationSchema>;
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

export default createZetchClient;
