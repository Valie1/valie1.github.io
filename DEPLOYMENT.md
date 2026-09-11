# Deployment notes — Pass 123.38

## What changed
- Fixed the mobile hero SCROLL arrow so it bounces up/down exactly like desktop.
- Reasserted the desktop pulse for the mobile circle.
- Kept the forced mobile animation parity block last in CSS so older overrides cannot cancel it.
- Retained the hero-only visibility lifecycle from Pass 123.36.
- Package version bumped to 9.13.38.

## Deploy
1. Replace the previous project with this pass.
2. Push to GitHub and let Actions rebuild.
3. Hard refresh on mobile after deploy if the browser still shows an older cached chunk.
