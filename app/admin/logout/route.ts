// GET /admin/logout — hapus cookie admin lalu kembali ke situs (dipakai bilah mode edit).
import { cookies } from 'next/headers';
import { COOKIE_NAME } from '@/lib/auth';

export async function GET(req: Request) {
  (await cookies()).delete(COOKIE_NAME);
  return Response.redirect(new URL('/', req.url), 303);
}
