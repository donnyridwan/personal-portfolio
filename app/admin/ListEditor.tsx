'use client';
// Daftar baris yang bisa ditambah/dihapus/digeser (angka, pengalaman, testimoni di halaman About).
type Field = { key: string; label: string; textarea?: boolean; width?: string; placeholder?: string };
type Row = Record<string, string>;

type Props = { name: string; fields: Field[]; value: Row[]; onChange: (rows: Row[]) => void; addLabel: string };

export default function ListEditor({ name, fields, value, onChange, addLabel }: Props) {
  const set = (i: number, k: string, v: string) => onChange(value.map((r, j) => (j === i ? { ...r, [k]: v } : r)));
  const move = (i: number, d: number) => {
    const next = [...value];
    [next[i], next[i + d]] = [next[i + d], next[i]];
    onChange(next);
  };
  return (
    <div>
      <input type="hidden" name={name} value={JSON.stringify(value)} />
      <div className="adm-rows">
        {value.map((r, i) => (
          <div className="adm-card adm-list-row" key={i}>
            <div className="adm-list-fields">
              {fields.map(f => (
                <label key={f.key} className="adm-field" style={{ flex: f.width ?? '1 1 160px' }}>
                  <span>{f.label}</span>
                  {f.textarea
                    ? <textarea rows={2} value={r[f.key] ?? ''} placeholder={f.placeholder} onChange={e => set(i, f.key, e.target.value)} />
                    : <input type="text" value={r[f.key] ?? ''} placeholder={f.placeholder} onChange={e => set(i, f.key, e.target.value)} />}
                </label>
              ))}
            </div>
            <div className="adm-actions">
              <button type="button" className="adm-btn adm-icon" disabled={i === 0} onClick={() => move(i, -1)} aria-label="Naikkan">↑</button>
              <button type="button" className="adm-btn adm-icon" disabled={i === value.length - 1} onClick={() => move(i, 1)} aria-label="Turunkan">↓</button>
              <button type="button" className="adm-btn adm-icon adm-danger" onClick={() => onChange(value.filter((_, j) => j !== i))} aria-label="Hapus">✕</button>
            </div>
          </div>
        ))}
      </div>
      <button type="button" className="adm-btn" onClick={() => onChange([...value, Object.fromEntries(fields.map(f => [f.key, '']))])}>+ {addLabel}</button>
    </div>
  );
}
