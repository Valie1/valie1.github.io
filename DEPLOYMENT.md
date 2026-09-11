# GitHub Pages Deployment

Production URL: `https://valie1.github.io/`

1. Open the existing `valie1.github.io` repository in GitHub Desktop.
2. Choose Repository → Show in Explorer.
3. Keep the hidden `.git` folder and remove the old website files from the repository working tree.
4. Copy every file and folder from Pass 123.19 into the repository root, including the hidden `.github` folder.
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
No deployment architecture changes. Mobile hero cards now use live phone-optimized MP4 loops from `public/media/hero-mobile/` while desktop keeps the original hero-loop assets. All six items per lane remain rendered. Runtime query strings are cache-busted to `v=123.19`.
