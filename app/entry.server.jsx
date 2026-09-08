import {ServerRouter} from 'react-router';
import {isbot} from 'isbot';
import * as ReactDOMServer from 'react-dom/server';
import {createContentSecurityPolicy} from '@shopify/hydrogen';

const ABORT_DELAY_MS = 10_000;

/**
 * Works on MiniOxygen (Web Streams) and Vercel/Node (pipeable streams).
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
  const shopHost = hostFromEnv(context.env.PUBLIC_STORE_DOMAIN);
  const checkoutHost = hostFromEnv(context.env.PUBLIC_CHECKOUT_DOMAIN);
  const shopOrigins = [shopHost, checkoutHost]
    .filter(Boolean)
    .map((host) => `https://${host}`);

  const {nonce, header, NonceProvider} = createContentSecurityPolicy({
    shop: {
      checkoutDomain: context.env.PUBLIC_CHECKOUT_DOMAIN,
      storeDomain: context.env.PUBLIC_STORE_DOMAIN,
    },
    defaultSrc: [
      "'self'",
      'https://cdn.shopify.com',
      'https://shopify.com',
      ...shopOrigins,
    ],
    imgSrc: [
      "'self'",
      'data:',
      'blob:',
      'https://cdn.shopify.com',
      'https://cdn.shopifycdn.net',
      'https://shopify.com',
      'https://*.shopify.com',
      'https://*.myshopify.com',
      'https://shop.app',
      'https://burst.shopifycdn.com',
      'https://cdn.judge.me',
      'https://*.judge.me',
      ...shopOrigins,
    ],
    mediaSrc: [
      "'self'",
      'https://cdn.shopify.com',
      'https://cdn.shopifycdn.net',
      ...shopOrigins,
    ],
    fontSrc: [
      "'self'",
      'data:',
      'https://cdn.shopify.com',
      'https://fonts.gstatic.com',
    ],
    styleSrc: [
      "'self'",
      "'unsafe-inline'",
      'https://cdn.shopify.com',
      'https://fonts.googleapis.com',
    ],
    scriptSrc: [
      "'self'",
      'https://cdn.shopify.com',
      'https://shopify.com',
      'https://cdn.judge.me',
      'https://js.hcaptcha.com',
      'https://hcaptcha.com',
      ...shopOrigins,
    ],
    connectSrc: [
      "'self'",
      'https://cdn.shopify.com',
      'https://monorail-edge.shopifysvc.com',
      'https://cdn.judge.me',
      'https://judge.me',
      ...shopOrigins,
    ],
    frameSrc: [
      "'self'",
      'https://cdn.shopify.com',
      'https://shopify.com',
      'https://*.shopify.com',
      'https://hcaptcha.com',
      'https://*.hcaptcha.com',
      ...shopOrigins,
    ],
  });

  const app = (
    <NonceProvider>
      <ServerRouter
        context={reactRouterContext}
        url={request.url}
        nonce={nonce}
      />
    </NonceProvider>
  );

  if (typeof ReactDOMServer.renderToReadableStream === 'function') {
    const body = await ReactDOMServer.renderToReadableStream(app, {
      nonce,
      signal: request.signal,
      onError(error) {
        console.error(error);
        responseStatusCode = 500;
      },
    });

    if (isbot(request.headers.get('user-agent') || '')) {
      await body.allReady;
    }

    responseHeaders.set('Content-Type', 'text/html');
    responseHeaders.set('Content-Security-Policy', header);

    return new Response(body, {
      headers: responseHeaders,
      status: responseStatusCode,
    });
  }

  return renderWithNodeStream({
    app,
    nonce,
    header,
    request,
    responseHeaders,
    responseStatusCode,
  });
}

/**
 * @param {{
 *   app: JSX.Element;
 *   nonce: string;
 *   header: string;
 *   request: Request;
 *   responseHeaders: Headers;
 *   responseStatusCode: number;
 * }}
 */
async function renderWithNodeStream({
  app,
  nonce,
  header,
  request,
  responseHeaders,
  responseStatusCode,
}) {
  const {PassThrough, Readable} = await import('node:stream');
  const ready = isbot(request.headers.get('user-agent') || '')
    ? 'onAllReady'
    : 'onShellReady';

  return new Promise((resolve, reject) => {
    let didError = false;

    const {pipe, abort} = ReactDOMServer.renderToPipeableStream(app, {
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
    });

    request.signal?.addEventListener('abort', abort, {once: true});
    setTimeout(abort, ABORT_DELAY_MS);
  });
}

/**
 * @param {string | undefined} value
 * @returns {string}
 */
function hostFromEnv(value) {
  if (!value) return '';
  try {
    return new URL(value.includes('://') ? value : `https://${value}`).host;
  } catch {
    return value.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
  }
}

/** @typedef {import('@shopify/hydrogen').HydrogenRouterContextProvider} HydrogenRouterContextProvider */
/** @typedef {import('react-router').EntryContext} EntryContext */
