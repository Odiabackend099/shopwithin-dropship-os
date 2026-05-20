import client from "prom-client";
import type { FastifyInstance } from "fastify";

client.collectDefaultMetrics({ prefix: "dropship_os_" });

export const webhookCounter = new client.Counter({
  name: "dropship_os_webhooks_total",
  help: "Total webhook deliveries received",
  labelNames: ["provider", "topic", "result"] as const
});

export async function metricsRoutes(app: FastifyInstance): Promise<void> {
  app.get("/metrics", async (_request, reply) => {
    reply.header("content-type", client.register.contentType);
    return client.register.metrics();
  });
}
