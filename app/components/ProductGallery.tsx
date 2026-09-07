import {useEffect, useMemo, useRef, useState} from 'react';
import {Image} from '@shopify/hydrogen';

type GalleryImage = {
  id?: string | null;
  url: string;
  altText?: string | null;
  width?: number | null;
  height?: number | null;
};

const MAX_THUMBS = 7;

function zoomUrl(url: string) {
  try {
    const parsed = new URL(url);
    parsed.searchParams.set('width', '1600');
    return parsed.toString();
  } catch {
    return url;
  }
}

export function ProductGallery({
  images,
  title,
  featuredImage,
}: {
  images: GalleryImage[];
  title: string;
  featuredImage?: GalleryImage | null;
}) {
  const ordered = useMemo(() => {
    const source = featuredImage?.url
      ? [
          featuredImage,
          ...images.filter(
            (image) => image.id !== featuredImage.id && image.url !== featuredImage.url,
          ),
        ]
      : images;
    return source.slice(0, MAX_THUMBS);
  }, [featuredImage, images]);

  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState({on: false, x: 50, y: 50});
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setActive(0);
    setZoom({on: false, x: 50, y: 50});
  }, [featuredImage?.id, featuredImage?.url]);

  const current = ordered[active] || ordered[0];

  if (!current) {
    return <div className="gallery-main skeleton skeleton-card" />;
  }

  const hasThumbs = ordered.length > 1;

  function moveZoom(event: React.MouseEvent<HTMLDivElement>) {
    const box = stageRef.current?.getBoundingClientRect();
    if (!box) return;
    const x = Math.min(100, Math.max(0, ((event.clientX - box.left) / box.width) * 100));
    const y = Math.min(100, Math.max(0, ((event.clientY - box.top) / box.height) * 100));
    setZoom({on: true, x, y});
  }

  return (
    <div className={`gallery${hasThumbs ? ' has-thumbs' : ''}`}>
      {hasThumbs ? (
        <div className="gallery-thumbs" aria-label="Product images">
          {ordered.map((image, index) => (
            <button
              type="button"
              key={image.id || image.url}
              aria-label={`View image ${index + 1}`}
              aria-current={index === active ? true : undefined}
              onMouseEnter={() => setActive(index)}
              onFocus={() => setActive(index)}
              onClick={() => setActive(index)}
            >
              <Image alt="" data={image} sizes="56px" />
            </button>
          ))}
        </div>
      ) : null}
      <div
        className={`gallery-main${zoom.on ? ' is-zooming' : ''}`}
        ref={stageRef}
        onMouseEnter={moveZoom}
        onMouseMove={moveZoom}
        onMouseLeave={() => setZoom((value) => ({...value, on: false}))}
      >
        <Image
          alt={current.altText || title}
          data={current}
          sizes="(min-width: 900px) 520px, 90vw"
        />
        <div
          className="gallery-zoom"
          aria-hidden="true"
          style={{
            backgroundImage: `url(${zoomUrl(current.url)})`,
            backgroundPosition: `${zoom.x}% ${zoom.y}%`,
          }}
        />
      </div>
    </div>
  );
}
