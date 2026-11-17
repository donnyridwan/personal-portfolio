// Formulir "Get in touch" (app Contact milik Framer): ambil nama/email/pesan dari isian apa pun namanya. Murni (dites).

export const CONTACT_LIMITS = { fieldChars: 5000, fields: 20 };

export type ContactInput = { name: string; email: string; message: string; fields: Record<string, string> };

const pick = (fields: Record<string, string>, keys: RegExp) =>
  Object.entries(fields).find(([k]) => keys.test(k))?.[1]?.trim() ?? '';

/** null kalau isian kosong/terlalu banyak/terlalu panjang atau email tidak valid. */
export function parseContact(entries: [string, unknown][]): ContactInput | null {
  const fields: Record<string, string> = {};
  for (const [k, v] of entries) {
    if (typeof v !== 'string') continue; // abaikan file
    if (k.startsWith('__framer')) continue; // isian teknis Framer (proof of work, dll.)
    if (Object.keys(fields).length >= CONTACT_LIMITS.fields) return null;
    if (v.length > CONTACT_LIMITS.fieldChars) return null;
    fields[k.slice(0, 100)] = v;
  }
  const name = pick(fields, /^(name|nama|full ?name)$/i);
  const email = pick(fields, /e-?mail/i);
  const message = pick(fields, /^(message|pesan|msg|body|content)$/i);
  if (!email && !message) return null;
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null;
  return { name, email, message, fields };
}
