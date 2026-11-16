// POST /api/admin/cloudinary-signature — tanda tangan untuk upload langsung dari browser ke Cloudinary.
import { isAdmin } from '@/lib/auth';
import { cloudinaryConfig, isAllowedFolder, signParams } from '@/lib/cloudinary';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  if (!(await isAdmin())) return Response.json({ error: 'Belum login' }, { status: 401 });

  const body = (await req.json().catch(() => null)) as { folder?: unknown } | null;
  const folder = typeof body?.folder === 'string' ? body.folder : '';
  if (!isAllowedFolder(folder)) return Response.json({ error: 'Folder tidak diizinkan' }, { status: 400 });

  let cfg;
  try {
    cfg = cloudinaryConfig();
  } catch (err) {
    return Response.json({ error: (err as Error).message }, { status: 500 });
  }
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = signParams({ folder, timestamp }, cfg.apiSecret);
  return Response.json(
    { cloudName: cfg.cloudName, apiKey: cfg.apiKey, timestamp, folder, signature },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}
