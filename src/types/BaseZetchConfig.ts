import { ZodError } from 'zod';
import Headers from '../types/Headers';
import ZetchError from '../ZetchError';

type TokenScheme = 'Basic' | 'Bearer' | 'JWTBearer';

interface BaseZetchConfig {
  // The base url for your client
  baseUrl: string;

  // Base headers you'd like to provide for every request from the client
  headers?: Headers;

  // Configuration for authentication
  authConfig?: {
    // The function you'd like called to refresh the token
    refreshToken: () => Promise<string>;
    // The token scheme you'd like to use (Basic, Bearer, JWTBearer)
    tokenScheme: TokenScheme;
    // The original token you'd like to use
    token: string;
  };

  // Configuration for retries
  retriesConfig?: {
    // Status codes you'd like to retry on
    retryStatuses: number[];
    // The max number of retries you'd like to allow
    numberOfRetries?: number;
  };

  // The function you'd like to use to log API errors to your error service of choice
  logApiError?: (error: ZetchError) => void;

  // The function you'd like to use to log API Validation errors to your error service of choice
  logApiValidationError?: (error: ZodError) => void;
}

export default BaseZetchConfig;
