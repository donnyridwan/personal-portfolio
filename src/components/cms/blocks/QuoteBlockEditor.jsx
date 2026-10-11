import React from 'react';
import { TextInput, TextArea } from './fields';

export default function QuoteBlockEditor({ block, onChange }) {
  return (
    <div className="flex flex-col gap-4">
      <TextArea label="Kutipan" value={block.text} onChange={(text) => onChange({ text })} placeholder="Apa kata klien tentang hasil kerjanya?" rows={3} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <TextInput label="Nama" value={block.name} onChange={(name) => onChange({ name })} placeholder="Selena Ramos" />
        <TextInput label="Jabatan" value={block.role} onChange={(role) => onChange({ role })} placeholder="Product Lead, EdTech" />
      </div>
    </div>
  );
}
