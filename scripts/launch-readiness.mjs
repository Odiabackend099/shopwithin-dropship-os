#!/usr/bin/env node
import { existsSync, readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import net from "node:net";

const envPath = new URL("../.env", import.meta.url);
const checks = [];

function add(name, ok, detail, severity = "critical") {
  checks.push({ name, ok, detail, severity });
}

function parseEnv(contents) {
  const env = {};
  for (const line of contents.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const separator = trimmed.indexOf("=");
    if (separator === -1) continue;
    env[trimmed.slice(0, separator)] = trimmed.slice(separator + 1);
  }
  return env;
}

function isRealValue(value) {
  if (!value) return false;
  const lowered = value.toLowerCase();
  return !["replace_", "redacted", "your-", "your_", "example", "test_"].some((token) => lowered.includes(token));
}

async function checkHttp(url, expectedStatus = 200) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);
  try {
    const response = await fetch(url, { signal: controller.signal });
    return { ok: response.status === expectedStatus, status: response.status };
  } catch (error) {
    return { ok: false, status: error instanceof Error ? error.message : "request_failed" };
  } finally {
    clearTimeout(timeout);
  }
}

async function checkPaidGate() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);
  try {
    const response = await fetch("http://localhost:4000/internal/traffic/validate-creative", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        organicPostsPublished: 18,
        creativesProduced: 24,
        bestOrganicViewCount: 2400,
        bestOrganicClickThroughRate: 1.8,
        landingPageSessions: 88,
        addToCarts: 5,
        requestedDailyBudgetNgn: 9000
      }),
      signal: controller.signal
    });
    if (!response.ok) return { ok: false, detail: `POST returned ${response.status}.` };
    const body = await response.json();
    const blockedByFlag =
      body.paidTestAllowed === false &&
      body.cappedDailyBudgetNgn === 0 &&
      Array.isArray(body.reasons) &&
      body.reasons.includes("paid_ads_feature_flag_disabled");
    return {
      ok: blockedByFlag,
      detail: blockedByFlag ? "Validated spend is blocked while PAID_ADS_ENABLED=false." : "Paid gate did not block spend as expected."
    };
  } catch (error) {
    return { ok: false, detail: error instanceof Error ? error.message : "request_failed" };
  } finally {
    clearTimeout(timeout);
  }
}

async function checkFulfillmentReadiness() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);
  try {
    const response = await fetch("http://localhost:4000/internal/fulfillment/ops", { signal: controller.signal });
    if (!response.ok) return { ok: false, detail: `GET /internal/fulfillment/ops returned ${response.status}.` };

    const body = await response.json();
    const summary = body?.fulfillment?.summary;
    if (!summary) return { ok: false, detail: "Fulfillment ops response did not include a summary." };

    const verifiedLinks = Number(summary.verifiedLinks ?? 0);
    const linkedProducts = Number(summary.linkedProducts ?? 0);
    const supplierFailures = Number(summary.supplierFailures ?? 0);
    const pendingApprovals = Number(summary.pendingApprovals ?? 0);

    if (supplierFailures > 0) {
      return {
        ok: false,
        detail: `Blocked by ${supplierFailures} supplier failure(s); resolve Zendrop/store connection before live fulfillment.`
      };
    }

    if (verifiedLinks < 1) {
      return {
        ok: false,
        detail: `No verified supplier product link exists (${verifiedLinks}/${linkedProducts}); FurLift must be linked in Zendrop first.`
      };
    }

    return {
      ok: true,
      detail: `Verified supplier links: ${verifiedLinks}/${linkedProducts}; pending approvals: ${pendingApprovals}.`
    };
  } catch (error) {
    return { ok: false, detail: error instanceof Error ? error.message : "request_failed" };
  } finally {
    clearTimeout(timeout);
  }
}

function checkTcpPort(port) {
  return new Promise((resolve) => {
    const socket = net.createConnection({ host: "127.0.0.1", port });
    const timeout = setTimeout(() => {
      socket.destroy();
      resolve(false);
    }, 1000);
    socket.once("connect", () => {
      clearTimeout(timeout);
      socket.end();
      resolve(true);
    });
    socket.once("error", () => {
      clearTimeout(timeout);
      resolve(false);
    });
  });
}

