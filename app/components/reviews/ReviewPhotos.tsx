import type {ReviewPhoto} from '~/lib/reviews/types';

export function ReviewPhotos({photos}: {photos: ReviewPhoto[]}) {
  if (!photos.length) return null;

  return (
    <div className="review-photos">
      {photos.map((photo) => (
        <img key={photo.url} src={photo.url} alt={photo.alt} loading="lazy" />
      ))}
    </div>
  );
}
