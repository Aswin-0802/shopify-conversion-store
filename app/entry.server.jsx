import {PassThrough, Readable} from 'node:stream';
import {ServerRouter} from 'react-router';
import {isbot} from 'isbot';
import {renderToPipeableStream} from 'react-dom/server';
import {createContentSecurityPolicy} from '@shopify/hydrogen';

const ABORT_DELAY_MS = 10_000;

/**
 * Node / Vercel entry. Oxygen uses Web Streams (`renderToReadableStream`).
 * Vercel Functions use Node, whose `react-dom/server` only exports
 * `renderToPipeableStream`.
 *
 * @param {Request} request
 * @param {number} responseStatusCode
 * @param {Headers} responseHeaders
 * @param {EntryContext} reactRouterContext
 * @param {HydrogenRouterContextProvider} context
 */
export default async function handleRequest(
  request,
  responseStatusCode,
  responseHeaders,
  reactRouterContext,
  context,
) {
  const {nonce, header, NonceProvider} = createContentSecurityPolicy({
    shop: {
      checkoutDomain: context.env.PUBLIC_CHECKOUT_DOMAIN,
      storeDomain: context.env.PUBLIC_STORE_DOMAIN,
    },
  });

  const ready = isbot(request.headers.get('user-agent') || '')
    ? 'onAllReady'
    : 'onShellReady';

  return new Promise((resolve, reject) => {
    let didError = false;

    const {pipe, abort} = renderToPipeableStream(
      <NonceProvider>
        <ServerRouter
          context={reactRouterContext}
          url={request.url}
          nonce={nonce}
        />
      </NonceProvider>,
      {
        nonce,
        [ready]() {
          const body = new PassThrough();
          const stream = Readable.toWeb(body);

          responseHeaders.set('Content-Type', 'text/html');
          responseHeaders.set('Content-Security-Policy', header);

          resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: didError ? 500 : responseStatusCode,
            }),
          );

          pipe(body);
        },
        onShellError(error) {
          reject(error);
        },
        onError(error) {
          didError = true;
          console.error(error);
        },
      },
    );

    request.signal?.addEventListener('abort', abort, {once: true});
    setTimeout(abort, ABORT_DELAY_MS);
  });
}

/** @typedef {import('@shopify/hydrogen').HydrogenRouterContextProvider} HydrogenRouterContextProvider */
/** @typedef {import('react-router').EntryContext} EntryContext */
