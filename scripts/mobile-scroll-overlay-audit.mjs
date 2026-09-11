import fs from "node:fs";

const runtime = fs.readFileSync("components/BrowserViewportRuntime.tsx", "utf8");
const hero = fs.readFileSync("components/HeroVideoWall.tsx", "utf8");
const css = fs.readFileSync("app/globals.css", "utf8");

const checks = [
  ["stable mobile height token is captured", runtime.includes('--valie-mobile-layout-height') && runtime.includes('syncStableMobileLayout')],
  ["browser chrome height-only resizes do not rewrite stable layout", runtime.includes('Math.abs(width - stableLayoutWidth) > 48')],
  ["orientation can intentionally refresh stable geometry", runtime.includes('onOrientationChange') && runtime.includes('syncStableMobileLayout(true)')],
  ["mobile hero disables scroll parallax", hero.includes('if (mobileHero || reducedMotion.matches)')],
  ["mobile hero avoids scroll/resize listeners", hero.includes('if (!mobileHero) {') && hero.includes('window.addEventListener("scroll", updateScroll')],
  ["mobile hero has explicit stable height", css.includes('height:max(var(--valie-mobile-layout-height,100svh),620px)!important')],
  ["mobile hero wall fills locked geometry", css.includes('.hero-video-wall{\n    width:100%!important;\n    height:100%!important')],
  ["mobile scroll anchoring is disabled on hero", css.includes('overflow-anchor:none!important')],
  ["mobile lane transform transitions are disabled", css.includes('.hero-media-lane{\n    transition:none!important;')],
  ["visualViewport scroll remains unbound", !runtime.includes('visualViewport?.addEventListener("scroll"')],
];

let passed = 0;
for (const [label, ok] of checks) {
  console.log(`${ok ? "✓" : "✗"} ${label}`);
  if (ok) passed += 1;
}
console.log(`Mobile scroll overlay audit: ${passed}/${checks.length}`);
if (passed !== checks.length) process.exit(1);
