# Sloane

Headless Shopify storefront for a small clothing label. Built with [Hydrogen](https://hydrogen.shopify.dev/), React Router 7, and the Storefront API.

Until a real shop is linked, the catalog comes from Shopify’s public demo source ([Mock.shop](https://mock.shop)). Cart, collections, product pages, and search still run against that live API — they are not fake UI.

## Run it locally

Needs **Node 22 or 24**.

```bash
npm install
cp .env.example .env
npm run dev
```

Open http://localhost:3000

`.env` must include `SESSION_SECRET`. You can leave the Shopify token fields blank for Mock.shop.

```bash
npm run build
npm run preview
```

Brand copy lives in `app/lib/site-content.ts`.

## Connect a live Shopify store

Do this when you have a store you own (or a Partner store you can open in Admin). A random Shopify login is not enough — the CLI has to see a store attached to that account.

### 1. Shopify login that can see the shop

1. In Shopify Admin, confirm you can open the store.
2. In this project:

```bash
npx shopify auth logout
npx shopify auth login
npx shopify hydrogen link
npx shopify hydrogen env pull
```

`env pull` writes Storefront tokens into `.env`. Never commit `.env`.

If `hydrogen link` says **Unable to get current user account** or **401**, the CLI user is not a store owner / staff / Partner with that shop. Log in with the store’s owner email (or a Partner account that has the shop), not a personal Shopify ID with no stores.

### 2. Or paste tokens by hand

1. In Shopify Admin: **Settings → Apps and sales channels → Develop apps** (or install the **Headless** channel).
2. Create an app, enable **Storefront API**.
3. Copy the public Storefront token and the store domain.

Put them in `.env`:

```bash
PUBLIC_STORE_DOMAIN="your-store.myshopify.com"
PUBLIC_STOREFRONT_API_TOKEN="..."
PRIVATE_STOREFRONT_API_TOKEN="..."   # optional, for private queries
PUBLIC_CHECKOUT_DOMAIN="your-store.myshopify.com"
SESSION_SECRET="a-long-random-string"
```

Optional:

```bash
PUBLIC_CUSTOMER_ACCOUNT_API_CLIENT_ID=""
PUBLIC_CUSTOMER_ACCOUNT_API_URL=""
PUBLIC_JUDGEME_SHOP_DOMAIN="your-store.myshopify.com"
CONTACT_FORM_ENDPOINT=""
NEWSLETTER_FORM_ENDPOINT=""
```

Restart `npm run dev` after changing env vars.

### 3. What changes after linking

- Product catalog, cart, checkout, and search use **your** shop.
- Customer accounts (Sign in) only appear if Customer Account API vars are set.
- `npx shopify hydrogen deploy` can publish to **Oxygen**, Shopify’s free Hydrogen host.

## Deploy / host it

Hydrogen is a React Router app with a Worker-style `fetch` server (`server.js`). Pick one of these.

### A. Shopify Oxygen (simplest, free with a linked store)

Best option once `hydrogen link` works.

```bash
npx shopify hydrogen deploy
```

Oxygen gives you a `*.myshopify.dev` URL (and you can attach a custom domain in the Hydrogen channel). You do **not** need Vercel for this.

#### Why visitors see “Log in — Continue to Oxygen”

Oxygen **preview deployments are private by default**. A URL like:

`https://01m1x….myshopify.dev`

always sends strangers to Shopify login. That is staff/preview auth, not a bug in this repo.

Share the **production** storefront URL instead:

`https://sloane-537fbcfec468b845b4b3.o2.myshopify.dev`

If that URL also asks for login (common on **development stores**), make a public link:

1. Shopify Admin → **Sales channels → Hydrogen → Sloane**
2. Open the latest **deployment**
3. Click **Share** → **Anyone with the link** → **Copy link**

Shareable links need a store on the **Basic plan or above**. Development stores often cannot create them.

CLI workaround (token lasts up to 12 hours):

```bash
npx shopify hydrogen deploy --auth-bypass-token --auth-bypass-token-duration 12
```

The command prints a URL with a bypass token. Send that link, not the raw preview URL.

### B. Vercel (free hobby plan)

Vercel is a fine public URL for a portfolio, but this repo is wired for **Oxygen**, not Vercel’s Node adapter. To put it on Vercel you switch the server runtime.

1. Create a GitHub repo and push this project (without `.env`).
2. In [Vercel](https://vercel.com): **Add New → Project → Import** the repo.
3. Follow Shopify’s [self-hosting Hydrogen](https://shopify.dev/docs/storefronts/headless/hydrogen/deployments/self-hosting) notes **and** Vercel’s [React Router](https://reactrouter.com/start/framework/installation) / Vercel guide:
   - Remove the Oxygen Vite plugin (`oxygen()` in `vite.config.js`).
   - Keep `hydrogen()`.
   - Point the server entry at Vercel’s React Router preset instead of Mini-Oxygen.
   - Pass `createHydrogenContext` through `getLoadContext` (see `app/lib/context.js`).
4. In Vercel → **Settings → Environment Variables**, add at least:

   - `SESSION_SECRET` (long random string)
   - `PUBLIC_STORE_DOMAIN`
   - `PUBLIC_STOREFRONT_API_TOKEN`
   - `PUBLIC_CHECKOUT_DOMAIN`

   Leave store tokens empty only if you are okay serving Mock.shop on the live URL.

5. Deploy. Use the Hobby plan for a free preview URL.

Shopify’s current self-hosting doc: https://shopify.dev/docs/storefronts/headless/hydrogen/deployments/self-hosting

If you only need a public demo and do not want to rewrite the server, use Oxygen (A) or Cloudflare (C). Those match this Worker `fetch` entry more closely.

### C. Cloudflare Workers / Pages (free tier)

Closest match to Oxygen (also a `fetch` Worker).

1. Install Wrangler: `npm install -D wrangler`
2. Follow [Deploy a React Router app to Cloudflare](https://reactrouter.com/how-to/cloudflare) plus Shopify self-hosting (remove `oxygen()`, keep `hydrogen()`, keep `createHydrogenContext`).
3. Set the same env vars as above (`wrangler secret put SESSION_SECRET`, etc.).
4. `npx wrangler deploy`

### D. Netlify (free starter)

Same idea as Vercel: React Router Netlify adapter + Hydrogen context. See [Netlify + React Router](https://docs.netlify.com/frameworks/react-router/) and the Shopify self-hosting page.

## Scripts

```bash
npm run dev       # local storefront
npm run build     # production build
npm run preview   # run the build locally
npx shopify hydrogen deploy   # Oxygen, needs a linked store
```
