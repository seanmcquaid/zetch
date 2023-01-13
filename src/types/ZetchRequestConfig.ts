import { ZodFirstPartySchemaTypes } from 'zod/lib/types';
import Headers from './Headers';

interface ZetchRequestConfig<
  ValidationSchema extends ZodFirstPartySchemaTypes
> {
  validationSchema?: ValidationSchema;
  headers?: Headers;

  body?: any;

  abortController?: AbortController;
}

export default ZetchRequestConfig;
