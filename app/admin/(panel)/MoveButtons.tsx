// Tombol ↑ ↓ untuk satu baris; masing-masing form kecil ke Server Action.
type Props = { id: string; action: (f: FormData) => Promise<void>; first: boolean; last: boolean };

export default function MoveButtons({ id, action, first, last }: Props) {
  return (
    <span className="adm-actions">
      <form action={action} className="adm-inline">
        <input type="hidden" name="id" value={id} />
        <input type="hidden" name="dir" value="up" />
        <button className="adm-btn adm-icon" disabled={first} aria-label="Naikkan">↑</button>
      </form>
      <form action={action} className="adm-inline">
        <input type="hidden" name="id" value={id} />
        <input type="hidden" name="dir" value="down" />
        <button className="adm-btn adm-icon" disabled={last} aria-label="Turunkan">↓</button>
      </form>
    </span>
  );
}
