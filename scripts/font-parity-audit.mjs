import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const css = fs.readFileSync(path.join(root, "app", "globals.css"), "utf8");
const layout = fs.readFileSync(path.join(root, "app", "layout.tsx"), "utf8");

const checks = [
  [css.includes('family=Archivo+Black&family=Arimo') && css.includes('family=Gelasio') && css.includes('family=Roboto+Mono'), "cross-device webfont stylesheet is requested"],
  [css.includes('--font-sans:"Arimo",Arial,Helvetica,sans-serif'), "sans role is locked to the same webfont across devices"],
  [css.includes('--font-serif:"Gelasio",Georgia,"Times New Roman",serif'), "serif role is locked to the same webfont across devices"],
  [css.includes('--font-heavy:"Archivo Black","Arial Black",Arial,Helvetica,sans-serif'), "heavy/display role is locked to the same webfont across devices"],
  [css.includes('--font-mono:"Roboto Mono"'), "monospace role is locked to the same webfont across devices"],
  [css.includes('@media(max-width:1020px)') && css.includes('.animated-valie-wordmark__draw,.animated-valie-wordmark__fill'), "mobile parity guard exists after responsive rules"],
  [css.includes('.animated-valie-wordmark__draw,.animated-valie-wordmark__fill') && css.includes('font-family:var(--font-heavy)!important'), "VALIE wordmarks use the same display family on mobile"],
  [css.includes('.client-reviews__intro h2 em') && css.includes('font-family:var(--font-serif)!important'), "editorial serif accents retain desktop family on mobile"],
  [css.includes('.video-error span,.video-error button,.player-time,.player-title,.player-shortcuts,.simple-preview-tabs button') && css.includes('font-family:var(--font-mono)!important'), "player/utility mono typography has cross-device parity"],
  [!css.includes('font-family:Arial,Helvetica,sans-serif') && !css.includes('font-family:Georgia,"Times New Roman",serif') && !css.includes('font-family:"Arial Black",Arial,Helvetica,sans-serif'), "legacy platform-dependent explicit font-family declarations are removed"],
  [!css.includes(' system-ui') && !css.match(/font:[^;]*\sArial(?:[,;])/), "font shorthands no longer select platform-dependent system families"],
  [layout.includes('https://fonts.googleapis.com') && layout.includes('https://fonts.gstatic.com'), "font origins are preconnected"],
];

let ok = 0;
for (const [pass, label] of checks) {
  console.log(`${pass ? "PASS" : "FAIL"} ${label}`);
  if (pass) ok += 1;
}
console.log(`\nFont parity audit: ${ok}/${checks.length}`);
if (ok !== checks.length) process.exit(1);
