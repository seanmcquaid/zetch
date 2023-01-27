export type TokenScheme = 'Basic' | 'Bearer' | 'JWTBearer';

interface AuthConfig {
  // The function you'd like called to refresh the token
  refreshToken: () => Promise<string>;
  // The token scheme you'd like to use (Basic, Bearer, JWTBearer)
  tokenScheme: TokenScheme;
  // The original token you'd like to use
  token: string;
}

export default AuthConfig;
