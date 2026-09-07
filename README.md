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
- Host the public site on **Vercel**. Oxygen stays private on development stores.

## Deploy on Vercel (public URL)

This app builds as a React Router server for Vercel. The GitHub repo is:

https://github.com/Aswin-0802/shopify-conversion-store

1. Open [Vercel](https://vercel.com) → **Add New → Project** → import that repo.
2. Framework preset: **React Router**. Build command: `npm run build`.
3. **Settings → Environment Variables**. For **each** variable, enable **Production**, **Preview**, and **Development** (all three). Copy values from local `.env` — never commit `.env`:

   - `SESSION_SECRET` (long random string)
   - `PUBLIC_STORE_DOMAIN`
   - `PUBLIC_STOREFRONT_API_TOKEN`
   - `PUBLIC_CHECKOUT_DOMAIN` (same as the store domain if unsure)
   - `PRIVATE_STOREFRONT_API_TOKEN` (recommended)
   - `PUBLIC_STOREFRONT_ID` (optional)
   - `PUBLIC_CUSTOMER_ACCOUNT_API_CLIENT_ID` / `PUBLIC_CUSTOMER_ACCOUNT_API_URL` (only if Sign in should work)

   Then **Deployments → ⋯ on the latest deployment → Redeploy**. New variables do not apply until you redeploy. Preview URLs (`*-aswin-ms-projects-*.vercel.app`) need the **Preview** checkbox or they still 500.

4. Deploy. Vercel gives a public `*.vercel.app` URL. Anyone can open it — no Shopify login.

If Sign in should work on that URL, add the Vercel domain in Shopify **Customer account** / Hydrogen storefront settings as an allowed callback origin.

Local `npm run dev` still uses Mini-Oxygen on http://localhost:3000.

Shopify’s self-hosting notes: https://shopify.dev/docs/storefronts/headless/hydrogen/deployments/self-hosting

## Scripts

```bash
npm run dev       # local storefront (Mini-Oxygen)
npm run build     # Vercel / React Router production build
npm run preview   # preview the production build locally
```
