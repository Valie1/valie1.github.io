# Deployment notes — Pass 123.42

## What changed
- Keeps the Pass 123.41 mobile menu viewport and stacking fixes.
- Binds a click listener directly to each WORK / ABOUT / REVIEWS / CONTACT mobile anchor.
- Stops cancelling normal `#fragment` navigation with `preventDefault()` on mobile menu destinations.
- Closes the menu from the tapped anchor itself.
- Adds `hashchange` recovery so a successful hash navigation cannot remain hidden behind an open menu.
- Adds same-hash/fixed-header scroll correction.
- Cache-busted navigation runtime assets to 123.42.
- Package version bumped to 9.13.42.

## Deploy
1. Replace the previous project with this pass.
2. Push to GitHub and let Pages rebuild.
3. Hard refresh once on mobile so `site-nav-runtime.js?v=123.42` replaces the older cached runtime.
