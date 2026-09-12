import fs from "node:fs";

const files = [
  "app/manifest.ts",
  "app/robots.ts",
  "app/sitemap.ts",
];

let failures = 0;
for (const file of files) {
  const source = fs.readFileSync(file, "utf8");
  const ok = /export\s+const\s+dynamic\s*=\s*["']force-static["']\s*;/.test(source);
  console.log(`${ok ? "PASS" : "FAIL"} ${file} exports dynamic = force-static`);
  if (!ok) failures += 1;
}

if (failures) {
  console.error(`Static metadata export audit failed: ${failures} metadata route(s) are not force-static.`);
  process.exit(1);
}

console.log(`Static metadata export audit passed: ${files.length}/${files.length}.`);
