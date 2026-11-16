'use server';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/auth';
import { addCategory, deleteCategory, moveCategory, renameCategory, UserError } from '@/lib/repo';

export type CatState = { error?: string; ok?: string } | null;

const str = (f: FormData, k: string) => String(f.get(k) ?? '').trim();

async function run(fn: () => Promise<unknown>, ok: string): Promise<CatState> {
  try {
    await fn();
  } catch (err) {
    if (err instanceof UserError) return { error: err.message };
    console.error('[admin] kategori', err);
    return { error: 'Gagal menyimpan. Database mungkin sedang bangun — coba lagi sebentar.' };
  }
  revalidatePath('/admin', 'layout');
  return { ok };
}

export async function addCategoryAction(_p: CatState, f: FormData): Promise<CatState> {
  await requireAdmin();
  return run(() => addCategory(str(f, 'label')), 'Kategori ditambahkan.');
}

export async function renameCategoryAction(_p: CatState, f: FormData): Promise<CatState> {
  await requireAdmin();
  return run(() => renameCategory(str(f, 'id'), str(f, 'label')), 'Nama kategori disimpan.');
}

export async function deleteCategoryAction(f: FormData) {
  await requireAdmin();
  await deleteCategory(str(f, 'id'));
  revalidatePath('/admin', 'layout');
}

export async function moveCategoryAction(f: FormData) {
  await requireAdmin();
  await moveCategory(str(f, 'id'), str(f, 'dir') === 'up' ? -1 : 1);
  revalidatePath('/admin/categories');
}
