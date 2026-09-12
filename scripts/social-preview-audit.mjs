import fs from "node:fs";

const imagePath = "public/valie-social-preview-12349.png";
const layout = fs.readFileSync("app/layout.tsx", "utf8");
const seo = fs.readFileSync("lib/seo.ts", "utf8");
const png = fs.readFileSync(imagePath);
const width = png.readUInt32BE(16);
const height = png.readUInt32BE(20);
const checks = [
  ["custom preview image exists", fs.existsSync(imagePath)],
  ["preview is exactly 1200x630", width === 1200 && height === 630],
  ["homepage Open Graph uses custom preview", layout.includes('absoluteUrl("/valie-social-preview-12349.png")')],
  ["homepage Twitter card uses custom preview", layout.includes('images: [absoluteUrl("/valie-social-preview-12349.png")]')],
  ["per-route metadata defaults to custom preview", seo.includes('image = "/valie-social-preview-12349.png"')],
];
let failed = 0;
for (const [label, ok] of checks) {
  console.log(`${ok ? "PASS" : "FAIL"} — ${label}`);
  if (!ok) failed++;
}
if (failed) process.exit(1);
console.log(`Social preview audit passed: ${checks.length}/${checks.length}.`);
