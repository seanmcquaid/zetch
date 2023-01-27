interface RetriesConfig {
  // Status codes you'd like to retry on
  retryStatuses: number[];
  // The max number of retries you'd like to allow
  numberOfRetries?: number;
}

export default RetriesConfig;
