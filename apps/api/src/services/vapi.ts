import { z } from "zod";

export const vapiSchema = z.object({
  VAPI_PRIVATE_KEY: z.string().min(1),
  VAPI_PUBLIC_KEY: z.string().min(1),
});

export type VapiConfig = z.infer<typeof vapiSchema>;

export interface VapiCall {
  id: string;
  status: "ongoing" | "completed" | "failed";
  duration: number;
  cost: number;
  transcript?: string;
}

export interface VapiAssistant {
  id: string;
  name: string;
  model: string;
  voiceId: string;
}

export class VapiClient {
  private apiKey: string;
  private baseUrl = "https://api.vapi.ai";

  constructor(privateKey: string) {
    this.apiKey = privateKey;
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        "Authorization": `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`VAPI error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async listAssistants(): Promise<VapiAssistant[]> {
    return this.request<VapiAssistant[]>("/assistants");
  }

  async createAssistant(config: {
    name: string;
    model: string;
    voiceId?: string;
    systemPrompt?: string;
  }): Promise<VapiAssistant> {
    return this.request<VapiAssistant>("/assistants", {
      method: "POST",
      body: JSON.stringify({
        model: config.model,
        voice: {
          provider: "vapi",
          voiceId: config.voiceId || "sarah",
        },
        name: config.name,
        systemPrompt: config.systemPrompt || "You are a helpful sales assistant.",
      }),
    });
  }

  async listCalls(): Promise<VapiCall[]> {
    return this.request<VapiCall[]>("/calls");
  }

  async getCall(callId: string): Promise<VapiCall> {
    return this.request<VapiCall>(`/calls/${callId}`);
  }

  async createOutboundCall(config: {
    assistantId?: string | null;
    phoneNumberId: string;
    customerNumber: string;
  }): Promise<{ id: string }> {
    return this.request<{ id: string }>("/calls", {
      method: "POST",
      body: JSON.stringify({
        assistantId: config.assistantId,
        phoneNumberId: config.phoneNumberId,
        customerNumber: config.customerNumber,
      }),
    });
  }

  async endCall(callId: string): Promise<void> {
    await this.request(`/calls/${callId}/end`, { method: "POST" });
  }
}