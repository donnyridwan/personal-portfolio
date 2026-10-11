import React from 'react';
import { Trash2 } from 'lucide-react';
import { TextInput } from './fields';

const MAX_ITEMS = 4;

export default function MetricsBlockEditor({ block, onChange }) {
  const updateItem = (idx, patch) =>
    onChange({ items: block.items.map((item, i) => (i === idx ? { ...item, ...patch } : item)) });

  return (
    <div className="flex flex-col gap-3">
      {block.items.map((item, idx) => (
        <div key={idx} className="grid grid-cols-[1fr_2fr_auto] gap-3 items-end">
          <TextInput label="Angka" value={item.value} onChange={(value) => updateItem(idx, { value })} placeholder="48%" />
          <TextInput label="Label" value={item.label} onChange={(label) => updateItem(idx, { label })} placeholder="Faster grading" />
          <button
            type="button"
            disabled={block.items.length <= 1}
            onClick={() => onChange({ items: block.items.filter((_, i) => i !== idx) })}
            className="h-[38px] px-2 text-[#999] hover:text-red-600 disabled:opacity-30 disabled:hover:text-[#999] cursor-pointer disabled:cursor-not-allowed"
            title="Hapus angka"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ))}
      {block.items.length < MAX_ITEMS && (
        <button
          type="button"
          onClick={() => onChange({ items: [...block.items, { value: '', label: '' }] })}
          className="self-start px-4 py-2 border border-dashed border-[#c9c9cc] text-[12.5px] text-[#555] hover:border-black hover:text-black cursor-pointer"
        >
          + Tambah angka
        </button>
      )}
    </div>
  );
}
