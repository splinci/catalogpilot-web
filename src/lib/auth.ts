import * as argon2 from 'argon2';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { UserSessionPayload } from '@/types/auth.dto';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'atlas_enterprise_commerce_os_secure_jwt_secret_2026_key'
);

export const AUTH_COOKIE_NAME = 'atlas_session';
const TOKEN_EXPIRATION_SECONDS = 8 * 60 * 60; // 8 Hours

/**
 * Password Hashing & Verification (Argon2id)
 */
export async function hashPassword(password: string): Promise<string> {
  return argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 1,
  });
}

export async function verifyPassword(hash: string, plainText: string): Promise<boolean> {
  try {
    return await argon2.verify(hash, plainText);
  } catch {
    return false;
  }
}

/**
 * JWT Token Signing & Verification (JOSE - Edge Compatible)
 */
export async function signAccessToken(payload: UserSessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('8h')
    .sign(JWT_SECRET);
}

export async function verifyAccessToken(token: string): Promise<UserSessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return {
      userId: payload.userId as string,
      email: payload.email as string,
      firstName: payload.firstName as string,
      lastName: payload.lastName as string,
      role: payload.role as any,
      companyId: payload.companyId as string,
      companyCode: payload.companyCode as string,
      companyName: payload.companyName as string,
    };
  } catch {
    return null;
  }
}

/**
 * Cookie Management Strategy
 */
export async function createSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: TOKEN_EXPIRATION_SECONDS,
  });
}

export async function destroySessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
}

export async function getCurrentSession(): Promise<UserSessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  if (!token) {
    return null;
  }
  return verifyAccessToken(token);
}
