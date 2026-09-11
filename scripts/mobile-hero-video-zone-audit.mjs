import fs from "node:fs";

const source = fs.readFileSync("components/HeroVideoWall.tsx", "utf8");
const checks = [
  ["mobile breakpoint playback mode", 'window.matchMedia("(max-width: 700px)").matches'],
  ["video lane kind marker", "data-hero-kind={kind}"],
  ["mobile central play zone inset", "const mobilePlayZoneInset = Math.round((root.getBoundingClientRect().height || window.innerHeight) * 0.24)"],
  ["mobile central play zone observer", 'rootMargin: `-${mobilePlayZoneInset}px 0px -${mobilePlayZoneInset}px 0px`'],
  ["mobile entry threshold", "ratio > (mobileHero ? 0.12 : 0.08)"],
  ["one active video per lane", "const laneLeaders = new Map<string, HTMLVideoElement>()"],
  ["poster reset helper", "const resetToPoster = (video: HTMLVideoElement) =>"],
  ["source removed after leaving zone", 'video.removeAttribute("src")'],
  ["mobile inactive videos return to poster", "if (mobileHero) resetToPoster(video)"],
  ["desktop observer preserved", 'rootMargin: "70px 0px"'],
  ["native poster preserved", "poster={item.poster}"],
  ["mobile inline muted playback preserved", "playsInline"],
  ["lazy source loading preserved", 'preload="none"'],
];

const failed = checks.filter(([, token]) => !source.includes(token));
if (failed.length) {
  for (const [name] of failed) console.error(`FAIL: ${name}`);
  process.exit(1);
}

console.log(`Mobile hero video play-zone audit: ${checks.length}/${checks.length} checks passed.`);
