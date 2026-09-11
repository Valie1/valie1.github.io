import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (rel) => fs.readFileSync(path.join(root,rel),"utf8");
const exists = (rel) => fs.existsSync(path.join(root,rel));
const css = read("app/globals.css");
const hero = read("components/HeroVideoWall.tsx");
const contact = read("components/OnePageContact.tsx");
const work = read("components/UnifiedWorkShowcase.tsx");
const viewportRuntime = read("components/BrowserViewportRuntime.tsx");
const pkg = JSON.parse(read("package.json"));
const names = fs.readdirSync(root);

const checks = [
  ["publish interaction lock exists", viewportRuntime.includes("document.addEventListener(eventName, preventDrag, true)") && css.includes("-webkit-user-drag:none")],
  ["publish package version is current", pkg.version === "9.13.15"],
  ["stable localhost dev command remains", pkg.scripts?.["dev:portfolio"] === "next dev -p 3000"],
  ["GitHub Pages static export is enabled", /output:\s*"export"/.test(read("next.config.mjs")) && /trailingSlash:\s*true/.test(read("next.config.mjs"))],
  ["final release audit is wired into launch check", pkg.scripts?.["launch:check"]?.includes("npm run final:release:audit")],
  ["hero scroll/parallax respects reduced motion", hero.includes("if (reducedMotion.matches)") && hero.includes("resetHeroMotion()")],
  ["hero pointer parallax respects reduced motion", hero.includes("reducedMotion.matches || constrainedDevice")],
  ["review rail respects OS reduced motion", css.includes(".review-orbit__track,") && css.includes("animation-play-state:paused!important")],
  ["coarse pointers cannot keep hover lift", css.includes("@media (hover:none), (pointer:coarse)") && css.includes(".one-contact-channel:hover")],
  ["final keyboard focus ring exists", css.includes('[role="tab"],[tabindex]):focus-visible') && css.includes("outline:2px solid #f5f2ed!important")],
  ["forced-colors active-state fallback exists", css.includes("@media (forced-colors:active)")],
  ["Discord target blank explicitly uses noopener", contact.includes('"noopener noreferrer"')],
  ["website target blank explicitly uses noopener", work.includes('rel="noopener noreferrer"')],
  ["stable AFTER HOURS preview remains", read("components/RenKotoneSecret.tsx").includes("afterHoursPreview")],
  ["old pass-number Easter preview aliases are gone", !/rk(?:49|51|52)Preview/.test(read("components/RenKotoneSecret.tsx"))],
  ["no debugger statements remain", !/\bdebugger\s*;/.test([hero,contact,work].join("\n"))],
  ["no transition: all added", !/transition\s*:\s*all\b/i.test(css)],
  ["generated TypeScript cache is absent", !exists("tsconfig.tsbuildinfo")],
  ["only one current launcher exists", names.filter((n)=>/^START-PASS-.*\.bat$/i.test(n)).length === 1],
  ["only one verification file exists", names.filter((n)=>/^PASS(?:122|123)(?:\..*)?-VERIFICATION\.txt$/i.test(n)).length === 1],
];

let failed=0;
for(const [label,ok] of checks){
  console.log(`${ok?"PASS":"FAIL"} — ${label}`);
  if(!ok) failed++;
}
if(failed){
  console.error(`Final release audit failed: ${failed}/${checks.length}`);
  process.exit(1);
}
console.log(`Final release audit passed: ${checks.length}/${checks.length}.`);
