"use client";

import { ChevronDown } from "lucide-react";
import { createPortal } from "react-dom";
import { useEffect, useState } from "react";

const REVEAL_DELAY_MS = 9350;
const HERO_MIN_VISIBLE_RATIO = 0.08;

function isHeroInCueZone(hero: HTMLElement) {
  const rect = hero.getBoundingClientRect();
  const viewportHeight = Math.max(window.innerHeight || document.documentElement.clientHeight || 0, 1);
  const viewportWidth = Math.max(window.innerWidth || document.documentElement.clientWidth || 0, 1);
  const isMobile = viewportWidth <= 760;

  const visibleTop = Math.max(rect.top, 0);
  const visibleBottom = Math.min(rect.bottom, viewportHeight);
  const visibleHeight = Math.max(0, visibleBottom - visibleTop);
  const denominator = Math.max(1, Math.min(rect.height || viewportHeight, viewportHeight));
  const visibleRatio = visibleHeight / denominator;

  const topGate = viewportHeight * (isMobile ? 0.42 : 0.48);
  const bottomGate = viewportHeight * (isMobile ? 0.82 : 0.7);

  return visibleRatio > HERO_MIN_VISIBLE_RATIO && rect.top <= topGate && rect.bottom >= bottomGate;
}

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

    let frame = 0;

    const syncInsideHero = () => {
      frame = 0;
      setInsideHero(isHeroInCueZone(hero));
    };

    const requestSync = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(syncInsideHero);
    };

    syncInsideHero();

    const observer = new IntersectionObserver(requestSync, {
      threshold: [0, 0.04, 0.1, 0.2, 0.35, 0.5, 0.75, 1],
      rootMargin: "0px",
    });
    observer.observe(hero);

    window.addEventListener("scroll", requestSync, { passive: true });
    window.addEventListener("resize", requestSync, { passive: true });
    window.addEventListener("orientationchange", requestSync, { passive: true });
    window.visualViewport?.addEventListener("resize", requestSync, { passive: true });
    document.addEventListener("visibilitychange", requestSync);

    return () => {
      window.clearTimeout(timer);
      if (frame) window.cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("scroll", requestSync);
      window.removeEventListener("resize", requestSync);
      window.removeEventListener("orientationchange", requestSync);
      window.visualViewport?.removeEventListener("resize", requestSync);
      document.removeEventListener("visibilitychange", requestSync);
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
