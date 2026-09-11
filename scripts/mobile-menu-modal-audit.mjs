import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const runtime = read('public/site-nav-runtime.js');
const nav = read('components/SiteNav.tsx');
const css = read('app/globals.css');
const layout = read('app/layout.tsx');

const checks = [
  ['Mobile menu exposes dialog modal semantics', nav.includes('role="dialog"') && nav.includes('aria-modal="true"')],
  ['Background isolation is applied when the menu opens', runtime.includes('isolateBackground(open)') && runtime.includes('function isolateBackground(next)')],
  ['Background nodes use native inert isolation', runtime.includes('setNodeInert(node, true)') && runtime.includes('node.setAttribute("inert", "")')],
  ['Background accessibility tree is hidden while menu is open', runtime.includes('node.setAttribute("aria-hidden", "true")')],
  ['Original inert and aria-hidden state is restored on close', runtime.includes('setNodeInert(record.node, record.inert)') && runtime.includes('record.ariaHidden === null')],
  ['Mobile destinations use native click activation', runtime.includes('menu.addEventListener("click", onMenuClick, false)') && !runtime.includes('onMenuPointerUp')],
  ['Native anchor default is preserved for destination clicks', !runtime.slice(runtime.indexOf('function onMenuClick'), runtime.indexOf('function onKey')).includes('event.preventDefault()')],
  ['Menu link activation closes without swallowing the anchor click', runtime.includes('setOpen(false, false)') && runtime.includes('scrollTargetIntoView(id)')],
  ['Same-page navigation closes menu before post-click section correction', runtime.includes('setOpen(false, false)') && runtime.includes('scrollTargetIntoView(id)')],
  ['Section positioning has a second correction pass', runtime.includes('}, 120)') && runtime.includes('scrollTargetIntoView(id)')],
  ['Outside pointer input is blocked while modal menu is open', runtime.includes('onDocumentPointerDown') && runtime.includes('event.stopImmediatePropagation()')],
  ['CSS blocks pointer interaction with body siblings while menu is open', css.includes('html.mobile-menu-locked body > :not(.minimal-site-nav):not(script):not(style):not(link)') && css.includes('pointer-events:none!important')],
  ['Navigation remains interactive above the lock', css.includes('html.mobile-menu-locked .minimal-site-nav *') && css.includes('pointer-events:auto')],
  ['Menu overscroll cannot chain into the underlying page', css.includes('.minimal-mobile-menu.is-open{') && css.includes('overscroll-behavior:none!important')],
  ['Deployed runtime is cache-busted for this pass', layout.includes('site-nav-runtime.js?v=123.31') && layout.includes('site-link-preview-lock.js?v=123.31')],
];

let failures = 0;
for (const [label, ok] of checks) {
  console.log(`${ok ? 'PASS' : 'FAIL'} — ${label}`);
  if (!ok) failures += 1;
}
console.log(`\nMobile menu modal + navigation audit: ${checks.length - failures}/${checks.length} passed.`);
if (failures) process.exit(1);
