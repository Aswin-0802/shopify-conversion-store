import {Await, Link, useLoaderData} from 'react-router';
import {Suspense} from 'react';
import {Image} from '@shopify/hydrogen';
import {Newsletter} from '~/components/Newsletter';
import {ProductGrid} from '~/components/ProductGrid';
import {ReviewSummary} from '~/components/reviews/ReviewSummary';
import {ReviewWidget} from '~/components/reviews/ReviewWidget';
import {collectionImage} from '~/lib/collection';
import {catalogFromProductMetafields} from '~/lib/reviews/provider';
import {absoluteUrl, seoPayload} from '~/lib/seo';
import {siteContent} from '~/lib/site-content';
import {
  FEATURED_COLLECTIONS_QUERY,
  FEATURED_PRODUCTS_QUERY,
  REVIEW_PRODUCTS_QUERY,
  SHOP_INFO_QUERY,
} from '~/lib/shopify/queries/catalog';

export const meta = ({data}) => {
  return seoPayload({
    title: `${siteContent.brandName} · ${siteContent.tagline}`,
    description: data?.shopDescription || siteContent.hero.subtitle,
    url: data?.canonicalUrl,
    image: data?.heroImage,
    type: 'website',
  });
};

export async function loader(args) {
  const deferredData = loadDeferredData(args);
  const criticalData = await loadCriticalData(args);
  return {...deferredData, ...criticalData};
}

async function loadCriticalData({context, request}) {
  const {storefront, env} = context;
  const [{collections}, {products}, {shop}] = await Promise.all([
    storefront.query(FEATURED_COLLECTIONS_QUERY),
    storefront.query(FEATURED_PRODUCTS_QUERY),
    storefront.query(SHOP_INFO_QUERY),
  ]);

  const featuredCollection = collections.nodes[0];
  const heroMedia =
    collectionImage(featuredCollection) ||
    shop.brand?.coverImage?.image ||
    products.nodes[0]?.featuredImage ||
    null;
  const heroImage = heroMedia?.url || null;

  return {
    isShopLinked: Boolean(env.PUBLIC_STORE_DOMAIN),
    featuredCollection,
    heroMedia,
    collections: collections.nodes,
    products: products.nodes,
    shopName: shop.name,
    shopDescription: shop.brand?.shortDescription || shop.description,
    heroImage,
    canonicalUrl: absoluteUrl(request, '/'),
    judgemeShopDomain: env.PUBLIC_JUDGEME_SHOP_DOMAIN || '',
  };
}

function loadDeferredData({context}) {
  const reviewProducts = context.storefront
    .query(REVIEW_PRODUCTS_QUERY)
    .catch((error) => {
      console.error(error);
      return null;
    });

  return {reviewProducts};
}

