import { ZodError } from 'zod';
import Headers from '../types/Headers';
import ZetchError from '../ZetchError';

type TokenScheme = 'Basic' | 'Bearer' | 'JWTBearer';

interface BaseZetchConfig {
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

export default BaseZetchConfig;
