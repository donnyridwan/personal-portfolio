// Token admin = hex SHA-256 dari ADMIN_PASSWORD. Tanpa import Next supaya bisa dipakai proxy.ts.

export const COOKIE_NAME = 'dockfolio_admin';
export const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 hari

export async function sha256Hex(s: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  return Array.from(new Uint8Array(buf), b => b.toString(16).padStart(2, '0')).join('');
}

/** null kalau ADMIN_PASSWORD belum diisi: tidak ada yang boleh masuk. */
export async function expectedToken(): Promise<string | null> {
  const pw = process.env.ADMIN_PASSWORD;
  return pw ? sha256Hex(pw) : null;
}

/** Perbandingan tanpa berhenti di karakter pertama yang beda. */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function isValidToken(token: string | undefined): Promise<boolean> {
  const expected = await expectedToken();
  return !!expected && !!token && safeEqual(token, expected);
}

export async function checkPassword(pw: string): Promise<boolean> {
  return !!pw && isValidToken(await sha256Hex(pw));
}
