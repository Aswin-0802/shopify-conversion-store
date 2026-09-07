import {useLoaderData} from 'react-router';
import {Analytics, getPaginationVariables} from '@shopify/hydrogen';
import {Aside} from '~/components/Aside';
import {Breadcrumbs} from '~/components/Breadcrumbs';
import {CollectionFilters, MobileFilterToggle} from '~/components/CollectionFilters';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';
import {ProductCard} from '~/components/ProductCard';
import {parseCollectionFilters, parseCollectionSort} from '~/lib/collection';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {seoPayload} from '~/lib/seo';
import {COLLECTION_QUERY} from '~/lib/shopify/queries/collection';

export const meta = ({data, params}) => {
  const title = data?.collection?.seo?.title || data?.collection?.title || 'Collection';
  return seoPayload({
    title,
    description: data?.collection?.seo?.description || data?.collection?.description,
    url: data?.collection ? `/collections/${params.handle}` : undefined,
    image: data?.collection?.image?.url,
  });
};

export async function loader({context, params, request}) {
  const {handle} = params;
  const {storefront} = context;
  const url = new URL(request.url);
  const paginationVariables = getPaginationVariables(request, {pageBy: 10});
  const filters = parseCollectionFilters(url.searchParams);
  const {sortKey, reverse} = parseCollectionSort(url.searchParams.get('sort'));

  if (!handle) {
    throw new Response('Collection not found', {status: 404});
  }

  const {collection} = await storefront.query(COLLECTION_QUERY, {
    variables: {
      handle,
      ...paginationVariables,
      filters,
      sortKey,
      reverse,
    },
  });

  if (!collection) {
    throw new Response(`Collection ${handle} not found`, {status: 404});
  }

  redirectIfHandleIsLocalized(request, {handle, data: collection});

  return {collection};
}

export default function Collection() {
  const {collection} = useLoaderData();
  const filters = collection.products.filters || [];

  return (
    <div className="collection-page">
      <Breadcrumbs
        items={[
          {label: 'Home', to: '/'},
          {label: 'Collections', to: '/collections'},
          {label: collection.title},
        ]}
      />
      <header className="collection-header">
        <p className="eyebrow">Collection</p>
        <h1>{collection.title}</h1>
        {collection.description ? <p className="lede">{collection.description}</p> : null}
      </header>
      <MobileFilterToggle />
      <Aside type="filters" heading="Filter & sort">
        <CollectionFilters
          filters={filters}
          productCount={collection.products.nodes.length}
          variant="drawer"
        />
      </Aside>
      <div className="filters-layout">
        <CollectionFilters
          filters={filters}
          productCount={collection.products.nodes.length}
          variant="desktop"
        />
        <div className="collection-results">
        <PaginatedResourceSection
          connection={collection.products}
          resourcesClassName="product-grid"
        >
          {({node: product, index}) => (
            <ProductCard
              key={product.id}
              product={product}
              loading={index < 8 ? 'eager' : 'lazy'}
            />
          )}
        </PaginatedResourceSection>
        </div>
      </div>
      <Analytics.CollectionView
        data={{
          collection: {
            id: collection.id,
            handle: collection.handle,
          },
        }}
      />
    </div>
  );
}