if (!existsSync(envPath)) {
  add(".env file", false, "Create .env from .env.example before staging.");
} else {
  add(".env file", true, ".env exists.");
  const env = parseEnv(readFileSync(envPath, "utf8"));

  const safetyFlags = {
    AUTO_FULFILLMENT_ENABLED: "false",
    PAID_ADS_ENABLED: "false",
    SHOPIFY_LIVE_WRITE_ENABLED: "false",
    SUPPLIER_AUTO_PAY_ENABLED: "false",
    AI_AUTO_PUBLISH_ENABLED: "false",
    CUSTOMER_AI_AUTO_REPLY_ENABLED: "false",
    STRIPE_ENABLED: "false"
  };

  for (const [key, expected] of Object.entries(safetyFlags)) {
    add(key, env[key] === expected, `Expected ${expected}; received ${env[key] ?? "missing"}.`);
  }

  add("SHOPIFY_STORE_BASE_CURRENCY", env.SHOPIFY_STORE_BASE_CURRENCY === "USD", `Received ${env.SHOPIFY_STORE_BASE_CURRENCY ?? "missing"}.`);
  add("FLUTTERWAVE_TEST_MODE", env.FLUTTERWAVE_TEST_MODE === "true", `Received ${env.FLUTTERWAVE_TEST_MODE ?? "missing"}.`);

  const stagingCredentials = [
    "SHOPIFY_SHOP_DOMAIN",
    "SHOPIFY_WEBHOOK_SECRET",
    "FLUTTERWAVE_PUBLIC_KEY",
    "FLUTTERWAVE_SECRET_KEY",
    "FLUTTERWAVE_SECRET_HASH",
    "OPENAI_API_KEY",
    "SUPPLIER_WEBHOOK_SECRET"
  ];

  for (const key of stagingCredentials) {
    add(key, isRealValue(env[key]), isRealValue(env[key]) ? "Configured." : "Missing or still using placeholder/redacted value.");
  }

  add(
    "SHOPIFY_ADMIN_ACCESS_TOKEN",
    env.SHOPIFY_LIVE_WRITE_ENABLED === "false" || isRealValue(env.SHOPIFY_ADMIN_ACCESS_TOKEN),
    env.SHOPIFY_LIVE_WRITE_ENABLED === "false"
      ? "Skipped because SHOPIFY_LIVE_WRITE_ENABLED=false."
      : isRealValue(env.SHOPIFY_ADMIN_ACCESS_TOKEN)
        ? "Configured."
        : "Missing or still using placeholder/redacted value."
  );

  const optionalPaymentKeys = ["PAYPAL_CLIENT_ID", "PAYPAL_CLIENT_SECRET"];
  for (const key of optionalPaymentKeys) {
    add(key, isRealValue(env[key]), isRealValue(env[key]) ? "Configured." : "Skipped for Flutterwave-first launch.", "warning");
  }

  add(
    "ZENDROP_CONNECTED_STORE_ENABLED",
    env.ZENDROP_CONNECTED_STORE_ENABLED !== "false",
    env.ZENDROP_CONNECTED_STORE_ENABLED === "false"
      ? "Disabled; Zendrop Shopify-connected fulfillment checks will not be launch-ready."
      : "Using supported Shopify-connected Zendrop workflow."
  );

  add(
    "ZENDROP_API_KEY",
    true,
    isRealValue(env.ZENDROP_API_KEY) ? "Configured." : "Skipped; Zendrop order operations use Shopify-connected dashboard verification.",
    "warning"
  );

  const optionalSupplierKeys = ["SPOCKET_API_KEY", "CJ_API_KEY"];
  for (const key of optionalSupplierKeys) {
    add(key, isRealValue(env[key]), isRealValue(env[key]) ? "Configured." : "Not configured; manual supplier routing remains required.", "warning");
  }
}

const docker = spawnSync("docker", ["info"], { encoding: "utf8" });
const postgresListening = await checkTcpPort(5432);
const redisListening = await checkTcpPort(6379);
const localDataServicesReady = postgresListening && redisListening;
add(
  "Local data services",
  docker.status === 0 || localDataServicesReady,
  docker.status === 0
    ? "Docker is available."
    : localDataServicesReady
      ? "Docker is not running, but local Postgres and Redis are listening."
      : "Docker is not running and local Postgres/Redis are not both listening."
);

const apiHealth = await checkHttp("http://localhost:4000/healthz");
add("API health", apiHealth.ok, `GET /healthz returned ${apiHealth.status}.`, "warning");

const adminHealth = await checkHttp("http://localhost:3000");
add("Admin health", adminHealth.ok, `GET / returned ${adminHealth.status}.`, "warning");

const paidGate = await checkPaidGate();
add("Paid-spend gate", paidGate.ok, paidGate.detail, "warning");

const fulfillmentReadiness = await checkFulfillmentReadiness();
add("Fulfillment readiness", fulfillmentReadiness.ok, fulfillmentReadiness.detail);

const failedCritical = checks.filter((check) => !check.ok && check.severity === "critical");
const failedWarnings = checks.filter((check) => !check.ok && check.severity === "warning");

for (const check of checks) {
  const icon = check.ok ? "PASS" : check.severity === "warning" ? "WARN" : "FAIL";
  console.log(`${icon} ${check.name}: ${check.detail}`);
}

console.log("");
console.log(`Summary: ${checks.length - failedCritical.length - failedWarnings.length}/${checks.length} checks passed.`);
if (failedCritical.length > 0) {
  console.log(`Blocked: ${failedCritical.length} critical check(s) must pass before staging orders.`);
  process.exit(1);
}
if (failedWarnings.length > 0) {
  console.log(`Warnings: ${failedWarnings.length} non-critical check(s) need attention before launch.`);
}
