import {PRODUCT_CARD_FRAGMENT} from '../fragments/product';

export const PRODUCT_VARIANT_FRAGMENT = `#graphql
  fragment ProductVariant on ProductVariant {
    availableForSale
    compareAtPrice {
      amount
      currencyCode
    }
    id
    image {
      __typename
      id
      url
      altText
      width
      height
    }
    price {
      amount
      currencyCode
    }
    product {
      title
      handle
    }
    selectedOptions {
      name
      value
    }
    sku
    title
    unitPrice {
      amount
      currencyCode
    }
  }
`;

export const PRODUCT_QUERY = `#graphql
  ${PRODUCT_VARIANT_FRAGMENT}
  query Product(
    $country: CountryCode
    $handle: String!
    $language: LanguageCode
    $selectedOptions: [SelectedOptionInput!]!
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      id
      title
      vendor
      handle
      descriptionHtml
      description
      encodedVariantExistence
      encodedVariantAvailability
      availableForSale
      tags
      options {
        name
        optionValues {
          name
          firstSelectableVariant {
            ...ProductVariant
          }
          swatch {
            color
            image {
              previewImage {
                url
              }
            }
          }
        }
      }
      images(first: 12) {
        nodes {
          id
          url
          altText
          width
          height
        }
      }
      selectedOrFirstAvailableVariant(
        selectedOptions: $selectedOptions
        ignoreUnknownOptions: true
        caseInsensitiveMatch: true
      ) {
        ...ProductVariant
      }
      adjacentVariants(selectedOptions: $selectedOptions) {
        ...ProductVariant
      }
      seo {
        description
        title
      }
      rating: metafield(namespace: "reviews", key: "rating") {
        value
      }
      ratingCount: metafield(namespace: "reviews", key: "rating_count") {
        value
      }
      judgemeBadge: metafield(namespace: "judgeme", key: "badge") {
        value
      }
    }
  }
`;

export const PRODUCT_RECOMMENDATIONS_QUERY = `#graphql
  ${PRODUCT_CARD_FRAGMENT}
  query ProductRecommendations(
    $productId: ID!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    recommended: productRecommendations(productId: $productId, intent: RELATED) {
      ...ProductCard
    }
    complementary: productRecommendations(productId: $productId, intent: COMPLEMENTARY) {
      ...ProductCard
    }
  }
`;
