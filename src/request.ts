import { ZodFirstPartySchemaTypes } from 'zod/lib/types';
import ZetchRequestConfig from './types/ZetchRequestConfig';
import BaseZetchConfig from './types/BaseZetchConfig';
import Headers from './types/Headers';
import ZetchError from './ZetchError';
import { z } from 'zod';

type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export const request = async <
  ValidationSchema extends ZodFirstPartySchemaTypes
>({
  url,
  requestConfig,
  baseZetchConfig,
  method,
  retries = 0,
}: {
  url: string;
  requestConfig?: ZetchRequestConfig<ValidationSchema>;
  baseZetchConfig: BaseZetchConfig;
  method: Method;
  retries?: number;
}): Promise<{
  data: z.infer<ValidationSchema>;
  requestConfig?: ZetchRequestConfig<ValidationSchema>;
  url: string;
  numberOfRetries: number;
  headers: Headers;
}> => {
  const maxNumberOfRetries = baseZetchConfig?.retriesConfig?.numberOfRetries
    ? baseZetchConfig.retriesConfig.numberOfRetries
    : 1;
  const body = requestConfig?.body
    ? requestConfig?.body instanceof FormData
      ? requestConfig?.body
      : JSON.stringify(requestConfig?.body)
    : undefined;
  const headers: Headers = baseZetchConfig.authConfig
    ? {
        ...baseZetchConfig.headers,
        ...requestConfig?.headers,
        Authorization: `${baseZetchConfig.authConfig.tokenScheme} ${baseZetchConfig.authConfig.token}`,
      }
    : { ...baseZetchConfig.headers, ...requestConfig?.headers };
  const response = await fetch(baseZetchConfig.baseUrl + url, {
    headers,
    body,
    signal: requestConfig?.abortController?.signal,
    method,
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
          return request({
            url,
            requestConfig: { ...requestConfig, headers: updatedHeaders },
            baseZetchConfig,
            method,
            retries: numberOfAttemptedRetries,
          });
        } else {
          return request({
            url,
            requestConfig: { ...requestConfig, headers },
            baseZetchConfig,
            method,
            retries: numberOfAttemptedRetries,
          });
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

  if (requestConfig?.validationSchema) {
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
