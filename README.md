# Valie Portfolio — Pass 123.35

Pass 123.35 keeps all Pass 123.34 behavior and hardens the mobile hero SCROLL visibility lifecycle so it behaves like desktop more reliably in real scrolling conditions. The SCROLL controls now re-check the hero bounds on scroll, resize, orientation changes, and visual viewport changes, and they only stay visible while the hero still occupies the active cue zone. That means the controls fade out after you move past the hero and fade back in when you return to the hero. The desktop-matching pulse/bounce animation and the smaller mobile size remain intact.
