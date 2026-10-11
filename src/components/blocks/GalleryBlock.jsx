import React from 'react';
import Caption from './Caption';

// Static class map so Tailwind keeps both column variants
const COLUMNS = { 2: 'md:grid-cols-2', 3: 'md:grid-cols-3' };

export default function GalleryBlock({ columns, images }) {
  const visible = images.filter((img) => img.url && img.url.trim());
  return (
    <div className={`grid grid-cols-1 ${COLUMNS[columns] || COLUMNS[2]} gap-4 md:gap-6`}>
      {visible.map((img, idx) => (
        <figure key={`${img.url}-${idx}`}>
          <div className="w-full aspect-[4/3] overflow-hidden bg-[#f5f5f7]">
            <img src={img.url} alt={img.caption || ''} loading="lazy" className="w-full h-full object-cover" />
          </div>
          <Caption>{img.caption}</Caption>
        </figure>
      ))}
    </div>
  );
}
