'use server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { checkPassword, COOKIE_MAX_AGE, COOKIE_NAME, sha256Hex } from '@/lib/auth';

export async function login(_prev: string | null, form: FormData): Promise<string | null> {
  const pw = String(form.get('password') ?? '');
  if (!process.env.ADMIN_PASSWORD) return 'ADMIN_PASSWORD belum diisi di server.';
  if (!(await checkPassword(pw))) return 'Password salah.';
  const jar = await cookies();
  jar.set(COOKIE_NAME, await sha256Hex(pw), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: COOKIE_MAX_AGE,
  });
  redirect('/?edit');
}

export async function logout(): Promise<void> {
  (await cookies()).delete(COOKIE_NAME);
  redirect('/admin/login');
}
