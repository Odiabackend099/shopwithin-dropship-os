import { Queue } from "bullmq";
import { Redis } from "ioredis";

export type JobName =
  | "order.route"
  | "tracking.sync"
  | "profit.snapshot"
  | "product.publish"
  | "product.score"
  | "reconciliation.run";

export interface JobQueue {
  enqueue<T extends object>(name: JobName, payload: T, options?: { jobId?: string; delayMs?: number }): Promise<void>;
}

export class InMemoryJobQueue implements JobQueue {
  readonly jobs: Array<{ name: JobName; payload: object; jobId?: string; delayMs?: number }> = [];

  async enqueue<T extends object>(name: JobName, payload: T, options: { jobId?: string; delayMs?: number } = {}): Promise<void> {
    this.jobs.push({ name, payload, ...options });
  }
}

export class BullMqJobQueue implements JobQueue {
  private readonly connection: Redis;
  private readonly queue: Queue;

  constructor(redisUrl: string) {
    this.connection = new Redis(redisUrl, { maxRetriesPerRequest: null });
    this.queue = new Queue("dropship-os", { connection: this.connection });
  }

  async enqueue<T extends object>(name: JobName, payload: T, options: { jobId?: string; delayMs?: number } = {}): Promise<void> {
    await this.queue.add(name, payload, {
      attempts: 5,
      backoff: { type: "exponential", delay: 1000 },
      removeOnComplete: { age: 86400, count: 1000 },
      removeOnFail: false,
      ...(options.jobId ? { jobId: options.jobId } : {}),
      ...(options.delayMs ? { delay: options.delayMs } : {})
    });
  }
}
