// Cek login admin di server (halaman, Server Action, route admin).
import 'server-only';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { COOKIE_NAME, isValidToken } from './token';

export * from './token';

export async function isAdmin(): Promise<boolean> {
  const jar = await cookies();
  return isValidToken(jar.get(COOKIE_NAME)?.value);
}

/** Panggil di awal setiap halaman admin dan Server Action; proxy.ts saja tidak cukup. */
export async function requireAdmin(): Promise<void> {
  if (!(await isAdmin())) redirect('/admin/login');
}
