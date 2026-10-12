import React from 'react';
import Caption from './Caption';
import MediaWithSkeleton from '../MediaWithSkeleton';

export default function ImageBlock({ url, caption }) {
  return (
    <figure>
      <MediaWithSkeleton url={url} alt={caption || ''} mode="natural" lazy />
      <Caption>{caption}</Caption>
    </figure>
  );
}
