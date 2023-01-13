import { ZodError } from 'zod';
import { ZodFirstPartySchemaTypes } from 'zod/lib/types';

interface Headers {
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

type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface ZetchRequestConfig<
  ValidationSchema extends ZodFirstPartySchemaTypes
> {
  validationSchema?: ValidationSchema;
  isRetry?: boolean;

  headers?: Headers;

  body?: any;

  abortController?: AbortController;
}

export class ZetchError extends Error {
  statusCode: number;
  data: any;
  constructor(errorInfo: { message: string; statusCode: number; data: any }) {
    super(errorInfo.message);
    this.statusCode = errorInfo.statusCode;
    this.data = errorInfo.data;
  }

  static isZetchError(error: unknown): error is ZetchError {
    return error instanceof ZetchError;
  }

  toObject() {
    return {
      message: this.message,
      statusCode: this.statusCode,
      data: this.data,
    };
  }
}

const request = async <ValidationSchema extends ZodFirstPartySchemaTypes>(
  url: string,
  requestConfig: ZetchRequestConfig<ValidationSchema>,
  baseZetchConfig: BaseZetchConfig,
  method: Method = 'GET',
  retries = 0
): Promise<ValidationSchema['_output']> => {
  const numberOfRetries = baseZetchConfig?.retriesConfig?.numberOfRetries
    ? baseZetchConfig.retriesConfig.numberOfRetries
    : 1;
  const headers: Headers = baseZetchConfig.authConfig
    ? {
        ...baseZetchConfig.headers,
        ...requestConfig.headers,
        Authorization: `${baseZetchConfig.authConfig.tokenScheme} ${baseZetchConfig.authConfig.token}`,
      }
    : { ...baseZetchConfig.headers, ...requestConfig.headers };
  const response = await fetch(baseZetchConfig.baseUrl + url, {
    headers,
    body: requestConfig.body,
    signal: requestConfig.abortController?.signal,
  });
  const data = await response.json();
  if (!response.ok) {
    if (
      baseZetchConfig.retriesConfig &&
      baseZetchConfig.retriesConfig.retryStatuses.includes(response.status) &&
      numberOfRetries > retries
    ) {
      if (!requestConfig.isRetry) {
        const numberOfAttemptedRetries = retries + 1;
        if (baseZetchConfig.authConfig) {
          const refreshedToken =
            await baseZetchConfig.authConfig?.refreshToken();
          const updatedHeaders: Headers = {
            ...headers,
            Authorization: `${baseZetchConfig.authConfig?.tokenScheme} ${refreshedToken}`,
          };
          return request(
            url,
            { ...requestConfig, isRetry: true, headers: updatedHeaders },
            baseZetchConfig,
            method,
            numberOfAttemptedRetries
          );
        } else {
          return request(
            url,
            { ...requestConfig, isRetry: true, headers },
            baseZetchConfig,
            method,
            numberOfAttemptedRetries
          );
        }
      }
    }
    const error = new ZetchError({
      message: response.statusText,
      data,
      statusCode: response.status,
    });

    if (baseZetchConfig.logApiError) {
      baseZetchConfig.logApiError(error);
    }

    throw error;
  }

  if (requestConfig.validationSchema) {
    const validationResults = requestConfig.validationSchema?.safeParse(data);
    if (!validationResults?.success && baseZetchConfig?.logApiValidationError) {
      baseZetchConfig.logApiValidationError(validationResults.error);
    }
  }

  return data;
};

export const createZetchClient = (zetchConfig: BaseZetchConfig) => {
  return {
    get: <ValidationSchema extends ZodFirstPartySchemaTypes>(
      url: string,
      requestConfig: ZetchRequestConfig<ValidationSchema>
    ) => {
      return request(url, requestConfig, zetchConfig);
    },
    post: <ValidationSchema extends ZodFirstPartySchemaTypes>(
      url: string,
      requestConfig: ZetchRequestConfig<ValidationSchema>
    ) => {
      return request(url, requestConfig, zetchConfig, 'POST');
    },
    put: <ValidationSchema extends ZodFirstPartySchemaTypes>(
      url: string,
      requestConfig: ZetchRequestConfig<ValidationSchema>
    ) => {
      return request(url, requestConfig, zetchConfig, 'PUT');
    },
    patch: <ValidationSchema extends ZodFirstPartySchemaTypes>(
      url: string,
      requestConfig: ZetchRequestConfig<ValidationSchema>
    ) => {
      return request(url, requestConfig, zetchConfig, 'PATCH');
    },
    delete: <ValidationSchema extends ZodFirstPartySchemaTypes>(
      url: string,
      requestConfig: ZetchRequestConfig<ValidationSchema>
    ) => {
      return request(url, requestConfig, zetchConfig, 'DELETE');
    },
  };
};
