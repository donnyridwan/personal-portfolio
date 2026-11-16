// POST /api/admin/desktop — ikon baru (foto/file hasil upload, atau proyek/folder yang sudah ada).
import { adminRoute, layoutOf } from '@/lib/api';
import { createDesktopItem } from '@/lib/repo';

export const dynamic = 'force-dynamic';

export const POST = adminRoute(async body => {
  const id = await createDesktopItem({
    kind: body.kind,
    ref: typeof body.ref === 'string' ? body.ref : '',
    label: typeof body.label === 'string' ? body.label : '',
    src: typeof body.src === 'string' ? body.src : '',
    x: body.x,
    y: body.y,
    layout: layoutOf(body.layout),
  });
  return { id };
});
