import {Link, useLoaderData} from 'react-router';
import {Image} from '@shopify/hydrogen';
import {absoluteUrl, seoPayload} from '~/lib/seo';
import {siteContent} from '~/lib/site-content';
import {FEATURED_COLLECTIONS_QUERY, SHOP_INFO_QUERY} from '~/lib/shopify/queries/catalog';
import type {Route} from './+types/pages.about';

export const meta: Route.MetaFunction = ({data}) => {
  return seoPayload({
    title: `About ${data?.shopName || ''}`.trim(),
    description: siteContent.about.intro,
    url: data?.canonicalUrl,
    image: data?.image,
  });
};

export async function loader({context, request}: Route.LoaderArgs) {
  const [{shop}, {collections}] = await Promise.all([
    context.storefront.query(SHOP_INFO_QUERY),
    context.storefront.query(FEATURED_COLLECTIONS_QUERY),
  ]);

  return {
    shopName: shop.name,
    image:
      shop.brand?.coverImage?.image?.url || collections.nodes[0]?.image?.url || null,
    cover: shop.brand?.coverImage?.image || collections.nodes[0]?.image || null,
    canonicalUrl: absoluteUrl(request, '/pages/about'),
  };
}

export default function AboutPage() {
  const {shopName, cover} = useLoaderData();
  const about = siteContent.about;

  return (
    <div className="page-shell">
      <header className="page-header">
        <p className="eyebrow">{about.eyebrow}</p>
        <h1>{about.title}</h1>
        <p className="lede">{about.intro}</p>
      </header>
      <section className="about-hero">
        <div>
          <h2>{about.mission.title}</h2>
          <p className="lede">{about.mission.body}</p>
        </div>
        <div className="page-image">
          {cover ? (
            <Image data={cover} alt={cover.altText || shopName} sizes="(min-width: 860px) 45vw, 100vw" />
          ) : null}
        </div>
      </section>
      <section className="section">
        <p className="eyebrow">Values</p>
        <h2>What we stand for</h2>
        <div className="values-grid" style={{marginTop: '1.5rem'}}>
          {about.values.map((value) => (
            <article className="value-card" key={value.title}>
              <h3>{value.title}</h3>
              <p>{value.body}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="section">
        <p className="eyebrow">Why customers choose {shopName}</p>
        <h2>A quieter kind of luxury.</h2>
        <ul className="why-list">
          {about.why.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <Link className="btn" to="/collections/all" style={{marginTop: '1.5rem'}}>
          Shop the collection
        </Link>
      </section>
    </div>
  );
}
