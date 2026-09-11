import fs from "node:fs";

const css = fs.readFileSync("app/globals.css", "utf8");
const checks = [
  ["mobile header draw layer clears after resolve", css.includes(".minimal-brand-draw .animated-valie-wordmark__letter") && css.includes("valieMobileGlyphClear .30s ease-out forwards!important")],
  ["mobile header solid fill remains resolved", css.includes(".minimal-brand-draw .animated-valie-wordmark__fill") && css.includes("valieWordmarkResolve .34s cubic-bezier(.22,1,.36,1) 2.08s forwards!important")],
  ["mobile footer draw is one-shot instead of looping", css.includes("footerValieMobileDraw .72s") && css.includes("footerValieMobileClear .30s")],
  ["mobile footer solid fill remains resolved", css.includes("footerValieMobileResolve .34s cubic-bezier(.22,1,.36,1) 2.08s forwards!important")],
  ["desktop footer loop remains available", css.includes("animation:footerValieGlyphLoop 5.8s") && css.includes("animation:footerValieFillLoop 5.8s")],
  ["fix is phone-scoped", css.includes("@media (max-width:760px) and (prefers-reduced-motion:no-preference)")],
];
let failed = 0;
for (const [label, ok] of checks) {
  console.log(`${ok ? "PASS" : "FAIL"} — ${label}`);
  if (!ok) failed++;
}
if (failed) {
  console.error(`Mobile wordmark resolve audit failed: ${failed}/${checks.length}`);
  process.exit(1);
}
console.log(`Mobile wordmark resolve audit passed: ${checks.length}/${checks.length}.`);
