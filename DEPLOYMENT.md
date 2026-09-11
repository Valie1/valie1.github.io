# Deployment notes — Pass 123.43

## Mobile menu fix
- Added capture-phase pointerdown/pointerup activation for WORK / ABOUT / REVIEWS / CONTACT.
- Added touchend fallback for mobile engines that fail to synthesize an anchor click.
- Added coordinate hit-testing so a transparent/retargeted layer cannot make the visible menu row untappable.
- Mobile activation now explicitly closes the overlay, writes the destination hash, and scrolls to the section.
- Preserved native anchors as a keyboard/mouse fallback.
- Cache-busted navigation runtime assets to 123.43.
- Package version bumped to 9.13.43.

## Deploy
1. Replace the previous project contents with this pass.
2. Commit/push and wait for the GitHub Pages workflow to finish.
3. Hard refresh once on mobile so `site-nav-runtime.js?v=123.43` replaces the older cached runtime.
