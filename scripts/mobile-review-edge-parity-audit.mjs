import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const css = fs.readFileSync(path.join(root, 'app', 'globals.css'), 'utf8');
const marker = '--mobile-review-edge-shadow-pass:123.33;';
const markerPos = css.lastIndexOf(marker);
const start = markerPos >= 0 ? css.lastIndexOf('@media (max-width:760px){', markerPos) : -1;
const tail = start >= 0 ? css.slice(start) : '';
const checks = [
  ['Pass 123.33 compact mobile review edge block exists', markerPos >= 0 && start >= 0],
  ['full-bleed mobile review rail remains viewport-wide', /\.client-reviews > \.review-orbit\{[\s\S]*?width:100dvw!important;[\s\S]*?max-width:100dvw!important/.test(css)],
  ['edge shadows are restored only on the client review orbit', /\.client-reviews > \.review-orbit::before,[\s\S]*?\.client-reviews > \.review-orbit::after\{[\s\S]*?content:""!important;[\s\S]*?display:block!important;/.test(tail)],
  ['normal-phone edge width is compact at 14px', /width:14px!important;/.test(tail)],
  ['small-phone edge width tightens to 12px', /@media \(max-width:430px\)[\s\S]*?width:12px!important;/.test(tail)],
  ['left edge uses a narrow dark-to-transparent gradient', /::before\{[\s\S]*?linear-gradient\(90deg,[\s\S]*?rgba\(5,5,5,0\) 100%\)/.test(tail)],
  ['right edge mirrors the left gradient direction', /::after\{[\s\S]*?linear-gradient\(270deg,[\s\S]*?rgba\(5,5,5,0\) 100%\)/.test(tail)],
  ['both edges use only a light backdrop blur', /backdrop-filter:blur\(1\.5px\)!important;/.test(tail)],
  ['left and right shadows are symmetric', /box-shadow:4px 0 10px rgba\(0,0,0,\.20\)!important;[\s\S]*?box-shadow:-4px 0 10px rgba\(0,0,0,\.20\)!important;/.test(tail)],
  ['viewport mask remains disabled so no broad black cover returns', /\.review-orbit__viewport\{[\s\S]*?-webkit-mask-image:none!important;[\s\S]*?mask-image:none!important;/.test(css)],
];
let failed = 0;
for (const [label, ok] of checks) {
  console.log(`${ok ? 'PASS' : 'FAIL'} — ${label}`);
  if (!ok) failed += 1;
}
console.log(`Mobile review compact edge-shadow audit: ${checks.length - failed}/${checks.length}`);
if (failed) process.exit(1);
