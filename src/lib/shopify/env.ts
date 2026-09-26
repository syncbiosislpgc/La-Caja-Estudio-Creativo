/**
 * Shopify Headless — stubs Fase 1.
 * Fase 5: Storefront API client + cart helpers.
 */

export type ShopifyEnv = {
  storeDomain: string;
  storefrontToken: string;
};

export function getShopifyEnv(): ShopifyEnv | null {
  const storeDomain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
  const storefrontToken = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN;
  if (!storeDomain || !storefrontToken) return null;
  return { storeDomain, storefrontToken };
}

export function isShopifyConfigured() {
  return getShopifyEnv() !== null;
}
