import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const css = read('app/globals.css');
const nav = read('components/SiteNav.tsx');
const consent = read('components/CookieConsent.tsx');
const viewport = read('components/BrowserViewportRuntime.tsx');
const navRuntime = read('public/site-nav-runtime.js');

const checks = [
  ['mobile interaction layer exists', css.includes('.minimal-mobile-menu{') && css.includes('height:var(--valie-visual-height,100dvh)!important')],
  ['Mobile menu uses the static runtime scroll lock', navRuntime.includes('mobile-menu-locked') && navRuntime.includes('document.addEventListener("wheel", onWheel') && navRuntime.includes('document.addEventListener("touchmove", onTouchMove')],
  ['Mobile menu links keep native same-page hash navigation', nav.includes('["#work", "WORK"]') && nav.includes('["#contact", "CONTACT"]') && navRuntime.includes('scrollTargetIntoView(id)')],
  ['Mobile menu uses the browser-native click path', navRuntime.includes('link.addEventListener("click", directMobileLinkClick, true)') && navRuntime.includes('menu.addEventListener("click", delegatedMenuClick, false)') && !navRuntime.includes('onMenuPointerUp')],
  ['Mobile menu isolates all background body children', navRuntime.includes('function isolateBackground(next)') && navRuntime.includes('setNodeInert(node, true)') && navRuntime.includes('node.setAttribute("aria-hidden", "true")')],
  ['Mobile menu blocks outside pointer activation', navRuntime.includes('function onDocumentPointerDown(event)') && navRuntime.includes('event.stopImmediatePropagation()')],
  ['Mobile menu bypasses global href-preview interception', nav.includes('data-valie-link-preview-skip') && read('public/site-link-preview-lock.js').includes('function shouldSkip(anchor)')],
  ['Cookie Settings uses the shared touch-safe document lock', consent.includes('lockDocumentScroll("cookie-settings-locked")')],
  ['Cookie Settings backdrop uses pointer events for touch', consent.includes('onPointerDown={(event) =>')],
  ['Visual viewport top is exposed to CSS', viewport.includes('--valie-visual-top')],
  ['Visual viewport left is exposed to CSS', viewport.includes('--valie-visual-left')],
  ['Keyboard inset is tracked for mobile viewport changes', viewport.includes('--valie-keyboard-inset')],
  ['Mobile menu is fixed to the visual viewport', /\.minimal-mobile-menu\{[\s\S]*?position:fixed!important/.test(css)],
  ['Mobile menu has contained touch scrolling', /\.minimal-mobile-menu\{[\s\S]*?touch-action:pan-y!important/.test(css)],
  ['Video/review overlays use visual viewport dimensions', css.includes('.one-video-modal,\n  .review-lightbox,\n  .cookie-consent-layer.is-settings-open') && css.includes('height:var(--valie-visual-height,100dvh)!important')],
  ['Review overlay image area can scroll on short phones', /\.review-lightbox__image-wrap\{[\s\S]*?overflow:auto!important/.test(css)],
  ['Mobile video timeline has a finger-sized interaction lane', /\.one-video-modal \.player-timeline\{[\s\S]*?min-height:22px!important/.test(css)],
  ['Mobile video player buttons have 44px touch targets', /\.one-video-modal \.player-row button,[\s\S]*?min-height:44px!important/.test(css)],
  ['Cookie Settings owns its internal mobile scroll', /cookie-consent\.is-settings[\s\S]*?overflow:auto!important/.test(css)],
  ['First-visit consent is a centered mobile bottom sheet', /cookie-consent-layer:not\(\.is-settings-open\)[\s\S]*?justify-content:center!important/.test(css)],
  ['Legal iframe owns mobile pan/overscroll behavior', /body\.cnh-policy-active \.cnh-policy-frame\.is-active\{[\s\S]*?touch-action:pan-y!important/.test(css)],
  ['Sticky mobile CTA is disabled under Cookie Settings', css.includes('html.cookie-settings-locked .mobile-contact-cta')],
  ['Sticky mobile CTA is disabled under legal portal', css.includes('body.cnh-policy-active .mobile-contact-cta')],
  ['Both hero scroll controls keep touch manipulation', /hero-scroll-cues--viewport \.hero-scroll-cue\{[\s\S]*?touch-action:manipulation!important/.test(css)],
  ['Short landscape overlay fallback exists', css.includes('@media(max-width:760px) and (max-height:560px) and (orientation:landscape)')],
];

let failures = 0;
for (const [label, ok] of checks) {
  console.log(`${ok ? 'PASS' : 'FAIL'} — ${label}`);
  if (!ok) failures += 1;
}

console.log(`\nMobile interactions + overlays audit: ${checks.length - failures}/${checks.length} passed.`);
if (failures) process.exit(1);
