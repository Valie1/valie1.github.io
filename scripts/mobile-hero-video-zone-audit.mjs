import fs from "node:fs";
import path from "node:path";

const source = fs.readFileSync("components/HeroVideoWall.tsx", "utf8");
const css = fs.readFileSync("app/globals.css", "utf8");
const mobileDir = path.join(process.cwd(), "public", "media", "hero-mobile");
const mobileFiles = fs.existsSync(mobileDir) ? fs.readdirSync(mobileDir).filter((name) => name.endsWith(".mp4")) : [];

const checks = [
  ["mobile breakpoint live mode", 'window.matchMedia("(max-width: 700px)").matches'],
  ["mobile live-video class", 'root.classList.toggle("is-mobile-live-mode", mobileHero)'],
  ["mobile-specific live source attribute", "data-hero-mobile-src={item.mobileLoop}"],
  ["mobile source selection keeps video playback", "video.dataset.heroMobileSrc || video.dataset.heroSrc"],
  ["mobile decoder budget remains active", "mobileHero ? (constrainedDevice ? 2 : 4)"],
  ["mobile per-lane playback budget", "const mobilePerLaneLimit = constrainedDevice ? 1 : 2"],
  ["mobile live videos use observer", "if (maxPlaying > 0)"],
  ["mobile observer prewarms near viewport", 'rootMargin: "12% 0px"'],
  ["mobile unload cooldown reduces source churn", "scheduleMobileUnload"],
  ["native posters preserved", "poster={item.poster}"],
  ["lazy sources preserved", 'preload="none"'],
  ["all six long cards retained", (source.match(/mobileLoop: "\/media\/hero-mobile\/long-/g) || []).length === 6],
  ["all six short cards retained", (source.match(/mobileLoop: "\/media\/hero-mobile\/(?:rage|sequence)/g) || []).length === 6],
  ["twelve optimized mobile hero loops exist", mobileFiles.length === 12],
  ["mobile card truncation removed", !css.includes(".hero-media-card:nth-child(n+5)")],
  ["GPU mobile up transform", "@keyframes heroLaneUpMobilePerf"],
  ["GPU mobile down transform", "@keyframes heroLaneDownMobilePerf"],
  ["mobile live-video CSS mode", ".hero-video-wall.is-mobile-live-mode .hero-media-card video"],
  ["mobile reveal animation disabled", "animation:none!important"],
  ["mobile lane masks disabled", "mask-image:none!important"],
  ["mobile video filters replaced by static overlay", "filter:none!important"],
  ["performance class cleaned up", 'root.classList.remove("is-offscreen", "is-page-hidden", "is-mobile-live-mode")'],
];

const failed = checks.filter(([, token]) => typeof token === "boolean" ? !token : !(source.includes(token) || css.includes(token)));
if (failed.length) {
  for (const [name] of failed) console.error(`FAIL: ${name}`);
  process.exit(1);
}

console.log(`Mobile hero live-video parity audit: ${checks.length}/${checks.length} checks passed.`);
