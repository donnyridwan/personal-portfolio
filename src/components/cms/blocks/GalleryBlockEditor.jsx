import React from 'react';
import { Trash2 } from 'lucide-react';
import MediaUploader from '../MediaUploader';
import { TextInput, labelClass } from './fields';

export default function GalleryBlockEditor({ block, onChange }) {
  const updateImage = (idx, patch) =>
    onChange({ images: block.images.map((img, i) => (i === idx ? { ...img, ...patch } : img)) });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col">
        <span className={labelClass}>Kolom di desktop</span>
        <div className="flex items-center gap-1 bg-[#efeeec] p-0.5 w-fit text-[12px]">
          {[2, 3].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => onChange({ columns: n })}
              className={`px-3 py-1 cursor-pointer ${block.columns === n ? 'bg-black text-white font-medium' : 'text-[#666] hover:text-black'}`}
            >
              {n} kolom
            </button>
          ))}
        </div>
      </div>

      {block.images.map((img, idx) => (
        <div key={idx} className="border border-[#e5e5e7] bg-white p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-medium text-[#171717]">Gambar {idx + 1}</span>
            <button
              type="button"
              onClick={() => onChange({ images: block.images.filter((_, i) => i !== idx) })}
              className="p-1.5 text-[#999] hover:text-red-600 cursor-pointer"
              title="Hapus gambar"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          <MediaUploader value={img.url} mediaType="image" onChange={(url) => updateImage(idx, { url })} />
          <TextInput label="Caption" value={img.caption} onChange={(caption) => updateImage(idx, { caption })} placeholder="Opsional" />
        </div>
      ))}

      <button
        type="button"
        onClick={() => onChange({ images: [...block.images, { url: '', caption: '' }] })}
        className="self-start px-4 py-2 border border-dashed border-[#c9c9cc] text-[12.5px] text-[#555] hover:border-black hover:text-black cursor-pointer"
      >
        + Tambah gambar
      </button>
    </div>
  );
}
