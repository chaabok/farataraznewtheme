import { SignJWT, jwtVerify, type JWTPayload } from 'jose';

const ISSUER = 'erp-auth-service';

function getSecretKey(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error('JWT_SECRET is missing or too short (min 16 chars)');
  }
  return new TextEncoder().encode(secret);
}

export interface AccessTokenPayload extends JWTPayload {
  sub: string;
  username: string;
  displayName?: string;
  role?: string;
}

export interface TokenSubject {
  sub: string;
  username: string;
  displayName?: string;
  role?: string;
}

/** Sign an HS256 access token (8h expiry, issuer-locked). */
export async function signAccessToken(subject: TokenSubject): Promise<string> {
  return new SignJWT({ ...subject })
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setIssuedAt()
    .setIssuer(ISSUER)
    .setExpirationTime('8h')
    .sign(getSecretKey());
}

/** Verify signature + issuer + expiry. Throws on any failure. */
export async function verifyAccessToken(
  token: string,
): Promise<AccessTokenPayload> {
  const { payload } = await jwtVerify(token, getSecretKey(), {
    issuer: ISSUER,
    algorithms: ['HS256'],
  });
  return payload as AccessTokenPayload;
}
