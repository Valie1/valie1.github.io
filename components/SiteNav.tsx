import type { CSSProperties } from "react";
import { site } from "@/lib/content";

const links = [
  ["#work", "WORK"],
  ["#about", "ABOUT"],
  ["#reviews", "REVIEWS"],
  ["#contact", "CONTACT"],
] as const;

const letters = ["V", "A", "L", "I", "E"] as const;

export default function SiteNav() {
  return (
    <header className="minimal-site-nav one-page-nav" data-static-site-nav>
      <div className="minimal-nav-inner">
        <a href="#top" className="minimal-site-brand minimal-site-brand--draw" aria-label={`${site.name} home`}>
          <svg className="animated-valie-wordmark is-drawing minimal-brand-draw" viewBox="0 0 89 32" role="img" aria-label={`${site.name} home`} preserveAspectRatio="xMinYMid meet">
            <defs>
              <filter id="valie-nav-glow" x="-30%" y="-50%" width="160%" height="200%">
                <feGaussianBlur stdDeviation="0.7" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <text className="animated-valie-wordmark__draw" x="0" y="25.7" aria-hidden="true" filter="url(#valie-nav-glow)">
              {letters.map((letter, index) => (
                <tspan key={`${letter}-${index}`} className="animated-valie-wordmark__letter" style={{ "--valie-draw-index": index } as CSSProperties}>
                  {letter}
                </tspan>
              ))}
            </text>
            <text className="animated-valie-wordmark__fill" x="0" y="25.7" aria-hidden="true">
              {letters.map((letter, index) => <tspan key={`fill-${letter}-${index}`}>{letter}</tspan>)}
            </text>
          </svg>
        </a>

        <nav className="minimal-site-links one-page-nav-links" aria-label="Primary navigation">
          {links.map(([href, label]) => (
            <a href={href} key={href}>{label}</a>
          ))}
        </nav>

        <button className="minimal-menu-button" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="minimal-mobile-menu" data-site-menu-button>
          <span className="minimal-menu-button__label" data-site-menu-label>MENU</span>
          <span className="minimal-menu-button__icon" aria-hidden="true"><i /><i /></span>
        </button>
      </div>

      <nav id="minimal-mobile-menu" className="minimal-mobile-menu" aria-label="Mobile navigation" aria-hidden="true" role="dialog" aria-modal="true" data-site-mobile-menu>
        <div className="minimal-mobile-menu__inner">
          <div className="minimal-mobile-menu__links">
            {links.map(([href, label], index) => (
              <a
                href={href}
                key={href}
                tabIndex={-1}
                data-site-mobile-link
                data-site-target={href.split("#")[1]}
                data-valie-link-preview-skip
                style={{ "--menu-index": index } as CSSProperties}
              >
                <strong>{label}</strong>
              </a>
            ))}
          </div>
        </div>
      </nav>
    </header>
  );
}
