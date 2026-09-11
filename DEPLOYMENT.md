# Deployment notes — Pass 123.39

## Actual bug fixed
The mobile arrow already had an animation name, but `transform:none!important` on the SVG had higher cascade priority than animation-generated transforms. As a result, opacity could animate while the arrow itself stayed in one vertical position.

## Fix
- Removed the blocking `transform:none!important` from the mobile SCROLL arrow SVG.
- Reused the exact desktop `pass94ScrollArrowFloat` 1.9s keyframes.
- Explicitly sets `animation-play-state: running` while the hero cue is visible.
- Keeps the requested animation active on mobile even under reduced-motion, per the user's explicit request.
- Retains Pass 123.36 hero enter/leave fade lifecycle and all later review/menu fixes.

Package version: 9.13.39.
