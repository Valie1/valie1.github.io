# VALIE Portfolio — Pass 123.24

GitHub Pages release for `https://valie1.github.io/`. Pass 123.24 fixes the GitHub Actions mobile viewport-stability audit introduced by Pass 123.23 without changing the intended scroll-cue overlay behavior. Initial cue visibility now derives from the stable hero geometry itself instead of reading the live `visualViewport`, so browser chrome cannot re-enter the fade calculation. The two SCROLL controls remain fixed overlays that fade out when the hero leaves and fade back in when it returns. All Pass 123.23 behavior and prior site fixes are retained.

Copy the contents of this folder into the local GitHub Desktop checkout for the `valie1.github.io` repository, keep the repository's hidden `.git` folder, commit the replacement, and push. In GitHub repository Settings → Pages, set Source to GitHub Actions.

Use `START-PASS-123.24-VIEWPORT-AUDIT-HOTFIX.bat` for a fresh local development preview at `http://localhost:3000`.

## Pass 123.06

### Mobile hero composition
The hero description is visible on phones again and uses a compact centered measure like desktop. VIEW WORK and CONTACT remain side by side on normal and narrow phones with smaller desktop-inspired pill proportions instead of becoming giant stacked full-width controls. Desktop is intentionally unchanged.

Pass 123.04 mobile review auto + swipe, Pass 123.02 Cookie Settings legal round trip, Pass 123.01 mobile software polish, Pass 123.00 viewport stability, mobile wordmark cleanup, static metadata fixes, and GitHub Pages deployment remain intact.

Mobile hero video play zone: on phones, long-form and short-form hero cards show their poster while approaching/leaving the center zone, play only while inside that zone, and unload back to the poster afterward. Desktop hero playback behavior remains unchanged.

## Pass 123.07 — Grey Website Cursor Click
Website project cards now use a neutral grey glass click affordance instead of the red circular arrow. The old arrow icon is replaced by a mouse-pointer click animation with a subtle ripple. Existing card lift/rotation, links, thumbnails, and tab behavior remain unchanged. Reduced-motion users receive a static cursor with no repeating animation.

## Pass 123.08 — Clean Work Tabs
Removed the tiny red underline marker beneath the active YOUTUBE LONG FORM / SHORTS / REELS / WEBSITES selector. The active capsule, tab switching, selected state, hover behavior, media grids, and Pass 123.07 website cursor-click affordance remain intact.


## Pass 123.09 — Mobile Scroll Overlay Stability
Mobile browser chrome height changes no longer resize the main hero geometry. The phone layout now captures a stable layout height, keeps live visual-viewport sizing only for true overlays, disables mobile hero scroll parallax that could amplify toolbar resize jitter, and keeps orientation changes intentional. Desktop behavior is unchanged.


## Pass 123.10 — Mobile Software Card Bounds
Mobile SOFTWARE I USE cards stay fully inside their section boundary with an even right-side inset on phones.

## Pass 123.11 — Mobile Review Carousel + Manual Swipe
The client reviews move continuously again on mobile while remaining fully native-scrollable by touch. Users can swipe left or right at any time; autoplay pauses during interaction, resumes shortly afterward, and loops through duplicated review sets without a visible end. Reduced-motion users keep manual swipe with autoplay disabled.


## Pass 123.12 — Cookie Settings → Legal Stacked Overlay
Cookie Policy, Privacy Policy, and Site Policies now open as a full-screen preloaded legal layer over Cookie Settings instead of closing the settings modal first. The existing fade/blur transition remains, each legal document is fully readable and scrollable, legal-document switching remains functional, and Back to Portfolio fades back to the exact Cookie Settings window that was already open, preserving its internal scroll position and returning focus to the link the user clicked.


## Pass 123.14 — Website Cursor True Center
The mouse-pointer icon inside each website-card circle is now locked to the exact geometric center of the circle. The repeating click motion no longer nudges the cursor up-left/down-right; it clicks by scaling in place, and the ripple ring now originates from exact 50% / 50% as well. Card hover, links, thumbnails, and all Pass 123.12 behavior remain unchanged.

### Pass 123.14 — Website cue true center
The WEBSITE hover cue now shares the same true center axis as the grey mouse-pointer circle and click ripple instead of appearing in the lower-right corner. Its hover/focus motion scales in place from the center, including the compact mobile treatment. All Pass 123.13 cursor/ripple centering and Pass 123.12 legal-overlay behavior are retained.


## Pass 123.15 — Remove Website Badge
The red WEBSITE cue/badge has been removed from website cards entirely. The centered pointer circle and click animation remain unchanged.


