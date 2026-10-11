import React from 'react';
import MediaUploader from '../MediaUploader';
import { TextInput } from './fields';

// Shared by the Image and Video blocks: one uploaded asset plus a caption
export default function MediaBlockEditor({ block, onChange, mediaType }) {
  return (
    <div className="flex flex-col gap-4">
      <MediaUploader value={block.url} mediaType={mediaType} onChange={(url) => onChange({ url })} />
      <TextInput label="Caption" value={block.caption} onChange={(caption) => onChange({ caption })} placeholder="Opsional" />
    </div>
  );
}
