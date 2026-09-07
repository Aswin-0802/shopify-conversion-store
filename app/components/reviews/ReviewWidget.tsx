import {useEffect} from 'react';
import {shopifyNumericId} from '~/lib/seo';

type ReviewWidgetProps = {
  shopDomain?: string | null;
  productGid?: string | null;
  variant?: 'product' | 'all';
};

/**
 * Isolated Judge.me widget loader.
 * Swap this file if you change review providers.
 */
export function ReviewWidget({
  shopDomain,
  productGid,
  variant = 'product',
}: ReviewWidgetProps) {
  useEffect(() => {
    if (!shopDomain) return;

    const existing = document.querySelector('script[data-reviews-provider="judgeme"]');
    if (existing) {
      window.dispatchEvent(new Event('jdgm:reload'));
      return;
    }

    window.jdgm = window.jdgm || {};
    window.jdgm.SHOP_DOMAIN = shopDomain;
    window.jdgm.PLATFORM = 'shopify';

    const script = document.createElement('script');
    script.src = 'https://cdn.judge.me/widget_preloader.js';
    script.async = true;
    script.dataset.reviewsProvider = 'judgeme';
    document.body.appendChild(script);
  }, [shopDomain]);

  if (!shopDomain) return null;

  if (variant === 'all') {
    return (
      <div
        className="jdgm-widget jdgm-all-reviews-widget"
        data-widget-type="all-reviews"
      />
    );
  }

  const productId = shopifyNumericId(productGid);
  if (!productId) return null;

  return (
    <div
      className="jdgm-widget jdgm-review-widget"
      data-id={productId}
      data-product-title=""
    />
  );
}

declare global {
  interface Window {
    jdgm?: {
      SHOP_DOMAIN?: string;
      PLATFORM?: string;
      PUBLIC_TOKEN?: string;
    };
  }
}
