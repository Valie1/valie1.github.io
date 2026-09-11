import fs from "node:fs";

const component = fs.readFileSync("components/HeroScrollCues.tsx", "utf8");
const css = fs.readFileSync("app/globals.css", "utf8");

const checks = [
  ["scroll cues are portaled outside document flow", component.includes("createPortal(overlay, document.body)")],
  ["overlay has explicit semantic marker", component.includes('data-valie-overlay="hero-scroll-cues"')],
  ["hero visibility is observer driven", component.includes("new IntersectionObserver") && component.includes("HERO_EXIT_RATIO")],
  ["visibility class is tied to hero presence", component.includes('visible ? " is-visible is-interactive" : ""')],
  ["legacy per-scroll opacity state is removed", !component.includes("heroOpacity") && !component.includes("requestAnimationFrame")],
  ["mobile overlay height uses stable layout token", css.includes("height:var(--valie-mobile-layout-height,100svh)!important")],
  ["mobile overlay is fixed to viewport top", css.includes("inset:0 0 auto 0!important")],
  ["both cues use stable bottom inset", css.includes("bottom:max(18px,env(safe-area-inset-bottom))!important")],
  ["mobile cue motion is disabled", css.includes(".hero-scroll-cues--viewport .hero-scroll-cue__circle svg") && css.includes("animation:none!important")],
  ["overlay fades instead of translating", css.includes("transition:opacity .34s cubic-bezier(.22,1,.36,1)!important")],
];

let passed = 0;
for (const [label, ok] of checks) {
  console.log(`${ok ? "✓" : "✗"} ${label}`);
  if (ok) passed += 1;
}
console.log(`Mobile scroll-cue overlay audit: ${passed}/${checks.length}`);
if (passed !== checks.length) process.exit(1);
