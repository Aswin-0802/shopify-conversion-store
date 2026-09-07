import {useLoaderData} from 'react-router';
import {PolicyLayout} from '~/components/PolicyLayout';
import {handleToPolicyField, resolvePolicy} from '~/lib/policies';
import {seoPayload} from '~/lib/seo';

export const meta = ({data}) => {
  return seoPayload({
    title: data?.policy?.title || 'Policy',
    description: data?.policy?.lede,
    url: data?.policy ? `/policies/${data.policy.handle}` : undefined,
  });
};

export async function loader({params, context}) {
  if (!params.handle) {
    throw new Response('Policy not found', {status: 404});
  }

  const policyField = handleToPolicyField(params.handle);
  if (!policyField) {
    throw new Response('Policy not found', {status: 404});
  }

  let shopPolicy = null;
  try {
    const data = await context.storefront.query(POLICY_CONTENT_QUERY, {
      variables: {
        privacyPolicy: false,
        shippingPolicy: false,
        termsOfService: false,
        refundPolicy: false,
        [policyField]: true,
        language: context.storefront.i18n?.language,
      },
    });
    shopPolicy = data.shop?.[policyField] || null;
  } catch (error) {
    console.error(error);
  }

  const policy = resolvePolicy(params.handle, shopPolicy);
  if (!policy) {
    throw new Response('Policy not found', {status: 404});
  }

  return {policy};
}

export default function Policy() {
  const {policy} = useLoaderData();

  return (
    <PolicyLayout title={policy.title} lede={policy.lede} handle={policy.handle}>
      <div dangerouslySetInnerHTML={{__html: policy.body}} />
    </PolicyLayout>
  );
}

const POLICY_CONTENT_QUERY = `#graphql
  fragment Policy on ShopPolicy {
    body
    handle
    id
    title
    url
  }
  query Policy(
    $country: CountryCode
    $language: LanguageCode
    $privacyPolicy: Boolean!
    $refundPolicy: Boolean!
    $shippingPolicy: Boolean!
    $termsOfService: Boolean!
  ) @inContext(language: $language, country: $country) {
    shop {
      privacyPolicy @include(if: $privacyPolicy) {
        ...Policy
      }
      shippingPolicy @include(if: $shippingPolicy) {
        ...Policy
      }
      termsOfService @include(if: $termsOfService) {
        ...Policy
      }
      refundPolicy @include(if: $refundPolicy) {
        ...Policy
      }
    }
  }
`;
