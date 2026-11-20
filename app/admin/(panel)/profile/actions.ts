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
  const badLink = links.find(l => !l.label || !/^(https?:\/\/|mailto:|tel:)/.test(l.url));
  if (badLink) return { error: 'Setiap link Kontak perlu label dan URL yang diawali https:// (atau mailto:/tel:).' };

  const about: Record<string, unknown> = {
    name: str(f, 'name'),
    role: str(f, 'role'),
    avatar: json<string[]>(f, 'avatar', [])[0] ?? '',
    paragraphs: String(f.get('paragraphs') ?? '')
      .split(/\n\s*\n/)
      .map(p => p.trim())
      .filter(Boolean),
  };
  const bookUrl = str(f, 'bookUrl');
  if (bookUrl && !/^(https?:\/\/|mailto:|tel:)/.test(bookUrl)) return { error: 'Link Book a Call harus diawali https:// (atau mailto:/tel:).' };
  const clean = (v: unknown, max = 600) => String(v ?? '').trim().slice(0, max);
  const rows = <T,>(key: string, map: (r: Record<string, unknown>) => T, keep: (r: T) => boolean) =>
    json<Record<string, unknown>[]>(f, key, []).slice(0, 20).map(map).filter(keep);
  Object.assign(about, {
    headline: clean(f.get('headline'), 200),
    subtitle: clean(f.get('subtitle'), 400),
    bookUrl,
    statsIntro: clean(f.get('statsIntro'), 200),
    experienceIntro: clean(f.get('experienceIntro'), 200),
    stats: rows('stats', r => ({ value: clean(r.value, 20), unit: clean(r.unit, 20), label: clean(r.label, 120) }), r => !!r.value),
    experience: rows('experience', r => ({ role: clean(r.role, 120), company: clean(r.company, 120), period: clean(r.period, 60), summary: clean(r.summary, 600) }), r => !!r.role),
    testimonials: rows('testimonials', r => ({ name: clean(r.name, 80), title: clean(r.title, 120), quote: clean(r.quote, 600), rating: Math.min(5, Math.max(1, Number(r.rating) || 5)) }), r => !!r.quote && !!r.name),
  });
  const resume = { url: json<string[]>(f, 'resume', [])[0] ?? '' };
  const ai = { name: str(f, 'ai_name').slice(0, 40), knowledge: String(f.get('ai_knowledge') ?? '').trim().slice(0, 20000) };

  try {
    await saveSetting('about', about);
    await saveSetting('contact', { email, links });
    await saveSetting('resume', resume);
    await saveSetting('ai', ai);
  } catch (err) {
    console.error('[admin] profil', err);
    return { error: 'Gagal menyimpan. Database mungkin sedang bangun — coba lagi sebentar.' };
  }
  revalidatePath('/admin/profile');
  return { ok: 'Profil tersimpan. Reload situs untuk melihat perubahan di Finder.' };
}
