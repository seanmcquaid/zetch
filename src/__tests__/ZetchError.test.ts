import ZetchError from '../ZetchError';

describe('ZetchError', () => {
  it('isZetchError returns true if error is ZetchError', () => {
    const error = new ZetchError(
      {
        message: 'error',
        data: {},
        statusCode: 500,
      },
      {
        url: 'url',
        numberOfRetries: 0,
        headers: {},
      }
    );
    expect(ZetchError.isZetchError(error)).toBeTruthy();
  });
});
