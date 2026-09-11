# Valie Portfolio — Pass 123.38

Pass 123.38 fixes the mobile hero SCROLL arrow animation so it matches desktop exactly. The circular button continues to use the desktop `cnhWhiteScrollPulse` animation and the arrow inside now uses the desktop `cnhArrowBounce` up/down animation with the same 2s timing. This forced parity block is intentionally placed last and is also kept active for mobile even when reduced-motion is requested, because the user explicitly asked for the desktop SCROLL cue behavior. All prior hero fade-in / fade-out / return behavior from Pass 123.36 is retained.
