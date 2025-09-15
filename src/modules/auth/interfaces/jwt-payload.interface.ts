export interface JwtPayload {
  sub: string; // user uuid
  email: string;
  role: string;
  projectUuid: string;
  iat?: number;
  exp?: number;
  jti?: string; // JWT ID для blacklist
}
