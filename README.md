# VALIE Portfolio — Pass 123.42

Mobile-menu native-tap reliability hotfix.

This pass keeps the Pass 123.41 mobile menu layout, but changes destination activation to a more reliable touch-browser path: every WORK / ABOUT / REVIEWS / CONTACT anchor now closes the overlay from a direct anchor listener while preserving the browser's real native `#fragment` navigation. A `hashchange` recovery path and same-hash scroll correction are included so the menu cannot remain stuck over a successfully-selected destination.
