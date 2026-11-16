// PATCH ganti nama / tampil-sembunyi di desktop; DELETE hapus folder (proyek di dalamnya tetap ada).
import { adminRoute } from '@/lib/api';
import { createDesktopItem, deleteCategory, removeFromDesktop, renameCategory } from '@/lib/repo';

export const dynamic = 'force-dynamic';

export const PATCH = adminRoute(async (body, { id }) => {
  if (typeof body.label === 'string') await renameCategory(id, body.label);
  if (body.onDesktop === true) await createDesktopItem({ kind: 'folder', ref: id });
  if (body.onDesktop === false) await removeFromDesktop('folder', id);
  return { ok: true };
});

export const DELETE = adminRoute(async (_b, { id }) => {
  await deleteCategory(id);
  return { ok: true };
});
