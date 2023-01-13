import { AxiosError, AxiosRequestConfig } from 'axios';
import { ZodFirstPartySchemaTypes } from 'zod/lib/types';
import { ZodError } from 'zod';
import axios, { AxiosInstance } from 'axios';

type AxiodRequestConfig<ValidationSchema extends ZodFirstPartySchemaTypes> =
  Omit<AxiosRequestConfig, 'url' | 'method'> & {
    validationSchema?: ValidationSchema;
  };
const createApiClient = (
  baseURL: string,
  axiodConfig?: AxiodConfig
): AxiosInstance => {
  const axiosInstance = axios.create({
    baseURL,
  });

  axiosInstance.interceptors.request.use(async config => {
    if (axiodConfig?.authConfig) {
      config.headers = {
        ...axiodConfig?.headers,
        Authorization: `${axiodConfig.authConfig.tokenScheme} ${axiodConfig?.authConfig.token}`,
      };
    } else {
      config.headers = {
        ...axiodConfig?.headers,
      };
    }

    return config;
  });

  axiosInstance.interceptors.response.use(
    response => {
      if (response?.config?.validationSchema) {
        const validationResults = response?.config?.validationSchema?.safeParse(
          response.data
        );
        if (!validationResults?.success && axiodConfig?.logApiValidationError) {
          axiodConfig.logApiValidationError(validationResults.error);
        }
      }
      return response.data;
    },
    async (error: AxiosError) => {
      const originalRequest = error?.config;
      if (error?.response?.status) {
        if (
          axiodConfig?.retryStatuses?.includes(error.response.status) &&
          !originalRequest?._retry &&
          !!originalRequest
        ) {
          originalRequest._retry = true;
          if (axiodConfig?.authConfig) {
            const token = axiodConfig.authConfig.refreshToken();
            axiosInstance.defaults.headers.common[
              'Authorization'
            ] = `${axiodConfig.authConfig.tokenScheme} ${token};`;
          }
          return axiosInstance(originalRequest);
        }
      }
      if (axiodConfig?.logApiError) {
        axiodConfig.logApiError(error);
      }
      return Promise.reject(error);
    }
  );

  return axiosInstance;
};

export interface AxiodConfig {
  headers?: { [key: string]: string };

  authConfig?: {
    refreshToken: () => Promise<string>;
    tokenScheme: 'Basic' | 'Bearer' | 'JWTBearer';
    token: string;
  };

  retryStatuses?: number[];
  logApiError?: (error: AxiosError) => void;

  logApiValidationError?: (error: ZodError) => void;
}

const createAxiod = (axiodConfig?: AxiodConfig) => {
  return {
    createClient: (baseUrl: string) => {
      const client = createApiClient(baseUrl, axiodConfig);

      return {
        get: <ValidationSchema extends ZodFirstPartySchemaTypes>(
          url: string,
          config?: AxiodRequestConfig<ValidationSchema>
        ) => client.get<ValidationSchema['_output']>(url, config),
        delete: <ValidationSchema extends ZodFirstPartySchemaTypes>(
          url: string,
          config?: AxiodRequestConfig<ValidationSchema>
        ) => client.delete<ValidationSchema['_output']>(url, config),
        head: <ValidationSchema extends ZodFirstPartySchemaTypes>(
          url: string,
          config?: AxiodRequestConfig<ValidationSchema>
        ) => client.head<ValidationSchema['_output']>(url, config),
        post: <ValidationSchema extends ZodFirstPartySchemaTypes>(
          url: string,
          data?: any,
          config?: AxiodRequestConfig<ValidationSchema>
        ) => client.post<ValidationSchema['_output']>(url, data, config),
        put: <ValidationSchema extends ZodFirstPartySchemaTypes>(
          url: string,
          data?: any,
          config?: AxiodRequestConfig<ValidationSchema>
        ) => client.put<ValidationSchema['_output']>(url, data, config),
        patch: <ValidationSchema extends ZodFirstPartySchemaTypes>(
          url: string,
          data?: any,
          config?: AxiodRequestConfig<ValidationSchema>
        ) => client.patch<ValidationSchema['_output']>(url, data, config),
      };
    },
  };
};

export default createAxiod;
