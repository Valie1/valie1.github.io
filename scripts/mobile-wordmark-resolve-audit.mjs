import fs from "node:fs";

const css = fs.readFileSync("app/globals.css", "utf8");
const nav = fs.readFileSync("components/SiteNav.tsx", "utf8");
const footer = fs.readFileSync("components/OnePageFooter.tsx", "utf8");
const shared = fs.readFileSync("components/AnimatedValieWordmark.tsx", "utf8");
const checks = [
  ["header outline letters use flowing tspans instead of hard-coded glyph x positions", nav.includes('className="animated-valie-wordmark__draw" x="0" y="25.7"') && nav.includes("<tspan") && !nav.includes("letter.x")],
  ["header fill uses the same flowing glyph structure", nav.includes('className="animated-valie-wordmark__fill"') && nav.includes('key={`fill-${letter}-${index}`}')],
  ["shared wordmark component is metric-safe", shared.includes('className="animated-valie-wordmark__draw" x="0" y="25.7"') && !shared.includes("letter.x")],
  ["footer outline letters use flowing tspans", footer.includes('className="footer-valie-static__draw" x="0" y="25.7"') && footer.includes('className="footer-valie-static__letter"')],
  ["footer fill uses the same flowing glyph structure", footer.includes('className="footer-valie-static__fill" x="0" y="25.7"') && footer.includes("<tspan>V</tspan><tspan>A</tspan>")],
  ["header outline fully clears when solid fill resolves", css.includes("@keyframes valieGlyphSettle{\n  from{opacity:1}\n  to{opacity:0}\n}")],
  ["footer outline fully clears during solid phase", css.includes("36%,88%{stroke-dashoffset:0;opacity:0}")],
  ["mobile keeps desktop draw timing", css.includes("valieGlyphDraw .72s cubic-bezier(.20,.82,.26,1) forwards")],
  ["mobile keeps desktop solid resolve", css.includes("valieWordmarkResolve .34s cubic-bezier(.22,1,.36,1) 2.08s forwards!important")],
  ["footer keeps repeating outline/fill loop", css.includes("animation:footerValieGlyphLoop 5.8s") && css.includes("animation:footerValieFillLoop 5.8s")],
  ["parity override stays phone scoped", css.includes("@media (max-width:760px) and (prefers-reduced-motion:no-preference)")],
];
let failed = 0;
for (const [label, ok] of checks) {
  console.log(`${ok ? "PASS" : "FAIL"} — ${label}`);
  if (!ok) failed++;
}
if (failed) {
  console.error(`Mobile wordmark clean-resolve audit failed: ${failed}/${checks.length}`);
  process.exit(1);
}
console.log(`Mobile wordmark clean-resolve audit passed: ${checks.length}/${checks.length}.`);
