import fs from "node:fs";

const data = JSON.parse(fs.readFileSync("content/portfolio.json", "utf8"));
const checks = [
  ["app/sitemap.ts", "Sitemap generator"],
  ["app/robots.ts", "Robots generator"],
  ["app/manifest.ts", "Web manifest"],
  ["public/valie-social-preview-12349.png", "Default Open Graph image"],
  ["app/privacy/page.tsx", "Privacy page"],
  ["app/policies/page.tsx", "Policies page"],
  ["app/cookies/page.tsx", "Cookie Policy page"],
  ["app/icon.svg", "Site icon"],
];
const failures = checks.filter(([file]) => !fs.existsSync(file));
const titleLength = data.site.seo.title.length;
const descriptionLength = data.site.seo.description.length;
if (titleLength < 20 || titleLength > 65) console.warn(`SEO warning: site title is ${titleLength} characters (aim roughly 20–65).`);
if (descriptionLength < 70 || descriptionLength > 170) console.warn(`SEO warning: description is ${descriptionLength} characters (aim roughly 70–170).`);
if (!data.site.seo.keywords?.length) failures.push(["content/portfolio.json", "SEO keywords"]);

const layout = fs.readFileSync("app/layout.tsx", "utf8");
const seoBuilder = fs.readFileSync("lib/seo.ts", "utf8");
if (!/openGraph\s*:/.test(layout) || !/description:\s*site\.seo\.description/.test(layout)) {
  failures.push(["app/layout.tsx", "Global Open Graph title/description metadata"]);
}
if (!/twitter\s*:/.test(layout) || !/card:\s*"summary_large_image"/.test(layout)) {
  failures.push(["app/layout.tsx", "Global X/Twitter card metadata"]);
}
if (!/openGraph\s*:/.test(seoBuilder) || !/twitter\s*:/.test(seoBuilder)) {
  failures.push(["lib/seo.ts", "Per-route social metadata builder"]);
}

if (!/metadataBase:\s*getSiteUrl\(\)/.test(layout)) {
  failures.push(["app/layout.tsx", "metadataBase uses configured production origin"]);
}
if (!/alternates:\s*\{\s*canonical:\s*absoluteUrl\("\/"\)/.test(layout)) {
  failures.push(["app/layout.tsx", "Homepage canonical URL"]);
}
if (!/alternates:\s*\{\s*canonical/.test(seoBuilder) || !/const canonical = absoluteUrl\(path\)/.test(seoBuilder)) {
  failures.push(["lib/seo.ts", "Per-route canonical URL generation"]);
}

for (const routeFile of ["app/privacy/page.tsx", "app/policies/page.tsx", "app/cookies/page.tsx"]) {
  const source = fs.readFileSync(routeFile, "utf8");
  if (!/description:\s*`[^`]{70,170}`/.test(source)) {
    failures.push([routeFile, "Unique public-route meta description (roughly 70–170 chars)"]);
  }
}


const titleChecks = [
  ["app/page.tsx", /buildMetadata\(\{ path: "\/" \}\)/, "Home title metadata"],
  ["app/privacy/page.tsx", /title:\s*"Privacy Policy"/, "Privacy page title"],
  ["app/policies/page.tsx", /title:\s*"Policies"/, "Policies page title"],
  ["app/cookies/page.tsx", /title:\s*"Cookie Policy"/, "Cookie Policy page title"],
  ["app/not-found.tsx", /title:\s*"404 — Page Not Found"/, "404 page title"],
];
for (const [file, pattern, label] of titleChecks) {
  const source = fs.readFileSync(file, "utf8");
  if (!pattern.test(source)) failures.push([file, label]);
}

const footerSource = fs.readFileSync("components/OnePageFooter.tsx", "utf8");
for (const [href, label] of [["/privacy", "Privacy footer link"], ["/cookies", "Cookie Policy footer link"], ["/policies", "Policies footer link"]]) {
  if (!footerSource.includes(`href="${href}"`)) failures.push(["components/OnePageFooter.tsx", label]);
}
if (!/aria-label="Footer legal links"/.test(footerSource)) {
  failures.push(["components/OnePageFooter.tsx", "Accessible footer legal navigation"]);
}

const publicUrl = process.env.NEXT_PUBLIC_SITE_URL;
if (!publicUrl || /your-domain\.com|localhost/i.test(publicUrl)) console.warn("SEO warning: set NEXT_PUBLIC_SITE_URL to the final HTTPS domain before launch so social-share URLs resolve correctly.");
if (failures.length) {
  console.error("SEO audit failed:\n" + failures.map(([file, label]) => `  - ${label}: ${file}`).join("\n"));
  process.exit(1);
}
console.log("SEO/social metadata OK — route titles, Privacy/Cookie/Policies footer destinations, search description, Open Graph sharing, X/Twitter cards, unique public-route descriptions, sitemap, robots, manifest, OG image, and icon are present.");
