# GitHub Pages Deployment

Production URL: `https://valie1.github.io/`

1. Open the existing `valie1.github.io` repository in GitHub Desktop.
2. Choose Repository → Show in Explorer.
3. Keep the hidden `.git` folder and remove the old website files from the repository working tree.
4. Copy every file and folder from Pass 123.33 into the repository root, including the hidden `.github` folder.
5. In GitHub Desktop, review the changes, commit them to the current default branch, and Push origin.
6. On GitHub.com, open Settings → Pages and set Build and deployment → Source to GitHub Actions.
7. Open the Actions tab and wait for `Deploy VALIE Portfolio to GitHub Pages` to finish successfully.
8. Open `https://valie1.github.io/` and hard refresh once if the previous site was cached.

The workflow installs the pinned dependencies, runs TypeScript and GitHub Pages compatibility checks, exports the site to `out/`, uploads that folder as the Pages artifact, and deploys it.

### Pass 123.07
No deployment changes. Website card hover affordances are visual-only and remain compatible with the existing GitHub Pages static export workflow.

### Pass 123.08
No deployment changes. This pass only removes the small active-tab underline marker from the three work-category tabs.


### Pass 123.09
No deployment architecture changes. This pass hardens mobile browser-chrome/viewport scrolling while retaining the same GitHub Pages static-export workflow.


### Pass 123.12
No deployment architecture changes. Cookie Settings legal links now use the existing preloaded legal portal as a stacked overlay, so the settings modal remains mounted underneath throughout the fade/blur transition and is revealed in-place when Back to Portfolio is used.


### Pass 123.14
No deployment architecture changes. The website-card cursor and click ripple are now optically/geometrically centered inside the existing circular affordance.

## Pass 123.14
No deployment architecture changes. Website card hover/click cues are now composed on the card center axis; the former lower-right WEBSITE cue anchor is removed.


## Pass 123.15 — Remove Website Badge
The red WEBSITE cue/badge has been removed from website cards entirely. The centered pointer circle and click animation remain unchanged.


## Pass 123.16 — Mobile Review Autoplay Hardening
No deployment architecture changes. This pass hardens the existing client-side mobile review carousel so automatic motion remains visible on mobile browsers while preserving manual left/right touch scrolling.


## Pass 123.17 — Mobile Navigation + VALIE Wordmark Desktop Parity
No deployment architecture changes. The static mobile navigation runtime is cache-busted to `v=123.17`, adds explicit touch-safe section navigation, and the mobile VALIE header/footer animations now mirror the desktop transformations.


## Pass 123.18 — Mobile Hero Performance Hardening
No deployment architecture changes. Mobile now runs the hero wall in poster-motion mode to remove video-decoder and observer churn while preserving the moving composition. Desktop keeps live hero video playback. Runtime query strings are cache-busted to `v=123.18`.


## Pass 123.19 — Mobile Hero Live-Video Parity
No deployment architecture changes. Mobile hero cards use live phone-optimized MP4 loops from `public/media/hero-mobile/` while desktop keeps the original hero-loop assets. All six items per lane remain rendered. Runtime query strings for that pass were cache-busted to `v=123.19`.


## Pass 123.20 — Mobile Nav + Never-Stop Review Carousel
Mobile menu links now own touch navigation directly and are excluded from the hover-link preview interceptor. The mobile review rail keeps autoplay active through and immediately after manual swipes. Runtime query strings are cache-busted to `v=123.20`.


## Pass 123.21 — Cross-Device Font Parity
No deployment architecture changes. Typography is now cross-device deterministic through Google Fonts CSS plus font-origin preconnects. Runtime navigation/link-preview query strings are cache-busted to `v=123.21`.


## Pass 123.22 — Clean VALIE Wordmark Resolve
No deployment architecture changes. Header/footer wordmark markup and CSS are corrected for metric-safe outline/fill alignment; runtime query strings are cache-busted to `v=123.23`.

## Pass 123.23 — Stable Mobile Hero Scroll-Cue Overlay
No deployment architecture changes. The hero scroll controls remain client-rendered, but their mobile portal overlay is now locked to `--valie-mobile-layout-height` and visibility is driven by hero intersection instead of per-scroll position updates. Runtime query strings are cache-busted to `v=123.23`.


## Pass 123.24 — Mobile Viewport Audit Hotfix
No deployment architecture changes. This pass removes the remaining `visualViewport` read from `HeroScrollCues` initial visibility geometry so the GitHub Actions `mobile:viewport-stability:audit` passes again. Runtime query strings are cache-busted to `v=123.24`.


## Pass 123.25 — Mobile Menu Modal + Navigation Hotfix
No deployment architecture changes. The static `site-nav-runtime.js` now owns mobile touch/pen activation and modal background isolation, and the runtime query strings are cache-busted to `v=123.27`. Push the replacement normally and let the existing GitHub Actions Pages workflow deploy it.

## Pass 123.27 — Mobile Review Edge Fade Parity
No deployment architecture changes. This pass is a CSS-only mobile review edge-mask correction plus a targeted audit. Push the replacement normally and let the existing GitHub Actions Pages workflow deploy it.


## Pass 123.27 — Mobile Scroll Cues: Desktop Behavior Parity

Mobile hero SCROLL cues now deliberately inherit the desktop behavior and animation treatment. The only mobile-specific difference is their safe-area-aware position. No deployment architecture changes were made.



## Pass 123.30 — Mobile Scroll Desktop Lifecycle + Smaller Controls
No deployment architecture changes. The mobile SCROLL overlay still uses the existing client-rendered portal and stable mobile layout height. This pass fixes the mobile armed-but-outside-hero opacity cascade so the controls fade out and back in with the same lifecycle as desktop, and reduces only the phone circle size to 46px/44px. Navigation runtime URLs are cache-busted to `v=123.30`. Push normally through the existing GitHub Actions Pages workflow.

## Pass 123.29 — Mobile Menu Native Anchor Fix
No deployment architecture changes. Mobile menu destinations now use native same-document hash anchors and the static menu runtime no longer prevents their default click navigation. Both navigation runtime URLs are cache-busted to `v=123.29`, so the updated phone behavior is fetched after deployment. Push normally through the existing GitHub Actions Pages workflow.


## Pass 123.32 — Remove Mobile Review Right Block
No deployment architecture changes. On mobile, the CLIENT REVIEWS right-edge pseudo-element is disabled completely and viewport mask images are explicitly removed. Runtime URLs are cache-busted to `v=123.32`. Push normally through the existing GitHub Actions Pages workflow.


## Pass 123.32 — Full-Bleed Mobile Reviews
No deployment architecture changes. The mobile CLIENT REVIEWS rail now breaks out of the padded section to the real viewport width and both edge-cover pseudo-elements are removed. This fixes the uncovered black strip at the right edge. Runtime URLs are cache-busted to `v=123.32`.

## Pass 123.33 — Compact Mobile Review Edge Shadows
No deployment architecture changes. The Pass 123.32 full-bleed mobile review rail is retained. Mobile CLIENT REVIEWS now adds only narrow 14px (12px on <=430px) mirrored edge shadow/blur overlays, with the broad viewport mask still disabled. Runtime URLs are cache-busted to `v=123.33`. Push normally through the existing GitHub Actions Pages workflow.
