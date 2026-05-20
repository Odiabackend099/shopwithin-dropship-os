// Shopify Custom Pixel fallback for Meta.
// Preferred path: use Shopify's official Facebook & Instagram app/channel integration.
// Do not install this if the official Meta app pixel is already active.

const META_PIXEL_ID = "REPLACE_WITH_META_PIXEL_ID";

!function (f, b, e, v, n, t, s) {
  if (f.fbq) return;
  n = f.fbq = function () {
    n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
  };
  if (!f._fbq) f._fbq = n;
  n.push = n;
  n.loaded = true;
  n.version = "2.0";
  n.queue = [];
  t = b.createElement(e);
  t.async = true;
  t.src = v;
  s = b.getElementsByTagName(e)[0];
  s.parentNode.insertBefore(t, s);
}(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");

fbq("init", META_PIXEL_ID);

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

function eventId(name, event) {
  const id = event?.id || event?.clientId || Date.now();
  return `shopwithin:${name}:${id}`;
}

function productParams(variant) {
  const price = variant?.price;
  return {
    content_ids: [variant?.sku || variant?.id].filter(Boolean),
    content_type: "product",
    content_name: variant?.product?.title || "FurLift Reusable Pet Hair Detailer",
    value: moneyAmount(price),
    currency: currencyCode(price)
  };
}

analytics.subscribe("page_viewed", (event) => {
  fbq("track", "PageView", {}, { eventID: eventId("PageView", event) });
});

analytics.subscribe("product_viewed", (event) => {
  const variant = event.data?.productVariant;
  fbq("track", "ViewContent", productParams(variant), { eventID: eventId("ViewContent", event) });
});

analytics.subscribe("product_added_to_cart", (event) => {
  const line = event.data?.cartLine;
  const variant = line?.merchandise;
  const params = productParams(variant);
  params.num_items = line?.quantity || 1;
  fbq("track", "AddToCart", params, { eventID: eventId("AddToCart", event) });
});

analytics.subscribe("checkout_started", (event) => {
  const checkout = event.data?.checkout;
  fbq("track", "InitiateCheckout", {
    value: moneyAmount(checkout?.totalPrice),
    currency: currencyCode(checkout?.currencyCode ? { currencyCode: checkout.currencyCode } : checkout?.totalPrice),
    num_items: checkout?.lineItems?.length
  }, { eventID: eventId("InitiateCheckout", event) });
});

analytics.subscribe("checkout_completed", (event) => {
  const checkout = event.data?.checkout;
  fbq("track", "Purchase", {
    value: moneyAmount(checkout?.totalPrice),
    currency: currencyCode(checkout?.currencyCode ? { currencyCode: checkout.currencyCode } : checkout?.totalPrice),
    order_id: checkout?.order?.id || checkout?.token
  }, { eventID: eventId("Purchase", event) });
});

