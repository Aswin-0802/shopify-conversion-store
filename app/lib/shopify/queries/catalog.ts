import {PRODUCT_CARD_FRAGMENT} from '../fragments/product';

export const FEATURED_COLLECTIONS_QUERY = `#graphql
  query FeaturedCollections($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    collections(first: 4, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        id
        handle
        title
        description
        image {
          id
          url
          altText
          width
          height
        }
        products(first: 8) {
          nodes {
            featuredImage {
              id
              url
              altText
              width
              height
            }
          }
        }
      }
    }
  }
`;

export const FEATURED_PRODUCTS_QUERY = `#graphql
  ${PRODUCT_CARD_FRAGMENT}
  query FeaturedProducts($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    products(first: 12, sortKey: BEST_SELLING) {
      nodes {
        ...ProductCard
      }
    }
  }
`;

export const SHOP_INFO_QUERY = `#graphql
  query ShopInfo($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    shop {
      name
      description
      primaryDomain {
        url
      }
      brand {
        slogan
        shortDescription
        coverImage {
          image {
            url
            altText
            width
            height
          }
        }
        squareLogo {
          image {
            url
            altText
            width
            height
          }
        }
      }
    }
  }
`;

export const REVIEW_PRODUCTS_QUERY = `#graphql
  query ReviewProducts($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    products(first: 50, sortKey: BEST_SELLING) {
      nodes {
        id
        handle
        title
        featuredImage {
          url
          altText
          width
          height
        }
        rating: metafield(namespace: "reviews", key: "rating") {
          value
        }
        ratingCount: metafield(namespace: "reviews", key: "rating_count") {
          value
        }
      }
    }
  }
`;
