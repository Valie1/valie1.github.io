import fs from "node:fs";

const cookie = fs.readFileSync(new URL("../components/CookieConsent.tsx", import.meta.url), "utf8");
const runtime = fs.readFileSync(new URL("../components/StaticLegalPortalRuntime.tsx", import.meta.url), "utf8");
const shell = fs.readFileSync(new URL("../components/LegalPageShell.tsx", import.meta.url), "utf8");
const css = fs.readFileSync(new URL("../app/globals.css", import.meta.url), "utf8");
const linkPreview = fs.readFileSync(new URL("../public/site-link-preview-lock.js", import.meta.url), "utf8");

const handoffStart = cookie.indexOf("const openLegalFromSettings");
const handoffEnd = cookie.indexOf("const saveChoice", handoffStart);
const handoff = handoffStart >= 0 && handoffEnd > handoffStart ? cookie.slice(handoffStart, handoffEnd) : "";

const checks = [
  [cookie.includes('data-valie-legal-deferred') && cookie.includes('openLegalFromSettings'), "Cookie Settings legal links use the dedicated stacked legal handoff"],
  [handoff.includes('new CustomEvent("valie:open-legal-portal"') && handoff.includes('keepCookieSettingsOpen: true'), "Cookie Settings requests the legal portal without tearing down the modal"],
  [!handoff.includes('closeSettings('), "Cookie Settings is never closed when a legal document is opened"],
  [handoff.includes('event.currentTarget') && handoff.includes('cookieSettingsScrollTop'), "The exact legal-link focus target and Cookie Settings scroll position are preserved"],
  [runtime.includes("var OPEN_MESSAGE = 'valie:open-legal-portal'") && runtime.includes("window.addEventListener(OPEN_MESSAGE, handleOpenRequest)"), "Legal portal receives explicit Cookie Settings handoffs"],
  [runtime.includes("keepCookieSettingsOpen = !!(returnContext && returnContext.cookieSettingsOpen)") && runtime.includes("detail.keepCookieSettingsOpen === true"), "Legal runtime records the stacked Cookie Settings context"],
  [runtime.includes("document.querySelector('.cookie-consent.is-settings')") && runtime.includes("settingsDialog.scrollTop = cookieSettingsScrollTop"), "Back to Portfolio restores the already-open Cookie Settings dialog to the same internal position"],
  [runtime.includes("settingsFocusTarget") && runtime.includes("focus({preventScroll:true})"), "Back to Portfolio returns focus to the legal link inside the still-open Cookie Settings window"],
  [!runtime.includes("window.__valieCookieSettingsRestoreScrollTop = reopenScrollTop"), "Legal return no longer closes and reopens Cookie Settings through the legacy bridge"],
  [runtime.includes("anchor.hasAttribute('data-valie-legal-deferred')") && runtime.includes("document.addEventListener('click', handleClick, true)"), "Global legal capture leaves Cookie Settings links to React while retaining one-click legal capture elsewhere"],
  [linkPreview.includes('anchor.hasAttribute("data-valie-legal-deferred")'), "Hover URL suppression does not steal Cookie Settings legal clicks"],
  [runtime.includes("loaded[path] = normalizePath(actualPath) === path"), "Preloaded legal frames tolerate trailing-slash static hosting"],
  [runtime.includes("layer.inert = true") && runtime.includes("layer.setAttribute('aria-hidden','true')") && runtime.includes("restoreCookieSettingsLayer()"), "The still-mounted Cookie Settings layer is temporarily inert and hidden from assistive tech while the legal page is on top"],
  [runtime.includes("frame.focus({preventScroll:true})"), "Opened legal documents receive focus so keyboard scrolling works immediately"],
  [shell.includes("window.parent.postMessage({type:CLOSE_MESSAGE}") && shell.includes("window.parent.postMessage({type:NAVIGATE_MESSAGE"), "Embedded legal pages keep Back to Portfolio and legal-document switching functional"],
  [css.includes("body.cnh-policy-active #cnh-policy-portal") && css.includes("filter:blur(10px)") && css.includes("transition:opacity .56s"), "Fade and blur portal transition styling remains enabled"],
];

const failed = checks.filter(([ok]) => !ok);
checks.forEach(([ok, label]) => console.log(`${ok ? "PASS" : "FAIL"}  ${label}`));
if (failed.length) process.exit(1);
console.log(`Cookie Settings stacked legal overlay audit passed: ${checks.length}/${checks.length}`);
