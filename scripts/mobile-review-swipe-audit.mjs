import fs from "node:fs";

const css = fs.readFileSync(new URL("../app/globals.css", import.meta.url), "utf8");
const component = fs.readFileSync(new URL("../components/ClientReviews.tsx", import.meta.url), "utf8");

const checks = [
  [css.includes("scroll-snap-type:x mandatory"), "mobile review rail uses mandatory horizontal snap"],
  [css.includes("scroll-snap-stop:always"), "mobile review cards stop one snap at a time"],
  [css.includes("overflow-x:auto!important"), "mobile review viewport remains finger-swipeable"],
  [css.includes('.review-orbit__set[aria-hidden="true"]{display:none!important}'), "duplicate desktop review sets stay hidden on mobile"],
  [css.includes("animation:none!important") && css.includes(".review-orbit__track.is-running"), "CSS transform rail stays disabled on mobile so native swiping is not fought"],
  [css.includes("overscroll-behavior-x:contain"), "horizontal swipe overscroll is contained"],
  [component.includes("reviewViewportRef"), "mobile review viewport has a runtime control ref"],
  [component.includes('window.matchMedia("(max-width: 760px)")'), "automatic runtime is mobile-only"],
  [component.includes('window.matchMedia("(prefers-reduced-motion: reduce)")'), "automatic mobile motion honors reduced motion"],
  [component.includes('behavior: "smooth"'), "automatic mobile advance uses smooth movement"],
  [component.includes('scheduleAuto(3200)'), "automatic mobile movement starts after a calm delay"],
  [component.includes('viewport.addEventListener("pointerdown", pauseAuto'), "finger interaction pauses automatic movement"],
  [component.includes('window.addEventListener("pointerup", resumeAuto'), "automatic movement resumes after manual interaction"],
  [component.includes("current >= items.length - 1") && component.includes("direction = -1"), "automatic movement reverses at rail ends instead of jumping across cards"],
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
console.log(`Mobile review auto + swipe audit: ${checks.length - failed}/${checks.length}`);
if (failed) process.exit(1);
