import { ZodError } from 'zod';
import { ZodFirstPartySchemaTypes } from 'zod/lib/types';
import { request } from './request';

export interface Headers {
  [key: string]: string;
}

type TokenScheme = 'Basic' | 'Bearer' | 'JWTBearer';

export interface BaseZetchConfig {
  headers?: Headers;

  authConfig?: {
    refreshToken: () => Promise<string>;
    tokenScheme: TokenScheme;
    token: string;
  };

  retriesConfig?: {
    retryStatuses: number[];

    numberOfRetries?: number;
  };
  logApiError?: (error: ZetchError) => void;

  logApiValidationError?: (error: ZodError) => void;

  baseUrl: string;
}
export interface ZetchRequestConfig<
  ValidationSchema extends ZodFirstPartySchemaTypes
> {
  validationSchema?: ValidationSchema;
  headers?: Headers;

  body?: any;

  abortController?: AbortController;
}

export class ZetchError extends Error {
  errorInfo: { message: string; statusCode: number; data: any };

  requestInfo: {
    requestConfig: ZetchRequestConfig<ZodFirstPartySchemaTypes>;
    url: string;
    numberOfRetries: number;
    headers: Headers;
  };
  constructor(
    errorInfo: { message: string; statusCode: number; data: any },
    requestInfo: {
      requestConfig: ZetchRequestConfig<ZodFirstPartySchemaTypes>;
      url: string;
      numberOfRetries: number;
      headers: Headers;
    }
  ) {
    super(errorInfo.message);
    this.errorInfo = errorInfo;
    this.requestInfo = requestInfo;
  }

  static isZetchError(error: unknown): error is ZetchError {
    return error instanceof ZetchError;
  }

  toObject() {
    return {
      error: this.errorInfo,
      request: this.requestInfo,
    };
  }
}

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

export const createZetchClient = (zetchConfig: BaseZetchConfig) => {
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
