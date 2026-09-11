import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const css = read('app/globals.css');
const runtime = read('public/site-nav-runtime.js');
const layout = read('app/layout.tsx');
const pkg = JSON.parse(read('package.json'));

const directStart = runtime.indexOf('function directMobileLinkClick');
const directEnd = runtime.indexOf('function closestMobileLink');
const direct = directStart >= 0 && directEnd > directStart ? runtime.slice(directStart, directEnd) : '';

const checks = [
  ['Pass 123.42 marker exists', css.includes('--pass12342-mobile-menu-native-tap:1')],
  ['Open mobile header rises above normal fixed site chrome', css.includes('z-index:2147482000!important') && css.includes('.minimal-site-nav.is-menu-open')],
  ['Menu is pinned to the live visual viewport', css.includes('left:var(--valie-visual-left,0px)!important') && css.includes('width:var(--valie-visual-width,100dvw)!important') && css.includes('var(--valie-visual-height,100dvh)')],
  ['Menu rows keep phone-safe tap targets', css.includes('min-height:clamp(58px,8.2vh,76px)!important') && css.includes('touch-action:manipulation!important')],
  ['Every mobile link receives a direct click listener', runtime.includes('link.addEventListener("click", directMobileLinkClick, true)') && runtime.includes('function bindLinks()')],
  ['Direct link activation closes the overlay', direct.includes('setOpen(false, false)')],
  ['Direct link activation preserves native anchor default behavior', !direct.includes('event.preventDefault()') && !direct.includes('stopImmediatePropagation()')],
  ['Same-hash taps receive a post-click scroll correction', direct.includes('scrollTargetIntoView(id)') && direct.includes('fallbackTimer')],
  ['Hash changes independently close a stuck-open menu', runtime.includes('function onHashChange()') && runtime.includes('if (open) setOpen(false, false)') && runtime.includes('window.addEventListener("hashchange", onHashChange, false)')],
  ['A delegated non-cancelling safety net remains', runtime.includes('menu.addEventListener("click", delegatedMenuClick, false)')],
  ['Target scroll compensates for the fixed nav height', runtime.includes('target.getBoundingClientRect().top - headerHeight')],
  ['Background inert isolation still restores on close', runtime.includes('isolateBackground(open)') && runtime.includes('setNodeInert(record.node, record.inert)')],
  ['Navigation scripts are cache-busted to 123.42', layout.includes('site-nav-runtime.js?v=123.42') && layout.includes('site-link-preview-lock.js?v=123.42')],
  ['Package version is 9.13.42', pkg.version === '9.13.42'],
];

let failures = 0;
for (const [label, ok] of checks) {
  console.log(`${ok ? 'PASS' : 'FAIL'} — ${label}`);
  if (!ok) failures += 1;
}
console.log(`\nMobile menu reliability audit: ${checks.length - failures}/${checks.length} passed.`);
if (failures) process.exit(1);
