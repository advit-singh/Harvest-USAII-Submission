import { existsSync, renameSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join } from "node:path";

const root = process.cwd();
const middlewarePath = join(root, "src", "middleware.ts");
const middlewareBackupPath = join(root, "src", "_middleware.github-pages.bak");
const apiPath = join(root, "src", "app", "api");
const apiBackupPath = join(root, "src", "app", "_api.github-pages.bak");
const outDir = join(root, "out");

const backups = [];

function backupPath(path, backup) {
  if (!existsSync(path)) return;
  renameSync(path, backup);
  backups.push({ from: backup, to: path });
}

function restoreBackedUpPaths() {
  while (backups.length > 0) {
    const { from, to } = backups.pop();
    if (existsSync(from)) {
      renameSync(from, to);
    }
  }
}

process.on("exit", restoreBackedUpPaths);
process.on("SIGINT", () => {
  restoreBackedUpPaths();
  process.exit(1);
});
process.on("SIGTERM", () => {
  restoreBackedUpPaths();
  process.exit(1);
});

backupPath(middlewarePath, middlewareBackupPath);
backupPath(apiPath, apiBackupPath);

const env = {
  ...process.env,
  GITHUB_PAGES: "true",
  NEXT_PUBLIC_GITHUB_PAGES: "true",
  NEXT_PUBLIC_USE_MOCK_API: "true",
  NEXT_PUBLIC_LIVE_INTELLIGENCE_API: "false",
  NEXT_PUBLIC_GEMINI_API_KEY: process.env.NEXT_PUBLIC_GEMINI_API_KEY ?? process.env.GEMINI_API_KEY ?? "",
};

const build = spawnSync("npm", ["run", "build"], {
  stdio: "inherit",
  env,
  shell: true,
});

restoreBackedUpPaths();

if (build.status !== 0) {
  process.exit(build.status ?? 1);
}

if (!existsSync(outDir)) {
  console.error("Build succeeded but out/ directory was not created.");
  process.exit(1);
}

writeFileSync(join(outDir, ".nojekyll"), "");
console.log("GitHub Pages static export ready in out/");
