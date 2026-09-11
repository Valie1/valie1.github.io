"use client";

import { ChevronDown } from "lucide-react";
import { createPortal } from "react-dom";
import { useEffect, useState } from "react";

const REVEAL_DELAY_MS = 9350;
const HERO_EXIT_RATIO = 0.85;

export default function HeroScrollCues() {
  const [mounted, setMounted] = useState(false);
  const [armed, setArmed] = useState(false);
  const [insideHero, setInsideHero] = useState(true);

  useEffect(() => {
    setMounted(true);
    const timer = window.setTimeout(() => setArmed(true), REVEAL_DELAY_MS);
    const hero = document.getElementById("top");

    if (!hero) {
      setInsideHero(false);
      return () => window.clearTimeout(timer);
    }

    let lastInsideHero: boolean | null = null;

    const syncHeroVisibility = () => {
      const rect = hero.getBoundingClientRect();
      const viewportHeight = Math.max(rect.height, 1);
      const visiblePx = Math.max(0, Math.min(rect.bottom, viewportHeight) - Math.max(rect.top, 0));
      const visibleRatio = visiblePx / Math.max(1, Math.min(rect.height, viewportHeight));
      const nextInsideHero = rect.bottom > 0 && rect.top < viewportHeight && visibleRatio > HERO_EXIT_RATIO;

      if (lastInsideHero === nextInsideHero) return;
      lastInsideHero = nextInsideHero;
      setInsideHero(nextInsideHero);
    };

    syncHeroVisibility();

    const observer = new IntersectionObserver(
      () => syncHeroVisibility(),
      { threshold: [0, 0.12, 0.25, 0.5, 0.75, HERO_EXIT_RATIO, 0.95, 1] },
    );
    observer.observe(hero);

    window.addEventListener("scroll", syncHeroVisibility, { passive: true });
    window.addEventListener("resize", syncHeroVisibility, { passive: true });
    window.addEventListener("orientationchange", syncHeroVisibility, { passive: true });

    return () => {
      window.clearTimeout(timer);
      observer.disconnect();
      window.removeEventListener("scroll", syncHeroVisibility);
      window.removeEventListener("resize", syncHeroVisibility);
      window.removeEventListener("orientationchange", syncHeroVisibility);
    };
  }, []);

  if (!mounted) return null;

  const visible = armed && insideHero;

  const overlay = (
    <div
      className={`hero-scroll-cues hero-scroll-cues--viewport${armed ? " is-armed" : ""}${visible ? " is-visible is-interactive" : ""}`}
      data-valie-overlay="hero-scroll-cues"
      aria-label="Scroll to the next section"
      aria-hidden={!visible}
    >
      <a
        className="hero-scroll-cue hero-scroll-cue--left"
        href="#about"
        aria-label="Scroll down to About"
        tabIndex={visible ? 0 : -1}
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
