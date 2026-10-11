import React from 'react';
import Caption from './Caption';

export default function VideoBlock({ url, caption }) {
  return (
    <figure>
      <video src={url} autoPlay loop muted playsInline className="w-full h-auto block bg-[#f5f5f7]" />
      <Caption>{caption}</Caption>
    </figure>
  );
}
