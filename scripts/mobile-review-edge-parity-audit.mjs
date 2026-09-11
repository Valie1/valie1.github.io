import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const css = fs.readFileSync(path.join(root, 'app', 'globals.css'), 'utf8');
const marker = '.client-reviews > .review-orbit{';
const start = css.lastIndexOf(marker);
const tail = start >= 0 ? css.slice(start) : '';
const checks = [
  ['Pass 123.32 mobile review full-bleed block exists', start >= 0],
  ['review orbit breaks out to dynamic viewport width', /\.client-reviews > \.review-orbit\{[\s\S]*?width:100dvw!important;[\s\S]*?max-width:100dvw!important/.test(tail)],
  ['review orbit is centered on the viewport rather than padded content box', /margin-left:calc\(50% - 50dvw\)!important;[\s\S]*?margin-right:calc\(50% - 50dvw\)!important;/.test(tail)],
  ['viewport no longer inherits the generic max-width clamp', /\.review-orbit__viewport\{[\s\S]*?max-width:none!important;/.test(tail)],
  ['left review edge cover is completely disabled', /\.review-orbit::before,[\s\S]*?\.review-orbit::after\{[\s\S]*?content:none!important;[\s\S]*?display:none!important;/.test(tail)],
  ['both edge covers have zero width', /\.review-orbit::before,[\s\S]*?\.review-orbit::after\{[\s\S]*?width:0!important;/.test(tail)],
  ['both edge covers have no background', /\.review-orbit::before,[\s\S]*?\.review-orbit::after\{[\s\S]*?background:none!important;/.test(tail)],
  ['review viewport has no mask image', /\.review-orbit__viewport\{[\s\S]*?-webkit-mask-image:none!important;[\s\S]*?mask-image:none!important;/.test(tail)],
  ['full-bleed fix is the final review-orbit mobile override', start > css.lastIndexOf('width:2px!important')],
];
let failed = 0;
for (const [label, ok] of checks) {
  console.log(`${ok ? 'PASS' : 'FAIL'} — ${label}`);
  if (!ok) failed += 1;
}
console.log(`Mobile review full-bleed audit: ${checks.length - failed}/${checks.length}`);
if (failed) process.exit(1);
