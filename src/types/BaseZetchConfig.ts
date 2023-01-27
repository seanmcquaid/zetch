import Headers from './Headers';
import AuthConfig from './AuthConfig';
import RetriesConfig from './RetriesConfig';
import ZetchError from '../ZetchError';
import { ZodError } from 'zod';

interface BaseZetchConfig {
  headers?: Headers;

  // Configuration for authentication
  authConfig?: AuthConfig;

  // Configuration for retries
  retriesConfig?: RetriesConfig;

  // The function you'd like to use to log API errors to your error service of choice
  onApiError?: (error: ZetchError) => void;

  // The function you'd like to use to log API Validation errors to your error service of choice
  onApiValidationError?: (error: ZodError) => void;
}

export default BaseZetchConfig;
