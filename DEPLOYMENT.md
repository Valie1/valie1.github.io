# Deployment notes — Pass 123.51

1. Deploy this archive as the complete site source.
2. Let GitHub Pages finish the build/deploy workflow.
3. Hard refresh once on the phone so `site-nav-runtime.js?v=123.45` replaces the older cached runtime.
4. Test: open mobile menu, tap WORK/ABOUT/REVIEWS/CONTACT over an area where a video card would be underneath. The destination should navigate, the menu should close, and **no video modal should appear from that same tap**.
5. Also test tapping outside menu controls while the menu is open; background content must remain non-interactive.

Pass 123.45 specifically adds a 760 ms post-navigation ghost-click shield and document capture guard while retaining the strict modal lock and physical-tap navigation fixes.


## Pass 123.46 — Mobile review modal continuity
On mobile, opening a client review no longer tears down and restarts the review carousel. The rail keeps moving behind the review modal and, when the modal closes, continues from the position it naturally reached. Swipe syncing, seamless looping, reduced-motion behavior, page scroll locking, and modal focus behavior are preserved.

### Pass 123.47
Startup-only change: the homepage `app/loading.tsx` now renders `null`, so the full-page site skeleton cannot flash during the initial load on desktop or mobile. Existing media and legal loading states are retained.

### Pass 123.48

Browser/tab title now reads `VALIE | Creative Editor & Web Designer`. No layout or interaction behavior changed.


### Pass 123.49

The production site now uses `public/valie-social-preview-12349.png` (1200×630) for Open Graph and X/Twitter previews. Deploy the complete archive. Because Discord and other social apps cache embeds, the new image URL is versioned to reduce stale-image reuse; an already-cached page embed can still take time to refresh.

## Pass 123.50

Adds the client-only `TabTitleRuntime` visibility behavior. No deployment configuration changes are required.


## Pass 123.51

The browser favicon is now circular and the V is centered. After deployment, close/reopen the tab or hard refresh once if Chrome is still showing its cached favicon. The icon URL is versioned with `v=123.51` to reduce stale-cache reuse.
