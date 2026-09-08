import {Suspense} from 'react';
import {Await, NavLink} from 'react-router';
import {Newsletter} from '~/components/Newsletter';
import {PrivacyChoices} from '~/components/PrivacyChoices';
import {siteContent} from '~/lib/site-content';

/**
 * @param {FooterProps}
 */
export function Footer({footer: footerPromise, header, publicStoreDomain}) {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <p className="footer-brand">{siteContent.brandName}</p>
            <p>{siteContent.tagline}</p>
            <div style={{marginTop: '1.25rem'}}>
              {siteContent.social.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  rel="noopener noreferrer"
                  target="_blank"
                  style={{marginRight: '1rem'}}
                >
                  {item.label}
                </a>
              ))}
            </div>
          </div>
          <div>
            <p className="eyebrow" style={{color: 'inherit'}}>
              Shop
            </p>
            {siteContent.nav.map((item) => (
              <div key={item.to}>
                <NavLink prefetch="intent" to={item.to}>
                  {item.title}
                </NavLink>
              </div>
            ))}
          </div>
          <Suspense>
            <Await resolve={footerPromise}>
              {(footer) => (
                <FooterMenu
                  menu={footer?.menu}
                  primaryDomainUrl={header.shop.primaryDomain.url}
                  publicStoreDomain={publicStoreDomain}
                />
              )}
            </Await>
          </Suspense>
          <div>
            <p className="eyebrow" style={{color: 'inherit'}}>
              Stay in touch
            </p>
            <Newsletter compact />
          </div>
        </div>
        <div className="footer-meta">
          <p>
            © {new Date().getFullYear()} {siteContent.brandName}
          </p>
          <PrivacyChoices />
          <p>{siteContent.footerNote}</p>
        </div>
      </div>
    </footer>
  );
}

/**
 * @param {{
 *   menu: FooterQuery['menu'];
 *   primaryDomainUrl: FooterProps['header']['shop']['primaryDomain']['url'];
 *   publicStoreDomain: string;
 * }}
 */
function FooterMenu({menu, primaryDomainUrl, publicStoreDomain}) {
  const items = menu?.items?.length ? menu.items : FALLBACK_FOOTER_MENU.items;

  return (
    <nav aria-label="Policies">
      <p className="eyebrow" style={{color: 'inherit'}}>
        Help
      </p>
      {items.map((item) => {
        if (!item.url || isPrivacyChoicesItem(item)) return null;
        const url =
          item.url.includes('myshopify.com') ||
          item.url.includes(publicStoreDomain) ||
          item.url.includes(primaryDomainUrl)
            ? new URL(item.url).pathname
            : item.url;
        const isExternal = !url.startsWith('/');
        return isExternal ? (
          <div key={item.id}>
            <a href={url} rel="noopener noreferrer" target="_blank">
              {item.title}
            </a>
          </div>
        ) : (
          <div key={item.id}>
            <NavLink end prefetch="intent" to={url}>
              {item.title}
            </NavLink>
          </div>
        );
      })}
    </nav>
  );
}

const FALLBACK_FOOTER_MENU = {
  id: 'fallback-footer',
  items: [
    {id: '1', title: 'Privacy Policy', url: '/policies/privacy-policy', items: []},
    {id: '2', title: 'Refund Policy', url: '/policies/refund-policy', items: []},
    {id: '3', title: 'Shipping Policy', url: '/policies/shipping-policy', items: []},
    {id: '4', title: 'Terms of Service', url: '/policies/terms-of-service', items: []},
  ],
};

function isPrivacyChoicesItem(item) {
  const title = item.title?.toLowerCase() || '';
  const url = item.url?.toLowerCase() || '';
  return (
    title.includes('privacy choices') ||
    url.includes('data-sharing-opt-out') ||
    url.includes('privacy-choices')
  );
}

/**
 * @typedef {Object} FooterProps
 * @property {Promise<FooterQuery|null>} footer
 * @property {HeaderQuery} header
 * @property {string} publicStoreDomain
 */

/** @typedef {import('storefrontapi.generated').FooterQuery} FooterQuery */
/** @typedef {import('storefrontapi.generated').HeaderQuery} HeaderQuery */
