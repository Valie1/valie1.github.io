import fs from "node:fs";
const css = fs.readFileSync(new URL("../app/globals.css", import.meta.url), "utf8");
const component = fs.readFileSync(new URL("../components/UnifiedWorkShowcase.tsx", import.meta.url), "utf8");
const checks = [
  ["website card cursor exists", component.includes('one-web-card__cursor')],
  ["website click ring exists", component.includes('one-web-card__click-ring')],
  ["website badge markup removed", !component.includes('one-web-card__badge') && !component.includes('>WEBSITE</span>')],
  ["website badge css removed", !css.includes('.one-web-card__badge')],
  ["cursor centered horizontally", css.includes(".one-web-card__cursor{") && css.includes("left:50%;")],
  ["cursor centered vertically", css.includes("top:50%;")],
  ["cursor translate locks center", css.includes("transform:translate(-50%,-50%);")],
  ["click ring animation", css.includes("@keyframes valieWebsiteClickRing")],
  ["click ring centered", css.includes(".one-web-card__click-ring{") && css.includes("transform:translate(-50%,-50%) scale(.35)")],
  ["click animation stays centered", css.includes("34%{transform:translate(-50%,-50%) scale(.88)}") && !css.includes("translate3d(-2px,-2px,0) scale(1)")],
  ["reduced motion safe", css.includes(".one-web-card__click-ring{display:none!important}")],
];
for (const [label, ok] of checks) {
  if (!ok) { console.error(`FAIL: ${label}`); process.exit(1); }
}
console.log(`Website cursor click audit: ${checks.length}/${checks.length}`);
