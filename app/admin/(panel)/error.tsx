'use client';
// Database Neon bisa sedang bangun (±1–2 detik) atau tidak terjangkau.
export default function AdminError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="adm-card">
      <h2>Data belum bisa dimuat</h2>
      <p className="adm-muted">Database mungkin sedang bangun atau koneksi terputus.</p>
      <button className="adm-btn adm-primary" onClick={reset}>Coba lagi</button>
    </div>
  );
}
