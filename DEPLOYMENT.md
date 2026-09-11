# Deployment notes — Pass 123.45

1. Deploy this archive as the complete site source.
2. Let GitHub Pages finish the build/deploy workflow.
3. Hard refresh once on the phone so `site-nav-runtime.js?v=123.45` replaces the older cached runtime.
4. Test: open mobile menu, tap WORK/ABOUT/REVIEWS/CONTACT over an area where a video card would be underneath. The destination should navigate, the menu should close, and **no video modal should appear from that same tap**.
5. Also test tapping outside menu controls while the menu is open; background content must remain non-interactive.

Pass 123.45 specifically adds a 760 ms post-navigation ghost-click shield and document capture guard while retaining the strict modal lock and physical-tap navigation fixes.
