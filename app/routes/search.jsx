import {useLoaderData} from 'react-router';
import {Analytics, getPaginationVariables} from '@shopify/hydrogen';
import {ProductGrid} from '~/components/ProductGrid';
import {SearchForm} from '~/components/SearchForm';
import {getEmptyPredictiveSearchResult} from '~/lib/search';
import {CATALOG_SEARCH_QUERY} from '~/lib/shopify/queries/search';
import {seoPayload} from '~/lib/seo';

/**
 * @type {Route.MetaFunction}
 */
export const meta = ({data}) => {
  const term = data?.term;
  return seoPayload({
    title: term ? `Search: ${term}` : 'Search',
    description: term ? `Results for ${term}` : 'Search the Sloane collection.',
    url: term ? `/search?q=${encodeURIComponent(term)}` : '/search',
  });
};

/**
 * @param {Route.LoaderArgs}
 */
export async function loader({request, context}) {
  const url = new URL(request.url);
  const isPredictive = url.searchParams.has('predictive');

  try {
    return isPredictive
      ? await predictiveSearch({request, context})
      : await regularSearch({request, context});
  } catch (error) {
    console.error(error);
    const term = String(url.searchParams.get('q') || '').trim();
    if (isPredictive) {
      return {type: 'predictive', term, result: getEmptyPredictiveSearchResult(), error: error.message};
    }
    return {type: 'regular', term, result: {total: 0, items: emptyRegularItems()}, error: error.message};
  }
}

/**
 * Renders the /search route
 */
export default function SearchPage() {
  const {type, term, result, error} = useLoaderData();
  if (type === 'predictive') return null;

  const products = result?.items?.products?.nodes || [];

  return (
    <div className="search-page">
      <header className="page-header">
        <p className="eyebrow">Search</p>
        <h1>{term ? `Results for “${term}”` : 'Search the collection'}</h1>
      </header>
      <SearchForm>
        {({inputRef}) => (
          <div className="search-form">
            <label htmlFor="search-q" className="sr-only">
              Search
            </label>
            <input
              id="search-q"
              defaultValue={term}
              name="q"
              placeholder="Search products"
              ref={inputRef}
              type="search"
            />
            <button className="btn" type="submit">
              Search
            </button>
          </div>
        )}
      </SearchForm>
      {error ? <p className="field-error">{error}</p> : null}
      {!term ? (
        <div className="empty-state">
          <h2>Find something you love</h2>
          <p>Try hoodie, sneakers, or a color.</p>
        </div>
      ) : products.length ? (
        <>
          <p className="collection-toolbar">
            Showing {products.length} {products.length === 1 ? 'product' : 'products'}
          </p>
          <ProductGrid products={products} />
        </>
      ) : (
        <div className="empty-state">
          <h2>No results for “{term}”</h2>
          <p>Try a different keyword, or browse the full catalog.</p>
        </div>
      )}
      <Analytics.SearchView data={{searchTerm: term, searchResults: result}} />
    </div>
  );
}

/**
 * Regular search query and fragments
 * (adjust as needed)
 */
const SEARCH_PRODUCT_FRAGMENT = `#graphql
  fragment SearchProduct on Product {
    __typename
    handle
    id
    publishedAt
    title
    trackingParameters
    vendor
    selectedOrFirstAvailableVariant(
      selectedOptions: []
      ignoreUnknownOptions: true
      caseInsensitiveMatch: true
    ) {
      id
      image {
        url
        altText
        width
        height
      }
      price {
        amount
        currencyCode
      }
      compareAtPrice {
        amount
        currencyCode
      }
      selectedOptions {
        name
        value
      }
      product {
        handle
        title
      }
    }
  }
`;

const SEARCH_PAGE_FRAGMENT = `#graphql
  fragment SearchPage on Page {
     __typename
     handle
    id
    title
    trackingParameters
  }
`;

const SEARCH_ARTICLE_FRAGMENT = `#graphql
  fragment SearchArticle on Article {
    __typename
    handle
    id
    title
    trackingParameters
  }
`;

const PAGE_INFO_FRAGMENT = `#graphql
  fragment PageInfoFragment on PageInfo {
    hasNextPage
    hasPreviousPage
    startCursor
    endCursor
  }
`;

