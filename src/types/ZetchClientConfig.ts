import BaseZetchConfig from './BaseZetchConfig';

interface ZetchClientConfig extends BaseZetchConfig {
  // The base url for your client
  baseUrl: string;
}

export default ZetchClientConfig;