## Pass 123.16 — Mobile Review Autoplay Hardening
The mobile CLIENT REVIEWS rail now visibly advances by itself like desktop while still allowing native left/right finger swiping. The mobile runtime keeps its own floating-point autoplay position so sub-pixel frame steps cannot be rounded away by a phone browser, disables scroll snapping that could pull tiny autoplay steps back to the same card, syncs autoplay to the user’s manual swipe position, pauses while the user interacts, then resumes after the existing delay. Reduced-motion still keeps manual swipe and disables automatic movement.


## Pass 123.17 — Mobile Navigation + VALIE Wordmark Desktop Parity
Mobile WORK / ABOUT / REVIEWS / CONTACT now use an explicit touch-safe activation path instead of relying only on native anchor click behavior. A short tap on a mobile menu pill closes the menu and reliably scrolls to the matching section, with a pointer-up fallback for mobile browsers that suppress or delay synthetic clicks. The navigation runtime URL is cache-busted so deployed phones receive the new behavior immediately.

The mobile VALIE wordmarks now use the same transformation treatment as desktop: the header keeps the desktop outline draw → subtle glyph settle → solid resolve, and the footer keeps the desktop repeating outline/fill loop. The previous phone-only one-shot clear/resolve animation has been removed. Reduced-motion behavior remains unchanged.


## Pass 123.18 — Mobile Hero Performance Hardening
The phone hero keeps the same moving long-form/short-form lane composition, but mobile no longer decodes MP4s inside the continuously moving wall. It uses the existing poster frames instead, avoids per-card IntersectionObserver playback churn, reduces each duplicated lane sequence from six rendered cards to four on phones, moves the tracks with `translate3d`, removes the mobile reveal/shadow/mask work, simplifies the glass overlay, and disables the tiny infinite arrow bounce. The result keeps the hero visually alive through the moving lanes while dramatically reducing main-thread, decoder, paint, and compositor pressure. Desktop live hero-video playback is unchanged.



## Pass 123.21 — Cross-Device Font Parity
Desktop, tablet, and mobile now resolve the same typography roles from web-delivered families instead of relying on whatever Arial/Georgia/system font happens to exist on the device. Sans, editorial serif, VALIE/display, and monospace roles are centralized in CSS variables, and a final mobile guard prevents later responsive rules from switching font families. Responsive font sizing remains intact; only family parity is locked.

## Pass 123.20 — Mobile Nav + Never-Stop Review Carousel

- WORK / ABOUT / REVIEWS / CONTACT on the full-screen mobile menu now bypass the global hover-link preview interceptor and use direct touch-end/click activation with explicit section scrolling.
- The client-review carousel no longer pauses or waits after a finger swipe: manual movement continuously resyncs the autoplay position and the automatic drift keeps running immediately.
- Pass 123.19 live mobile hero-video parity and all prior behavior are retained.

## Pass 123.19 — Mobile Hero Live-Video Parity
Mobile now keeps the same six long-form and six short-form hero items as desktop and restores live MP4 playback instead of poster-only motion. Each hero item has a phone-optimized H.264 loop with the same content, 24 fps timing, and poster fallback; desktop continues to use the original 720p/406x720 loops. Mobile playback is bounded per lane, prewarmed near the viewport, and unloaded after a short cooldown when it leaves the active zone so the browser is not decoding every moving card at once. The moving lane animation remains GPU-transformed, while expensive moving lane masks and per-frame video filters stay replaced by static overlays. No hero cards are hidden on mobile.


## Pass 123.22 — Clean VALIE Wordmark Resolve
The header and footer VALIE transformations keep their outline-draw → solid-resolve behavior, but the outline layer no longer leaves faint extra glyphs to the right of the word. Draw and fill now use the same flowing glyph layout, so web-font metrics stay aligned on mobile and desktop, and the outline clears completely once the solid mark resolves.

## Pass 123.23 — Stable Mobile Hero Scroll-Cue Overlay

The two hero SCROLL controls are now a true portal overlay with mobile geometry locked to the stable layout height captured by the viewport runtime. They no longer ride browser-chrome height changes or translate/bounce on touch devices. The overlay stays fully visible while the main hero is present, fades out as the hero leaves the viewport, and fades back in when the hero is revisited. Both left and right controls share the same locked bottom axis. Pass 123.22 clean wordmark resolve and all prior mobile/desktop behavior remain intact.


## Pass 123.24 — Mobile Viewport Audit Hotfix

The GitHub Actions failure at **Audit mobile viewport stability** is fixed. `HeroScrollCues` no longer reads `window.visualViewport` when calculating its initial hero visibility. It derives that geometry from the already-stable hero height, while the IntersectionObserver still handles fade-out/fade-in as the hero leaves and re-enters the viewport. This keeps the Pass 123.23 overlay behavior intact and satisfies the deployment guard that intentionally rejects live visual-viewport dependencies in hero geometry. Runtime query strings are cache-busted to `v=123.24`.
