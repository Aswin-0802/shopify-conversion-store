import {useLoaderData} from 'react-router';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';

/**
 * @type {Route.MetaFunction}
 */
export const meta = ({data}) => {
  return [{title: `${data?.page.title ?? 'Page'} · Sloane`}];
};

/**
 * @param {Route.LoaderArgs} args
 */
export async function loader(args) {
  const deferredData = loadDeferredData(args);
  const criticalData = await loadCriticalData(args);
  return {...deferredData, ...criticalData};
}

/**
 * @param {Route.LoaderArgs}
 */
async function loadCriticalData({context, request, params}) {
  if (!params.handle) {
    throw new Error('Missing page handle');
  }

  const [{page}] = await Promise.all([
    context.storefront.query(PAGE_QUERY, {
      variables: {
        handle: params.handle,
      },
    }),
  ]);

  if (!page) {
    throw new Response('Not Found', {status: 404});
  }

  redirectIfHandleIsLocalized(request, {handle: params.handle, data: page});

  return {page};
}

function loadDeferredData() {
  return {};
}

export default function Page() {
  /** @type {LoaderReturnData} */
  const {page} = useLoaderData();
  const isPrivacyChoices = page.handle === 'data-sharing-opt-out';

  return (
    <div
      className={`page-shell page-content${isPrivacyChoices ? ' privacy-choices-page' : ''}`}
    >
      <header className="page-header">
        <p className="eyebrow">{isPrivacyChoices ? 'Privacy' : 'Page'}</p>
        <h1>{isPrivacyChoices ? 'Your privacy choices' : page.title}</h1>
        {isPrivacyChoices ? (
          <p className="lede">
            Control how Sloane uses cookies and sharing for ads. This only applies in
            states that give you that right.
          </p>
        ) : null}
      </header>
      <div
        className="policy-body shopify-page-body"
        dangerouslySetInnerHTML={{__html: page.body}}
      />
    </div>
  );
}

const PAGE_QUERY = `#graphql
  query Page(
    $language: LanguageCode,
    $country: CountryCode,
    $handle: String!
  )
  @inContext(language: $language, country: $country) {
    page(handle: $handle) {
      handle
      id
      title
      body
      seo {
        description
        title
      }
    }
  }
`;

/** @typedef {import('./+types/pages.$handle').Route} Route */
/** @typedef {ReturnType<typeof useLoaderData<typeof loader>>} LoaderReturnData */
