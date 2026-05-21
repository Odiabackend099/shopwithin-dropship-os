import type { FastifyInstance } from "fastify";
import { VapiClient } from "../services/vapi.js";

export async function vapiRoutes(app: FastifyInstance) {
  const vapi = new VapiClient(process.env.VAPI_PRIVATE_KEY || "");

  app.get("/api/vapi/assistants", async (_request, reply) => {
    try {
      const assistants = await vapi.listAssistants();
      return reply.send({ assistants });
    } catch {
      return reply.status(500).send({ error: "Failed to fetch assistants" });
    }
  });

  app.get("/api/vapi/calls", async (_request, reply) => {
    try {
      const calls = await vapi.listCalls();
      return reply.send({ calls });
    } catch {
      return reply.status(500).send({ error: "Failed to fetch calls" });
    }
  });

  app.post("/api/vapi/calls", async (request, reply) => {
    try {
      const body = request.body as Record<string, unknown>;
      const call = await vapi.createOutboundCall({
        assistantId: body.assistantId as string | undefined,
        phoneNumberId: body.phoneNumberId as string,
        customerNumber: body.customerNumber as string,
      });
      return reply.status(201).send({ callId: call.id });
    } catch {
      return reply.status(500).send({ error: "Failed to create call" });
    }
  });

  app.get("/api/vapi/calls/:id", async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const call = await vapi.getCall(id);
      return reply.send({ call });
    } catch {
      return reply.status(404).send({ error: "Call not found" });
    }
  });

  app.post("/api/vapi/calls/:id/end", async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      await vapi.endCall(id);
      return reply.send({ success: true });
    } catch {
      return reply.status(500).send({ error: "Failed to end call" });
    }
  });
}