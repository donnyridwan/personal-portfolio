// POST /api/admin/categories — folder baru ("Folder Baru", "Folder Baru 2", …), opsional ditaruh di desktop.
import { adminRoute, layoutOf } from '@/lib/api';
import { addCategoryUnique, createDesktopItem } from '@/lib/repo';

export const dynamic = 'force-dynamic';

export const POST = adminRoute(async body => {
  const { id, label } = await addCategoryUnique(typeof body.label === 'string' ? body.label : '');
  let desktopId: string | null = null;
  if (body.desktop && typeof body.desktop === 'object') {
    desktopId = await createDesktopItem({
      kind: 'folder', ref: id, x: body.desktop.x, y: body.desktop.y, layout: layoutOf(body.desktop.layout),
    });
  }
  return { id, label, desktopId };
});
