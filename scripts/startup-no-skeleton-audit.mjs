import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const loadingPath = path.join(root, "app", "loading.tsx");
const source = fs.readFileSync(loadingPath, "utf8");
const checks = [
  ["root route loading renders nothing", /return\s+null\s*;/.test(source)],
  ["root route no longer imports the full-site skeleton", !source.includes("SiteLoadingSkeleton")],
  ["root route loading contains no skeleton markup", !/skeleton|placeholder|shimmer/i.test(source)],
];
let failed = 0;
for (const [label, ok] of checks) {
  console.log(`${ok ? "✓" : "✖"} ${label}`);
  if (!ok) failed++;
}
if (failed) {
  console.error(`\nStartup no-skeleton audit failed: ${failed}/${checks.length}`);
  process.exit(1);
}
console.log(`\nStartup no-skeleton audit passed: ${checks.length}/${checks.length}`);
