# Valie Portfolio — Pass 123.39

Pass 123.39 fixes the actual reason the mobile SCROLL arrows were not moving vertically. A mobile `transform:none!important` declaration was overriding the transform values produced by the desktop keyframe animation, so the animation could be assigned but the SVG could not physically move. That blocking declaration is removed. Mobile now reuses the exact desktop `pass94ScrollArrowFloat` 1.9s animation, explicitly runs it while the cue is visible, and keeps the existing hero fade-out / fade-back-in lifecycle from Pass 123.36.
