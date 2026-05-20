import Fastify from "fastify";
import cors from "@fastify/cors";
import rateLimit from "@fastify/rate-limit";
import * as Sentry from "@sentry/node";
import { ZodError } from "zod";
import type { AppEnv } from "./env.js";
import { loadEnv } from "./env.js";
import { BullMqJobQueue, InMemoryJobQueue, type JobQueue } from "./lib/job-queue.js";
import { InMemoryRepository, PrismaRepository, type Repository } from "./lib/repository.js";
import { healthRoutes } from "./routes/health.js";
import { internalRoutes } from "./routes/internal.js";
import { metricsRoutes } from "./routes/metrics.js";
import { webhookRoutes } from "./routes/webhooks.js";
import { KlaviyoClient } from "./services/klaviyo.js";
import { ProductAiService } from "./services/openai.js";
import { ShopifyClient } from "./services/shopify.js";
import { SupplierClient } from "./services/suppliers.js";

export type BuildAppOptions = {
  env?: AppEnv;
  repository?: Repository;
  queue?: JobQueue;
};

export async function buildApp(options: BuildAppOptions = {}) {
  const env = options.env ?? loadEnv();
  if (env.SENTRY_DSN) Sentry.init({ dsn: env.SENTRY_DSN, environment: env.NODE_ENV });

  const repository = options.repository ?? (env.DATABASE_URL ? new PrismaRepository() : new InMemoryRepository());
  const queue = options.queue ?? (env.REDIS_URL ? new BullMqJobQueue(env.REDIS_URL) : new InMemoryJobQueue());
  const shopify = new ShopifyClient(env);
  const klaviyo = new KlaviyoClient(env);
  const suppliers = new SupplierClient(env);
  const ai = new ProductAiService(env);

  const app = Fastify({ logger: { level: env.LOG_LEVEL } });
  await app.register(cors, { origin: true });
  await app.register(rateLimit, { max: 300, timeWindow: "1 minute" });

  app.removeContentTypeParser("application/json");
  app.addContentTypeParser("application/json", { parseAs: "buffer" }, (request, body, done) => {
    const raw = Buffer.isBuffer(body) ? body : Buffer.from(body);
    (request as typeof request & { rawBody?: Buffer }).rawBody = raw;
    try {
      done(null, JSON.parse(raw.toString("utf8")));
    } catch (error) {
      done(error as Error);
    }
  });

  app.addHook("onClose", async () => {
    await repository.close();
  });

  app.setErrorHandler((error, request, reply) => {
    if (error instanceof ZodError || (error && typeof error === "object" && "issues" in error && Array.isArray((error as { issues?: unknown }).issues))) {
      reply.status(422).send({ ok: false, error: "validation_failed", issues: (error as ZodError).issues });
      return;
    }
    request.log.error({ error }, "request failed");
    Sentry.captureException(error);
    reply.status(500).send({ ok: false, error: error instanceof Error ? error.message : "unknown error" });
  });

  await app.register(healthRoutes);
  await app.register(metricsRoutes);
  await app.register(webhookRoutes, { env, repository, queue });
  await app.register(internalRoutes, { env, repository, queue, shopify, klaviyo, suppliers, ai });

  return app;
}
