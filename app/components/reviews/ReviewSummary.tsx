import type {ReviewSummaryData} from '~/lib/reviews/types';
import {ReviewStars} from './ReviewStars';

export function ReviewSummary({
  summary,
  heading = 'Customer reviews',
}: {
  summary: ReviewSummaryData;
  heading?: string;
}) {
  if (!summary.count) return null;

  const max = Math.max(...Object.values(summary.distribution), 1);

  return (
    <section className="review-summary" aria-labelledby="review-summary-heading">
      <div>
        <p className="eyebrow">{heading}</p>
        <p className="review-average">{summary.average.toFixed(1)}</p>
        <ReviewStars rating={summary.average} count={summary.count} />
        <p>{summary.count} review{summary.count === 1 ? '' : 's'}</p>
      </div>
      <div className="distribution" aria-label="Rating distribution">
        {([5, 4, 3, 2, 1] as const).map((star) => (
          <div className="distribution-row" key={star}>
            <span>{star} star</span>
            <div className="distribution-bar">
              <span style={{width: `${(summary.distribution[star] / max) * 100}%`}} />
            </div>
            <span>{summary.distribution[star]}</span>
          </div>
        ))}
      </div>
      <p id="review-summary-heading" className="sr-only">
        {heading}
      </p>
    </section>
  );
}
