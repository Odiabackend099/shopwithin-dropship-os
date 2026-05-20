import type { AppEnv } from "../env.js";

export type KlaviyoEventInput = {
  email: string;
  eventName: "Placed Order" | "Fulfillment Held" | "Tracking Updated" | "Abandoned Checkout";
  properties: Record<string, unknown>;
  time?: string | undefined;
};

export class KlaviyoClient {
  constructor(private readonly env: AppEnv, private readonly fetchImpl: typeof fetch = fetch) {}

  async createEvent(input: KlaviyoEventInput): Promise<{ status: "dry_run" | "sent"; eventName: string }> {
    if (!this.env.KLAVIYO_PRIVATE_API_KEY) {
      return { status: "dry_run", eventName: input.eventName };
    }

    const response = await this.fetchImpl("https://a.klaviyo.com/api/events/", {
      method: "POST",
      headers: {
        authorization: `Klaviyo-API-Key ${this.env.KLAVIYO_PRIVATE_API_KEY}`,
        accept: "application/json",
        "content-type": "application/json",
        revision: this.env.KLAVIYO_REVISION
      },
      body: JSON.stringify({
        data: {
          type: "event",
          attributes: {
            properties: input.properties,
            time: input.time ?? new Date().toISOString(),
            metric: {
              data: {
                type: "metric",
                attributes: { name: input.eventName }
              }
            },
            profile: {
              data: {
                type: "profile",
                attributes: { email: input.email }
              }
            }
          }
        }
      })
    });

    if (response.status === 429) throw new Error("Klaviyo rate limit reached");
    if (!response.ok) throw new Error(`Klaviyo event sync failed with ${response.status}`);
    return { status: "sent", eventName: input.eventName };
  }
}
