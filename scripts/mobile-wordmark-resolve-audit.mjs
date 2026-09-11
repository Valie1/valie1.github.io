import fs from "node:fs";

const css = fs.readFileSync("app/globals.css", "utf8");
const checks = [
  ["mobile header uses desktop glyph draw", css.includes("valieGlyphDraw .72s cubic-bezier(.20,.82,.26,1) forwards")],
  ["mobile header keeps desktop glyph settle instead of phone-only clear", css.includes("valieGlyphSettle .24s ease-out forwards!important") && !css.includes("valieMobileGlyphClear")],
  ["mobile header uses desktop solid resolve", css.includes("valieWordmarkResolve .34s cubic-bezier(.22,1,.36,1) 2.08s forwards!important")],
  ["mobile footer uses the desktop repeating glyph loop", css.includes("animation:footerValieGlyphLoop 5.8s cubic-bezier(.20,.82,.26,1) infinite!important")],
  ["mobile footer uses the desktop repeating fill loop", css.includes("animation:footerValieFillLoop 5.8s cubic-bezier(.22,1,.36,1) infinite!important")],
  ["legacy mobile one-shot footer animation is removed", !css.includes("footerValieMobileDraw") && !css.includes("footerValieMobileClear") && !css.includes("footerValieMobileResolve")],
  ["desktop footer loop remains available", css.includes("animation:footerValieGlyphLoop 5.8s") && css.includes("animation:footerValieFillLoop 5.8s")],
  ["parity override is phone-scoped", css.includes("@media (max-width:760px) and (prefers-reduced-motion:no-preference)")],
];
let failed = 0;
for (const [label, ok] of checks) {
  console.log(`${ok ? "PASS" : "FAIL"} — ${label}`);
  if (!ok) failed++;
}
if (failed) {
  console.error(`Mobile wordmark desktop-parity audit failed: ${failed}/${checks.length}`);
  process.exit(1);
}
console.log(`Mobile wordmark desktop-parity audit passed: ${checks.length}/${checks.length}.`);
