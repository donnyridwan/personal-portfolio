// Upload dari browser langsung ke Cloudinary (dipakai mode edit dan form admin).
// - Tidak ada batas ukuran di sisi kita: gambar yang melebihi batas Cloudinary dikecilkan dulu
//   di browser, file besar (video) dikirim bertahap per potongan.
// - Batas akhir tetap batas paket Cloudinary; pesannya diteruskan apa adanya kalau ditolak.

export const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
export const VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];

const IMAGE_TARGET = 9.5 * 1024 * 1024; // di bawah batas gambar Cloudinary (10 MB di paket gratis)
const CHUNK = 20 * 1024 * 1024; // potongan upload bertahap (min. 5 MB per potongan kecuali terakhir)

const canvasToBlob = (canvas, type, quality) => new Promise(r => canvas.toBlob(r, type, quality));

/**
 * Gambar JPG/PNG/WebP yang terlalu besar dikecilkan (resolusi & kualitas) sampai di bawah batas.
 * GIF dibiarkan (animasinya akan hilang kalau digambar ulang). File lain dikembalikan apa adanya.
 */
export async function shrinkImage(file) {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size <= IMAGE_TARGET) return file;
  let bmp;
  try { bmp = await createImageBitmap(file); } catch { return file; }
  const type = file.type === 'image/jpeg' ? 'image/jpeg' : 'image/webp'; // PNG → WebP: tetap transparan, jauh lebih kecil
  const ext = type === 'image/jpeg' ? 'jpg' : 'webp';
  let scale = Math.min(1, 8000 / Math.max(bmp.width, bmp.height));
  let quality = 0.9;
  let blob = null;
  for (let i = 0; i < 8; i++) {
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(bmp.width * scale));
    canvas.height = Math.max(1, Math.round(bmp.height * scale));
    canvas.getContext('2d').drawImage(bmp, 0, 0, canvas.width, canvas.height);
    blob = await canvasToBlob(canvas, type, quality);
    if (blob && blob.size <= IMAGE_TARGET) break;
    if (quality > 0.8) quality -= 0.05; else scale *= 0.85;
  }
  bmp.close?.();
  if (!blob || blob.size >= file.size) return file;
  return new File([blob], file.name.replace(/\.[^.]+$/, '') + '.' + ext, { type });
}

/**
 * Kirim file ke Cloudinary dengan tanda tangan dari /api/admin/cloudinary-signature.
 * @param {File} file
 * @param {{cloudName:string, apiKey:string, timestamp:number, folder:string, signature:string}} sign
 * @param {(fraction:number)=>void} [onProgress]
 * @returns {Promise<string>} secure_url
 */
export async function sendToCloudinary(file, sign, onProgress) {
  const resource = file.type.startsWith('video/') ? 'video' : 'auto';
  const url = `https://api.cloudinary.com/v1_1/${sign.cloudName}/${resource}/upload`;
  const formFor = blob => {
    const form = new FormData();
    form.append('file', blob, file.name);
    form.append('api_key', sign.apiKey);
    form.append('timestamp', String(sign.timestamp));
    form.append('folder', sign.folder);
    form.append('signature', sign.signature);
    return form;
  };
  const read = async res => {
    const out = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(friendly(out.error?.message, file) ?? `Upload "${file.name}" gagal (${res.status})`);
    return out;
  };

  if (file.size <= CHUNK) {
    const out = await read(await fetch(url, { method: 'POST', body: formFor(file) }));
    onProgress?.(1);
    if (!out.secure_url) throw new Error(`Upload "${file.name}" gagal`);
    return out.secure_url;
  }

  // Upload bertahap: potongan berurutan dengan id upload yang sama.
  const id = `df-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  let out = null;
  for (let start = 0; start < file.size; start += CHUNK) {
    const end = Math.min(start + CHUNK, file.size);
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'X-Unique-Upload-Id': id, 'Content-Range': `bytes ${start}-${end - 1}/${file.size}` },
      body: formFor(file.slice(start, end)),
    });
    out = await read(res);
    onProgress?.(end / file.size);
  }
  if (!out?.secure_url) throw new Error(`Upload "${file.name}" gagal`);
  return out.secure_url;
}

/** Pesan Cloudinary soal ukuran → bahasa yang jelas. */
function friendly(msg, file) {
  if (!msg) return null;
  if (/file size too large/i.test(msg)) {
    const mb = (file.size / 1024 / 1024).toFixed(1);
    return `"${file.name}" (${mb} MB) melebihi batas paket Cloudinary. (${msg})`;
  }
  return msg;
}
