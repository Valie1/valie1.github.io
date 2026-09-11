# VALIE Portfolio — Pass 123.32

GitHub Pages release for `https://valie1.github.io/`. Pass 123.32 fixes the actual cause of the mobile CLIENT REVIEWS black strip on the right. A generic mobile `max-width:100%` containment rule was still forcing the review rail to the padded content width. Because the rail was shifted left for a full-bleed look, the right side stopped short of the phone viewport and exposed a dark strip.

Pass 123.32 makes the mobile review rail truly viewport-wide (`100dvw` with a `100vw` fallback), centers that breakout against the viewport, removes the inherited max-width clamp from the review viewport, disables BOTH review edge pseudo-elements, and keeps mask images disabled. Review swipe/autoplay remains unchanged; desktop review styling is untouched. Pass 123.30 scroll behavior and Pass 123.29 navigation fixes remain intact. Runtime navigation assets are cache-busted to `v=123.32`.

## Local preview

Use `START-PASS-123.32-FULL-BLEED-MOBILE-REVIEWS.bat` for a fresh local production-style preview.
