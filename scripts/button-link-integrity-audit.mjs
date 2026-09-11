import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const errors = [];
const notes = [];

const read = (rel) => fs.readFileSync(path.join(root, rel), "utf8");
const exists = (rel) => fs.existsSync(path.join(root, rel));
const fail = (message) => errors.push(message);

function walk(dir, extensions = new Set([".tsx", ".ts"])) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name === ".next") continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full, extensions));
    else if (extensions.has(path.extname(entry.name))) out.push(full);
  }
  return out;
}

function isHttpUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function assertLocalPublicPath(value, label) {
  if (!value?.startsWith("/")) return;
  const rel = path.join("public", value.replace(/^\/+/, ""));
  if (!exists(rel)) fail(`${label} points to missing public file: ${value}`);
}

const sourceFiles = [...walk(path.join(root, "app")), ...walk(path.join(root, "components")), ...walk(path.join(root, "lib"))];
const source = sourceFiles.map((file) => fs.readFileSync(file, "utf8")).join("\n");


for (const pattern of [
  /href\s*=\s*["']\s*["']/g,
  /href\s*=\s*["']#["']/g,
  /href\s*=\s*["']javascript:/gi,
]) {
  if (pattern.test(source)) fail(`Found a dead/unsafe href matching ${pattern}.`);
}


for (const file of sourceFiles.filter((file) => file.endsWith(".tsx"))) {
  const text = fs.readFileSync(file, "utf8");
  const buttonRegex = /<button\b([^>]*)>/gs;
  let match;
  while ((match = buttonRegex.exec(text))) {
    if (!/\btype\s*=/.test(match[1])) {
      const line = text.slice(0, match.index).split("\n").length;
      fail(`${path.relative(root, file)}:${line} has a <button> without an explicit type.`);
    }
  }
}


const page = read("app/page.tsx");
const work = read("components/UnifiedWorkShowcase.tsx");
const contact = read("components/OnePageContact.tsx");
const anchorSources = `${page}\n${work}\n${contact}`;
for (const id of ["top", "work", "about", "reviews", "contact", "long-form", "short-form", "websites"]) {
  const idPattern = new RegExp(`id=["']${id}["']`);
  if (!idPattern.test(anchorSources)) fail(`Required anchor #${id} is missing.`);
}

const nav = read("components/SiteNav.tsx");
for (const href of ["#work", "#about", "#reviews", "#contact"]) {
  if (!nav.includes(`"${href}"`)) fail(`Primary/mobile navigation is missing ${href}.`);
}

const heroCues = read("components/HeroScrollCues.tsx");
if (!heroCues.includes('href="#about"')) fail("Hero scroll cue no longer points to #about.");


const footer = read("components/OnePageFooter.tsx");
for (const [href, routeFile] of [["/privacy", "app/privacy/page.tsx"], ["/cookies", "app/cookies/page.tsx"], ["/policies", "app/policies/page.tsx"]]) {
  if (!footer.includes(`href="${href}"`)) fail(`Footer is missing ${href}.`);
  if (!exists(routeFile)) fail(`Footer destination ${href} has no route file (${routeFile}).`);
}
if (footer.includes('"use client"') || footer.includes("useEffect") || footer.includes("useState")) fail("Footer legal controls unexpectedly re-entered a client hydration boundary.");
if (!footer.includes('className="cookie-settings-trigger"') || !footer.includes("COOKIE SETTINGS")) fail("Footer COOKIE SETTINGS control is missing.");


const notFound = read("app/not-found.tsx");
for (const href of ["/#top", "/#work", "/#about", "/#contact"]) {
  if (!notFound.includes(`"${href}"`) && !notFound.includes(`href="${href}"`)) fail(`404 recovery navigation is missing ${href}.`);
}


const requiredControls = [
  ["components/OnePageVideoShowcase.tsx", "one-video-modal__close", "video modal close"],
  ["components/ClientReviews.tsx", "review-lightbox__close", "review modal close"],
  ["components/GlobalFeedback.tsx", "global-feedback__close", "feedback dismiss"],
  ["components/CustomVideoPlayer.tsx", "RETRY", "video retry"],
  ["app/error.tsx", "TRY AGAIN", "route error retry"],
  ["app/global-error.tsx", "TRY AGAIN", "global error retry"],
];
for (const [file, token, label] of requiredControls) {
  if (!read(file).includes(token)) fail(`Missing ${label} control in ${file}.`);
}



const content = JSON.parse(read("content/portfolio.json"));
for (const project of content.projects ?? []) {
  if (project.status !== "published") continue;
  const label = `project ${project.slug}`;
  assertLocalPublicPath(project.media?.hero, `${label} hero`);
  assertLocalPublicPath(project.media?.previewVideo, `${label} previewVideo`);
  assertLocalPublicPath(project.media?.hoverVideo, `${label} hoverVideo`);
  for (const [index, frame] of (project.media?.frames ?? []).entries()) {
    assertLocalPublicPath(frame?.src, `${label} frame ${index + 1}`);
  }

  if (project.category === "web") {
    const liveUrl = project.website?.liveUrl?.trim();
    if (!liveUrl || !isHttpUrl(liveUrl)) fail(`${label} website card lacks a valid http(s) liveUrl.`);
  } else {
    const playback = project.media?.playbackUrl?.trim();
    const preview = project.media?.previewVideo?.trim();
    const validPlayback = Boolean(playback && (playback.startsWith("/") || isHttpUrl(playback)));
    const validPreview = Boolean(preview && (preview.startsWith("/") || isHttpUrl(preview)));
    if (!validPlayback && !validPreview) fail(`${label} play card has no usable playbackUrl or previewVideo.`);
  }
}


const email = content.site?.email?.trim();
if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) fail("Site email is invalid, which would break the email contact action.");
const contactSource = read("components/OnePageContact.tsx");
if (!contactSource.includes("https://discord.com/users/")) fail("Discord contact action is missing a Discord user URL.");
if (!contactSource.includes("mailto:${site.email}")) fail("Email contact action is no longer wired to site.email.");


const contentLib = read("lib/content.ts");
for (const helper of ["getProjectPlaybackSource", "getProjectWebsiteUrl", "isSafeProjectUrl"]) {
  if (!contentLib.includes(`function ${helper}`)) fail(`Missing runtime URL guard helper ${helper}.`);
}

if (errors.length) {
  console.error("Button/link integrity audit FAILED:\n");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

notes.push(`checked ${sourceFiles.length} source files`);
notes.push(`checked ${(content.projects ?? []).filter((project) => project.status === "published").length} published project cards`);
console.log(`Button/link integrity audit passed (${notes.join(", ")}).`);
