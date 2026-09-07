import {Suspense} from 'react';
import {Await, NavLink, useAsyncValue} from 'react-router';
import {useAnalytics, useOptimisticCart} from '@shopify/hydrogen';
import {useAside} from '~/components/Aside';
import {siteContent} from '~/lib/site-content';

/**
 * @param {HeaderProps}
 */
export function Header({header, isLoggedIn, cart, publicStoreDomain, showAccount}) {
  const {shop, menu} = header;

  return (
    <header className="site-header">
      <div className="header-inner">
        <div className="header-left">
          <HeaderMenuMobileToggle />
          <HeaderMenu
            menu={menu}
            viewport="desktop"
            primaryDomainUrl={header.shop.primaryDomain.url}
            publicStoreDomain={publicStoreDomain}
            showAccount={showAccount}
          />
        </div>
        <NavLink prefetch="intent" to="/" className="logo" end>
          {siteContent.brandName || shop.name}
        </NavLink>
        <HeaderCtas isLoggedIn={isLoggedIn} cart={cart} showAccount={showAccount} />
      </div>
    </header>
  );
}

/**
 * @param {{
 *   menu: HeaderProps['header']['menu'];
 *   primaryDomainUrl: HeaderProps['header']['shop']['primaryDomain']['url'];
 *   viewport: Viewport;
 *   publicStoreDomain: HeaderProps['publicStoreDomain'];
 * }}
 */
export function HeaderMenu({
  menu,
  primaryDomainUrl,
  viewport,
  publicStoreDomain,
  showAccount,
}) {
  const {close} = useAside();
  const source = menu?.items?.length ? menu.items : FALLBACK_HEADER_MENU.items;
  const extras = menu?.items?.length
    ? EXTRA_NAV.filter((item) => !menuHas(menu, item.to))
    : [];
  const items = [...source, ...extras];

  return (
    <nav
      className={viewport === 'desktop' ? 'header-menu-desktop' : 'header-menu-mobile'}
      aria-label={viewport === 'desktop' ? 'Primary' : 'Mobile'}
    >
      {viewport === 'mobile' ? (
        <>
          <NavLink end onClick={close} prefetch="intent" to="/">
            Home
          </NavLink>
          {showAccount ? (
            <NavLink onClick={close} prefetch="intent" to="/account">
              Account
            </NavLink>
          ) : null}
        </>
      ) : null}
      {items.map((item) => {
        const url = resolveMenuUrl(item, primaryDomainUrl, publicStoreDomain);
        if (!url) return null;
        return (
          <NavLink
            className={({isActive}) =>
              `header-menu-item${isActive ? ' is-active' : ''}`
            }
            end
            key={item.id || item.to || item.title}
            onClick={close}
            prefetch="intent"
            to={url}
          >
            {item.title}
          </NavLink>
        );
      })}
    </nav>
  );
}

/**
 * @param {Pick<HeaderProps, 'isLoggedIn' | 'cart'>}
 */
function HeaderCtas({isLoggedIn, cart, showAccount}) {
  return (
    <nav className="header-ctas" aria-label="Search and cart">
      <SearchToggle />
      {showAccount ? (
        <NavLink
          prefetch="intent"
          to="/account"
          className="header-icon header-account"
          aria-label="Account"
        >
          <AccountIcon />
          <span className="header-icon-label">
            <Suspense fallback="Account">
              <Await resolve={isLoggedIn} errorElement="Sign in">
                {(loggedIn) => (loggedIn ? 'Account' : 'Sign in')}
              </Await>
            </Suspense>
          </span>
        </NavLink>
      ) : null}
      <CartToggle cart={cart} />
    </nav>
  );
}

function HeaderMenuMobileToggle() {
  const {open} = useAside();
  return (
    <button
      className="header-menu-mobile-toggle"
      type="button"
      aria-label="Open menu"
      onClick={() => open('mobile')}
    >
      <HamburgerIcon />
    </button>
  );
}

