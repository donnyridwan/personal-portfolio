// POST /api/admin/projects — proyek baru cepat (dari desktop/Finder), opsional langsung ditaruh di desktop.
import { adminRoute, layoutOf, strList } from '@/lib/api';
import { createDesktopItem, createProjectQuick } from '@/lib/repo';

export const dynamic = 'force-dynamic';

export const POST = adminRoute(async body => {
  const { id, name } = await createProjectQuick({
    name: typeof body.name === 'string' ? body.name : '',
    categories: strList(body.categories),
    images: strList(body.images),
  });
  let desktopId: string | null = null;
  if (body.desktop && typeof body.desktop === 'object') {
    desktopId = await createDesktopItem({
      kind: 'project', ref: id, x: body.desktop.x, y: body.desktop.y, layout: layoutOf(body.desktop.layout),
    });
  }
  return { id, name, desktopId };
});
