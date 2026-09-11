import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const css = read('app/globals.css');
const runtime = read('public/site-nav-runtime.js');
const layout = read('app/layout.tsx');
const pkg = JSON.parse(read('package.json'));

const pass = 'PASS 123.41 — MOBILE MENU RELIABILITY';
const checks = [
  ['Pass 123.41 mobile reliability override exists', css.includes(pass)],
  ['Open mobile header rises above normal fixed site chrome', css.includes('z-index:2147482000!important') && css.includes('.minimal-site-nav.is-menu-open')],
  ['Menu is pinned to the live visual viewport', css.includes('left:var(--valie-visual-left,0px)!important') && css.includes('width:var(--valie-visual-width,100dvw)!important') && css.includes('var(--valie-visual-height,100dvh)')],
  ['Menu paints an opaque surface independent of page content', css.includes('background:#050505!important') && css.includes('contain:layout paint!important')],
  ['Menu rows have phone-safe tap targets', css.includes('min-height:clamp(58px,8.2vh,76px)!important') && css.includes('touch-action:manipulation!important')],
  ['Short portrait devices receive compact sizing', css.includes('@media (max-width:430px) and (max-height:700px)') && css.includes('min-height:52px!important')],
  ['Short landscape devices receive two-column fallback', css.includes('@media (max-width:950px) and (max-height:560px) and (orientation:landscape)') && css.includes('grid-template-columns:repeat(2,minmax(0,1fr))!important')],
  ['Hero scroll UI is hidden while menu is locked', css.includes('html.mobile-menu-locked .hero-scroll-cues--viewport') && css.includes('visibility:hidden!important')],
  ['Primary menu clicks are deterministic', runtime.includes('if (isPrimary && id) event.preventDefault();') && runtime.includes('navigateToTarget(id);')],
  ['Navigation updates hash without depending on native locked-body timing', runtime.includes('function commitHash(id)') && runtime.includes('window.history.pushState(null, "", nextHash)')],
  ['Navigation waits for unlock/layout before scrolling', runtime.includes('window.requestAnimationFrame(function ()') && runtime.includes('window.setTimeout(function () { scrollTargetIntoView(id); }, 140)')],
  ['Target scroll compensates for the fixed nav height', runtime.includes('target.getBoundingClientRect().top - headerHeight')],
  ['Navigation scripts are cache-busted to 123.41', layout.includes('site-nav-runtime.js?v=123.41') && layout.includes('site-link-preview-lock.js?v=123.41')],
  ['Package version is 9.13.41', pkg.version === '9.13.41'],
];

let failures = 0;
for (const [label, ok] of checks) {
  console.log(`${ok ? 'PASS' : 'FAIL'} — ${label}`);
  if (!ok) failures += 1;
}
console.log(`\nMobile menu reliability audit: ${checks.length - failures}/${checks.length} passed.`);
if (failures) process.exit(1);
