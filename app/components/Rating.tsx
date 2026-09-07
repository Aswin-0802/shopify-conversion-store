import {parseRatingCount, parseRatingMetafield} from '~/lib/reviews/parse';
import {ReviewStars} from './reviews/ReviewStars';

type RatingProps = {
  ratingMetafield?: string | null;
  ratingCountMetafield?: string | null;
};

export function Rating({ratingMetafield, ratingCountMetafield}: RatingProps) {
  const rating = parseRatingMetafield(ratingMetafield);
  const count = parseRatingCount(ratingCountMetafield);
  if (!rating) return null;

  return (
    <div className="product-rating">
      <ReviewStars rating={rating} count={count} size="sm" />
      {count ? <span>{count}</span> : null}
    </div>
  );
}
