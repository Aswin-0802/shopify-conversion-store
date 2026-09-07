import {Await, useLoaderData} from 'react-router';
import {Suspense} from 'react';
import {
  Analytics,
  getAdjacentAndFirstAvailableVariants,
  getProductOptions,
  getSelectedProductOptions,
  useOptimisticVariant,
  useSelectedOptionInUrlParam,
} from '@shopify/hydrogen';
import {AddToCartButton} from '~/components/AddToCartButton';
import {Breadcrumbs} from '~/components/Breadcrumbs';
import {Price} from '~/components/Price';
import {ProductForm} from '~/components/ProductForm';
import {ProductGallery} from '~/components/ProductGallery';
import {ProductGrid} from '~/components/ProductGrid';
import {Rating} from '~/components/Rating';
import {ReviewSummary} from '~/components/reviews/ReviewSummary';
import {ReviewWidget} from '~/components/reviews/ReviewWidget';
import {useAside} from '~/components/Aside';
import {parseRatingCount, parseRatingMetafield} from '~/lib/reviews/parse';
import {emptySummary} from '~/lib/reviews/provider';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {seoPayload} from '~/lib/seo';
import {siteContent} from '~/lib/site-content';
import {
  PRODUCT_QUERY,
  PRODUCT_RECOMMENDATIONS_QUERY,
} from '~/lib/shopify/queries/product';

export const meta = ({data, params}) => {
  const product = data?.product;
  return seoPayload({
    title: product?.seo?.title || product?.title || 'Product',
    description: product?.seo?.description || product?.description,
    url: `/products/${params.handle}`,
    image: product?.selectedOrFirstAvailableVariant?.image?.url || product?.images?.nodes?.[0]?.url,
    type: 'product',
  });
};

export async function loader({context, params, request}) {
  const {handle} = params;
  const {storefront, env} = context;

  if (!handle) {
    throw new Response('Product not found', {status: 404});
  }

  const {product} = await storefront.query(PRODUCT_QUERY, {
    variables: {handle, selectedOptions: getSelectedProductOptions(request)},
  });

  if (!product?.id) {
    throw new Response('Product not found', {status: 404});
  }

  redirectIfHandleIsLocalized(request, {handle, data: product});

  const recommendations = storefront
    .query(PRODUCT_RECOMMENDATIONS_QUERY, {
      variables: {productId: product.id},
    })
    .catch((error) => {
      console.error(error);
      return null;
    });

  return {
    product,
    recommendations,
    judgemeShopDomain: env.PUBLIC_JUDGEME_SHOP_DOMAIN || '',
  };
}

export default function Product() {
  const {product, recommendations, judgemeShopDomain} = useLoaderData();
  const {open} = useAside();
  const selectedVariant = useOptimisticVariant(
    product.selectedOrFirstAvailableVariant,
    getAdjacentAndFirstAvailableVariants(product),
  );

  useSelectedOptionInUrlParam(selectedVariant.selectedOptions);

  const productOptions = getProductOptions({
    ...product,
    selectedOrFirstAvailableVariant: selectedVariant,
  });

  const images = product.images?.nodes?.length
    ? product.images.nodes
    : selectedVariant?.image
      ? [selectedVariant.image]
      : [];

  const rating = parseRatingMetafield(product.rating?.value);
  const ratingCount = parseRatingCount(product.ratingCount?.value);
  const summary = rating && ratingCount
    ? {
        average: rating,
        count: ratingCount,
        distribution: {1: 0, 2: 0, 3: 0, 4: 0, 5: 0},
      }
    : emptySummary();
  if (summary.count && rating) {
    const star = Math.min(5, Math.max(1, Math.round(rating)));
    summary.distribution[star] = ratingCount;
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description,
    image: images.map((image) => image.url),
    sku: selectedVariant?.sku,
    brand: {'@type': 'Brand', name: product.vendor},
    offers: {
      '@type': 'Offer',
      priceCurrency: selectedVariant?.price?.currencyCode,
      price: selectedVariant?.price?.amount,
      availability: selectedVariant?.availableForSale
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      url: `/products/${product.handle}`,
    },
    ...(summary.count
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: summary.average,
            reviewCount: summary.count,
            bestRating: 5,
            worstRating: 1,
          },
        }
      : {}),
  };

  return (
    <div className="product-page">
      <Breadcrumbs
        items={[
          {label: 'Home', to: '/'},
          {label: 'Shop', to: '/collections/all'},
          {label: product.title},
        ]}
      />
      <div className="product-layout">
        <ProductGallery
          images={images}
          title={product.title}
          featuredImage={selectedVariant?.image}
        />
      <div className="product-main">
        <p className="eyebrow">{siteContent.brandName}</p>
        <h1>{product.title}</h1>
        <Rating
          ratingMetafield={product.rating?.value}
          ratingCountMetafield={product.ratingCount?.value}
        />
        <Price
          price={selectedVariant?.price}
          compareAtPrice={selectedVariant?.compareAtPrice}
        />
        <p>
          {selectedVariant?.availableForSale
            ? 'In stock and ready to ship'
            : 'Currently unavailable'}
        </p>
        <ProductForm
          productOptions={productOptions}
          selectedVariant={selectedVariant}
        />
        <ul className="trust-row">
          {siteContent.trust.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <div className="accordion">
          <details open>
            <summary>Description</summary>
            <div dangerouslySetInnerHTML={{__html: product.descriptionHtml}} />
          </details>
          <details>
            <summary>{siteContent.shipping.title}</summary>
            <p>{siteContent.shipping.body}</p>
          </details>
          <details>
            <summary>{siteContent.returns.title}</summary>
            <p>{siteContent.returns.body}</p>
          </details>
        </div>
        <ReviewSummary summary={summary} />
        <ReviewWidget
          shopDomain={judgemeShopDomain}
          productGid={product.id}
          variant="product"
        />
      </div>
      </div>

      {selectedVariant?.availableForSale ? (
        <div className="sticky-atc">
          <div>
            <strong>{product.title}</strong>
            <Price
              price={selectedVariant.price}
              compareAtPrice={selectedVariant.compareAtPrice}
            />
          </div>
          <AddToCartButton
            className="btn"
            onClick={() => open('cart')}
            lines={[
              {
                merchandiseId: selectedVariant.id,
                quantity: 1,
                selectedVariant: {
                  ...selectedVariant,
                  product: {
                    handle: product.handle,
                    title: product.title,
                  },
                },
              },
            ]}
          >
            Add to cart
          </AddToCartButton>
        </div>
      ) : null}

      <Suspense fallback={null}>
        <Await resolve={recommendations}>
          {(result) => (
            <>
              {result?.recommended?.length ? (
                <section className="related-section section">
                  <p className="eyebrow">Related</p>
                  <h2>Related products</h2>
                  <ProductGrid products={result.recommended.slice(0, 4)} />
                </section>
              ) : null}
              {result?.complementary?.length ? (
                <section className="related-section section">
                  <p className="eyebrow">Recommended</p>
                  <h2>You may also like</h2>
                  <ProductGrid products={result.complementary.slice(0, 4)} />
                </section>
              ) : null}
            </>
          )}
        </Await>
      </Suspense>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{__html: JSON.stringify(jsonLd)}}
      />
      <Analytics.ProductView
        data={{
          products: [
            {
              id: product.id,
              title: product.title,
              price: selectedVariant?.price.amount || '0',
              vendor: product.vendor,
              variantId: selectedVariant?.id || '',
              variantTitle: selectedVariant?.title || '',
              quantity: 1,
            },
          ],
        }}
      />
    </div>
  );
}
