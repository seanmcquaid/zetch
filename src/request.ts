import { ZodFirstPartySchemaTypes } from 'zod/lib/types';
import ZetchRequestConfig from './types/ZetchRequestConfig';
import ZetchClientConfig from './types/ZetchClientConfig';
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
  baseZetchConfig?: ZetchClientConfig;
  method: Method;
  retries?: number;
}): Promise<{
  data: z.infer<ValidationSchema>;
  requestConfig?: ZetchRequestConfig<ValidationSchema>;
  url: string;
  numberOfRetries: number;
  headers: Headers;
}> => {
  const retriesConfig =
    requestConfig?.retriesConfig ?? baseZetchConfig?.retriesConfig;
  const maxNumberOfRetries = retriesConfig?.numberOfRetries ?? 1;
  const body = requestConfig?.body
    ? requestConfig?.body instanceof FormData
      ? requestConfig?.body
      : JSON.stringify(requestConfig?.body)
    : undefined;
  const authConfig = requestConfig?.authConfig ?? baseZetchConfig?.authConfig;
  const headers: Headers = authConfig
    ? {
        ...baseZetchConfig?.headers,
        ...requestConfig?.headers,
        Authorization: `${authConfig.tokenScheme} ${authConfig.token}`,
      }
    : { ...baseZetchConfig?.headers, ...requestConfig?.headers };
  const response = await fetch(`${baseZetchConfig?.baseUrl ?? ''}${url}`, {
    headers,
    body,
    signal: requestConfig?.abortController?.signal,
    method,
  });
  const data = await response.json();
  if (!response.ok) {
    if (
      retriesConfig &&
      retriesConfig.retryStatuses.includes(response.status)
    ) {
      if (maxNumberOfRetries > retries) {
        const numberOfAttemptedRetries = retries + 1;
        if (authConfig) {
          const refreshedToken = await authConfig.refreshToken();
          const updatedHeaders: Headers = {
            ...headers,
            Authorization: `${authConfig.tokenScheme} ${refreshedToken}`,
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
        url,
        numberOfRetries: retries,
        headers,
        body: requestConfig?.body,
      }
    );

    const onApiError = requestConfig?.onApiError ?? baseZetchConfig?.onApiError;

    if (onApiError) {
      onApiError(error);
    }

    throw error;
  }

  const onApiValidationError =
    requestConfig?.onApiValidationError ??
    baseZetchConfig?.onApiValidationError;

  if (requestConfig?.validationSchema) {
    const validationResults = requestConfig.validationSchema?.safeParse(data);
    if (!validationResults?.success && onApiValidationError) {
      onApiValidationError(validationResults.error);
    }
  }

  return {
    data,
    headers,
    requestConfig,
    url: `${baseZetchConfig?.baseUrl ?? ''}${url}`,
    numberOfRetries: retries,
  };
};
