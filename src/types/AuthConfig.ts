export type TokenScheme = 'Basic' | 'Bearer' | 'JWTBearer';

interface AuthConfig {
  // The function you'd like called to refresh the token
  refreshToken: () => Promise<string>;
  // The token scheme you'd like to use (Basic, Bearer, JWTBearer)
  tokenScheme: TokenScheme;
  // Function to return the token you'd like to use
  getToken: () => string;
}

export default AuthConfig;
