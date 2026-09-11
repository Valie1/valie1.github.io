import fs from "node:fs";

const css = fs.readFileSync(new URL("../app/globals.css", import.meta.url), "utf8");
const page = fs.readFileSync(new URL("../app/page.tsx", import.meta.url), "utf8");
const tail = css.slice(-5000);

const checks = [
  [tail.includes(".one-hero--video-wall .one-hero-intro") && tail.includes("display:block!important"), "mobile hero description remains visible"],
  [tail.includes("max-width:min(82vw,310px)!important"), "mobile description stays compact like desktop"],
  [tail.includes("font-size:9.5px!important") && tail.includes("line-height:1.58!important"), "mobile description typography is compact and readable"],
  [tail.includes(".one-hero-actions.valie-hero-cta-pair") && tail.includes("flex-direction:row!important"), "mobile hero CTAs remain side by side"],
  [tail.includes("min-width:126px!important") && tail.includes("min-height:42px!important"), "mobile hero CTAs use compact desktop-like proportions"],
  [tail.includes("@media (max-width:380px)") && tail.includes("min-width:116px!important"), "narrow phones keep both CTAs on one row"],
  [page.includes('className="one-hero-intro"'), "hero description remains sourced from page content"],
  [page.includes("valie-hero-cta-pair"), "hero CTA pair markup remains intact"],
];

let failed = 0;
for (const [ok, label] of checks) {
  if (ok) console.log(`PASS ${label}`);
  else {
    console.error(`FAIL ${label}`);
    failed += 1;
  }
}
console.log(`Mobile hero composition audit: ${checks.length - failed}/${checks.length}`);
if (failed) process.exit(1);
