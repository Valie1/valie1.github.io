import fs from "node:fs";
const css=fs.readFileSync(new URL("../app/globals.css", import.meta.url),"utf8");
const checks=[
 ["desktop white pulse keyframes exist", css.includes("@keyframes cnhWhiteScrollPulse")],
 ["desktop arrow bounce keyframes exist", css.includes("@keyframes cnhArrowBounce")],
 ["mobile visible circle reuses desktop pulse", /@media\(max-width:760px\)[\s\S]*?\.hero-scroll-cues--viewport\.is-armed\.is-visible \.hero-scroll-cue__circle\{[\s\S]*?animation:cnhWhiteScrollPulse 2s ease-in-out infinite!important/.test(css)],
 ["mobile visible arrow reuses desktop bounce", /@media\(max-width:760px\)[\s\S]*?\.hero-scroll-cues--viewport\.is-armed\.is-visible \.hero-scroll-cue__circle svg\{[\s\S]*?animation:cnhArrowBounce 2s ease-in-out infinite!important/.test(css)],
 ["mobile size remains compact", css.includes("width:46px!important") && css.includes("width:44px!important")],
 ["mobile reveal lifecycle remains armed+visible", css.includes(".hero-scroll-cues--viewport.is-armed.is-visible")],
];
let ok=0;
for(const [name,pass] of checks){ console.log(`${pass?"PASS":"FAIL"}: ${name}`); if(pass) ok++; }
console.log(`mobile-scroll-desktop-animation-parity ${ok}/${checks.length}`);
if(ok!==checks.length) process.exit(1);
