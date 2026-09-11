import fs from "node:fs";

const css = fs.readFileSync("app/globals.css", "utf8");
const component = fs.readFileSync("components/UnifiedWorkShowcase.tsx", "utf8");
const checks = [
  ["three work tabs remain", ["YOUTUBE LONG FORM", "SHORTS / REELS", "WEBSITES"].every((label) => component.includes(label))],
  ["tab click switching remains", component.includes("onClick={() => selectTab(tab.id, tab.hash)}")],
  ["active capsule remains", css.includes(".unified-work-tabs button.is-active")],
  ["active underline pseudo is suppressed", css.includes(".unified-work-tabs button.is-active::after{\n  content:none!important;\n  display:none!important")],
  ["all work-tab after markers suppressed", css.includes(".unified-work-tabs button::after,\n.unified-work-tabs button.is-active::after")],
];
let failed = 0;
for (const [label, ok] of checks) {
  console.log(`${ok ? "✓" : "✗"} ${label}`);
  if (!ok) failed++;
}
if (failed) process.exit(1);
console.log(`Work tab underline audit: ${checks.length}/${checks.length}`);
