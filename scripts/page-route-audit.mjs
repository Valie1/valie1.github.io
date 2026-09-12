import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const expectedPages = new Set([
  "app/page.tsx",
  "app/privacy/page.tsx",
  "app/cookies/page.tsx",
  "app/policies/page.tsx",
]);
const requiredMetadataRoutes = [
  "app/robots.ts",
  "app/sitemap.ts",
  "app/manifest.ts",
  "app/icon.svg",
  "app/not-found.tsx",
  "app/error.tsx",
  "app/global-error.tsx",
];

const foundPages = [];
const foundRouteHandlers = [];
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.name === "page.tsx") foundPages.push(path.relative(root, full).replaceAll("\\", "/"));
    else if (entry.name === "route.ts") foundRouteHandlers.push(path.relative(root, full).replaceAll("\\", "/"));
  }
}
walk(path.join(root, "app"));

const actualPages = new Set(foundPages);
const missingPages = [...expectedPages].filter((route) => !actualPages.has(route));
const extraPages = [...actualPages].filter((route) => !expectedPages.has(route));
const missingMetadata = requiredMetadataRoutes.filter((route) => !fs.existsSync(path.join(root, route)));
const prep = fs.readFileSync(path.join(root, "scripts/prepare-github-pages.mjs"), "utf8");
const expectedRedirects = ["work", "work/long-form", "work/short-form", "work/websites", "about", "contact"];
const missingRedirects = expectedRedirects.filter((route) => !prep.includes(`["${route}",`));

if (missingPages.length || extraPages.length || foundRouteHandlers.length || missingMetadata.length || missingRedirects.length) {
  console.error("Static route audit FAILED.");
  if (missingPages.length) console.error(`Missing public pages: ${missingPages.join(", ")}`);
  if (extraPages.length) console.error(`Unexpected public pages: ${extraPages.join(", ")}`);
  if (foundRouteHandlers.length) console.error(`Static export cannot keep route handlers: ${foundRouteHandlers.join(", ")}`);
  if (missingMetadata.length) console.error(`Missing metadata/error routes: ${missingMetadata.join(", ")}`);
  if (missingRedirects.length) console.error(`Missing generated legacy redirects: ${missingRedirects.join(", ")}`);
  process.exit(1);
}

console.log(`Static route audit passed — 4 exported pages, 0 route handlers, ${requiredMetadataRoutes.length} metadata/error routes, and ${expectedRedirects.length} generated legacy redirects are locked.`);