export default function Homepage() {
  const data = useLoaderData();
  const hero = data.featuredCollection;
  const heroMedia = data.heroMedia;

  return (
    <div className="home">
      <section className="hero" aria-labelledby="hero-heading">
        {heroMedia ? (
          <div className="hero-media">
            <Image
              data={heroMedia}
              sizes="100vw"
              alt={heroMedia.altText || hero?.title || siteContent.brandName}
            />
          </div>
        ) : null}
        <div className="hero-content">
          <p className="eyebrow">{siteContent.hero.eyebrow}</p>
          <h1 id="hero-heading">{siteContent.hero.title}</h1>
          <p>{siteContent.hero.subtitle}</p>
          <div className="hero-actions">
            <Link className="btn" to={siteContent.hero.primaryCta.to}>
              {siteContent.hero.primaryCta.label}
            </Link>
            <Link className="btn btn-secondary" to={siteContent.hero.secondaryCta.to}>
              {siteContent.hero.secondaryCta.label}
            </Link>
          </div>
        </div>
      </section>

      {data.collections?.length ? (
        <section className="section">
          <div className="container">
            <div className="section-header">
              <div>
                <p className="eyebrow">Collections</p>
                <h2>Featured collections</h2>
              </div>
              <Link className="btn-ghost" to="/collections">
                View all
              </Link>
            </div>
            <div className="featured-collections-grid">
              {data.collections.map((collection, index) => {
                const image = collectionImage(collection);
                return (
                <Link
                  key={collection.id}
                  className={`collection-tile${index === 0 ? ' is-feature' : ''}`}
                  prefetch="intent"
                  to={`/collections/${collection.handle}`}
                >
                  {image ? (
                    <Image
                      data={image}
                      alt={image.altText || collection.title}
                      sizes={index === 0 ? '(min-width: 700px) 50vw, 100vw' : '(min-width: 700px) 25vw, 50vw'}
                    />
                  ) : (
                    <div className="skeleton skeleton-card" />
                  )}
                  <span className="collection-tile-copy">
                    <span className="eyebrow">Shop</span>
                    <h3>{collection.title}</h3>
                  </span>
                </Link>
                );
              })}
            </div>
          </div>
        </section>
      ) : null}

      <section className="section">
        <div className="container">
          <div className="section-header">
            <div>
              <p className="eyebrow">Bestsellers</p>
              <h2>Featured products</h2>
            </div>
            <Link className="btn-ghost" to="/collections/all">
              Shop all
            </Link>
          </div>
          <ProductGrid products={data.products} />
        </div>
      </section>

      <section className="section">
        <div className="container">
          <p className="eyebrow">Why shop with us</p>
          <h2>Why people keep coming back.</h2>
          <div className="benefits-grid" style={{marginTop: '1.5rem'}}>
            {siteContent.benefits.map((benefit) => (
              <article className="benefit-card" key={benefit.title}>
                <h3>{benefit.title}</h3>
                <p>{benefit.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="promo-banner">
            {heroMedia ? (
              <Image
                data={heroMedia}
                alt={heroMedia.altText || siteContent.promo.title}
                sizes="(min-width: 860px) 50vw, 100vw"
              />
            ) : (
              <div className="page-image" />
            )}
            <div className="promo-copy">
              <p className="eyebrow">{siteContent.promo.eyebrow}</p>
              <h2>{siteContent.promo.title}</h2>
              <p>{siteContent.promo.body}</p>
              <Link className="btn" to={siteContent.promo.cta.to} style={{marginTop: '1.25rem'}}>
                {siteContent.promo.cta.label}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Suspense fallback={null}>
        <Await resolve={data.reviewProducts}>
          {(response) => {
            const catalog = catalogFromProductMetafields(
              response?.products?.nodes || [],
              data.judgemeShopDomain,
            );
            if (!catalog.summary.count && catalog.source === 'none') return null;
            return (
              <section className="section">
                <div className="container">
                  <div className="section-header">
                    <div>
                      <p className="eyebrow">Reviews</p>
                      <h2>What customers say</h2>
                    </div>
                    <Link className="btn-ghost" to="/pages/reviews">
                      All reviews
                    </Link>
                  </div>
                  <ReviewSummary summary={catalog.summary} />
                  {catalog.source === 'judgeme' ? (
                    <ReviewWidget shopDomain={data.judgemeShopDomain} variant="all" />
                  ) : null}
                </div>
              </section>
            );
          }}
        </Await>
      </Suspense>

      <section className="section">
        <div className="container">
          <div className="story-band">
            <div className="story-copy">
              <p className="eyebrow">{siteContent.story.eyebrow}</p>
              <h2>{siteContent.story.title}</h2>
              <p>{siteContent.story.body}</p>
              <Link className="btn" to={siteContent.story.cta.to} style={{marginTop: '1.25rem'}}>
                {siteContent.story.cta.label}
              </Link>
            </div>
            {heroMedia ? (
              <Image
                data={heroMedia}
                alt=""
                sizes="(min-width: 860px) 50vw, 100vw"
              />
            ) : (
              <div className="page-image" />
            )}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <Newsletter />
        </div>
      </section>
    </div>
  );
}

/** @typedef {import('./+types/_index').Route} Route */
