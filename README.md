# VALIE Portfolio — Pass 123.15

GitHub Pages release for `https://valie1.github.io/`. Pass 123.06 polishes the mobile hero so the description and CTA pair match the compact desktop composition instead of disappearing or expanding into oversized full-width stacked buttons.

Copy the contents of this folder into the local GitHub Desktop checkout for the `valie1.github.io` repository, keep the repository's hidden `.git` folder, commit the replacement, and push. In GitHub repository Settings → Pages, set Source to GitHub Actions.

Use `START-PASS-123.15-NO-WEBSITE-BADGE.bat` for a fresh local development preview at `http://localhost:3000`.

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
