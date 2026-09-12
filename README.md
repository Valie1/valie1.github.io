# VALIE Portfolio — Pass 123.52

This pass keeps the working Pass 123.43 physical mobile-menu navigation and the Pass 123.44 strict modal lock, then fixes the real-phone **ghost click** shown after tapping a mobile menu destination.

## Fix in this pass

On Android/Chromium, the menu closes on the physical `pointerup`/`touchend`. A trailing synthesized `click` can be generated immediately afterward, when the menu is already gone. That click can land on a video card now exposed underneath and open the video modal.

Pass 123.45 adds a short-lived, transparent full-viewport post-tap shield, a document-level trailing-click guard, and a direct video-modal safety gate. The shield is armed **before** the menu closes, swallows pointer/touch/click input for 760 ms, then removes itself. This prevents the same finger tap used on WORK / ABOUT / REVIEWS / CONTACT from falling through into portfolio videos or any other page control after navigation.

The strict lock while the menu is visibly open remains in place: background page content, videos, links, hero controls, desktop nav/brand, focus escape, and scrolling are blocked. Only the mobile menu rows and CLOSE are interactive.

Navigation assets are cache-busted to `123.45`; package version is `9.13.45`.


## Pass 123.46 — Mobile review modal continuity
On mobile, opening a client review no longer tears down and restarts the review carousel. The rail keeps moving behind the review modal and, when the modal closes, continues from the position it naturally reached. Swipe syncing, seamless looping, reduced-motion behavior, page scroll locking, and modal focus behavior are preserved.

## Pass 123.47 — Startup skeleton removal
The root route no longer renders the full-site loading skeleton. Initial desktop and mobile loads now stay on the site's base background until the actual page is ready, removing the brief skeleton flash at startup. Media-level loading states and legal-page loading states remain unchanged.

## Pass 123.48 — Browser title separator

Changed the site/browser title to `VALIE | Creative Editor & Web Designer`. All Pass 123.47 behavior is retained.


## Pass 123.49 — Custom Open Graph / social preview

The real portfolio now uses the supplied hero composition as its social sharing image. A production-ready 1200×630 PNG is stored at `public/valie-social-preview-12349.png`. Homepage Open Graph, X/Twitter, and shared per-route metadata all reference that static asset, which is safer for GitHub Pages and gives the image a new cache-busting URL. All Pass 123.48 site behavior is retained.

## Pass 123.50 — Tab leave and return title personality

The browser tab now reacts to page visibility without changing any page UI. When the visitor leaves the tab, the title cycles through the full approved editing themed away-message set. When the visitor returns, it cycles through the full approved welcome-back set and then restores the normal title `VALIE | Creative Editor & Web Designer` automatically. Messages contain no period, comma, or dash punctuation, and the emoji appears after the text as requested.


## Pass 123.51 — Circular centered browser icon

The browser/favicon mark is now a true circle with transparent corners instead of a rounded square. The white V is geometrically centered inside the 64×64 icon. The favicon URL is cache-busted to `123.51` in both document metadata and the web manifest so browsers are more likely to pick up the new icon immediately. All Pass 123.50 tab-title behavior and prior site fixes are retained.


## Pass 123.52 — Single tab title messages

The browser title no longer cycles through many messages during one leave or return. On the first visible load it shows `Welcome to VALIE 🎬` for 6.5 seconds and then restores the normal title. Each time the visitor leaves the tab, exactly one approved away message is selected and held unchanged until they return. On return, exactly one approved return message is shown for 6.5 seconds, then the title returns to `VALIE | Creative Editor & Web Designer`. The approved phrase sets are still used across separate leave and return events, but never rotate while one event is active.
