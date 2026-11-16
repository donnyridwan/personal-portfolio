'use client';
// Di dalam jendela "Edit Detail" (iframe di desktop mode edit): setelah simpan/hapus proyek,
// beri tahu desktop supaya jendelanya ditutup dan data dimuat ulang.
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

export default function EmbedBridge() {
  const path = usePathname();
  const params = useSearchParams();
  useEffect(() => {
    if (window.top === window.self) return;
    if (path === '/admin/projects' && (params.has('saved') || params.has('deleted'))) {
      window.parent.postMessage({ type: 'dockfolio:done' }, location.origin);
    }
  }, [path, params]);
  return null;
}
