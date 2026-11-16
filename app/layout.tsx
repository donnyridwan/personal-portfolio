// Layout root hanya dipakai halaman admin; "/" dilayani public/index.html.
export const metadata = { title: 'Dockfolio Admin', robots: { index: false } };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
