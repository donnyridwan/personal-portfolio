// GET /api/resume — PDF resume dari Profil, disajikan dari domain sendiri.
// PDF di Cloudinary diambil lewat API bertanda tangan (CDN-nya menolak PDF kalau setelan akun belum diaktifkan).
import { cloudinaryConfig, parseCloudinaryPdf, signedDownloadUrl } from '@/lib/cloudinary';
import { loadSettings } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  let url = '';
  try {
    const resume = (await loadSettings()).resume as { url?: string } | undefined;
    url = typeof resume?.url === 'string' ? resume.url : '';
  } catch (err) {
    console.error('[api/resume] data', err);
    return new Response('Resume belum bisa dimuat.', { status: 500 });
  }
  if (!url) return new Response('Resume belum tersedia.', { status: 404 });

  let cfg = null;
  try { cfg = cloudinaryConfig(); } catch { /* tanpa Cloudinary: langsung alihkan */ }
  const pdf = cfg && parseCloudinaryPdf(url, cfg.cloudName);
  if (!cfg || !pdf) return Response.redirect(url, 302);

  const res = await fetch(signedDownloadUrl(cfg, pdf.resourceType, pdf.publicId));
  if (!res.ok || !res.body) {
    console.error('[api/resume] cloudinary', res.status);
    return new Response('Resume belum bisa dimuat.', { status: 502 });
  }
  return new Response(res.body, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline; filename="CV-Donny-Ridwan-Setiawan.pdf"',
      // Di-cache sebentar di CDN Vercel; versi baru (setelah ganti resume) memakai ?v= berbeda.
      'Cache-Control': 'public, max-age=300, s-maxage=3600',
    },
  });
}
