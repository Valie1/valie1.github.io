# Deployment notes — Pass 123.44

## Mobile menu strict modal lock
- Preserved the working Pass 123.43 physical-tap navigation for WORK / ABOUT / REVIEWS / CONTACT.
- Made the underlying page inert and `aria-hidden` while the mobile menu is open.
- Made the VALIE brand and desktop navigation inert while the mobile menu is open.
- Added capture-phase blocking for pointerdown, pointerup, click, double-click, context menu, touchstart and touchend outside the menu/CLOSE control.
- Preserved wheel/touchmove blocking outside the menu.
- Added focus containment so focus cannot escape to the page behind the menu.
- Added a window-scroll guard so the background page cannot move while the menu is open.
- Added CSS pointer locks so only the CLOSE button and the mobile menu surfaces remain interactive.
- Cache-busted navigation runtime assets to 123.44.
- Package version bumped to 9.13.44.

## Deploy
1. Replace the previous project contents with this pass.
2. Commit/push and wait for the GitHub Pages workflow to finish.
3. Hard refresh once on mobile so `site-nav-runtime.js?v=123.44` replaces the older cached runtime.
