// Upload dari browser: minta tanda tangan ke server, lalu kirim file langsung ke Cloudinary.

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // 10 MB
export const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
export const PDF_TYPES = ['application/pdf'];

export type UploadKind = 'image' | 'pdf';

/** Pesan kesalahan kalau file tidak boleh di-upload, atau null kalau boleh. */
export function checkFile(file: File, kind: UploadKind): string | null {
  const types = kind === 'pdf' ? PDF_TYPES : IMAGE_TYPES;
  if (!types.includes(file.type)) {
    return kind === 'pdf'
      ? `"${file.name}" bukan PDF.`
      : `"${file.name}" bukan gambar JPG, PNG, WebP, atau GIF.`;
  }
  if (file.size > MAX_UPLOAD_BYTES) return `"${file.name}" lebih dari 10 MB.`;
  return null;
}

/** Mengembalikan secure_url dari Cloudinary. */
export async function uploadToCloudinary(file: File, folder: string): Promise<string> {
  const signRes = await fetch('/api/admin/cloudinary-signature', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ folder }),
  });
  const sign = await signRes.json().catch(() => ({}));
  if (!signRes.ok) throw new Error(sign.error ?? `Gagal meminta izin upload (${signRes.status})`);

  const form = new FormData();
  form.append('file', file);
  form.append('api_key', sign.apiKey);
  form.append('timestamp', String(sign.timestamp));
  form.append('folder', sign.folder);
  form.append('signature', sign.signature);
  const res = await fetch(`https://api.cloudinary.com/v1_1/${sign.cloudName}/auto/upload`, {
    method: 'POST',
    body: form,
  });
  const out = await res.json().catch(() => ({}));
  if (!res.ok || !out.secure_url) throw new Error(out.error?.message ?? `Upload gagal (${res.status})`);
  return out.secure_url as string;
}

/** Path lokal lama ("assets/…") ditampilkan relatif ke root situs. */
export function displaySrc(src: string): string {
  return /^(https?:)?\/\//.test(src) || src.startsWith('/') ? src : `/${src}`;
}
