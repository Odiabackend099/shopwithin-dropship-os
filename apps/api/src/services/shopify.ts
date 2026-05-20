import type { ShopifyProductDraft } from "@dropship-os/core";
import type { AppEnv } from "../env.js";

type ShopifyGraphqlResponse<T> = {
  data?: T;
  errors?: Array<{ message: string }>;
  extensions?: { cost?: { throttleStatus?: { currentlyAvailable: number; restoreRate: number } } };
};

export class ShopifyClient {
  constructor(private readonly env: AppEnv, private readonly fetchImpl: typeof fetch = fetch) {}

  async createDraftProduct(product: ShopifyProductDraft): Promise<{ shopifyProductId: string }> {
    if (!this.env.flags.shopifyLiveWriteEnabled) {
      return { shopifyProductId: `dry-run-${product.handle}` };
    }
    if (!this.env.SHOPIFY_ADMIN_ACCESS_TOKEN) throw new Error("SHOPIFY_ADMIN_ACCESS_TOKEN is required for live writes");

    const mutation = `#graphql
      mutation ProductCreate($product: ProductCreateInput!) {
        productCreate(product: $product) {
          product { id handle }
          userErrors { field message }
        }
      }`;

    const response = await this.graphql<{ productCreate: { product: { id: string } | null; userErrors: Array<{ message: string }> } }>(
      mutation,
      {
        product: {
          title: product.title,
          handle: product.handle,
          descriptionHtml: product.bodyHtml,
          vendor: product.vendor,
          productType: product.productType,
          tags: product.tags,
          status: "DRAFT",
          seo: { title: product.seoTitle, description: product.seoDescription }
        }
      }
    );

    const errors = response.productCreate.userErrors;
    if (errors.length > 0 || !response.productCreate.product) {
      throw new Error(`Shopify productCreate failed: ${errors.map((error) => error.message).join("; ")}`);
    }
    return { shopifyProductId: response.productCreate.product.id };
  }

  async syncTracking(input: {
    fulfillmentOrderId: string;
    trackingNumber: string;
    trackingUrl?: string;
    carrier?: string;
    notifyCustomer: boolean;
  }): Promise<void> {
    if (!this.env.flags.shopifyLiveWriteEnabled) return;
    const mutation = `#graphql
      mutation FulfillmentCreate($fulfillment: FulfillmentV2Input!) {
        fulfillmentCreateV2(fulfillment: $fulfillment) {
          fulfillment { id status }
          userErrors { field message }
        }
      }`;
    await this.graphql(mutation, {
      fulfillment: {
        lineItemsByFulfillmentOrder: [{ fulfillmentOrderId: input.fulfillmentOrderId }],
        trackingInfo: {
          number: input.trackingNumber,
          url: input.trackingUrl,
          company: input.carrier
        },
        notifyCustomer: input.notifyCustomer
      }
    });
  }

  async syncTrackingForOrder(input: {
    shopifyOrderId: string;
    trackingNumber: string;
    trackingUrl?: string;
    carrier?: string;
    notifyCustomer: boolean;
  }): Promise<{ fulfillmentOrderId: string; status: "dry_run" | "synced" }> {
    if (!this.env.flags.shopifyLiveWriteEnabled) {
      return { fulfillmentOrderId: `dry-run-fulfillment-order-${input.shopifyOrderId}`, status: "dry_run" };
    }
    const fulfillmentOrderId = await this.findOpenFulfillmentOrderId(input.shopifyOrderId);
    await this.syncTracking({
      fulfillmentOrderId,
      trackingNumber: input.trackingNumber,
      notifyCustomer: input.notifyCustomer,
      ...(input.trackingUrl ? { trackingUrl: input.trackingUrl } : {}),
      ...(input.carrier ? { carrier: input.carrier } : {})
    });
    return { fulfillmentOrderId, status: "synced" };
  }

  private async findOpenFulfillmentOrderId(shopifyOrderId: string): Promise<string> {
    const query = `#graphql
      query OrderFulfillmentOrders($id: ID!) {
        order(id: $id) {
          fulfillmentOrders(first: 10) {
            nodes { id status }
          }
        }
      }`;
    const gid = shopifyOrderId.startsWith("gid://") ? shopifyOrderId : `gid://shopify/Order/${shopifyOrderId}`;
    const response = await this.graphql<{ order: { fulfillmentOrders: { nodes: Array<{ id: string; status: string }> } } | null }>(query, { id: gid });
    const fulfillmentOrder = response.order?.fulfillmentOrders.nodes.find((node) => !["CLOSED", "CANCELLED"].includes(node.status));
    if (!fulfillmentOrder) throw new Error(`no_open_fulfillment_order_for_shopify_order:${shopifyOrderId}`);
    return fulfillmentOrder.id;
  }

  private async graphql<T>(query: string, variables: Record<string, unknown>): Promise<T> {
    const response = await this.fetchImpl(
      `https://${this.env.SHOPIFY_SHOP_DOMAIN}/admin/api/${this.env.SHOPIFY_API_VERSION}/graphql.json`,
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-shopify-access-token": this.env.SHOPIFY_ADMIN_ACCESS_TOKEN ?? ""
        },
        body: JSON.stringify({ query, variables })
      }
    );

    if (response.status === 429) throw new Error("Shopify rate limit reached");
    if (!response.ok) throw new Error(`Shopify API failed with ${response.status}`);

    const json = (await response.json()) as ShopifyGraphqlResponse<T>;
    const throttle = json.extensions?.cost?.throttleStatus;
    if (throttle && throttle.currentlyAvailable < throttle.restoreRate) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
    if (json.errors?.length) throw new Error(json.errors.map((error) => error.message).join("; "));
    if (!json.data) throw new Error("Shopify API returned no data");
    return json.data;
  }
}
