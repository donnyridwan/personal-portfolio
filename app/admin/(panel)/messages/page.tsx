import { listContactMessages } from '@/lib/repo';
import { deleteMessageAction } from './actions';

export const metadata = { title: 'Pesan · Donny Ridwan · Admin' };

const fmt = (d: string) =>
  new Date(d).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Jakarta' });

export default async function MessagesPage() {
  const messages = await listContactMessages();
  return (
    <>
      <h1>Pesan</h1>
      <p className="adm-muted">Kiriman dari formulir &ldquo;Get in touch&rdquo; di app Contact (dock). Waktu dalam WIB.</p>
      {messages.length === 0 ? (
        <div className="adm-card adm-muted">Belum ada pesan.</div>
      ) : messages.map(m => (
        <div className="adm-card" key={m.id}>
          <div className="adm-toprow" style={{ marginBottom: 8 }}>
            <div>
              <strong>{m.name || '(tanpa nama)'}</strong>{' '}
              {m.email && <a href={`mailto:${m.email}`}>{m.email}</a>}
              <div className="adm-muted" style={{ fontSize: 12 }}>{fmt(m.created_at)}</div>
            </div>
            <form action={deleteMessageAction}>
              <input type="hidden" name="id" value={m.id} />
              <button className="adm-btn adm-danger">Hapus</button>
            </form>
          </div>
          <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{m.message || <span className="adm-muted">(kosong)</span>}</p>
        </div>
      ))}
    </>
  );
}
