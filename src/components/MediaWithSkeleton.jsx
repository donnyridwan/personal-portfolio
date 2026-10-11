import React, { useEffect, useRef, useState } from 'react';

// Image or video that shows a pulsing skeleton until the media is ready, then fades in.
// mode="fill": fills a parent that sets the size (e.g. aspect-[4/3]); media is cropped with object-cover.
// mode="natural": full width at the media's own height; holds a 4:3 skeleton until it knows its size.
export default function MediaWithSkeleton({ url, mediaType = 'image', alt = '', mode = 'fill', mediaClassName = '', lazy = false }) {
  const [ready, setReady] = useState(false);
  const imgRef = useRef(null);

  // Cached images can finish loading before React attaches onLoad; reset when the source changes
  useEffect(() => {
    const img = imgRef.current;
    setReady(Boolean(img && img.complete && img.naturalWidth > 0));
  }, [url]);

  // A broken file stops the pulse instead of shimmering forever
  const done = () => setReady(true);
  const isVideo = mediaType === 'video';
  const fade = `transition-opacity duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${ready ? 'opacity-100' : 'opacity-0'}`;
  const skeleton = 'bg-[#efefef] motion-safe:animate-pulse';

  if (mode === 'natural') {
    const media = `w-full h-auto block ${fade} ${mediaClassName}`;
    return (
      <div className={ready ? '' : `aspect-[4/3] ${skeleton}`} data-skeleton={ready ? undefined : ''}>
        {isVideo ? (
          <video src={url} autoPlay loop muted playsInline onLoadedData={done} onError={done} className={media} />
        ) : (
          <img ref={imgRef} src={url} alt={alt} loading={lazy ? 'lazy' : undefined} onLoad={done} onError={done} className={media} />
        )}
      </div>
    );
  }

  const media = `absolute inset-0 w-full h-full object-cover ${fade} ${mediaClassName}`;
  return (
    <>
      {!ready && <div className={`absolute inset-0 ${skeleton}`} data-skeleton="" />}
      {isVideo ? (
        <video src={url} autoPlay loop muted playsInline onLoadedData={done} onError={done} className={media} />
      ) : (
        <img ref={imgRef} src={url} alt={alt} loading={lazy ? 'lazy' : undefined} onLoad={done} onError={done} className={media} />
      )}
    </>
  );
}
