# Deployment notes — Pass 123.41

## What changed
- Raised the mobile navigation stacking context only while the menu is open.
- Bound the open menu to the live visual viewport on phones and foldables.
- Added compact portrait and short-landscape menu sizing fallbacks.
- Made mobile menu destination clicks deterministic after scroll lock is released.
- Hid hero scroll controls while the mobile menu is open.
- Cache-busted navigation runtime assets to 123.41.
- Package version bumped to 9.13.41.

## Deploy
1. Replace the previous project with this pass.
2. Push to GitHub and let Pages rebuild.
3. Hard refresh once on mobile if an older cached stylesheet/runtime is still visible.
