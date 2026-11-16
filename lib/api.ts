// Pembungkus route /api/admin/*: cek login, baca JSON, dan ubah error jadi respons yang rapi.
import 'server-only';
import { isAdmin } from './auth';
import { UserError } from './repo';

type Ctx = { params: Promise<Record<string, string>> };
type Handler = (body: Record<string, any>, params: Record<string, string>) => Promise<unknown>;

export function adminRoute(handler: Handler) {
  return async (req: Request, ctx: Ctx) => {
    if (!(await isAdmin())) return Response.json({ error: 'Belum login' }, { status: 401 });
    let body: Record<string, any> = {};
    if (req.method !== 'GET' && req.method !== 'DELETE') {
      const parsed = await req.json().catch(() => null);
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        return Response.json({ error: 'Data tidak valid' }, { status: 400 });
      }
      body = parsed;
    }
    try {
      const out = await handler(body, await ctx.params);
      return Response.json(out ?? { ok: true }, { headers: { 'Cache-Control': 'no-store' } });
    } catch (err) {
      if (err instanceof UserError) return Response.json({ error: err.message }, { status: 400 });
      console.error('[api/admin]', req.method, new URL(req.url).pathname, err);
      return Response.json({ error: 'Gagal menyimpan. Database mungkin sedang bangun — coba lagi.' }, { status: 500 });
    }
  };
}

export const layoutOf = (v: unknown): 'd' | 'm' => (v === 'm' ? 'm' : 'd');
export const strList = (v: unknown): string[] =>
  Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string' && !!x.trim()) : [];
