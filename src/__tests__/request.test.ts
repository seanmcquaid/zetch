describe('request', () => {
  describe('request failure', () => {
    describe('retries', () => {
      it('calls refresh token when retrying if an auth config is provided', () => {});
      it('does not call refresh token when retrying if an auth config is not provided', () => {});
    });
    it('throws ZetchError if request fails', () => {});
  });
  it('returns data if successful', () => {});
  it('logs api validation error if the schema does not match the data', () => {});
});
