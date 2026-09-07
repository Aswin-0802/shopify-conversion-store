import {classNames} from '~/lib/collection';

type ReviewStarsProps = {
  rating: number;
  count?: number;
  size?: 'sm' | 'md';
  label?: string;
};

export function ReviewStars({rating, count, size = 'md', label}: ReviewStarsProps) {
  const clamped = Math.max(0, Math.min(5, rating));
  const text = label || `${clamped.toFixed(1)} out of 5 stars`;

  return (
    <div className={classNames('stars', size === 'sm' && 'stars-sm')} aria-label={text}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star} aria-hidden="true">
          {clamped >= star - 0.25 ? '★' : '☆'}
        </span>
      ))}
      {typeof count === 'number' ? (
        <span className="sr-only">{count} reviews</span>
      ) : null}
    </div>
  );
}
