// PATCH ganti nama / tambah gambar / tampil-sembunyi di desktop; DELETE hapus proyek.
import { adminRoute, strList } from '@/lib/api';
import { addProjectImages, createDesktopItem, deleteProject, removeFromDesktop, renameProject } from '@/lib/repo';

export const dynamic = 'force-dynamic';

export const PATCH = adminRoute(async (body, { id }) => {
  if (typeof body.name === 'string') await renameProject(id, body.name);
  if (body.addImages) await addProjectImages(id, strList(body.addImages));
  if (body.onDesktop === true) await createDesktopItem({ kind: 'project', ref: id });
  if (body.onDesktop === false) await removeFromDesktop('project', id);
  return { ok: true };
});

export const DELETE = adminRoute(async (_b, { id }) => {
  await deleteProject(id);
  return { ok: true };
});
