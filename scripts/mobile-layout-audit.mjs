import fs from "node:fs";

const css = fs.readFileSync(new URL("../app/globals.css", import.meta.url), "utf8");
const tail = css;

const checks = [
  ["mobile layout layer exists", tail.includes("--valie-mobile-gutter") && tail.includes("@media (max-width:760px)")],
  ["phone-only breakpoint protects desktop", tail.includes("@media (max-width:760px)")],
  ["safe-area mobile gutters exist", tail.includes("--valie-mobile-gutter") && tail.includes("safe-area-inset-left") && tail.includes("safe-area-inset-right")],
  ["hero is stable-viewport bounded", tail.includes("min-height:max(var(--valie-stable-page-height),620px)")],
  ["about/software collapse to phone flow", tail.includes(".creative-toolkit--split-redesign") && tail.includes("grid-template-columns:1fr!important")],
  ["work tabs remain three-up on phones", tail.includes(".unified-work-tabs") && tail.includes("repeat(3,minmax(0,1fr))")],
  ["long form is single-column", tail.includes(".reference-media-grid--long{grid-template-columns:1fr!important")],
  ["short form is two-column", tail.includes(".reference-media-grid--short{grid-template-columns:repeat(2,minmax(0,1fr))")],
  ["review cards fit narrow phones", tail.includes("width:clamp(272px,82vw,330px)") && tail.includes("@media (max-width:360px)")],
  ["contact is single-column", tail.includes(".one-contact-hub") && tail.includes("grid-template-columns:1fr!important")],
  ["footer legal controls reflow", tail.includes(".valie-footer__legal") && tail.includes("grid-template-columns:repeat(2,minmax(0,1fr))")],
  ["legal documents use phone typography", tail.includes(".legal-hero h1") && tail.includes("font-size:clamp(46px,14.8vw,70px)")],
  ["extra-narrow 360px pass exists", tail.includes("@media (max-width:360px)")],
  ["phone landscape pass exists", tail.includes("orientation:landscape") && tail.includes("max-height:560px")],
];

const failed = checks.filter(([, ok]) => !ok);
for (const [name, ok] of checks) console.log(`${ok ? "PASS" : "FAIL"}  ${name}`);
if (failed.length) {
  console.error(`\nMobile layout audit failed: ${failed.length}/${checks.length}`);
  process.exit(1);
}
console.log(`\nMobile layout audit passed: ${checks.length}/${checks.length}`);
