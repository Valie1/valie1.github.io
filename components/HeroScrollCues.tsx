"use client";

import { ChevronDown } from "lucide-react";
import { createPortal } from "react-dom";
import { useEffect, useState } from "react";

const REVEAL_DELAY_MS = 9350;
const HERO_EXIT_RATIO = 0.065;

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

    const syncInitialVisibility = () => {
      const rect = hero.getBoundingClientRect();
      const viewportHeight = Math.max(1, window.visualViewport?.height ?? window.innerHeight);
      const visiblePx = Math.max(0, Math.min(rect.bottom, viewportHeight) - Math.max(rect.top, 0));
      const visibleRatio = visiblePx / Math.max(1, Math.min(rect.height, viewportHeight));
      setInsideHero(visibleRatio > HERO_EXIT_RATIO);
    };

    syncInitialVisibility();

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        setInsideHero(entry.isIntersecting && entry.intersectionRatio > HERO_EXIT_RATIO);
      },
      { threshold: [0, HERO_EXIT_RATIO, 0.12, 0.25, 0.5, 1] },
    );

    observer.observe(hero);

    return () => {
      window.clearTimeout(timer);
      observer.disconnect();
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
