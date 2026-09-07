import type {ReviewSummaryData} from './types';

type RatingMetafield = {
  scale_min?: string | number;
  scale_max?: string | number;
  value?: string | number;
};

export function parseRatingMetafield(value?: string | null) {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value) as RatingMetafield;
    const rating = Number(parsed.value);
    if (!Number.isFinite(rating) || rating <= 0) return null;
    return rating;
  } catch {
    const rating = Number(value);
    return Number.isFinite(rating) && rating > 0 ? rating : null;
  }
}

export function parseRatingCount(value?: string | null) {
  if (!value) return 0;
  const count = Number(value);
  return Number.isFinite(count) && count > 0 ? count : 0;
}

export function emptySummary(): ReviewSummaryData {
  return {
    average: 0,
    count: 0,
    distribution: {1: 0, 2: 0, 3: 0, 4: 0, 5: 0},
  };
}

export function summarizeRatings(ratings: number[]): ReviewSummaryData {
  const summary = emptySummary();
  if (!ratings.length) return summary;

  for (const rating of ratings) {
    const star = Math.min(5, Math.max(1, Math.round(rating))) as 1 | 2 | 3 | 4 | 5;
    summary.distribution[star] += 1;
    summary.average += rating;
    summary.count += 1;
  }

  summary.average = Number((summary.average / summary.count).toFixed(2));
  return summary;
}

export function formatReviewDate(value?: string) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}
