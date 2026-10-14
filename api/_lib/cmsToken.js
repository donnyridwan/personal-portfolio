import { createHmac, timingSafeEqual } from 'node:crypto';

// Files under api/_lib are not exposed as routes by Vercel.

const TOKEN_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours

function getSecret() {
  return process.env.CMS_AUTH_SECRET || process.env.CMS_ADMIN_PASSWORD || '';
}

function sign(payload, secret) {
  return createHmac('sha256', secret).update(payload).digest('base64url');
}

function safeEqual(a, b) {
  const bufA = Buffer.from(String(a));
  const bufB = Buffer.from(String(b));
  return bufA.length === bufB.length && timingSafeEqual(bufA, bufB);
}

export function checkPassword(password) {
  const expected = process.env.CMS_ADMIN_PASSWORD;
  if (!expected || !password) return false;
  return safeEqual(password, expected);
}

export function issueToken() {
  const secret = getSecret();
  if (!secret) throw new Error('CMS auth is not configured');
  const payload = `cms.${Date.now() + TOKEN_TTL_MS}`;
  return `${payload}.${sign(payload, secret)}`;
}

export function verifyToken(token) {
  const secret = getSecret();
  if (!secret || typeof token !== 'string') return false;
  const lastDot = token.lastIndexOf('.');
  if (lastDot <= 0) return false;
  const payload = token.slice(0, lastDot);
  const signature = token.slice(lastDot + 1);
  if (!safeEqual(signature, sign(payload, secret))) return false;
  const expiresAt = Number(payload.split('.')[1]);
  return Number.isFinite(expiresAt) && Date.now() < expiresAt;
}

export function getBearerToken(req) {
  const header = req.headers?.authorization || '';
  return header.startsWith('Bearer ') ? header.slice(7) : '';
}
