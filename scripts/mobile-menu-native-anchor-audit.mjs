import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const nav = read('components/SiteNav.tsx');
const runtime = read('public/site-nav-runtime.js');
const css = read('app/globals.css');
const layout = read('app/layout.tsx');

const checks = [
  ['Mobile menu destinations remain real same-document hashes', ['#work','#about','#reviews','#contact'].every((hash) => nav.includes(`["${hash}"`))],
  ['Brand home target remains a native same-document hash', nav.includes('href="#top"')],
  ['Mobile links remain excluded from hover-preview interception', nav.includes('data-valie-link-preview-skip')],
  ['Mobile links preserve real href attributes', nav.includes('href={href}')],
  ['Runtime keeps a direct click fallback on every mobile anchor', runtime.includes('link.addEventListener("click", directMobileLinkClick, true)')],
  ['Physical taps are captured from pointerup before click synthesis', runtime.includes('document.addEventListener("pointerup", activateFromPointer, true)')],
  ['Touchend fallback exists for mobile engines that skip pointerup activation', runtime.includes('document.addEventListener("touchend", activateFromTouchEnd, { passive: false, capture: true })')],
  ['Hit testing can recover the intended row by screen coordinates', runtime.includes('function linkAtPoint(x, y)') && runtime.includes('getBoundingClientRect()')],
  ['Tap activation closes the menu and writes the hash explicitly', runtime.includes('finishNavigation(id)') && runtime.includes('setOpen(false, false)') && runtime.includes('writeHash(id)')],
  ['Fixed-nav scroll correction still runs after activation', runtime.includes('scrollTargetIntoView(id)') && runtime.includes('requestAnimationFrame')],
  ['Hashchange independently recovers from a stuck-open overlay', runtime.includes('window.addEventListener("hashchange", onHashChange, false)')],
  ['Mobile links keep pointer interaction above menu decoration', css.includes('.minimal-mobile-menu.is-open .minimal-mobile-menu__links a{') && css.includes('pointer-events:auto!important')],
  ['Navigation assets are cache-busted to Pass 123.44', layout.includes('site-nav-runtime.js?v=123.44') && layout.includes('site-link-preview-lock.js?v=123.44')],
];

let failures = 0;
for (const [label, ok] of checks) {
  console.log(`${ok ? 'PASS' : 'FAIL'} — ${label}`);
  if (!ok) failures += 1;
}
console.log(`\nMobile menu physical-tap audit: ${checks.length - failures}/${checks.length} passed.`);
if (failures) process.exit(1);
