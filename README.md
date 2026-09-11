# VALIE Portfolio — Pass 123.45

This pass keeps the working Pass 123.43 physical mobile-menu navigation and the Pass 123.44 strict modal lock, then fixes the real-phone **ghost click** shown after tapping a mobile menu destination.

## Fix in this pass

On Android/Chromium, the menu closes on the physical `pointerup`/`touchend`. A trailing synthesized `click` can be generated immediately afterward, when the menu is already gone. That click can land on a video card now exposed underneath and open the video modal.

Pass 123.45 adds a short-lived, transparent full-viewport post-tap shield, a document-level trailing-click guard, and a direct video-modal safety gate. The shield is armed **before** the menu closes, swallows pointer/touch/click input for 760 ms, then removes itself. This prevents the same finger tap used on WORK / ABOUT / REVIEWS / CONTACT from falling through into portfolio videos or any other page control after navigation.

The strict lock while the menu is visibly open remains in place: background page content, videos, links, hero controls, desktop nav/brand, focus escape, and scrolling are blocked. Only the mobile menu rows and CLOSE are interactive.

Navigation assets are cache-busted to `123.45`; package version is `9.13.45`.
