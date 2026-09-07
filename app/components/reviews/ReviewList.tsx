import type {ProductReview} from '~/lib/reviews/types';
import {ReviewCard} from './ReviewCard';

export function ReviewList({reviews}: {reviews: ProductReview[]}) {
  if (!reviews.length) return null;

  return (
    <div>
      {reviews.map((review) => (
        <ReviewCard key={review.id} review={review} />
      ))}
    </div>
  );
}
