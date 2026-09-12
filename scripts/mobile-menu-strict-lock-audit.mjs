import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const css = read('app/globals.css');
const runtime = read('public/site-nav-runtime.js');
const nav = read('components/SiteNav.tsx');
const layout = read('app/layout.tsx');
const pkg = JSON.parse(read('package.json'));

const checks = [
  ['Pass 123.45 strict modal-lock marker exists', css.includes('--pass12345-mobile-menu-strict-modal-lock:1')],
  ['Mobile menu remains a semantic modal dialog', nav.includes('role="dialog"') && nav.includes('aria-modal="true"')],
  ['Underlying body siblings become inert', runtime.includes('isolateBackground(open)') && runtime.includes('rememberIsolation(node, isolatedNodes)')],
  ['Header brand and desktop nav become inert while menu is open', runtime.includes('function isolateHeaderChrome(next)') && runtime.includes('.minimal-site-brand, .minimal-site-links') && runtime.includes('isolateHeaderChrome(open)')],
  ['Only CLOSE button and menu are allowed modal targets', runtime.includes('function isAllowedModalTarget(target, x, y)') && runtime.includes('button.contains(target)') && runtime.includes('menu.contains(target)')],
  ['Outside pointer down is blocked in capture phase', runtime.includes('document.addEventListener("pointerdown", onStrictPointer, true)') && runtime.includes('event.stopImmediatePropagation()')],
  ['Outside pointer up is blocked in capture phase', runtime.includes('document.addEventListener("pointerup", onStrictPointer, true)')],
  ['Outside click/double-click/context-menu events are blocked', runtime.includes('document.addEventListener("click", onStrictClick, true)') && runtime.includes('document.addEventListener("dblclick", onStrictClick, true)') && runtime.includes('document.addEventListener("contextmenu", onStrictClick, true)')],
  ['Outside touch start/end are blocked', runtime.includes('document.addEventListener("touchstart", onStrictTouch') && runtime.includes('document.addEventListener("touchend", onStrictTouch')],
  ['Outside wheel and touchmove are blocked', runtime.includes('document.addEventListener("wheel", onWheel') && runtime.includes('document.addEventListener("touchmove", onTouchMove')],
  ['Focus cannot escape the modal controls', runtime.includes('window.addEventListener("focusin", onFocusIn, true)') && runtime.includes('function onFocusIn(event)')],
  ['Window scroll is restored while the menu is open', runtime.includes('window.addEventListener("scroll", onWindowScroll') && runtime.includes('window.scrollTo(lockedScrollX, lockedScrollY)')],
  ['CSS disables brand and desktop-nav pointer interaction while menu is open', css.includes('.minimal-site-nav.is-menu-open .minimal-nav-inner > .minimal-site-brand') && css.includes('.minimal-site-nav.is-menu-open .minimal-nav-inner > .minimal-site-links') && css.includes('pointer-events:none!important')],
  ['CSS explicitly re-enables only close button and menu surfaces', css.includes('.minimal-site-nav.is-menu-open .minimal-menu-button') && css.includes('.minimal-site-nav.is-menu-open .minimal-mobile-menu') && css.includes('pointer-events:auto!important')],
  ['Underlying body children remain pointer-locked', css.includes('html.mobile-menu-locked body > :not(.minimal-site-nav):not(script):not(style):not(link)')],
  ['Navigation runtime is cache-busted to 123.45', layout.includes('site-nav-runtime.js?v=123.45') && layout.includes('site-link-preview-lock.js?v=123.45')],
  ['Package version includes Pass 123.51', pkg.version === '9.13.51'],
];

let failures = 0;
for (const [label, ok] of checks) {
  console.log(`${ok ? 'PASS' : 'FAIL'} — ${label}`);
  if (!ok) failures += 1;
}
console.log(`\nMobile menu strict modal-lock audit: ${checks.length - failures}/${checks.length} passed.`);
if (failures) process.exit(1);
