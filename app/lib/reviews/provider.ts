import {emptySummary, parseRatingCount, parseRatingMetafield, summarizeRatings} from './parse';

export {emptySummary};
import type {ProductReview, ReviewCatalog, ReviewSource} from './types';

type ReviewMetafields = {
  rating?: {value?: string | null} | null;
  ratingCount?: {value?: string | null} | null;
  judgemeBadge?: {value?: string | null} | null;
};

export function hasJudgeMeConfig(shopDomain?: string | null) {
  return Boolean(shopDomain && shopDomain.trim());
}

export function resolveReviewSource({
  judgemeShopDomain,
  metafields,
}: {
  judgemeShopDomain?: string | null;
  metafields?: ReviewMetafields | null;
}): ReviewSource {
  if (hasJudgeMeConfig(judgemeShopDomain)) return 'judgeme';
  if (parseRatingMetafield(metafields?.rating?.value) || parseRatingCount(metafields?.ratingCount?.value)) {
    return 'shopify-metafields';
  }
  return 'none';
}

export function catalogFromProductMetafields(
  products: Array<{
    id: string;
    handle: string;
    title: string;
    rating?: {value?: string | null} | null;
    ratingCount?: {value?: string | null} | null;
  }>,
  judgemeShopDomain?: string | null,
): ReviewCatalog {
  const ratings: number[] = [];

  for (const product of products) {
    const average = parseRatingMetafield(product.rating?.value);
    const count = parseRatingCount(product.ratingCount?.value);
    if (average && count) {
      for (let i = 0; i < count; i += 1) ratings.push(average);
    } else if (average) {
      ratings.push(average);
    }
  }

  const source = hasJudgeMeConfig(judgemeShopDomain)
    ? 'judgeme'
    : ratings.length
      ? 'shopify-metafields'
      : 'none';

  return {
    source,
    summary: ratings.length ? summarizeRatings(ratings) : emptySummary(),
    reviews: [],
  };
}

export function reviewsJsonLd(reviews: ProductReview[], summary: ReviewCatalog['summary']) {
  if (!summary.count || !summary.average) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'AggregateRating',
    ratingValue: summary.average,
    reviewCount: summary.count,
    bestRating: 5,
    worstRating: 1,
    ...(reviews.length
      ? {
          review: reviews.map((review) => ({
            '@type': 'Review',
            author: {'@type': 'Person', name: review.author},
            datePublished: review.createdAt,
            reviewBody: review.body,
            name: review.title || review.productTitle,
            reviewRating: {
              '@type': 'Rating',
              ratingValue: review.rating,
              bestRating: 5,
              worstRating: 1,
            },
          })),
        }
      : {}),
  };
}
