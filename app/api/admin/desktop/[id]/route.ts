// PATCH posisi ({x,y,layout}) atau nama ({label}); DELETE hapus ikon foto/file dari desktop.
import { adminRoute, layoutOf } from '@/lib/api';
import { deleteDesktopItem, moveDesktopItem, renameDesktopItem } from '@/lib/repo';

export const dynamic = 'force-dynamic';

export const PATCH = adminRoute(async (body, { id }) => {
  if ('x' in body || 'y' in body) await moveDesktopItem(id, body.x, body.y, layoutOf(body.layout));
  if (typeof body.label === 'string') await renameDesktopItem(id, body.label);
  return { ok: true };
});

export const DELETE = adminRoute(async (_b, { id }) => {
  await deleteDesktopItem(id);
  return { ok: true };
});
