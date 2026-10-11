import React from 'react';
import { TextInput, TextArea } from './fields';

export default function TextBlockEditor({ block, onChange }) {
  return (
    <div className="flex flex-col gap-4">
      <TextInput label="Label kecil" value={block.label} onChange={(label) => onChange({ label })} placeholder="01 — Challenge" />
      <TextInput label="Judul" value={block.heading} onChange={(heading) => onChange({ heading })} placeholder="Apa masalah utamanya?" />
      <TextArea label="Isi" value={block.body} onChange={(body) => onChange({ body })} placeholder="Ceritakan konteks, proses, atau hasilnya..." rows={5} />
    </div>
  );
}
