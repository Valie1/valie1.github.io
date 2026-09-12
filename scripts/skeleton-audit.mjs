import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const exists = (file) => fs.existsSync(path.join(root, file));
const assert = (condition, message) => {
  if (!condition) {
    console.error(`✖ ${message}`);
    process.exitCode = 1;
  } else {
    console.log(`✓ ${message}`);
  }
};

const loading = read("app/loading.tsx");
const skeleton = read("components/Skeleton.tsx");
const image = read("components/PortfolioImage.tsx");
const loadedImage = read("components/LoadedImage.tsx");
const hero = read("components/HeroVideoWall.tsx");
const player = read("components/CustomVideoPlayer.tsx");
const reviews = read("components/ClientReviews.tsx");
const contact = read("components/OnePageContact.tsx");
const toolkit = read("components/CreativeToolkit.tsx");
const legalShell = read("components/LegalLoadingSkeleton.tsx");
const css = read("app/globals.css");

assert(/return\s+null\s*;/.test(loading) && !loading.includes("SiteLoadingSkeleton"), "homepage route loading is blank so no full-site skeleton flashes on first paint");
assert(skeleton.includes("valie-skeleton"), "reusable skeleton primitive exists");

assert(image.includes("showSkeleton") && image.includes("SETTLE_MS") && image.includes("media-skeleton"), "portfolio media delays fast-load skeleton flash and crossfades out after decode");
assert(loadedImage.includes("SETTLE_MS") && loadedImage.includes("loaded-image__skeleton"), "fixed-size contact/tool images use the same anti-flicker skeleton handoff");
assert(contact.includes("LoadedImage") && contact.includes("one-contact-profile__image-skeleton") && contact.includes("one-contact-channel__icon-skeleton"), "contact profile and channel icons have real loading states");
assert(toolkit.includes("LoadedImage") && toolkit.includes("software-card__icon-skeleton"), "software icons have real loading states");

assert(hero.includes("hero-media-card__skeleton"), "hero media cards retain poster skeletons");
assert(css.includes(".hero-media-card__skeleton::after{animation-iteration-count:2}"), "hidden hero skeleton sweeps stop after the initial loading window");
assert(player.includes("youtubeSkeletonVisible") && player.includes("settleYouTubeFrame"), "YouTube iframe skeleton overlaps the iframe fade instead of disappearing abruptly");
assert(player.includes("video-loading--skeleton media-skeleton"), "short local buffering stalls are protected from skeleton flash");
assert(reviews.includes("activeSkeletonVisible") && reviews.includes("settleActiveImage"), "review screenshot skeleton fades out after the real image starts appearing");

for (const route of ["privacy", "policies", "cookies"]) {
  const file = `app/${route}/loading.tsx`;
  assert(exists(file) && read(file).includes("LegalLoadingSkeleton"), `${route} uses the lightweight legal-page skeleton`);
}
assert(legalShell.includes("legal-loading-skeleton__section"), "legal skeleton mirrors policy sections");

assert(css.includes("@keyframes valieSkeletonSweep117"), "final seamless skeleton sweep keyframes are defined");
assert(css.includes("@keyframes valieMediaSkeletonReveal"), "fast-load anti-flicker reveal delay is defined");
assert(css.includes("content-visibility:auto"), "offscreen route-shell sections can defer paint work");
assert(css.includes("prefers-reduced-motion:reduce") && css.includes(".valie-skeleton::after{animation:none!important"), "reduced-motion disables skeleton sweep");
assert(!css.includes("animation:valieSkeletonSweep117 1.58s ease"), "final skeleton loop stays linear and avoids eased reset timing");

if (process.exitCode) process.exit(process.exitCode);
console.log("Skeleton audit passed.");
