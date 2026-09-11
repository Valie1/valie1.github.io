# Valie Portfolio — Pass 123.36

Pass 123.36 fixes the GitHub Actions build regression introduced in Pass 123.35 while retaining the requested mobile hero SCROLL lifecycle. The cues still use the exact desktop pulse/bounce animations from Pass 123.34, stay compact on phones, fade out after leaving the hero, and fade back in on return. The visibility fallback now derives geometry from the stable hero box and avoids `visualViewport`/RAF state, so it satisfies the existing mobile viewport stability and scroll-cue architecture audits used by the deployment workflow.
