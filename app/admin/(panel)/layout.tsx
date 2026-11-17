import { requireAdmin } from '@/lib/auth';
import { logout } from '../session-actions';
import { Suspense } from 'react';
import EmbedBridge from './EmbedBridge';
import NavLinks from './NavLinks';

export const dynamic = 'force-dynamic';

// Dijalankan sebelum render supaya header admin tidak sempat berkedip di dalam iframe.
const EMBED_SCRIPT = `if(window.top!==window.self)document.documentElement.classList.add('adm-embed');`;

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return (
    <>
      {/* Di dalam jendela "Edit Detail" (iframe) header disembunyikan; setelah simpan/hapus, beri tahu desktop. */}
      <script dangerouslySetInnerHTML={{ __html: EMBED_SCRIPT }} />
      <Suspense fallback={null}><EmbedBridge /></Suspense>
      <header className="adm-header">
        <strong className="adm-brand">Donny Ridwan</strong>
        <a href="/?edit" className="adm-btn adm-primary">Desktop (mode edit)</a>
        <NavLinks />
        <div className="adm-header-end">
          <a href="/" target="_blank" rel="noopener">Lihat situs ↗</a>
          <form action={logout}><button className="adm-btn">Logout</button></form>
        </div>
      </header>
      <main className="adm-main">{children}</main>
    </>
  );
}
