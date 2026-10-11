import React from 'react';

export default function QuoteBlock({ text, name, role }) {
  return (
    <figure className="border-l border-[#e5e5e7] pl-6 md:pl-8 max-w-[760px]">
      <blockquote className="font-serif font-normal text-[24px] md:text-[28px] leading-[1.3] tracking-[-0.4px] text-[#171717]">
        “{text}”
      </blockquote>
      {(name || role) && (
        <figcaption className="mt-5 flex flex-col gap-0.5">
          {name && <span className="text-[14px] font-medium text-[#171717] tracking-[-0.2px]">{name}</span>}
          {role && <span className="text-[12.5px] text-[#737373]">{role}</span>}
        </figcaption>
      )}
    </figure>
  );
}
