import React from 'react';
import Caption from './Caption';

export default function ImageBlock({ url, caption }) {
  return (
    <figure>
      <img src={url} alt={caption || ''} loading="lazy" className="w-full h-auto block bg-[#f5f5f7]" />
      <Caption>{caption}</Caption>
    </figure>
  );
}
