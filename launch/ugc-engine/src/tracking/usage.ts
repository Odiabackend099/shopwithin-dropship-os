import fs from "node:fs";
import path from "node:path";
import { type UsageLogEntry, usageLogEntrySchema } from "../schemas/index.js";

export class UsageTracker {
  private logPath: string;

  constructor(logDir: string) {
    fs.mkdirSync(logDir, { recursive: true });
    this.logPath = path.join(logDir, "usage.jsonl");
  }

  log(entry: UsageLogEntry): void {
    const validated = usageLogEntrySchema.parse(entry);
    const line = JSON.stringify(validated) + "\n";
    fs.appendFileSync(this.logPath, line, "utf8");
  }

  readAll(): UsageLogEntry[] {
    if (!fs.existsSync(this.logPath)) return [];
    const lines = fs.readFileSync(this.logPath, "utf8").split("\n").filter(Boolean);
    return lines.map((l) => usageLogEntrySchema.parse(JSON.parse(l)));
  }

  statsByDriver(): Record<string, { count: number; costUsd: number; failures: number }> {
    const entries = this.readAll();
    const stats: Record<string, { count: number; costUsd: number; failures: number }> = {};
    for (const e of entries) {
      const s = (stats[e.driver] ??= { count: 0, costUsd: 0, failures: 0 });
      s.count++;
      s.costUsd += e.costEstimateUsd;
      if (!e.success) s.failures++;
    }
    return stats;
  }

  totalCostUsd(): number {
    return this.readAll().reduce((sum, e) => sum + e.costEstimateUsd, 0);
  }
}
