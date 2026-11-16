'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth';
import {
  deleteProject, moveFeatured, moveProject, saveProject, UserError, type ProjectInput,
} from '@/lib/repo';

const str = (f: FormData, k: string) => String(f.get(k) ?? '').trim();
const jsonList = (f: FormData, k: string): string[] => {
  try {
    const v = JSON.parse(String(f.get(k) ?? '[]'));
    return Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string' && !!x.trim()) : [];
  } catch {
    return [];
  }
};

export type SaveState = { error: string } | null;

export async function saveProjectAction(_prev: SaveState, form: FormData): Promise<SaveState> {
  await requireAdmin();
  const originalId = str(form, 'originalId') || null;
  const yearRaw = str(form, 'year');
  const year = yearRaw ? Number(yearRaw) : null;
  if (year !== null && (!Number.isInteger(year) || year < 1900 || year > 2100)) {
    return { error: 'Tahun harus angka antara 1900 dan 2100.' };
  }
  const input: ProjectInput = {
    id: str(form, 'id'),
    name: str(form, 'name'),
    client: str(form, 'client'),
    year,
    summary: str(form, 'summary'),
    challenge: str(form, 'challenge'),
    solution: str(form, 'solution'),
    final_thoughts: str(form, 'final_thoughts'),
    url: str(form, 'url'),
    thumbnail: jsonList(form, 'thumbnail')[0] ?? '',
    images: jsonList(form, 'images'),
    tags: str(form, 'tags').split(',').map(t => t.trim()).filter(Boolean),
    categories: form.getAll('categories').map(String),
    featured_color: form.get('featured') === 'on' ? str(form, 'featured_color') || '#0a84ff' : null,
  };
  let id: string;
  try {
    id = await saveProject(originalId, input);
  } catch (err) {
    if (err instanceof UserError) return { error: err.message };
    console.error('[admin] simpan proyek', err);
    return { error: 'Gagal menyimpan. Database mungkin sedang bangun — coba lagi sebentar.' };
  }
  revalidatePath('/admin', 'layout');
  redirect(`/admin?saved=${encodeURIComponent(id)}`);
}

export async function deleteProjectAction(form: FormData) {
  await requireAdmin();
  await deleteProject(str(form, 'id'));
  revalidatePath('/admin', 'layout');
  redirect('/admin');
}

export async function moveProjectAction(form: FormData) {
  await requireAdmin();
  await moveProject(str(form, 'id'), str(form, 'dir') === 'up' ? -1 : 1);
  revalidatePath('/admin');
}

export async function moveFeaturedAction(form: FormData) {
  await requireAdmin();
  await moveFeatured(str(form, 'id'), str(form, 'dir') === 'up' ? -1 : 1);
  revalidatePath('/admin');
}
