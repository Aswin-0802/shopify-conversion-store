export const SORT_OPTIONS = [
  {label: 'Featured', value: 'featured'},
  {label: 'Best selling', value: 'best-selling'},
  {label: 'Newest', value: 'newest'},
  {label: 'Price: low to high', value: 'price-asc'},
  {label: 'Price: high to low', value: 'price-desc'},
  {label: 'Title: A–Z', value: 'title-asc'},
  {label: 'Title: Z–A', value: 'title-desc'},
] as const;

export type CollectionSortValue = (typeof SORT_OPTIONS)[number]['value'];

export function parseCollectionSort(value: string | null) {
  switch (value) {
    case 'best-selling':
      return {sortKey: 'BEST_SELLING' as const, reverse: false};
    case 'newest':
      return {sortKey: 'CREATED' as const, reverse: true};
    case 'price-asc':
      return {sortKey: 'PRICE' as const, reverse: false};
    case 'price-desc':
      return {sortKey: 'PRICE' as const, reverse: true};
    case 'title-asc':
      return {sortKey: 'TITLE' as const, reverse: false};
    case 'title-desc':
      return {sortKey: 'TITLE' as const, reverse: true};
    default:
      return {sortKey: 'COLLECTION_DEFAULT' as const, reverse: false};
  }
}

export function parseCollectionFilters(searchParams: URLSearchParams) {
  const filters: Array<Record<string, unknown>> = [];

  for (const value of searchParams.getAll('filter')) {
    try {
      const parsed = JSON.parse(value) as Record<string, unknown>;
      if (parsed && typeof parsed === 'object') filters.push(parsed);
    } catch {
      // Ignore malformed filter params.
    }
  }

  return filters;
}

export function isOnSale(price?: {amount: string} | null, compareAt?: {amount: string} | null) {
  if (!price || !compareAt) return false;
  return Number(compareAt.amount) > Number(price.amount);
}

export function classNames(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(' ');
}

type StoreImage = {
  id?: string | null;
  url: string;
  altText?: string | null;
  width?: number | null;
  height?: number | null;
} | null | undefined;

export function collectionImage(collection?: {
  image?: StoreImage;
  products?: {nodes?: Array<{featuredImage?: StoreImage}>};
} | null) {
  return collection?.image || collection?.products?.nodes?.[0]?.featuredImage || null;
}
