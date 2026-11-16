import { requireAdmin } from '@/lib/auth';
import { logout } from '../session-actions';
import NavLinks from './NavLinks';

export const dynamic = 'force-dynamic';

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return (
    <>
      <header className="adm-header">
        <strong className="adm-brand">Dockfolio</strong>
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
