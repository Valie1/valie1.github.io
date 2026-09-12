import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const css = read('app/globals.css');
const runtime = read('public/site-nav-runtime.js');
const layout = read('app/layout.tsx');
const pkg = JSON.parse(read('package.json'));

const checks = [
  ['Pass 123.45 strict-lock marker exists', css.includes('--pass12345-mobile-menu-strict-modal-lock:1')],
  ['Open mobile header rises above normal fixed site chrome', css.includes('z-index:2147482000!important') && css.includes('.minimal-site-nav.is-menu-open')],
  ['Menu is pinned to the live visual viewport', css.includes('left:var(--valie-visual-left,0px)!important') && css.includes('width:var(--valie-visual-width,100dvw)!important') && css.includes('var(--valie-visual-height,100dvh)')],
  ['Menu rows keep phone-safe tap targets', css.includes('min-height:clamp(58px,8.2vh,76px)!important') && css.includes('touch-action:manipulation!important')],
  ['Pointerdown records the intended mobile row', runtime.includes('document.addEventListener("pointerdown", rememberPress, true)') && runtime.includes('function rememberPress(event)')],
  ['Pointerup performs physical tap activation', runtime.includes('document.addEventListener("pointerup", activateFromPointer, true)') && runtime.includes('Math.hypot(dx, dy) > 18')],
  ['Touchend fallback performs coordinate hit testing', runtime.includes('function activateFromTouchEnd(event)') && runtime.includes('linkAtPoint(touch.clientX, touch.clientY)')],
  ['Tap activation no longer depends on native anchor default navigation', runtime.includes('event.preventDefault();') && runtime.includes('finishNavigation(id)')],
  ['Activation explicitly closes overlay, updates hash, and scrolls', runtime.includes('setOpen(false, false)') && runtime.includes('writeHash(id)') && runtime.includes('scrollTargetIntoView(id)')],
  ['Duplicate click after pointer/touch activation is suppressed', runtime.includes('Date.now() - lastActivationAt < 700') && runtime.includes('lastActivationId === id')],
  ['Hash changes independently close a stuck-open menu', runtime.includes('function onHashChange()') && runtime.includes('if (open) setOpen(false, false)')],
  ['Target scroll compensates for the fixed nav height', runtime.includes('target.getBoundingClientRect().top - headerHeight')],
  ['Background inert isolation still restores on close', runtime.includes('isolateBackground(open)') && runtime.includes('setNodeInert(record.node, record.inert)')],
  ['Navigation scripts are cache-busted to 123.45', layout.includes('site-nav-runtime.js?v=123.45') && layout.includes('site-link-preview-lock.js?v=123.45')],
  ['Package version includes Pass 123.52', pkg.version === '9.13.52'],
];

let failures = 0;
for (const [label, ok] of checks) {
  console.log(`${ok ? 'PASS' : 'FAIL'} — ${label}`);
  if (!ok) failures += 1;
}
console.log(`\nMobile menu reliability audit: ${checks.length - failures}/${checks.length} passed.`);
if (failures) process.exit(1);
