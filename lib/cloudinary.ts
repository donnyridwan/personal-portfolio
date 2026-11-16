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
