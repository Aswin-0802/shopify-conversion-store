import * as serverBuild from 'virtual:react-router/server-build';
import {createRequestHandler, storefrontRedirect} from '@shopify/hydrogen';
import {createHydrogenRouterContext} from '~/lib/context';

/**
 * Shared Hydrogen request handler for Oxygen (Worker) and Vercel (Node).
 * @param {Request} request
 * @param {Env | NodeJS.ProcessEnv} [env]
 * @param {{waitUntil?: (promise: Promise<unknown>) => void}} [executionContext]
 * @return {Promise<Response>}
 */
async function handleFetch(request, env = process.env, executionContext) {
  try {
    const hydrogenContext = await createHydrogenRouterContext(
      request,
      env,
      executionContext,
    );

    const handleRequest = createRequestHandler({
      build: serverBuild,
      mode: process.env.NODE_ENV,
      getLoadContext: () => hydrogenContext,
    });

    const response = await handleRequest(request);

    if (hydrogenContext.session.isPending) {
      response.headers.set(
        'Set-Cookie',
        await hydrogenContext.session.commit(),
      );
    }

    if (response.status === 404) {
      return storefrontRedirect({
        request,
        response,
        storefront: hydrogenContext.storefront,
      });
    }

    return response;
  } catch (error) {
    console.error(error);
    return new Response('An unexpected error occurred', {status: 500});
  }
}

/**
 * Vercel custom server entry: `export default (request) => Response`.
 * Oxygen / Mini-Oxygen calls `default.fetch(request, env, ctx)`.
 * @param {Request} request
 * @param {Env} [env]
 * @param {{waitUntil?: (promise: Promise<unknown>) => void}} [executionContext]
 */
async function vercelHandler(request, env, executionContext) {
  return handleFetch(request, env ?? process.env, executionContext);
}

vercelHandler.fetch = handleFetch;

export default vercelHandler;
