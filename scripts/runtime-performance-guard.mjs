import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

const checks = [
  {
    name: "About/toolkit remains a server component",
    pass: !read("components/CreativeToolkit.tsx").startsWith('"use client"'),
  },
  {
    name: "Review rail has no app-level pause state",
    pass:
      read("components/ClientReviews.tsx").includes('className="review-orbit is-performance-paused"') &&
      !read("components/ClientReviews.tsx").includes("new IntersectionObserver") &&
      !read("components/ClientReviews.tsx").includes("orbitVisible") &&
      read("app/globals.css").includes(".review-orbit.is-performance-paused .review-orbit__track") &&
      read("app/globals.css").includes("animation-play-state:running!important"),
  },
  {
    name: "Review rail uses four seamless sets",
    pass:
      read("components/ClientReviews.tsx").includes("[0, 1, 2, 3].map") &&
      read("app/globals.css").includes("translate3d(-25%,0,0)"),
  },
  {
    name: "Work stage only promotes while switching",
    pass:
      read("app/globals.css").includes('.unified-work-stage[aria-busy="true"]') &&
      read("app/globals.css").includes("will-change:auto!important"),
  },
  {
    name: "Footer wordmark uses zero client runtime",
    pass:
      !fs.existsSync(path.join(root, "components/FooterWordmarkMotion.tsx")) &&
      !read("components/OnePageFooter.tsx").includes('"use client"') &&
      read("components/OnePageFooter.tsx").includes("footer-valie-static") &&
      read("app/globals.css").includes("footerValieGlyphLoop"),
  },
  {
    name: "Hidden hero scroll arrows suspend their infinite animation",
    pass: read("app/globals.css").includes("hero-scroll-cues--viewport:not(.is-interactive)"),
  },
  {
    name: "Mobile hero keeps live video with bounded decode/compositor work",
    pass:
      read("components/HeroVideoWall.tsx").includes('data-hero-mobile-src={item.mobileLoop}') &&
      read("components/HeroVideoWall.tsx").includes('root.classList.toggle("is-mobile-live-mode", mobileHero)') &&
      read("components/HeroVideoWall.tsx").includes("const mobilePerLaneLimit = constrainedDevice ? 1 : 2") &&
      read("components/HeroVideoWall.tsx").includes("scheduleMobileUnload") &&
      read("app/globals.css").includes("heroLaneUpMobilePerf") &&
      read("app/globals.css").includes(".hero-video-wall.is-mobile-live-mode .hero-media-card video") &&
      !read("app/globals.css").includes(".hero-media-card:nth-child(n+5)"),
  },
];

const failed = checks.filter((check) => !check.pass);
for (const check of checks) {
  console.log(`${check.pass ? "PASS" : "FAIL"} — ${check.name}`);
}

if (failed.length) {
  process.exitCode = 1;
} else {
  console.log(`Runtime performance guard passed: ${checks.length}/${checks.length} checks.`);
}