// NOTE: https://shopify.dev/docs/api/storefront/latest/queries/search
export const SEARCH_QUERY = `#graphql
  query RegularSearch(
    $country: CountryCode
    $endCursor: String
    $first: Int
    $language: LanguageCode
    $last: Int
    $term: String!
    $startCursor: String
  ) @inContext(country: $country, language: $language) {
    articles: search(
      query: $term,
      types: [ARTICLE],
      first: $first,
    ) {
      nodes {
        ...on Article {
          ...SearchArticle
        }
      }
    }
    pages: search(
      query: $term,
      types: [PAGE],
      first: $first,
    ) {
      nodes {
        ...on Page {
          ...SearchPage
        }
      }
    }
    products: search(
      after: $endCursor,
      before: $startCursor,
      first: $first,
      last: $last,
      query: $term,
      sortKey: RELEVANCE,
      types: [PRODUCT],
      unavailableProducts: HIDE,
    ) {
      nodes {
        ...on Product {
          ...SearchProduct
        }
      }
      pageInfo {
        ...PageInfoFragment
      }
    }
  }
  ${SEARCH_PRODUCT_FRAGMENT}
  ${SEARCH_PAGE_FRAGMENT}
  ${SEARCH_ARTICLE_FRAGMENT}
  ${PAGE_INFO_FRAGMENT}
`;

/**
 * Regular search fetcher
 * @param {Pick<
 *   Route.LoaderArgs,
 *   'request' | 'context'
 * >}
 * @return {Promise<RegularSearchReturn>}
 */
async function regularSearch({request, context}) {
  const {storefront} = context;
  const url = new URL(request.url);
  const term = String(url.searchParams.get('q') || '').trim();

  if (!term) {
    return {type: 'regular', term, result: {total: 0, items: emptyRegularItems()}};
  }

  try {
    const variables = getPaginationVariables(request, {pageBy: 12});
    const {errors, ...items} = await storefront.query(SEARCH_QUERY, {
      variables: {...variables, term},
    });
    const nodes = items?.products?.nodes || [];
    if (nodes.length) {
      items.products = {
        ...items.products,
        nodes: nodes.map(toProductCard),
      };
      return {
        type: 'regular',
        term,
        error: errors?.map(({message}) => message).join(', '),
        result: {total: nodes.length, items},
      };
    }
  } catch (error) {
    console.error(error);
  }

  const catalog = await catalogSearch(storefront, term, 12);
  return {
    type: 'regular',
    term,
    result: {
      total: catalog.products.nodes.length,
      items: {
        ...emptyRegularItems(),
        products: catalog.products,
      },
    },
  };
}

function toProductCard(product) {
  const variant = product.selectedOrFirstAvailableVariant;
  const image = variant?.image || null;
  const price = variant?.price || {amount: '0', currencyCode: 'USD'};
  return {
    ...product,
    availableForSale: Boolean(variant?.id),
    featuredImage: image,
    images: {nodes: image ? [image] : []},
    priceRange: {minVariantPrice: price},
    compareAtPriceRange: {minVariantPrice: variant?.compareAtPrice || null},
  };
}

/**
 * Predictive search query and fragments
 * (adjust as needed)
 */
const PREDICTIVE_SEARCH_ARTICLE_FRAGMENT = `#graphql
  fragment PredictiveArticle on Article {
    __typename
    id
    title
    handle
    blog {
      handle
    }
    image {
      url
      altText
      width
      height
    }
    trackingParameters
  }
`;

const PREDICTIVE_SEARCH_COLLECTION_FRAGMENT = `#graphql
  fragment PredictiveCollection on Collection {
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
    trackingParameters
  }
`;

const PREDICTIVE_SEARCH_PAGE_FRAGMENT = `#graphql
  fragment PredictivePage on Page {
    __typename
    id
    title
    handle
    trackingParameters
  }
`;

const PREDICTIVE_SEARCH_PRODUCT_FRAGMENT = `#graphql
  fragment PredictiveProduct on Product {
    __typename
    id
    title
    handle
    trackingParameters
    selectedOrFirstAvailableVariant(
      selectedOptions: []
      ignoreUnknownOptions: true
      caseInsensitiveMatch: true
    ) {
      id
      image {
        url
        altText
        width
        height
      }
      price {
        amount
        currencyCode
      }
    }
  }
`;

const PREDICTIVE_SEARCH_QUERY_FRAGMENT = `#graphql
  fragment PredictiveQuery on SearchQuerySuggestion {
    __typename
    text
    styledText
    trackingParameters
  }
`;

