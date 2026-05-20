import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";

const profileDir = join(homedir(), ".codex", "shopwithin-browser-profiles", "facebook-meta");
const pwcli = join(homedir(), ".codex", "skills", "playwright", "scripts", "playwright_cli.sh");
const url = process.argv[2] ?? "https://www.facebook.com/";
const sessionName = "facebook-meta-visible";

if (!existsSync(pwcli)) {
  console.error(`Playwright CLI wrapper not found: ${pwcli}`);
  process.exit(1);
}

mkdirSync(profileDir, { recursive: true });

const activeProbe = spawnSync(
  pwcli,
  ["--session", sessionName, "snapshot"],
  {
    stdio: "pipe",
    env: process.env,
    encoding: "utf8",
  },
);

if (activeProbe.status === 0) {
  console.log(`Meta browser session '${sessionName}' is already running.`);
  console.log("Reusing it without restarting the browser.");

  const gotoResult = spawnSync(pwcli, ["--session", sessionName, "goto", url], {
    stdio: "inherit",
    env: process.env,
  });

  process.exit(gotoResult.status ?? 1);
}

const result = spawnSync(
  pwcli,
  [
    "--session",
    sessionName,
    "open",
    url,
    "--headed",
    "--persistent",
    "--profile",
    profileDir,
  ],
  {
    stdio: "inherit",
    env: process.env,
  },
);

process.exit(result.status ?? 1);
