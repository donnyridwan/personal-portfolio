import React from 'react';

export default function Caption({ children }) {
  if (!children) return null;
  return <figcaption className="text-[12px] text-[#a3a3a3] tracking-[-0.1px] mt-2.5">{children}</figcaption>;
}
