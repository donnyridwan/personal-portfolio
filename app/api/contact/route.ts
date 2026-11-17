// POST /api/contact — formulir "Get in touch" di app Contact (sebelumnya terkirim ke Framer milik pembuat template).
// Framer mengirim FormData; balas 200 supaya formulir menampilkan status sukses.
import { createHash } from 'node:crypto';
import { parseContact } from '@/lib/contact';
import { saveContactMessage } from '@/lib/repo';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const form = await req.formData().catch(() => null);
  const input = form ? parseContact([...form.entries()]) : null;
  if (!input) return Response.json({ error: { message: 'Isian tidak valid.' } }, { status: 400 });
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown';
  const visitor = createHash('sha256').update(`dockfolio-contact:${ip}`).digest('hex').slice(0, 32);
  try {
    const r = await saveContactMessage(input, visitor);
    if (r === 'limit') return Response.json({ error: { message: 'Terlalu banyak pesan. Coba lagi nanti.' } }, { status: 429 });
  } catch (err) {
    console.error('[api/contact]', err);
    return Response.json({ error: { message: 'Pesan belum bisa dikirim. Coba lagi.' } }, { status: 500 });
  }
  return Response.json({ ok: true });
}
