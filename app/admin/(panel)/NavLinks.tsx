'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const LINKS = [
  { href: '/admin/projects', label: 'Proyek' },
  { href: '/admin/categories', label: 'Kategori' },
  { href: '/admin/profile', label: 'Profil' },
  { href: '/admin/messages', label: 'Pesan' },
];

export default function NavLinks() {
  const path = usePathname();
  const active = (href: string) =>
    path.startsWith(href);
  return (
    <nav className="adm-nav">
      {LINKS.map(l => (
        <Link key={l.href} href={l.href} aria-current={active(l.href) ? 'page' : undefined}>{l.label}</Link>
      ))}
    </nav>
  );
}
