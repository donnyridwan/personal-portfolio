// Tanda tangan upload Cloudinary (secret hanya di server). Browser mengirim file langsung ke Cloudinary.
import 'server-only';
import { createHash } from 'node:crypto';

export type CloudinaryConfig = { cloudName: string; apiKey: string; apiSecret: string };

export function parseCloudinaryUrl(url: string): CloudinaryConfig {
  const m = /^cloudinary:\/\/([^:@/]+):([^@/]+)@([^/?#]+)$/.exec(url.trim());
  if (!m) throw new Error('CLOUDINARY_URL tidak valid (format: cloudinary://KEY:SECRET@CLOUD)');
  return { apiKey: decodeURIComponent(m[1]), apiSecret: decodeURIComponent(m[2]), cloudName: m[3] };
}

export function cloudinaryConfig(): CloudinaryConfig {
  const url = process.env.CLOUDINARY_URL;
  if (!url) throw new Error('CLOUDINARY_URL belum diisi');
  return parseCloudinaryUrl(url);
}

/** SHA-1 dari "k=v&k=v" (urut abjad) + secret — aturan signed upload Cloudinary. */
export function signParams(params: Record<string, string | number>, secret: string): string {
  const str = Object.keys(params)
    .sort()
    .map(k => `${k}=${params[k]}`)
    .join('&');
  return createHash('sha1').update(str + secret).digest('hex');
}

export function isAllowedFolder(folder: string): boolean {
  return folder === 'dockfolio/profile' || folder === 'dockfolio/desktop' || /^dockfolio\/projects\/[a-z0-9-]+$/.test(folder);
}

/** URL PDF di akun Cloudinary ini → bagian-bagiannya; null kalau bukan. */
export function parseCloudinaryPdf(url: string, cloudName: string) {
  const m = /^https:\/\/res\.cloudinary\.com\/([^/]+)\/(image|raw)\/upload\/(?:v(\d+)\/)?(.+)\.pdf$/i.exec(url);
  if (!m || m[1] !== cloudName) return null;
  return { resourceType: m[2] as 'image' | 'raw', publicId: m[4], version: m[3] ?? '' };
}

/**
 * URL unduhan bertanda tangan lewat API Cloudinary (bukan CDN). Dipakai untuk PDF, karena CDN Cloudinary
 * menolak PDF selama "Allow delivery of PDF and ZIP files" belum diaktifkan di akun.
 */
export function signedDownloadUrl(cfg: CloudinaryConfig, resourceType: string, publicId: string, format = 'pdf') {
  const params = { format, public_id: publicId, timestamp: Math.floor(Date.now() / 1000), type: 'upload' };
  const signature = signParams(params, cfg.apiSecret);
  const q = new URLSearchParams({ ...Object.fromEntries(Object.entries(params).map(([k, v]) => [k, String(v)])), api_key: cfg.apiKey, signature });
  return `https://api.cloudinary.com/v1_1/${cfg.cloudName}/${resourceType}/download?${q}`;
}
