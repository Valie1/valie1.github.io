import fs from "node:fs";
import path from "node:path";
const root=process.cwd();
const read=(rel)=>fs.readFileSync(path.join(root,rel),"utf8");
const icon=read("app/icon.svg");
const layout=read("app/layout.tsx");
const manifest=read("app/manifest.ts");
const pkg=JSON.parse(read("package.json"));
const checks=[
  ["favicon uses a circle", icon.includes('<circle cx="32" cy="32" r="30"') && !icon.includes("<rect")],
  ["V is centered horizontally", icon.includes('M16 16H26L32 38L38 16H48L37 48H27L16 16Z')],
  ["favicon remains 64 by 64", icon.includes('viewBox="0 0 64 64"')],
  ["layout icon is cache busted", layout.includes('/icon.svg?v=123.51')],
  ["manifest icon is cache busted", manifest.includes('/icon.svg?v=123.51')],
  ["package version is 9.13.51", pkg.version === "9.13.51"],
];
let failed=0; for(const [name,ok] of checks){console.log(`${ok?"PASS":"FAIL"} — ${name}`); if(!ok) failed++;}
if(failed){console.error(`Favicon audit failed: ${failed}/${checks.length}`); process.exit(1);}
console.log(`Favicon audit passed: ${checks.length}/${checks.length}.`);
