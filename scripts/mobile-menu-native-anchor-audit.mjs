import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const nav = read('components/SiteNav.tsx');
const runtime = read('public/site-nav-runtime.js');
const css = read('app/globals.css');
const layout = read('app/layout.tsx');

const checks = [
  ['Mobile menu destinations are native same-document hashes', ['#work','#about','#reviews','#contact'].every((hash) => nav.includes(`["${hash}"`))],
  ['Brand home target is a native same-document hash', nav.includes('href="#top"')],
  ['Mobile links remain excluded from hover-preview interception', nav.includes('data-valie-link-preview-skip')],
  ['Runtime does not prevent default navigation for mobile destination clicks', !runtime.slice(runtime.indexOf('function onMenuClick'), runtime.indexOf('function onKey')).includes('event.preventDefault()')],
  ['Runtime closes the menu from the real click event', runtime.includes('menu.addEventListener("click", onMenuClick, false)') && runtime.includes('setOpen(false, false)')],
  ['Runtime performs a post-click native-target correction', runtime.includes('scrollTargetIntoView(id)') && runtime.includes('}, 120)')],
  ['Legacy pointer-up synthetic activation path is removed', !runtime.includes('onMenuPointerUp') && !runtime.includes('suppressClickUntil')],
  ['Mobile links are forced above menu decorative layers', css.includes('.minimal-mobile-menu__links a{\n    position:relative!important;\n    z-index:3!important;')],
  ['Mobile links explicitly keep pointer interaction', css.includes('.minimal-mobile-menu__links a *{\n    pointer-events:auto!important;')],
  ['Mobile targets reserve space for the fixed header', css.includes('scroll-margin-top:calc(70px + env(safe-area-inset-top))!important')],
  ['Navigation assets are cache-busted to Pass 123.33', layout.includes('site-nav-runtime.js?v=123.36') && layout.includes('site-link-preview-lock.js?v=123.36')],
];

let failures = 0;
for (const [label, ok] of checks) {
  console.log(`${ok ? 'PASS' : 'FAIL'} — ${label}`);
  if (!ok) failures += 1;
}
console.log(`\nMobile menu native-anchor audit: ${checks.length - failures}/${checks.length} passed.`);
if (failures) process.exit(1);