// NOTE: https://shopify.dev/docs/api/storefront/latest/queries/predictiveSearch
const PREDICTIVE_SEARCH_QUERY = `#graphql
  query PredictiveSearch(
    $country: CountryCode
    $language: LanguageCode
    $limit: Int!
    $limitScope: PredictiveSearchLimitScope!
    $term: String!
    $types: [PredictiveSearchType!]
  ) @inContext(country: $country, language: $language) {
    predictiveSearch(
      limit: $limit,
      limitScope: $limitScope,
      query: $term,
      types: $types,
    ) {
      articles {
        ...PredictiveArticle
      }
      collections {
        ...PredictiveCollection
      }
      pages {
        ...PredictivePage
      }
      products {
        ...PredictiveProduct
      }
      queries {
        ...PredictiveQuery
      }
    }
  }
  ${PREDICTIVE_SEARCH_ARTICLE_FRAGMENT}
  ${PREDICTIVE_SEARCH_COLLECTION_FRAGMENT}
  ${PREDICTIVE_SEARCH_PAGE_FRAGMENT}
  ${PREDICTIVE_SEARCH_PRODUCT_FRAGMENT}
  ${PREDICTIVE_SEARCH_QUERY_FRAGMENT}
`;

/**
 * Predictive search fetcher
 * @param {Pick<
 *   Route.ActionArgs,
 *   'request' | 'context'
 * >}
 * @return {Promise<PredictiveSearchReturn>}
 */
async function predictiveSearch({request, context}) {
  const {storefront} = context;
  const url = new URL(request.url);
  const term = String(url.searchParams.get('q') || '').trim();
  const limit = Number(url.searchParams.get('limit') || 6);
  const type = 'predictive';

  if (!term) return {type, term, result: getEmptyPredictiveSearchResult()};

  try {
    const {predictiveSearch: items, errors} = await storefront.query(
      PREDICTIVE_SEARCH_QUERY,
      {
        variables: {
          limit,
          limitScope: 'EACH',
          term,
        },
      },
    );

    if (!errors && items?.products?.length) {
      const total = Object.values(items).reduce(
        (acc, item) => acc + (item?.length || 0),
        0,
      );
      return {type, term, result: {items, total}};
    }
  } catch (error) {
    console.error(error);
  }

  const catalog = await catalogSearch(storefront, term, limit);
  const items = {
    articles: [],
    pages: [],
    queries: [],
    collections: catalog.collections.nodes,
    products: catalog.products.nodes.map((product) => ({
      __typename: 'Product',
      id: product.id,
      title: product.title,
      handle: product.handle,
      trackingParameters: null,
      selectedOrFirstAvailableVariant: product.selectedOrFirstAvailableVariant,
    })),
  };

  return {
    type,
    term,
    result: {
      items,
      total: items.products.length + items.collections.length,
    },
  };
}

function emptyRegularItems() {
  return {
    articles: {nodes: []},
    pages: {nodes: []},
    products: {
      nodes: [],
      pageInfo: {
        hasNextPage: false,
        hasPreviousPage: false,
        startCursor: null,
        endCursor: null,
      },
    },
  };
}

async function catalogSearch(storefront, term, first) {
  const data = await storefront.query(CATALOG_SEARCH_QUERY, {
    variables: {query: term, first},
  });

  const needle = term.toLowerCase();
  const productNodes = data.products?.nodes || [];
  const matchedProducts = productNodes.filter((product) =>
    product.title.toLowerCase().includes(needle),
  );
  const collectionNodes = data.collections?.nodes || [];
  const matchedCollections = collectionNodes.filter((collection) =>
    collection.title.toLowerCase().includes(needle),
  );

  return {
    products: {
      ...(data.products || emptyRegularItems().products),
      nodes: matchedProducts.length ? matchedProducts : productNodes,
    },
    collections: {
      nodes: matchedCollections.length ? matchedCollections : collectionNodes,
    },
  };
}

/** @typedef {import('./+types/search').Route} Route */
/** @typedef {import('~/lib/search').RegularSearchReturn} RegularSearchReturn */
/** @typedef {import('~/lib/search').PredictiveSearchReturn} PredictiveSearchReturn */
/** @typedef {import('storefrontapi.generated').RegularSearchQuery} RegularSearchQuery */
/** @typedef {import('storefrontapi.generated').PredictiveSearchQuery} PredictiveSearchQuery */
/** @typedef {ReturnType<typeof useLoaderData<typeof loader>>} LoaderReturnData */
