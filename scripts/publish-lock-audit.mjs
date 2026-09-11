import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (rel) => fs.readFileSync(path.join(root, rel), "utf8");
const walk = (dir, out = []) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
};

const sourceFiles = ["app", "components", "lib", "scripts"]
  .flatMap((dir) => walk(path.join(root, dir)))
  .filter((file) => /\.(?:tsx?|jsx?|mjs|css)$/.test(file) && !file.endsWith("next-env.d.ts"));
const css = read("app/globals.css");
const viewport = read("components/BrowserViewportRuntime.tsx");
const envExample = read(".env.example");
const mediaSources = sourceFiles.filter((file) => /\.(?:tsx|jsx)$/.test(file)).map((file) => fs.readFileSync(file, "utf8")).join("\n");
const mediaTags = [...mediaSources.matchAll(/<(?:img|video|Image)\b[\s\S]*?>/g)].map((match) => match[0]);
const nav = read("components/SiteNav.tsx");
const legal = read("components/LegalPageShell.tsx");
const hero = read("components/HeroVideoWall.tsx");
const home = read("app/page.tsx");
const reviews = read("components/ClientReviews.tsx");
const legalRuntime = read("components/StaticLegalPortalRuntime.tsx");
const layout = read("app/layout.tsx");
const accessibility = read("lib/accessibility.ts");
const nextConfig = read("next.config.mjs");
const blockOpen = "/" + "*";
const blockClose = "*" + "/";
const checks = [
  ["mobile menu numeric microcopy removed", !nav.includes('padStart(2, "0")') && !nav.includes('<small>{String(index + 1)')],
  ["legal hero kicker microcopy removed", !legal.includes('className="legal-kicker"') && !css.includes('.legal-kicker{')],
  ["all image context menus are blocked sitewide", viewport.includes('const IMAGE_CONTEXT_SELECTOR = "img"') && viewport.includes('document.addEventListener("contextmenu", preventImageContextMenu, true)') && viewport.includes("event.target.closest(IMAGE_CONTEXT_SELECTOR)") && viewport.includes("event.preventDefault()") && viewport.includes('document.removeEventListener("contextmenu", preventImageContextMenu, true)')],
  ["capture-phase drag blocking covers the whole document", viewport.includes('const DRAG_EVENTS = ["dragstart", "drag", "dragenter", "dragover", "drop"]') && viewport.includes("document.addEventListener(eventName, preventDrag, true)") && viewport.includes("event.stopPropagation()")],
  ["drag blocking cleanup is active", viewport.includes("document.removeEventListener(eventName, preventDrag, true)")],
  ["selection drag is blocked outside editable controls", viewport.includes('document.addEventListener("selectstart", preventSelectionDrag, true)') && viewport.includes('input,textarea,select,[contenteditable="true"]')],
  ["sitewide CSS drag lock is present", css.includes("html,body,#main-content,body *") && css.includes("-webkit-user-drag:none!important")],
  ["sitewide review selection lock is present", css.includes("body *{") && css.includes("user-select:none!important") && css.includes('[contenteditable="true"] *')],
  ["horizontal drag and overscroll are suppressed", css.includes("overscroll-behavior-x:none") && css.includes("overflow-x:clip")],
  ["legacy preview stamp scrubber is active", viewport.includes("PREVIEW_STAMP_PATTERN") && viewport.includes("LEGACY_STAMP_SELECTOR") && viewport.includes("MutationObserver")],
  ["legacy preview stamp CSS fallback is active", css.includes(".rk49-build-stamp,[data-build-stamp]") && css.includes("display:none!important")],
  ["media markup stays hydration-safe", mediaTags.length > 0 && mediaTags.every((tag) => !/\bdraggable\s*=/.test(tag))],
  ["desktop interactive hover motion is present", css.includes("@media (hover:hover) and (pointer:fine)") && css.includes("scale:1.015") && css.includes("filter:brightness(1.08)")],
  ["hover motion respects reduced-motion", css.includes("@media (prefers-reduced-motion:reduce)") && css.includes("translate:none!important") && css.includes("scale:1!important")],
  ["pointer clicks release non-editable focus", viewport.includes('document.addEventListener("pointerup", releasePointerFocus, true)') && viewport.includes("document.activeElement === target") && viewport.includes("target.blur()")],
  ["pointer modality suppresses sticky focus visuals", viewport.includes('root.dataset.valieInput = "pointer"') && css.includes('html[data-valie-input="pointer"] body :is(a[href],a[data-valie-link-preview-lock],button,[role="button"],[role="tab"],summary,[tabindex]):focus-visible')],
  ["video play overlays use neutral grey treatment", css.includes("background:rgba(82,82,78,.88)!important") && css.includes("background:rgba(72,72,68,.90)!important") && !css.slice(css.lastIndexOf('.reference-media-card__play')).includes("rgba(224,32,32")],
  ["mobile navigation arrows are removed", !nav.includes("↗") && !nav.includes("minimal-mobile-menu__links a>span")],
  ["legal document arrows are removed", !legal.includes("↗")],
  ["hero lane badge is removed", !hero.includes("hero-media-lane__label") && !css.includes("hero-media-lane__label")],
  ["hero wall owns runtime after its own hydration", hero.includes('"use client"') && hero.includes("useEffect(() =>") && hero.includes("const rootRef = useRef<HTMLDivElement>(null)") && hero.includes('className="hero-video-wall hero-video-wall--split" ref={rootRef}') && !layout.includes("hero-video-wall-runtime.js") && !hero.includes("data-hero-wall-runtime")],
  ["hero discipline microcopy is removed", !home.includes("one-hero-disciplines") && !home.includes("LONG FORM <i /> SHORT FORM <i /> WEB")],
  ["review open-original microcopy is removed", !reviews.includes("review-card__action") && !reviews.includes("OPEN ORIGINAL")],
  ["review numeric markers are removed", !reviews.includes("review-card__number") && !css.includes(".review-card__number")],
  ["review verified-note microcopy is removed", !reviews.includes("VERIFIED CLIENT NOTE") && !css.includes(".review-card__meta i")],
  ["review lightbox screenshot-label microcopy is removed", !reviews.includes("ORIGINAL REVIEW SCREENSHOT")],
  ["review card content is vertically centered", css.includes("align-items:center;\n  padding:24px 24px 22px") && css.includes("height:auto;flex-direction:column;justify-content:center;align-self:center") && !css.includes("grid-template-columns:24px 44px minmax(0,1fr)!important")],
  ["review hover keeps card lift and rotation without secondary text scaling", css.includes("transform:translate3d(0,calc(var(--review-y) - 12px),28px) rotate(0deg)!important") && css.includes("scale:1!important") && css.includes("filter:none!important")],
  ["legal links use restored 122.61 one-click portal capture", legalRuntime.includes("document.addEventListener('click', handleClick, true)") && legalRuntime.includes("event.stopImmediatePropagation()") && legalRuntime.includes("show(path, anchor, clickY)")],
  ["legal portal restores the golden preloaded-frame architecture", layout.includes("<StaticLegalPortalRuntime />") && legalRuntime.includes('src="about:blank"') && legalRuntime.includes("warmFrames();") && legalRuntime.includes("portal.classList.add('is-preparing')")],
  ["navigation is server-static with vanilla interaction runtime", layout.includes("<SiteNav />") && layout.includes('src="/site-nav-runtime.js?v=123.30"') && !nav.includes('"use client"') && nav.includes('className="minimal-site-nav one-page-nav"') && css.includes("body:has(.legal-page) .minimal-site-nav{display:none!important}")],
  ["legal fade/blur portal styling is restored", css.includes("body.cnh-policy-active #cnh-policy-portal") && css.includes("filter:blur(10px)") && css.includes("transition:opacity .56s")],
  ["modal isolation keeps the legal portal interactive", accessibility.includes('child.id === "cnh-policy-portal"') && legalRuntime.includes("portal.inert = false") && legalRuntime.includes("portal.removeAttribute('inert')")],
  ["legal iframe warming is post-hydration aware", viewport.includes('root.dataset.valieHydrated = "true"') && legalRuntime.includes("window.addEventListener('valie:hydrated', onHydrated")],
  ["mobile navigation uses pill geometry", css.includes("border-radius:999px!important") && css.includes("grid-template-columns:minmax(0,1fr)!important")],
  ["CSS comments are removed", !css.includes(blockOpen) && !css.includes(blockClose)],
  ["source block comments are removed", sourceFiles.every((file) => { const text = fs.readFileSync(file, "utf8"); return !text.includes(blockOpen) && !text.includes(blockClose); })],
  ["source line comments are removed", sourceFiles.every((file) => !/(^|\n)\s*\/\//.test(fs.readFileSync(file, "utf8")))],
  ["environment example is comment-free", !/(^|\n)\s*#/.test(envExample)],
  ["legacy hotfix note is absent", !fs.existsSync(path.join(root, "PASS122.1-CSS-BUILD-HOTFIX.md"))],
  ["mobile menu decorative eyebrow removed", !nav.includes("minimal-mobile-menu__eyebrow") && !nav.includes("NAVIGATION") && !nav.includes("VALIE / 2026")],
  ["mobile menu discipline footer removed", !nav.includes("minimal-mobile-menu__footer") && !nav.includes("VIDEO EDITING")],
  ["GitHub Pages static export is enabled", nextConfig.includes('output: "export"') && nextConfig.includes("trailingSlash: true") && nextConfig.includes("unoptimized: true")],
  ["server-only custom routes are removed for static export", !nextConfig.includes("async redirects") && !nextConfig.includes("async headers") && !nextConfig.includes("async rewrites")],
  ["development uses the stable default Next dev server", read("package.json").includes('"dev": "next dev"') && read("package.json").includes('"dev:portfolio": "next dev -p 3000"')],
  ["GitHub Pages preview launcher builds before serving", read("START-PASS-123.30-MOBILE-SCROLL-DESKTOP-LIFECYCLE.bat").includes("npm run build:pages") && read("START-PASS-123.30-MOBILE-SCROLL-DESKTOP-LIFECYCLE.bat").includes("npm run preview:pages")],
  ["development cache cleaner removes Next Turbopack SWC and module caches", read("scripts/clean-next-cache.mjs").includes('".next"') && read("scripts/clean-next-cache.mjs").includes('".turbo"') && read("scripts/clean-next-cache.mjs").includes('".swc"') && read("scripts/clean-next-cache.mjs").includes('path.join("node_modules", ".cache")')],
  ["GitHub Pages deployment workflow is present", fs.existsSync(path.join(root, ".github", "workflows", "deploy-pages.yml")) && read(".github/workflows/deploy-pages.yml").includes("npm run build:pages") && read(".github/workflows/deploy-pages.yml").includes("actions/deploy-pages@v5")],
  ["mobile optional-media gate keeps desktop-style action composition", css.includes(".one-video-modal__panel:has(.video-consent-gate)") && css.includes("display:flex!important") && css.includes("flex-wrap:nowrap!important") && css.includes("min-height:350px!important") && css.includes("min-width:126px!important")],
  ["browser hover URL preview is hydration-safe and navigation remains intact", layout.includes('src="/site-link-preview-lock.js?v=123.30"') && fs.existsSync(path.join(root, "public", "site-link-preview-lock.js")) && read("public/site-link-preview-lock.js").includes('window.addEventListener("load", scheduleBoot') && read("public/site-link-preview-lock.js").includes('document.addEventListener("pointerover", onPointerOver, true)') && read("public/site-link-preview-lock.js").includes('document.addEventListener("pointerout", onPointerOut, true)') && !read("public/site-link-preview-lock.js").includes('querySelectorAll("a[href]")') && legalRuntime.includes("a[href],a[data-valie-link-href]") && legal.includes("a[href],a[data-valie-link-href]")],
  ["runtime-managed links retain pointer cursor and native keyboard semantics", read("public/site-link-preview-lock.js").includes('anchor.style.cursor = "pointer"') && read("public/site-link-preview-lock.js").includes('anchor.setAttribute("href", href)') && !read("public/site-link-preview-lock.js").includes('anchor.setAttribute("role", "link")') && css.includes('a[data-valie-link-preview-lock],\na[data-valie-link-href]') && css.includes('cursor:pointer!important')],
  ["dependency versions are pinned for repeatable installs", !read("package.json").includes('"^')],
];

let failed = 0;
for (const [label, ok] of checks) {
  console.log(`${ok ? "PASS" : "FAIL"} — ${label}`);
  if (!ok) failed++;
}
if (failed) {
  console.error(`Publish lock audit failed: ${failed}/${checks.length}`);
  process.exit(1);
}
console.log(`Publish lock audit passed: ${checks.length}/${checks.length}.`);
