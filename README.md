# VALIE Portfolio — Pass 123.33

GitHub Pages release for `https://valie1.github.io/`. Pass 123.33 keeps the Pass 123.32 CLIENT REVIEWS rail truly full-bleed on mobile, then adds back only a **small, symmetrical edge shadow/blur** on the left and right so clipped review cards fade naturally at the viewport edge without recreating the old wide black block.

The mobile edge treatment is intentionally narrow: 14px on normal phones and 12px on <=430px phones. Both sides use mirrored dark-to-transparent gradients, a light 1.5px backdrop blur, and matching soft inward shadows. The review viewport mask stays disabled, the rail stays `100dvw`, and swipe/autoplay behavior is unchanged. Desktop review styling remains untouched. Pass 123.30 hero SCROLL behavior and Pass 123.29 mobile navigation fixes are retained. Runtime navigation assets are cache-busted to `v=123.33`.

## Local preview

Use `START-PASS-123.33-MOBILE-REVIEW-EDGE-SHADOWS.bat` for a fresh local production-style preview.
