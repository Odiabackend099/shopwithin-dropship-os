export type FeatureFlags = {
  autoFulfillmentEnabled: boolean;
  paidAdsEnabled: boolean;
  aiAutoPublishEnabled: boolean;
  stripeEnabled: boolean;
  shopifyLiveWriteEnabled: boolean;
  supplierAutoPayEnabled: boolean;
  customerAiAutoReplyEnabled: boolean;
};

export function readFeatureFlags(env: Record<string, string | undefined>): FeatureFlags {
  return {
    autoFulfillmentEnabled: env.AUTO_FULFILLMENT_ENABLED === "true",
    paidAdsEnabled: env.PAID_ADS_ENABLED === "true",
    aiAutoPublishEnabled: env.AI_AUTO_PUBLISH_ENABLED === "true",
    stripeEnabled: env.STRIPE_ENABLED === "true",
    shopifyLiveWriteEnabled: env.SHOPIFY_LIVE_WRITE_ENABLED === "true",
    supplierAutoPayEnabled: env.SUPPLIER_AUTO_PAY_ENABLED === "true",
    customerAiAutoReplyEnabled: env.CUSTOMER_AI_AUTO_REPLY_ENABLED === "true"
  };
}
