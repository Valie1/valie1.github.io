import fs from "node:fs";
const css=fs.readFileSync(new URL("../app/globals.css", import.meta.url),"utf8");
const checks=[
 ["desktop arrow float keyframes exist", css.includes("@keyframes pass94ScrollArrowFloat")],
 ["no stale mismatched keyframes linger", !css.includes("cnhWhiteScrollPulse") && !css.includes("cnhArrowBounce")],
 ["desktop arrow svg animates with float (unscoped, applies at all widths)", /(?<!@media[^{]*)\.hero-scroll-cues--viewport \.hero-scroll-cue__circle svg\{[\s\S]*?animation:pass94ScrollArrowFloat 1\.9s ease-in-out infinite!important/.test(css)],
 ["mobile visible arrow reuses the SAME desktop float animation", /@media\(max-width:760px\)[\s\S]*?\.hero-scroll-cues--viewport\.is-armed\.is-visible \.hero-scroll-cue__circle svg\{[\s\S]*?animation:pass94ScrollArrowFloat 1\.9s ease-in-out infinite!important/.test(css)],
 ["mobile size remains compact", css.includes("width:46px!important") && css.includes("width:44px!important")],
 ["mobile reveal lifecycle remains armed+visible", css.includes(".hero-scroll-cues--viewport.is-armed.is-visible")],
];
let ok=0;
for(const [name,pass] of checks){ console.log(`${pass?"PASS":"FAIL"}: ${name}`); if(pass) ok++; }
console.log(`mobile-scroll-desktop-animation-parity ${ok}/${checks.length}`);
if(ok!==checks.length) process.exit(1);
