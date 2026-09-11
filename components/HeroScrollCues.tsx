"use client";

import { ChevronDown } from "lucide-react";
import { createPortal } from "react-dom";
import { useEffect, useState, type CSSProperties } from "react";

const REVEAL_DELAY_MS = 9350;

export default function HeroScrollCues() {
  const [mounted, setMounted] = useState(false);
  const [armed, setArmed] = useState(false);
  const [heroOpacity, setHeroOpacity] = useState(1);

  useEffect(() => {
    setMounted(true);

    const timer = window.setTimeout(() => setArmed(true), REVEAL_DELAY_MS);
    let raf = 0;

    const updateHeroFade = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        raf = 0;
        const hero = document.getElementById("top");
        if (!hero) {
          setHeroOpacity(0);
          return;
        }

        const rect = hero.getBoundingClientRect();
        const viewportHeight = Math.max(rect.height, 1);
        const travelled = Math.max(0, -rect.top);






        const fadeStart = viewportHeight * 0.06;
        const fadeEnd = viewportHeight * 0.30;
        const progress = Math.min(1, Math.max(0, (travelled - fadeStart) / Math.max(1, fadeEnd - fadeStart)));


        const eased = progress * progress * (3 - 2 * progress);
        setHeroOpacity(1 - eased);
      });
    };

    updateHeroFade();
    window.addEventListener("scroll", updateHeroFade, { passive: true });
    window.addEventListener("resize", updateHeroFade, { passive: true });

    return () => {
      window.clearTimeout(timer);
      if (raf) window.cancelAnimationFrame(raf);
      window.removeEventListener("scroll", updateHeroFade);
      window.removeEventListener("resize", updateHeroFade);
    };
  }, []);

  if (!mounted) return null;

  const visible = armed && heroOpacity > 0.015;
  const interactive = armed && heroOpacity > 0.18;

  const overlay = (
    <div
      className={`hero-scroll-cues hero-scroll-cues--viewport${armed ? " is-armed" : ""}${interactive ? " is-interactive" : ""}`}
      style={{ "--hero-scroll-opacity": heroOpacity } as CSSProperties}
      aria-label="Scroll to the next section"
      aria-hidden={!visible}
    >
      <a
        className="hero-scroll-cue hero-scroll-cue--left"
        href="#about"
        aria-label="Scroll down to About"
        tabIndex={interactive ? 0 : -1}
      >
        <span className="hero-scroll-cue__circle" aria-hidden="true">
          <ChevronDown size={22} strokeWidth={1.45} />
        </span>
        <span className="hero-scroll-cue__label">SCROLL</span>
      </a>

      <a
        className="hero-scroll-cue hero-scroll-cue--right"
        href="#about"
        aria-hidden="true"
        tabIndex={-1}
      >
        <span className="hero-scroll-cue__circle" aria-hidden="true">
          <ChevronDown size={22} strokeWidth={1.45} />
        </span>
        <span className="hero-scroll-cue__label">SCROLL</span>
      </a>
    </div>
  );

  return createPortal(overlay, document.body);
}
