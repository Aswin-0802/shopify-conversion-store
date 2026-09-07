import {createHydrogenContext} from '@shopify/hydrogen';
import {AppSession} from '~/lib/session';
import {CART_QUERY_FRAGMENT} from '~/lib/fragments';
import {openHydrogenCache} from '~/lib/memory-cache';
import {readRuntimeEnv} from '~/lib/runtime-env';

// Define the additional context object
const additionalContext = {
  // Additional context for custom properties, CMS clients, 3P SDKs, etc.
  // These will be available as both context.propertyName and context.get(propertyContext)
  // Example of complex objects that could be added:
  // cms: await createCMSClient(env),
  // reviews: await createReviewsClient(env),
};

/**
 * @param {{waitUntil?: (promise: Promise<unknown>) => void} | undefined} executionContext
 * @returns {(promise: Promise<unknown>) => void}
 */
function getWaitUntil(executionContext) {
  if (executionContext?.waitUntil) {
    return executionContext.waitUntil.bind(executionContext);
  }
  return (promise) => {
    void Promise.resolve(promise).catch((error) => {
      console.error(error);
    });
  };
}

/**
 * Creates Hydrogen context for React Router.
 * Works on Oxygen (Worker env) and Vercel / Node (`process.env`).
 * @param {Request} request
 * @param {Env | NodeJS.ProcessEnv} [env]
 * @param {{waitUntil?: (promise: Promise<unknown>) => void}} [executionContext]
 */
export async function createHydrogenRouterContext(
  request,
  env = process.env,
  executionContext,
) {
  const runtimeEnv = readRuntimeEnv(env);

  if (!runtimeEnv.SESSION_SECRET) {
    throw new Error(
      'SESSION_SECRET is not set. Add it in Vercel → Settings → Environment Variables for Production and Preview, then Redeploy.',
    );
  }

  const waitUntil = getWaitUntil(executionContext);
  const [cache, session] = await Promise.all([
    openHydrogenCache(),
    AppSession.init(request, [runtimeEnv.SESSION_SECRET]),
  ]);

  const hydrogenContext = createHydrogenContext(
    {
      env: runtimeEnv,
      request,
      cache,
      waitUntil,
      session,
      i18n: {language: 'EN', country: 'US'},
      cart: {
        queryFragment: CART_QUERY_FRAGMENT,
      },
    },
    additionalContext,
  );

  return hydrogenContext;
}

/** @typedef {Class<additionalContext>} AdditionalContextType */

/** @typedef {import('storefrontapi.generated').CartApiQueryFragment} CartApiQueryFragment */
