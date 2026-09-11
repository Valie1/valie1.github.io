import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const css = fs.readFileSync(path.join(root, 'app', 'globals.css'), 'utf8');
const blockStart = css.lastIndexOf('@media (max-width:760px){');
const tail = blockStart >= 0 ? css.slice(blockStart) : '';
const checks = [
  ['final mobile override block exists', blockStart >= 0],
  ['right review edge pseudo-element is not rendered on mobile', /\.review-orbit::after\{[\s\S]*?content:none!important;[\s\S]*?display:none!important/.test(tail)],
  ['right review edge width is forced to zero', /\.review-orbit::after\{[\s\S]*?width:0!important/.test(tail)],
  ['right review edge background is removed', /\.review-orbit::after\{[\s\S]*?background:none!important/.test(tail)],
  ['right review edge opacity is zero', /\.review-orbit::after\{[\s\S]*?opacity:0!important/.test(tail)],
  ['right review edge transform is removed', /\.review-orbit::after\{[\s\S]*?transform:none!important/.test(tail)],
  ['review viewport has no mask image', /\.review-orbit__viewport\{[\s\S]*?-webkit-mask-image:none!important;[\s\S]*?mask-image:none!important/.test(tail)],
  ['removal block occurs after the older 2px edge hardening block', blockStart > css.lastIndexOf('width:2px!important')],
];
let failed = 0;
for (const [label, ok] of checks) {
  console.log(`${ok ? 'PASS' : 'FAIL'} — ${label}`);
  if (!ok) failed += 1;
}
console.log(`Mobile review right-edge removal audit: ${checks.length - failed}/${checks.length}`);
if (failed) process.exit(1);
