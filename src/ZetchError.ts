import Headers from './types/Headers';

class ZetchError extends Error {
  public errorInfo: { message: string; statusCode: number; data: unknown };

  public requestInfo: {
    url: string;
    numberOfRetries: number;
    headers: Headers;
    body?: FormData | unknown[] | { [key: string]: unknown };
  };
  constructor(
    errorInfo: { message: string; statusCode: number; data: unknown },
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

  public toObject() {
    return {
      error: this.errorInfo,
      request: this.requestInfo,
    };
  }
}

export default ZetchError;
