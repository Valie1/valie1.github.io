import fs from "node:fs";

const css = fs.readFileSync("app/globals.css", "utf8");
const runtime = fs.readFileSync("components/BrowserViewportRuntime.tsx", "utf8");
const cues = fs.readFileSync("components/HeroScrollCues.tsx", "utf8");

const checks = [
  ["stable page-height token uses small viewport units", css.includes("--valie-stable-page-height:100svh")],
  ["stable page-height has a legacy fallback", css.includes("@supports not (height:100svh)") && css.includes("--valie-stable-page-height:100vh")],
  ["mobile hero uses stable page height", css.includes(".one-hero,\n  .one-hero--video-wall{\n    min-height:var(--valie-stable-page-height)!important;")],
  ["final phone hero override stays on stable page height", css.includes("min-height:max(var(--valie-stable-page-height),620px)!important") && css.includes("min-height:max(var(--valie-stable-page-height),590px)!important")],
  ["mobile hero has no live visualViewport height dependency", !/\.one-hero(?:--video-wall)?[^{}]*\{[^}]*--valie-visual-height/s.test(css) && !/\.one-hero--video-wall[^{}]*\{[^}]*100dvh/s.test(css)],
  ["overlay surfaces still use live visual viewport height", css.includes(".minimal-mobile-menu") && css.includes("var(--valie-visual-height") && css.includes(".one-video-modal") && css.includes(".review-lightbox")],
  ["viewport runtime no longer reacts to visualViewport scroll", !runtime.includes('visualViewport?.addEventListener("scroll", requestSync') && !runtime.includes('visualViewport?.removeEventListener("scroll", requestSync')],
  ["hero scroll cues derive fade geometry from the stable hero itself", cues.includes("const viewportHeight = Math.max(rect.height, 1);") && !cues.includes("window.visualViewport")],
];

let failed = 0;
for (const [label, ok] of checks) {
  console.log(`${ok ? "PASS" : "FAIL"} — ${label}`);
  if (!ok) failed++;
}
if (failed) {
  console.error(`Mobile viewport stability audit failed: ${failed}/${checks.length}`);
  process.exit(1);
}
console.log(`Mobile viewport stability audit passed: ${checks.length}/${checks.length}.`);
