import {Link, useLoaderData} from 'react-router';
import {Breadcrumbs} from '~/components/Breadcrumbs';
import {resolvePolicyList} from '~/lib/policies';
import {seoPayload} from '~/lib/seo';

export const meta = () => {
  return seoPayload({
    title: 'Policies',
    description: 'Privacy, shipping, refunds, and terms for Sloane.',
    url: '/policies',
  });
};

export async function loader({context}) {
  let shop = null;
  try {
    const data = await context.storefront.query(POLICIES_QUERY);
    shop = data.shop;
  } catch (error) {
    console.error(error);
  }

  return {policies: resolvePolicyList(shop)};
}

export default function Policies() {
  const {policies} = useLoaderData();

  return (
    <div className="page-shell policy-page">
      <Breadcrumbs
        items={[
          {label: 'Home', to: '/'},
          {label: 'Policies'},
        ]}
      />
      <header className="page-header">
        <p className="eyebrow">Sloane</p>
        <h1>Policies</h1>
        <p className="lede">
          How we handle your data, shipping, returns, and the terms of this shop.
        </p>
      </header>
      <div className="policy-cards">
        {policies.map((policy) => (
          <Link
            className="policy-card"
            key={policy.id}
            prefetch="intent"
            to={`/policies/${policy.handle}`}
          >
            <h2>{policy.title}</h2>
            <p>{policy.lede}</p>
            <span>Read</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

const POLICIES_QUERY = `#graphql
  fragment PolicyItem on ShopPolicy {
    id
    title
    handle
  }
  query Policies ($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    shop {
      privacyPolicy {
        ...PolicyItem
      }
      shippingPolicy {
        ...PolicyItem
      }
      termsOfService {
        ...PolicyItem
      }
      refundPolicy {
        ...PolicyItem
      }
    }
  }
`;
