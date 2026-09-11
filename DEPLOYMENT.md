# Deployment notes — Pass 123.36

## Fix
Pass 123.35 failed the GitHub Pages build during `mobile:viewport-stability:audit`. The new cue lifecycle used live viewport geometry (`window.innerHeight` / `visualViewport`) and RAF, which violated the project's existing stability guard.

Pass 123.36 keeps the desired behavior but restores the expected architecture:
- stable hero-derived visibility geometry;
- IntersectionObserver remains the primary lifecycle source;
- passive scroll/resize/orientation fallbacks for mobile browser chrome edge cases;
- no `visualViewport` dependency in HeroScrollCues;
- no requestAnimationFrame scroll-opacity state;
- desktop pulse/bounce animations and compact mobile sizing retained.

Package version: 9.13.36.
