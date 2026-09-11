import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const read = (rel) => fs.readFileSync(path.join(root, rel), "utf8");
const runtime = read("public/site-nav-runtime.js");
const css = read("app/globals.css");
const layout = read("app/layout.tsx");
const videos = read("components/OnePageVideoShowcase.tsx");
const pkg = JSON.parse(read("package.json"));

const checks = [
  ["Pass 123.45 ghost-click shield marker exists", css.includes("--pass12345-mobile-menu-ghost-click-shield:1")],
  ["Physical menu navigation arms a post-tap shield before closing", runtime.includes("if (open) armPostTapShield();") && runtime.indexOf("if (open) armPostTapShield();") < runtime.indexOf("setOpen(false, false);", runtime.indexOf("function finishNavigation"))],
  ["Post-tap shield covers the viewport above portfolio media", css.includes(".valie-mobile-menu-posttap-shield") && css.includes("z-index:2147481999!important") && css.includes("pointer-events:auto!important")],
  ["Trailing clicks are blocked even after menu state becomes closed", runtime.includes("postTapGuardUntil && Date.now() < postTapGuardUntil") && runtime.includes("blockEvent(event);")],
  ["Video modal has a direct menu/shield safety gate", videos.includes("mobile-menu-locked") && videos.includes("[data-valie-menu-posttap-shield]")],
  ["Shield swallows pointer/touch/click families", runtime.includes('["pointerdown", "pointerup", "touchstart", "touchend", "click", "dblclick", "contextmenu"]')],
  ["Shield lifetime is bounded and removed", runtime.includes("removePostTapShield();") && runtime.includes("}, 760);")],
  ["Page restore clears stale post-tap shielding", runtime.includes("removePostTapShield(); postTapGuardUntil = 0;")],
  ["Navigation runtime is cache-busted to 123.45", layout.includes('site-nav-runtime.js?v=123.45') && layout.includes('site-link-preview-lock.js?v=123.45')],
  ["Package version is 9.13.45", pkg.version === "9.13.45"],
];

let failed = 0;
for (const [name, ok] of checks) {
  console.log(`${ok ? "PASS" : "FAIL"} ${name}`);
  if (!ok) failed += 1;
}
console.log(`\nMobile menu ghost-click audit: ${checks.length - failed}/${checks.length} passed`);
if (failed) process.exit(1);
