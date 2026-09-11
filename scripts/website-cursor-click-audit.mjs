import fs from "node:fs";

const component = fs.readFileSync("components/UnifiedWorkShowcase.tsx", "utf8");
const css = fs.readFileSync("app/globals.css", "utf8");
const checks = [
  ["cursor icon imported", component.includes("MousePointer2")],
  ["old arrow removed", !component.includes("ArrowUpRight")],
  ["cursor element rendered", component.includes('className="one-web-card__cursor"')],
  ["click ring rendered", component.includes('className="one-web-card__click-ring"')],
  ["grey open background", css.includes("background:rgba(92,92,92,.28)!important")],
  ["cursor animation", css.includes("@keyframes valieWebsiteCursorClick")],
  ["click ring animation", css.includes("@keyframes valieWebsiteClickRing")],
  ["reduced motion safe", css.includes(".one-web-card__cursor,\n  .one-web-card__click-ring{animation:none!important}")],
];
let failed = 0;
for (const [label, ok] of checks) {
  console.log(`${ok ? "✓" : "✗"} ${label}`);
  if (!ok) failed++;
}
if (failed) process.exit(1);
console.log(`Website cursor click audit: ${checks.length}/${checks.length}`);
