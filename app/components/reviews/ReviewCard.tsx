import {Link} from 'react-router';
import {formatReviewDate} from '~/lib/reviews/parse';
import type {ProductReview} from '~/lib/reviews/types';
import {ReviewPhotos} from './ReviewPhotos';
import {ReviewStars} from './ReviewStars';

export function ReviewCard({review}: {review: ProductReview}) {
  return (
    <article className="review-card">
      <ReviewStars rating={review.rating} />
      <div>
        <strong>{review.author}</strong>
        {review.verified ? <span> · Verified buyer</span> : null}
        {review.createdAt ? <span> · {formatReviewDate(review.createdAt)}</span> : null}
      </div>
      {review.title ? <h3>{review.title}</h3> : null}
      {review.productHandle ? (
        <Link to={`/products/${review.productHandle}`}>{review.productTitle}</Link>
      ) : null}
      <p>{review.body}</p>
      <ReviewPhotos photos={review.photos} />
    </article>
  );
}
