// Shopify Custom Pixel fallback for TikTok.
// Preferred path: use Shopify's official TikTok app/channel integration.
// Do not install this if the official TikTok app pixel is already active.

const TIKTOK_PIXEL_ID = "REPLACE_WITH_TIKTOK_PIXEL_ID";

!function (w, d, t) {
  w.TiktokAnalyticsObject = t;
  const ttq = w[t] = w[t] || [];
  ttq.methods = ["page", "track", "identify", "instances", "debug", "on", "off", "once", "ready", "alias", "group", "enableCookie", "disableCookie", "holdConsent", "revokeConsent", "grantConsent"];
  ttq.setAndDefer = function (target, method) {
    target[method] = function () {
      target.push([method].concat(Array.prototype.slice.call(arguments, 0)));
    };
  };
  for (let i = 0; i < ttq.methods.length; i++) ttq.setAndDefer(ttq, ttq.methods[i]);
  ttq.instance = function (id) {
    const instance = ttq._i[id] || [];
    for (let i = 0; i < ttq.methods.length; i++) ttq.setAndDefer(instance, ttq.methods[i]);
    return instance;
  };
  ttq.load = function (id) {
    const src = "https://analytics.tiktok.com/i18n/pixel/events.js";
    ttq._i = ttq._i || {};
    ttq._i[id] = [];
    ttq._i[id]._u = src;
    ttq._t = ttq._t || {};
    ttq._t[id] = +new Date();
    ttq._o = ttq._o || {};
    ttq._o[id] = {};
    const script = d.createElement("script");
    script.type = "text/javascript";
    script.async = true;
    script.src = src + "?sdkid=" + id + "&lib=" + t;
    const firstScript = d.getElementsByTagName("script")[0];
    firstScript.parentNode.insertBefore(script, firstScript);
  };
  ttq.load(TIKTOK_PIXEL_ID);
  ttq.page();
}(window, document, "ttq");

function moneyAmount(value) {
  if (value === undefined || value === null) return undefined;
  if (typeof value === "number") return value;
  if (typeof value.amount === "number") return value.amount;
  if (typeof value.amount === "string") return Number(value.amount);
  return undefined;
}

function currencyCode(value) {
  return value?.currencyCode || value?.currency || "USD";
}

function productParams(variant) {
  const price = variant?.price;
  return {
    content_id: variant?.sku || variant?.id,
    content_type: "product",
    content_name: variant?.product?.title || "FurLift Reusable Pet Hair Detailer",
    value: moneyAmount(price),
    currency: currencyCode(price)
  };
}

analytics.subscribe("page_viewed", () => {
  ttq.page();
});

analytics.subscribe("product_viewed", (event) => {
  const variant = event.data?.productVariant;
  ttq.track("ViewContent", productParams(variant));
});

analytics.subscribe("product_added_to_cart", (event) => {
  const line = event.data?.cartLine;
  const variant = line?.merchandise;
  const params = productParams(variant);
  params.quantity = line?.quantity || 1;
  ttq.track("AddToCart", params);
});

analytics.subscribe("checkout_started", (event) => {
  const checkout = event.data?.checkout;
  ttq.track("InitiateCheckout", {
    content_type: "product",
    value: moneyAmount(checkout?.totalPrice),
    currency: currencyCode(checkout?.currencyCode ? { currencyCode: checkout.currencyCode } : checkout?.totalPrice),
    num_items: checkout?.lineItems?.length
  });
});

analytics.subscribe("checkout_completed", (event) => {
  const checkout = event.data?.checkout;
  ttq.track("CompletePayment", {
    content_type: "product",
    value: moneyAmount(checkout?.totalPrice),
    currency: currencyCode(checkout?.currencyCode ? { currencyCode: checkout.currencyCode } : checkout?.totalPrice),
    order_id: checkout?.order?.id || checkout?.token
  });
});

