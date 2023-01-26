import { ZodFirstPartySchemaTypes } from 'zod/lib/types';
import Headers from './Headers';

interface ZetchRequestConfig<
  ValidationSchema extends ZodFirstPartySchemaTypes
> {
  // The validation schema you'd like to use for the response
  validationSchema?: ValidationSchema;

  // The headers you'd like to provide for this specific request. These will override previously set values in your client
  headers?: Headers;

  // The request body you'd like to send with the request
  body?: FormData | unknown[] | Record<string, unknown>;

  // The abort controller you'd like to use for this request, in the event you would like to cancel the request
  abortController?: AbortController;
}

export type ZetchGetRequestConfig<
  ValidationSchema extends ZodFirstPartySchemaTypes
> = Omit<ZetchRequestConfig<ValidationSchema>, 'body'>;

export default ZetchRequestConfig;
