import { probeFile } from "../video/ffmpeg.js";
import { type QaReport, type ExportConfig } from "../schemas/index.js";

export interface ValidationCheck {
  assetPath: string;
  check: string;
  passed: boolean;
  detail?: string;
}

export async function validateExport(config: ExportConfig): Promise<ValidationCheck[]> {
  const checks: ValidationCheck[] = [];

  const probe = await probeFile(config.sourceAssetPath);
  if (!probe) {
    checks.push({
      assetPath: config.sourceAssetPath,
      check: "file_probe",
      passed: false,
      detail: "FFprobe could not read file",
    });
    return checks;
  }

  checks.push({
    assetPath: config.sourceAssetPath,
    check: "file_probe",
    passed: true,
    detail: `width=${probe.width}, height=${probe.height}, duration=${probe.durationSec.toFixed(2)}s`,
  });

  const expectedW = config.dimensions.width;
  const expectedH = config.dimensions.height;
  checks.push({
    assetPath: config.sourceAssetPath,
    check: "dimensions",
    passed: probe.width === expectedW && probe.height === expectedH,
    detail: `Expected ${expectedW}x${expectedH}, got ${probe.width}x${probe.height}`,
  });

  if (config.durationSec !== undefined) {
    const tolerance = 0.5;
    checks.push({
      assetPath: config.sourceAssetPath,
      check: "duration",
      passed: Math.abs(probe.durationSec - config.durationSec) <= tolerance,
      detail: `Expected ~${config.durationSec}s, got ${probe.durationSec.toFixed(2)}s`,
    });
  }

  checks.push({
    assetPath: config.sourceAssetPath,
    check: "audio_present",
    passed: probe.hasAudio,
    detail: probe.hasAudio ? "Audio stream detected" : "No audio stream",
  });

  checks.push({
    assetPath: config.sourceAssetPath,
    check: "not_corrupted",
    passed: probe.bitrate > 0 && probe.durationSec > 0,
    detail: `bitrate=${probe.bitrate}, duration=${probe.durationSec.toFixed(2)}s`,
  });

  return checks;
}

export async function runQa(runId: string, exports: ExportConfig[]): Promise<QaReport> {
  const timestamp = new Date().toISOString();
  const allChecks: ValidationCheck[] = [];

  for (const exp of exports) {
    const checks = await validateExport(exp);
    allChecks.push(...checks);
  }

  const passedCount = allChecks.filter((c) => c.passed).length;
  const failedCount = allChecks.filter((c) => !c.passed).length;
  const overall = failedCount === 0 ? "pass" : passedCount === 0 ? "fail" : "partial";

  return {
    runId,
    timestamp,
    checks: allChecks,
    passedCount,
    failedCount,
    overall,
  };
}
