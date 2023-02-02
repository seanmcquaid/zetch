import Headers from './types/Headers';

class ZetchError extends Error {
  errorInfo: { message: string; statusCode: number; data: any };

  requestInfo: {
    url: string;
    numberOfRetries: number;
    headers: Headers;
    body?: FormData | unknown[] | { [key: string]: unknown };
  };
  constructor(
    errorInfo: { message: string; statusCode: number; data: any },
    requestInfo: {
      url: string;
      numberOfRetries: number;
      headers: Headers;
      body?: FormData | unknown[] | { [key: string]: unknown };
    }
  ) {
    super(`Request failed with status code ${errorInfo.statusCode}`);
    this.name = 'ZetchError';
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
