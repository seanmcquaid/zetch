import { ZodFirstPartySchemaTypes } from 'zod/lib/types';
import BaseZetchConfig from './BaseZetchConfig';

interface ZetchRequestConfig<ValidationSchema extends ZodFirstPartySchemaTypes>
  extends BaseZetchConfig {
  // The validation schema you'd like to use for the response
  validationSchema?: ValidationSchema;

  // The request body you'd like to send with the request
  body?: FormData | unknown[] | { [key: string]: unknown };

  // The abort controller you'd like to use for this request, in the event you would like to cancel the request
  abortController?: AbortController;
}

export type ZetchGetRequestConfig<
  ValidationSchema extends ZodFirstPartySchemaTypes
> = Omit<ZetchRequestConfig<ValidationSchema>, 'body'>;

export default ZetchRequestConfig;
