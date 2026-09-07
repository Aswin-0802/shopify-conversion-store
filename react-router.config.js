import {hydrogenPreset} from '@shopify/hydrogen/react-router-preset';
import {vercelPreset} from '@vercel/react-router/vite';

/**
 * Local `shopify hydrogen dev` uses the Hydrogen preset (Oxygen).
 * `npm run build` / Vercel uses the Vercel preset. The two cannot be
 * combined: Hydrogen rejects `serverBundles`, which Vercel requires.
 */
const vercelBuild =
  process.env.VERCEL === '1' || process.env.npm_lifecycle_event === 'build';

export default {
  ssr: true,
  appDirectory: 'app',
  buildDirectory: 'dist',
  subResourceIntegrity: false,
  future: {
    v8_middleware: true,
    v8_splitRouteModules: true,
  },
  presets: vercelBuild ? [vercelPreset()] : [hydrogenPreset()],
};

/** @typedef {import('@react-router/dev/config').Config} Config */
