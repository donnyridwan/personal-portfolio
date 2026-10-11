import React from 'react';
import { isRenderable } from '../../lib/blocks';
import TextBlock from './TextBlock';
import ImageBlock from './ImageBlock';
import GalleryBlock from './GalleryBlock';
import VideoBlock from './VideoBlock';
import MetricsBlock from './MetricsBlock';
import QuoteBlock from './QuoteBlock';

const COMPONENTS = {
  text: TextBlock,
  image: ImageBlock,
  gallery: GalleryBlock,
  video: VideoBlock,
  metrics: MetricsBlock,
  quote: QuoteBlock,
};

export default function BlockRenderer({ blocks }) {
  const visible = blocks.filter(isRenderable);
  if (visible.length === 0) return null;

  return (
    <div className="flex flex-col gap-10 md:gap-16">
      {visible.map((block) => {
        const Component = COMPONENTS[block.type];
        return <Component key={block.id} {...block} />;
      })}
    </div>
  );
}
