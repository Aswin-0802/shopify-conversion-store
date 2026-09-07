export type ReviewPhoto = {
  url: string;
  alt: string;
};

export type ProductReview = {
  id: string;
  productId?: string;
  productHandle?: string;
  productTitle?: string;
  author: string;
  title?: string;
  body: string;
  rating: number;
  createdAt?: string;
  photos: ReviewPhoto[];
  verified?: boolean;
};

export type ReviewSummaryData = {
  average: number;
  count: number;
  distribution: Record<1 | 2 | 3 | 4 | 5, number>;
};

export type ReviewSource = 'shopify-metafields' | 'judgeme' | 'none';

export type ReviewCatalog = {
  source: ReviewSource;
  summary: ReviewSummaryData;
  reviews: ProductReview[];
};
