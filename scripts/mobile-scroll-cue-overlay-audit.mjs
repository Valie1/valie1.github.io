import fs from "node:fs";

const component = fs.readFileSync("components/HeroScrollCues.tsx", "utf8");
const css = fs.readFileSync("app/globals.css", "utf8");

const checks = [
  ["scroll cues are portaled outside document flow", component.includes("createPortal(overlay, document.body)")],
  ["desktop/mobile share the same delayed arm timer", component.includes("const REVEAL_DELAY_MS = 9350") && component.includes("setTimeout(() => setArmed(true), REVEAL_DELAY_MS)")],
  ["overlay has explicit semantic marker", component.includes('data-valie-overlay="hero-scroll-cues"')],
  ["hero visibility is observer driven", component.includes("new IntersectionObserver") && component.includes("HERO_EXIT_RATIO")],
  ["visibility class is tied to hero presence", component.includes('visible ? " is-visible is-interactive" : ""')],
  ["legacy per-scroll opacity state is removed", !component.includes("heroOpacity") && !component.includes("requestAnimationFrame")],
  ["mobile overlay height uses stable layout token", css.includes("height:var(--valie-mobile-layout-height,100svh)!important")],
  ["mobile overlay is fixed to viewport top", css.includes("inset:0 0 auto 0!important")],
  ["phone geometry keeps the safe-area position", css.includes("bottom:max(30px,calc(env(safe-area-inset-bottom) + 18px))!important")],
  ["phone left and right positions stay symmetric", css.includes("left:max(22px,calc(env(safe-area-inset-left) + 14px))!important") && css.includes("right:max(22px,calc(env(safe-area-inset-right) + 14px))!important")],
  ["mobile visual circle is intentionally smaller than desktop", css.includes("width:46px!important") && css.includes("height:46px!important")],
  ["compact phones get the smaller 44px circle", css.includes("width:44px!important") && css.includes("height:44px!important")],
  ["mobile arrow keeps desktop float animation", css.includes("animation:pass94ScrollArrowFloat 1.9s ease-in-out infinite!important")],
  ["mobile press state keeps desktop cue response", css.includes("transform:translateY(4px) scale(1.035)!important")],
  ["overlay uses the desktop-style opacity transition", css.includes("transition:opacity .34s cubic-bezier(.22,1,.36,1)!important")],
  ["armed mobile cue is explicitly hidden after hero exit", css.includes(".hero-scroll-cues--viewport.is-armed:not(.is-visible){\n    opacity:0!important;")],
  ["armed mobile cue returns when hero is visible", css.includes(".hero-scroll-cues--viewport.is-armed.is-visible{\n    opacity:1!important;")],
];

let passed = 0;
for (const [label, ok] of checks) {
  console.log(`${ok ? "✓" : "✗"} ${label}`);
  if (ok) passed += 1;
}
console.log(`Mobile scroll-cue desktop-behavior audit: ${passed}/${checks.length}`);
if (passed !== checks.length) process.exit(1);
