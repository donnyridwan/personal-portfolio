'use client';
// Daftar gambar/PDF: upload ke Cloudinary, tempel URL, hapus, geser urutan.
import { useState } from 'react';
import { checkFile, displaySrc, uploadToCloudinary, type UploadKind } from '@/lib/upload-client';

type Props = {
  value: string[];
  onChange: (urls: string[]) => void;
  folder: string;
  multiple?: boolean;
  kind?: UploadKind;
};

export default function ImageField({ value, onChange, folder, multiple = false, kind = 'image' }: Props) {
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [pasted, setPasted] = useState('');

  const add = (urls: string[]) => onChange(multiple ? [...value, ...urls] : urls.slice(-1));

  async function onFiles(files: FileList | null) {
    if (!files?.length) return;
    const list = Array.from(files);
    const bad = list.map(f => checkFile(f, kind)).find(Boolean);
    if (bad) return setError(bad);
    setError('');
    const done: string[] = [];
    try {
      for (const [i, f] of list.entries()) {
        setBusy(list.length > 1 ? `Mengunggah ${i + 1}/${list.length}…` : 'Mengunggah…');
        done.push(await uploadToCloudinary(f, folder));
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      if (done.length) add(done);
      setBusy('');
    }
  }

  function onPaste() {
    const url = pasted.trim();
    if (!url) return;
    if (!/^https?:\/\//.test(url)) return setError('URL harus diawali http:// atau https://');
    setError('');
    add([url]);
    setPasted('');
  }

  const moveTo = (i: number, j: number) => {
    const next = [...value];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };

  return (
    <div>
      {value.length > 0 && (
        <div className="adm-images">
          {value.map((src, i) => (
            <div className="adm-image" key={`${src}-${i}`}>
              {kind === 'pdf' ? (
                <a href={displaySrc(src)} target="_blank" rel="noopener" className="adm-pdf">Buka PDF ↗</a>
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={displaySrc(src)} alt="" loading="lazy" />
              )}
              <div className="adm-actions">
                {multiple && (
                  <>
                    <button type="button" className="adm-btn adm-icon" disabled={i === 0} onClick={() => moveTo(i, i - 1)} aria-label="Geser ke kiri">←</button>
                    <button type="button" className="adm-btn adm-icon" disabled={i === value.length - 1} onClick={() => moveTo(i, i + 1)} aria-label="Geser ke kanan">→</button>
                  </>
                )}
                <button type="button" className="adm-btn adm-icon adm-danger" onClick={() => onChange(value.filter((_, k) => k !== i))} aria-label="Hapus">✕</button>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="adm-upload-row">
        <label className="adm-btn adm-file">
          {busy || (kind === 'pdf' ? 'Upload PDF' : multiple ? 'Upload gambar' : value.length ? 'Ganti gambar' : 'Upload gambar')}
          <input
            type="file"
            accept={kind === 'pdf' ? 'application/pdf' : 'image/jpeg,image/png,image/webp,image/gif'}
            multiple={multiple}
            disabled={!!busy}
            onChange={e => { onFiles(e.target.files); e.target.value = ''; }}
          />
        </label>
        <input
          type="url"
          placeholder="…atau tempel URL"
          value={pasted}
          onChange={e => setPasted(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); onPaste(); } }}
        />
        <button type="button" className="adm-btn" onClick={onPaste}>Tambah URL</button>
      </div>
      {error && <p className="adm-error" role="alert" style={{ marginTop: 8 }}>{error}</p>}
    </div>
  );
}
