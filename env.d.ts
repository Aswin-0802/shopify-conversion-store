/// <reference types="vite/client" />
/// <reference types="react-router" />
/// <reference types="@shopify/oxygen-workers-types" />
/// <reference types="@shopify/hydrogen/react-router-types" />

import '@total-typescript/ts-reset';

declare global {
  interface Env {
    PUBLIC_JUDGEME_SHOP_DOMAIN?: string;
    CONTACT_FORM_ENDPOINT?: string;
    NEWSLETTER_FORM_ENDPOINT?: string;
  }
}

export {};