function SearchToggle() {
  const {open} = useAside();
  return (
    <button
      className="header-icon"
      type="button"
      aria-label="Open search"
      onClick={() => open('search')}
    >
      <SearchIcon />
      <span className="header-icon-label">Search</span>
    </button>
  );
}

/**
 * @param {{count: number}}
 */
function CartBadge({count}) {
  const {open} = useAside();
  const {publish, shop, cart, prevCart} = useAnalytics();

  return (
    <a
      href="/cart"
      className="header-icon"
      aria-label={`Cart, ${count} items`}
      onClick={(event) => {
        event.preventDefault();
        open('cart');
        publish('cart_viewed', {
          cart,
          prevCart,
          shop,
          url: window.location.href || '',
        });
      }}
    >
      <CartIcon />
      <span className="header-icon-label">Cart</span>
      <span className="cart-count">{count}</span>
    </a>
  );
}

/**
 * @param {Pick<HeaderProps, 'cart'>}
 */
function CartToggle({cart}) {
  return (
    <Suspense fallback={<CartBadge count={0} />}>
      <Await resolve={cart}>
        <CartBanner />
      </Await>
    </Suspense>
  );
}

function CartBanner() {
  const originalCart = useAsyncValue();
  const cart = useOptimisticCart(originalCart);
  return <CartBadge count={cart?.totalQuantity ?? 0} />;
}

function menuHas(menu, path) {
  return Boolean(menu?.items?.some((item) => item.url?.includes(path)));
}

function resolveMenuUrl(item, primaryDomainUrl, publicStoreDomain) {
  if (item.to) return item.to;
  if (!item.url) return null;
  return item.url.includes('myshopify.com') ||
    (publicStoreDomain && item.url.includes(publicStoreDomain)) ||
    (primaryDomainUrl && item.url.includes(primaryDomainUrl))
    ? new URL(item.url).pathname
    : item.url;
}

const EXTRA_NAV = siteContent.nav.map((item, index) => ({
  id: `local-nav-${index}`,
  title: item.title,
  to: item.to,
  url: item.to,
}));

const FALLBACK_HEADER_MENU = {
  id: 'fallback-header-menu',
  items: siteContent.nav.map((item, index) => ({
    id: `fallback-${index}`,
    resourceId: null,
    tags: [],
    title: item.title,
    type: 'HTTP',
    url: item.to,
    items: [],
  })),
};

function HamburgerIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" fill="none">
      <path
        d="M4 7h16M4 12h16M4 17h16"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" fill="none">
      <circle cx="11" cy="11" r="6.25" stroke="currentColor" strokeWidth="1.6" />
      <path d="M16 16.5 20 20.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function AccountIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" fill="none">
      <circle cx="12" cy="8" r="3.25" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M5.5 19.25c1.4-3.1 3.7-4.5 6.5-4.5s5.1 1.4 6.5 4.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" fill="none">
      <path
        d="M6 7h15l-1.4 8.2a2 2 0 0 1-2 1.8H9.2a2 2 0 0 1-2-1.7L5.2 4.8A1.5 1.5 0 0 0 3.7 3.5H3"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="9.5" cy="20.5" r="1.2" fill="currentColor" />
      <circle cx="17.5" cy="20.5" r="1.2" fill="currentColor" />
    </svg>
  );
}

/** @typedef {'desktop' | 'mobile'} Viewport */
/**
 * @typedef {Object} HeaderProps
 * @property {HeaderQuery} header
 * @property {Promise<CartApiQueryFragment|null>} cart
 * @property {Promise<boolean>} isLoggedIn
 * @property {string} publicStoreDomain
 * @property {boolean} [showAccount]
 */

/** @typedef {import('storefrontapi.generated').HeaderQuery} HeaderQuery */
/** @typedef {import('storefrontapi.generated').CartApiQueryFragment} CartApiQueryFragment */
