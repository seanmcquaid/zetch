import { ZodFirstPartySchemaTypes } from 'zod/lib/types';
import {
  BaseZetchConfig,
  ZetchError,
  ZetchRequestConfig,
  Headers,
} from './createZetchClient';

type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export const request = async <
  ValidationSchema extends ZodFirstPartySchemaTypes
>(
  url: string,
  requestConfig: ZetchRequestConfig<ValidationSchema>,
  baseZetchConfig: BaseZetchConfig,
  method: Method = 'GET',
  retries = 0
): Promise<{
  data: ValidationSchema['_output'];
  requestConfig: ZetchRequestConfig<ValidationSchema>;
  url: string;
  numberOfRetries: number;
  headers: Headers;
}> => {
  const maxNumberOfRetries = baseZetchConfig?.retriesConfig?.numberOfRetries
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
      baseZetchConfig.retriesConfig.retryStatuses.includes(response.status)
    ) {
      if (maxNumberOfRetries > retries) {
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
            { ...requestConfig, headers: updatedHeaders },
            baseZetchConfig,
            method,
            numberOfAttemptedRetries
          );
        } else {
          return request(
            url,
            { ...requestConfig, headers },
            baseZetchConfig,
            method,
            numberOfAttemptedRetries
          );
        }
      }
    }
    const error = new ZetchError(
      {
        message: response.statusText,
        data,
        statusCode: response.status,
      },
      {
        requestConfig,
        url,
        numberOfRetries: retries,
        headers,
      }
    );

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

  return {
    data,
    headers,
    requestConfig,
    url: baseZetchConfig.baseUrl + url,
    numberOfRetries: retries,
  };
};
