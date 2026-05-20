import path from "node:path";

export interface ExportIndex {
  runId: string;
  productSlug: string;
  sceneId: string;
  variant: number;
  platform: string;
  timestamp: string;
  filename: string;
  fullPath: string;
}

export function buildExportFilename(
  productSlug: string,
  sceneId: string,
  variant: number,
  platform: string,
  timestamp: string,
  ext: string
): string {
  const safeScene = sceneId.replace(/[^a-zA-Z0-9-]/g, "-").toLowerCase();
  const ts = timestamp.replace(/[:.]/g, "-").slice(0, 19);
  return `${productSlug}-${safeScene}-v${variant}-${platform}-${ts}.${ext}`;
}

export function indexExport(
  exportDir: string,
  productSlug: string,
  sceneId: string,
  variant: number,
  platform: string,
  ext: string
): ExportIndex {
  const timestamp = new Date().toISOString();
  const filename = buildExportFilename(productSlug, sceneId, variant, platform, timestamp, ext);
  const fullPath = path.join(exportDir, platform, filename);
  return {
    runId: `${productSlug}-${Date.now()}`,
    productSlug,
    sceneId,
    variant,
    platform,
    timestamp,
    filename,
    fullPath,
  };
}
