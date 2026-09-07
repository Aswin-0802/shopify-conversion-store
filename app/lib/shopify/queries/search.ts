import {PRODUCT_CARD_FRAGMENT} from '../fragments/product';

export const CATALOG_SEARCH_QUERY = `#graphql
  ${PRODUCT_CARD_FRAGMENT}
  query CatalogSearch(
    $country: CountryCode
    $language: LanguageCode
    $query: String!
    $first: Int
  ) @inContext(country: $country, language: $language) {
    products(first: $first, query: $query) {
      nodes {
        ...ProductCard
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
    collections(first: 6, query: $query) {
      nodes {
        __typename
        id
        title
        handle
        image {
          url
          altText
          width
          height
        }
      }
    }
  }
`;
