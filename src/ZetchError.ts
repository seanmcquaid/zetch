import { ZodFirstPartySchemaTypes } from 'zod/lib/types';
import Headers from './types/Headers';
import ZetchRequestConfig from './types/ZetchRequestConfig';

class ZetchError extends Error {
  errorInfo: { message: string; statusCode: number; data: any };

  requestInfo: {
    requestConfig?: ZetchRequestConfig<ZodFirstPartySchemaTypes>;
    url: string;
    numberOfRetries: number;
    headers: Headers;
  };
  constructor(
    errorInfo: { message: string; statusCode: number; data: any },
    requestInfo: {
      requestConfig?: ZetchRequestConfig<ZodFirstPartySchemaTypes>;
      url: string;
      numberOfRetries: number;
      headers: Headers;
    }
  ) {
    super(errorInfo.message);
    this.errorInfo = errorInfo;
    this.requestInfo = requestInfo;
  }

  static isZetchError(error: unknown): error is ZetchError {
    return error instanceof ZetchError;
  }

  toObject() {
    return {
      error: this.errorInfo,
      request: this.requestInfo,
    };
  }
}

export default ZetchError;
