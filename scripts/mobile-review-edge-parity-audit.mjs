import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const css = fs.readFileSync(path.join(root, 'app', 'globals.css'), 'utf8');
const checks = [
  ['mobile parity block is final in source', css.lastIndexOf('@media (max-width:760px){') < css.lastIndexOf('.review-orbit::before,')],
  ['edge masks share one narrow width', /\.review-orbit::before,\s*\n\s*\.review-orbit::after\{[\s\S]*?width:9px!important/.test(css)],
  ['edge masks explicitly drop filters', /filter:none!important/.test(css)],
  ['edge masks explicitly drop shadows', /box-shadow:none!important/.test(css)],
  ['left fade is narrow mirrored gradient', css.includes('linear-gradient(90deg,rgba(5,5,5,.72) 0%,rgba(5,5,5,.26) 46%,rgba(5,5,5,0) 100%)!important')],
  ['right fade mirrors left exactly', css.includes('linear-gradient(270deg,rgba(5,5,5,.72) 0%,rgba(5,5,5,.26) 46%,rgba(5,5,5,0) 100%)!important')],
  ['left side is anchored only left', /\.review-orbit::before\{[\s\S]*?left:0!important;[\s\S]*?right:auto!important;/.test(css)],
  ['right side is anchored only right', /\.review-orbit::after\{[\s\S]*?right:0!important;[\s\S]*?left:auto!important;/.test(css)],
];
let failed = 0;
for (const [label, ok] of checks) {
  console.log(`${ok ? 'PASS' : 'FAIL'} — ${label}`);
  if (!ok) failed += 1;
}
console.log(`Mobile review edge parity audit: ${checks.length - failed}/${checks.length}`);
if (failed) process.exit(1);
