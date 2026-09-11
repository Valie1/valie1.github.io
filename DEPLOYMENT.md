# Deployment notes — Pass 123.35

This pass keeps the mobile hero SCROLL controls visually matched to desktop and hardens their visibility lifecycle.

## What changed
- The mobile hero SCROLL controls now re-evaluate hero visibility on scroll, resize, orientation changes, and visual viewport changes.
- The controls fade out after the user scrolls past the hero section.
- The controls fade back in when the user scrolls back into the hero section.
- The desktop pulse/bounce animation parity from Pass 123.34 remains intact.
- Package version bumped to 9.13.35.

## Deploy
1. Replace the previous project with this pass.
2. Run the normal production build/deploy flow.
3. Hard refresh on mobile after deploy if an older cached chunk is still shown.
