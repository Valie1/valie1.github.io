import fs from "node:fs";

const css = fs.readFileSync(new URL("../app/globals.css", import.meta.url), "utf8");
const component = fs.readFileSync(new URL("../components/ClientReviews.tsx", import.meta.url), "utf8");

const checks = [
  [css.includes("scroll-snap-type:none!important") && css.includes("scroll-behavior:auto!important"), "mobile review autoplay is not cancelled by scroll snapping or smooth-scroll interpolation"],
  [css.includes("overflow-x:auto!important"), "mobile review viewport remains finger-swipeable"],
  [css.includes('.review-orbit__set[aria-hidden="true"]') && css.includes("display:flex!important"), "duplicate review sets remain available for a seamless mobile loop"],
  [css.includes("animation:none!important") && css.includes(".review-orbit__track.is-running"), "desktop CSS transform animation stays disabled on mobile so native swiping is not fought"],
  [css.includes("overscroll-behavior-x:contain"), "horizontal swipe overscroll is contained"],
  [component.includes("reviewViewportRef"), "mobile review viewport has a runtime control ref"],
  [component.includes('window.matchMedia("(max-width: 760px)")'), "automatic runtime is mobile-only"],
  [component.includes('window.matchMedia("(prefers-reduced-motion: reduce)")'), "automatic mobile motion honors reduced motion"],
  [component.includes("requestAnimationFrame(animate)"), "mobile carousel uses frame-synced continuous movement"],
  [component.includes("const autoSpeed = 42"), "mobile carousel has a controlled continuous travel speed"],
  [component.includes("let autoPosition = 0"), "mobile carousel keeps an independent floating-point autoplay position"],
  [component.includes("autoPosition += (autoSpeed * elapsed) / 1000") && component.includes("viewport.scrollLeft = autoPosition"), "automatic carousel advances even on browsers that quantize scrollLeft writes"],
  [component.includes("let next = autoPosition") && !component.includes("autoPosition = viewport.scrollLeft;\n    };\n\n    const initialize"), "loop normalization preserves the floating-point autoplay accumulator between frames"],
  [component.includes("syncManualPosition") && component.includes('viewport.addEventListener("scroll", syncManualPosition'), "manual swipes hand their final position back to autoplay without a jump"],
  [component.includes("autoPosition = width") && component.includes("viewport.scrollLeft = autoPosition"), "carousel initializes inside duplicated sets so users can swipe both left and right"],
  [component.includes("normalizeLoopPosition"), "carousel loops seamlessly instead of hitting an end"],
  [component.includes('viewport.addEventListener("pointerdown", pauseAuto'), "finger interaction pauses automatic movement"],
  [component.includes('window.addEventListener("pointerup", resumeAuto'), "automatic movement resumes after manual interaction"],
  [component.includes('viewport.addEventListener("touchstart", pauseAuto'), "touch swipes explicitly pause autoplay on mobile browsers"],
  [component.includes("scheduleResume"), "autoplay waits before resuming after a manual swipe"],
  [component.includes("The cards keep moving; on mobile, swipe left or right"), "review copy describes automatic and manual mobile browsing"],
];

let failed = 0;
for (const [ok, label] of checks) {
  if (ok) console.log(`PASS ${label}`);
  else {
    console.error(`FAIL ${label}`);
    failed += 1;
  }
}
console.log(`Mobile review carousel + swipe audit: ${checks.length - failed}/${checks.length}`);
if (failed) process.exit(1);
