import fs from "node:fs";

const css = fs.readFileSync(new URL("../app/globals.css", import.meta.url), "utf8");
const checks = [
  ["phone software deck keeps compact cards", css.includes(".creative-toolkit--pass54 .software-card__top") && css.includes("grid-template-columns:56px minmax(0,1fr)!important")],
  ["phone cards do not use giant one-column identity layout", css.includes("display:flex!important") && css.includes("flex-direction:column!important")],
  ["mobile icon is compact", css.includes("width:54px!important") && css.includes("width:44px!important")],
  ["purpose copy sits below identity", css.includes("border-left:0!important") && css.includes("border-top:1px solid rgba(255,255,255,.065)!important")],
  ["mobile cards retain desktop accent surface", css.includes("rgba(var(--software-accent),.075)")],
  ["extra narrow phones get dedicated compaction", css.includes("@media (max-width:390px)") && css.includes("grid-template-columns:50px minmax(0,1fr)!important")],
  ["software deck cancels the legacy mobile width:100 overflow", css.includes(".creative-toolkit--pass54 .software-redesign__grid") && css.includes("width:auto!important") && css.includes("align-self:stretch!important")],
  ["software cards stay inside the deck track", css.includes("max-width:100%!important") && css.includes("min-width:0!important")],
];
const failed = checks.filter(([, ok]) => !ok);
for (const [name, ok] of checks) console.log(`${ok ? "PASS" : "FAIL"}  ${name}`);
if (failed.length) { console.error(`\nMobile software polish audit failed: ${failed.length}/${checks.length}`); process.exit(1); }
console.log(`\nMobile software polish audit passed: ${checks.length}/${checks.length}`);
