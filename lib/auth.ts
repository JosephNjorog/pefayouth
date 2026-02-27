import { SignJWT, jwtVerify } from 'jose';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-dev-secret-change-in-production');

export interface JWTPayload {
  id: string;
  email: string;
  role: string;
  name: string;
  memberId?: string;
}

export async function signJWT(payload: JWTPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET);
}

export async function verifyJWT(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as JWTPayload;
  } catch {
    return null;
  }
}

export function getTokenFromRequest(req: VercelRequest): string | null {
  // Check Authorization header first
  const auth = req.headers['authorization'];
  if (auth?.startsWith('Bearer ')) {
    return auth.slice(7);
  }
  // Then check cookie
  const cookieHeader = req.headers['cookie'] || '';
  const match = cookieHeader.match(/(?:^|;\s*)auth-token=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

export async function requireAuth(
  req: VercelRequest,
  res: VercelResponse
): Promise<JWTPayload | null> {
  const token = getTokenFromRequest(req);
  if (!token) {
    res.status(401).json({ error: 'Unauthorized' });
    return null;
  }
  const user = await verifyJWT(token);
  if (!user) {
    res.status(401).json({ error: 'Invalid or expired token' });
    return null;
  }
  return user;
}

export async function requireRole(
  req: VercelRequest,
  res: VercelResponse,
  roles: string[]
): Promise<JWTPayload | null> {
  const user = await requireAuth(req, res);
  if (!user) return null;
  if (!roles.includes(user.role)) {
    res.status(403).json({ error: 'Forbidden: insufficient permissions' });
    return null;
  }
  return user;
}

export function setAuthCookie(res: VercelResponse, token: string) {
  res.setHeader(
    'Set-Cookie',
    `auth-token=${encodeURIComponent(token)}; HttpOnly; Path=/; Max-Age=${7 * 24 * 60 * 60}; SameSite=Strict${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`
  );
}

export function clearAuthCookie(res: VercelResponse) {
  res.setHeader(
    'Set-Cookie',
    'auth-token=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict'
  );
}
