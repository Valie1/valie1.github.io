import fs from "node:fs";

const cookie = fs.readFileSync(new URL("../components/CookieConsent.tsx", import.meta.url), "utf8");
const runtime = fs.readFileSync(new URL("../components/StaticLegalPortalRuntime.tsx", import.meta.url), "utf8");
const shell = fs.readFileSync(new URL("../components/LegalPageShell.tsx", import.meta.url), "utf8");
const css = fs.readFileSync(new URL("../app/globals.css", import.meta.url), "utf8");
const linkPreview = fs.readFileSync(new URL("../public/site-link-preview-lock.js", import.meta.url), "utf8");

const checks = [
  [cookie.includes('data-valie-legal-deferred') && cookie.includes('openLegalFromSettings'), "Cookie Settings legal links use the deferred handoff path"],
  [cookie.includes('window.requestAnimationFrame(() =>') && cookie.includes('new CustomEvent("valie:open-legal-portal"') && cookie.includes('returnToCookieSettings: true'), "Cookie Settings releases modal state before dispatching the legal portal request with return context"],
  [cookie.includes('cookieSettingsScrollTop') && cookie.includes('__valieCookieSettingsRestoreScrollTop'), "Cookie Settings preserves its own scroll position across the legal round trip"],
  [runtime.includes("var OPEN_MESSAGE = 'valie:open-legal-portal'") && runtime.includes("window.addEventListener(OPEN_MESSAGE, handleOpenRequest)"), "Legal portal receives explicit Cookie Settings handoffs"],
  [runtime.includes("anchor.hasAttribute('data-valie-legal-deferred')") && runtime.includes("document.addEventListener('click', handleClick, true)"), "Global legal capture leaves deferred Cookie Settings links to React while retaining one-click legal capture elsewhere"],
  [linkPreview.includes('anchor.hasAttribute("data-valie-legal-deferred")'), "Hover URL suppression does not steal deferred legal clicks before React handles them"],
  [runtime.includes("loaded[path] = normalizePath(actualPath) === path"), "Preloaded legal frames tolerate trailing-slash static hosting"],
  [runtime.includes("window.scrollTo({top:savedY,left:0,behavior:'auto'})") && runtime.includes("window.__valieCookieSettingsPending = true"), "Back to Portfolio restores the originating page position and reopens Cookie Settings"],
  [runtime.includes("window.__valieCookieSettingsRestoreScrollTop = reopenScrollTop") && cookie.includes("dialogRef.current.scrollTop = restoreScrollTop"), "Reopened Cookie Settings returns to the same internal position"],
  [shell.includes("window.parent.postMessage({type:CLOSE_MESSAGE}") && shell.includes("window.parent.postMessage({type:NAVIGATE_MESSAGE"), "Embedded legal pages keep Back to Portfolio and legal-document switching functional"],
  [css.includes("body.cnh-policy-active #cnh-policy-portal") && css.includes("filter:blur(10px)") && css.includes("transition:opacity .56s"), "Fade and blur portal transition styling remains enabled"],
];

const failed = checks.filter(([ok]) => !ok);
checks.forEach(([ok, label]) => console.log(`${ok ? "PASS" : "FAIL"}  ${label}`));
if (failed.length) process.exit(1);
console.log(`Cookie Settings legal round-trip audit passed: ${checks.length}/${checks.length}`);
