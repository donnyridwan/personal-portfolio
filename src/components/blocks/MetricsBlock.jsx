import React from 'react';

const COLUMNS = { 1: 'md:grid-cols-1', 2: 'md:grid-cols-2', 3: 'md:grid-cols-3', 4: 'md:grid-cols-4' };

export default function MetricsBlock({ items }) {
  const visible = items.filter((item) => item.value && item.value.trim());
  return (
    <div className={`grid grid-cols-2 ${COLUMNS[visible.length] || COLUMNS[4]} gap-4 md:gap-6`}>
      {visible.map((item, idx) => (
        <div
          key={idx}
          className="bg-[#f5f5f7] border border-[#e5e5e7] p-6 md:p-8 flex flex-col items-start justify-end gap-3"
        >
          <span className="font-serif font-normal text-[44px] md:text-[60px] leading-none tracking-tight text-[#171717]">
            {item.value}
          </span>
          {item.label && <span className="text-[13px] text-[#525252] tracking-[-0.2px]">{item.label}</span>}
        </div>
      ))}
    </div>
  );
}
