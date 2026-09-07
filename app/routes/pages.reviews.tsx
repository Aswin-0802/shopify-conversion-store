import {Link, useLoaderData} from 'react-router';
import {Image} from '@shopify/hydrogen';
import {ReviewSummary} from '~/components/reviews/ReviewSummary';
import {ReviewWidget} from '~/components/reviews/ReviewWidget';
import {catalogFromProductMetafields, reviewsJsonLd} from '~/lib/reviews/provider';
import {absoluteUrl, seoPayload} from '~/lib/seo';
import {REVIEW_PRODUCTS_QUERY} from '~/lib/shopify/queries/catalog';
import type {Route} from './+types/pages.reviews';

export const meta: Route.MetaFunction = ({data}) => {
  return seoPayload({
    title: 'Reviews',
    description: 'Verified customer reviews for our products.',
    url: data?.canonicalUrl,
  });
};

export async function loader({context, request}: Route.LoaderArgs) {
  const judgemeShopDomain = context.env.PUBLIC_JUDGEME_SHOP_DOMAIN || '';
  const {products} = await context.storefront.query(REVIEW_PRODUCTS_QUERY);
  const catalog = catalogFromProductMetafields(products.nodes, judgemeShopDomain);

  return {
    catalog,
    products: products.nodes as Array<{
      id: string;
      handle: string;
      title: string;
      featuredImage?: {
        url: string;
        altText?: string | null;
        width?: number | null;
        height?: number | null;
      } | null;
      rating?: {value?: string | null} | null;
      ratingCount?: {value?: string | null} | null;
    }>,
    judgemeShopDomain,
    canonicalUrl: absoluteUrl(request, '/pages/reviews'),
  };
}

export default function ReviewsPage() {
  const {catalog, products, judgemeShopDomain} = useLoaderData<typeof loader>();
  const jsonLd = reviewsJsonLd(catalog.reviews, catalog.summary);

  return (
    <div className="page-shell">
      <header className="page-header">
        <p className="eyebrow">Reviews</p>
        <h1>Customer reviews</h1>
        <p className="lede">
          Fit notes, fabric comments, and photos from people who bought the piece.
        </p>
      </header>

      {catalog.summary.count ? <ReviewSummary summary={catalog.summary} /> : null}

      {catalog.source === 'judgeme' ? (
        <section className="section">
          <ReviewWidget shopDomain={judgemeShopDomain} variant="all" />
        </section>
      ) : null}

      {!catalog.summary.count && catalog.source !== 'judgeme' ? (
        <div className="empty-state">
          <h2>Reviews will appear here</h2>
          <p>
            Reviews show up here after customers leave them on a product. If you
            just opened the shop, this page will stay quiet until the first ones land.
          </p>
        </div>
      ) : null}

      {catalog.source === 'shopify-metafields' ? (
        <section className="section">
          <h2>Reviewed products</h2>
          <div className="product-grid">
            {products
              .filter((product) => product.rating?.value)
              .map((product) => (
                <Link key={product.id} className="product-card" to={`/products/${product.handle}`}>
                  {product.featuredImage ? (
                    <div className="product-card-media">
                      <Image
                        data={product.featuredImage}
                        alt={product.featuredImage.altText || product.title}
                        sizes="(min-width: 700px) 25vw, 50vw"
                      />
                    </div>
                  ) : null}
                  <h3>{product.title}</h3>
                </Link>
              ))}
          </div>
        </section>
      ) : null}

      {jsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{__html: JSON.stringify(jsonLd)}}
        />
      ) : null}
    </div>
  );
}
