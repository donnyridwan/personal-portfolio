'use server';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/auth';
import { saveSetting } from '@/lib/repo';

export type ProfileState = { error?: string; ok?: string } | null;

const str = (f: FormData, k: string) => String(f.get(k) ?? '').trim();
const json = <T,>(f: FormData, k: string, fallback: T): T => {
  try { return JSON.parse(String(f.get(k) ?? '')) as T; } catch { return fallback; }
};

export async function saveProfileAction(_p: ProfileState, f: FormData): Promise<ProfileState> {
  await requireAdmin();
  const email = str(f, 'email');
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: 'Format email tidak valid.' };

  const links = json<{ label: string; url: string }[]>(f, 'links', [])
    .map(l => ({ label: String(l.label ?? '').trim(), url: String(l.url ?? '').trim() }))
    .filter(l => l.label || l.url);
  const badLink = links.find(l => !l.label || !/^(https?:\/\/|mailto:)/.test(l.url));
  if (badLink) return { error: 'Setiap link Kontak perlu label dan URL yang diawali https:// (atau mailto:).' };

  const about = {
    name: str(f, 'name'),
    role: str(f, 'role'),
    avatar: json<string[]>(f, 'avatar', [])[0] ?? '',
    paragraphs: String(f.get('paragraphs') ?? '')
      .split(/\n\s*\n/)
      .map(p => p.trim())
      .filter(Boolean),
  };
  const resume = { url: json<string[]>(f, 'resume', [])[0] ?? '' };

  try {
    await saveSetting('about', about);
    await saveSetting('contact', { email, links });
    await saveSetting('resume', resume);
  } catch (err) {
    console.error('[admin] profil', err);
    return { error: 'Gagal menyimpan. Database mungkin sedang bangun — coba lagi sebentar.' };
  }
  revalidatePath('/admin/profile');
  return { ok: 'Profil tersimpan. Reload situs untuk melihat perubahan di Finder.' };
}
