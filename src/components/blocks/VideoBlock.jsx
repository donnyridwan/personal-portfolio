import React from 'react';
import Caption from './Caption';
import MediaWithSkeleton from '../MediaWithSkeleton';

export default function VideoBlock({ url, caption }) {
  return (
    <figure>
      <MediaWithSkeleton url={url} mediaType="video" mode="natural" />
      <Caption>{caption}</Caption>
    </figure>
  );
}
