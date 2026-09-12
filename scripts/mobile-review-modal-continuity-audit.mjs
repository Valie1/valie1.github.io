import fs from "node:fs";

const component = fs.readFileSync(new URL("../components/ClientReviews.tsx", import.meta.url), "utf8");

const effectStart = component.indexOf('const viewport = reviewViewportRef.current;');
const effectEnd = component.indexOf('\n  useEffect(() => {\n    if (!active) return;', effectStart);
const autoplayEffect = effectStart >= 0 && effectEnd > effectStart
  ? component.slice(effectStart, effectEnd)
  : "";

const checks = [
  [effectStart >= 0 && effectEnd > effectStart, "mobile review autoplay effect can be isolated"],
  [autoplayEffect.includes('if (!viewport) return;'), "autoplay only depends on the viewport being mounted"],
  [!autoplayEffect.includes('if (!viewport || active)') && !autoplayEffect.includes('if (active)'), "opening a review does not stop mobile autoplay"],
  [autoplayEffect.trimEnd().endsWith('}, []);'), "mobile autoplay effect stays mounted across review modal state changes"],
  [autoplayEffect.includes('requestAnimationFrame(animate)'), "carousel motion remains frame-synced while the modal is open"],
  [autoplayEffect.includes('autoPosition += (autoSpeed * elapsed) / 1000'), "carousel position keeps advancing continuously"],
  [autoplayEffect.includes('viewport.scrollLeft = autoPosition'), "continuous position is written to the same mobile viewport"],
  [component.includes('target.focus({ preventScroll: true })') || component.includes('restoreFocus(openerRef.current)'), "modal close keeps focus restoration without intentionally scrolling the review rail"],
  [component.includes('const unlockScroll = lockDocumentScroll("review-modal-locked")'), "review modal still locks page scroll independently of the horizontal carousel"],
];

let failed = 0;
for (const [ok, label] of checks) {
  if (ok) console.log(`PASS ${label}`);
  else {
    console.error(`FAIL ${label}`);
    failed += 1;
  }
}

console.log(`Mobile review modal continuity audit: ${checks.length - failed}/${checks.length}`);
if (failed) process.exit(1);
