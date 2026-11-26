// Upload dari browser: minta tanda tangan ke server, lalu kirim file langsung ke Cloudinary.

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
  return null; // tanpa batas ukuran di sisi kita: gambar besar dikecilkan, file besar dikirim bertahap
}

type UploadModule = {
  shrinkImage: (f: File) => Promise<File>;
  sendToCloudinary: (f: File, sign: unknown, onProgress?: (p: number) => void) => Promise<string>;
};

/** Modul upload yang sama dengan mode edit (public/upload/upload.js), dimuat saat dipakai. */
const uploadModule = () =>
  import(/* webpackIgnore: true */ /* turbopackIgnore: true */ '/upload/upload.js' as string) as Promise<UploadModule>;

/** Mengembalikan secure_url dari Cloudinary. Gambar besar dikecilkan dulu, file besar dikirim bertahap. */
export async function uploadToCloudinary(file: File, folder: string, onProgress?: (p: number) => void): Promise<string> {
  const mod = await uploadModule();
  const ready = file.type.startsWith('image/') ? await mod.shrinkImage(file) : file;
  const signRes = await fetch('/api/admin/cloudinary-signature', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ folder }),
  });
  const sign = await signRes.json().catch(() => ({}));
  if (!signRes.ok) throw new Error(sign.error ?? `Gagal meminta izin upload (${signRes.status})`);
  return mod.sendToCloudinary(ready, sign, onProgress);
}

/** Path lokal lama ("assets/…") ditampilkan relatif ke root situs. */
export function displaySrc(src: string): string {
  return /^(https?:)?\/\//.test(src) || src.startsWith('/') ? src : `/${src}`;
}
