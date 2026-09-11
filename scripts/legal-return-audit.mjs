import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (rel) => fs.readFileSync(path.join(root, rel), "utf8");
const errors = [];
const pass = (ok, message) => { if (!ok) errors.push(message); };

const layout = read("app/layout.tsx");
const runtime = read("components/StaticLegalPortalRuntime.tsx");
const shell = read("components/LegalPageShell.tsx");
const footer = read("components/OnePageFooter.tsx");
const css = read("app/globals.css");
const accessibility = read("lib/accessibility.ts");
const viewport = read("components/BrowserViewportRuntime.tsx");

pass(layout.includes("<StaticLegalPortalRuntime />"), "RootLayout must mount the restored legal portal.");
pass(accessibility.includes('child.id === "cnh-policy-portal"'), "Dialog isolation must exempt the legal portal so modal-to-policy navigation stays interactive.");
pass(viewport.includes('root.dataset.valieHydrated = "true"') && viewport.includes('window.dispatchEvent(new Event("valie:hydrated"))'), "Legal prewarm must have a post-hydration readiness signal.");
pass(runtime.includes("window.addEventListener('valie:hydrated', onHydrated") && runtime.includes("if(hydrationReady) warmFrames()"), "Legal iframe prewarm must wait for hydration when possible.");
pass(runtime.includes("portal.inert = false") && runtime.includes("portal.removeAttribute('inert')"), "Legal portal must self-heal stale inert state before opening.");
pass(runtime.includes("src=\"about:blank\"") && runtime.includes("data-legal-path={path}"), "Legal portal must own the three blank preloaded frames.");
pass(runtime.includes("warmFrames();") && runtime.includes("frame.setAttribute('src', path)"), "Golden legal routes must prewarm before the first click.");
pass(runtime.includes("document.addEventListener('click', handleClick, true)"), "Golden legal click capture is missing.");
pass(runtime.includes("event.preventDefault()") && runtime.includes("event.stopImmediatePropagation()") && runtime.includes("show(path, anchor, clickY)"), "Legal links must be accepted deterministically on the first click.");
pass(runtime.includes("portal.classList.add('is-preparing')") && runtime.includes("body.classList.add('cnh-policy-active')"), "Golden fade/blur entry sequence is missing.");
pass(runtime.includes("keepCookieSettingsOpen") && runtime.includes("settingsDialog.scrollTop = cookieSettingsScrollTop"), "Cookie Settings stacked legal return must preserve the still-open modal and its internal position.");
pass(shell.includes("window.parent.postMessage({type:NAVIGATE_MESSAGE") && shell.includes("window.parent.postMessage({type:CLOSE_MESSAGE}"), "Embedded legal switching and Back to Portfolio bridge are missing.");
pass(shell.includes('href="/"') && shell.includes("portfolio-back-button"), "Direct legal routes must retain a native Back to Portfolio anchor.");
for (const href of ["/privacy", "/cookies", "/policies"]) pass(footer.includes(`href="${href}"`) || shell.includes(`"${href}"`), `Missing legal route ${href}.`);
pass(!shell.includes("↗"), "Removed legal document arrows must stay removed.");
pass(css.includes("body.cnh-policy-active #cnh-policy-portal") && css.includes("filter:blur(10px)") && css.includes("transition:opacity .56s"), "Golden legal fade/blur CSS is missing.");
pass(!layout.includes("legal-navigation-runtime.js"), "Replacement native legal-navigation runtime must stay removed.");

if (errors.length) {
  console.error("Legal flow audit FAILED:\n");
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}
console.log("Legal flow audit passed: preloaded portal, stacked Cookie Settings handoff, fade/blur switching, Back to Portfolio, and footer integration.");
