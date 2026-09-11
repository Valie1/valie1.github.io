"use client";

import type { CSSProperties } from "react";
import { useEffect, useId, useState } from "react";

type Props = {
  className?: string;
  active?: boolean;
  label?: string;
  delayMs?: number;
  loop?: boolean;
  loopPauseMs?: number;
};

const letters = ["V", "A", "L", "I", "E"] as const;






export default function AnimatedValieWordmark({
  className = "",
  active = true,
  label = "VALIE",
  delayMs = 420,
  loop = false,
  loopPauseMs = 3000,
}: Props) {
  const [drawing, setDrawing] = useState(false);
  const uid = useId().replace(/:/g, "");

  useEffect(() => {
    if (!active) {
      setDrawing(false);
      return;
    }

    let startTimer = 0;
    let loopTimer = 0;
    let restartTimer = 0;
    let cancelled = false;




    const animationDurationMs = 2420;

    const run = () => {
      if (cancelled) return;
      setDrawing(true);

      if (loop) {
        loopTimer = window.setTimeout(() => {
          if (cancelled) return;
          setDrawing(false);


          restartTimer = window.setTimeout(run, 40);
        }, animationDurationMs + Math.max(0, loopPauseMs));
      }
    };

    setDrawing(false);
    startTimer = window.setTimeout(run, Math.max(0, delayMs));

    return () => {
      cancelled = true;
      window.clearTimeout(startTimer);
      window.clearTimeout(loopTimer);
      window.clearTimeout(restartTimer);
    };
  }, [active, delayMs, loop, loopPauseMs]);

  return (
    <svg
      className={`animated-valie-wordmark ${drawing ? "is-drawing" : ""} ${className}`.trim()}
      viewBox="0 0 89 32"
      role="img"
      aria-label={label}
      preserveAspectRatio="xMinYMid meet"
    >
      <defs>
        <filter id={`valieGlow-${uid}`} x="-30%" y="-50%" width="160%" height="200%">
          <feGaussianBlur stdDeviation="0.7" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <text className="animated-valie-wordmark__draw" x="0" y="25.7" aria-hidden="true" filter={`url(#valieGlow-${uid})`}>
        {letters.map((letter, index) => (
          <tspan
            key={`${letter}-${index}`}
            className="animated-valie-wordmark__letter"
            style={{ "--valie-draw-index": index } as CSSProperties}
          >
            {letter}
          </tspan>
        ))}
      </text>

      <text className="animated-valie-wordmark__fill" x="0" y="25.7" aria-hidden="true">
        {letters.map((letter, index) => <tspan key={`fill-${letter}-${index}`}>{letter}</tspan>)}
      </text>
    </svg>
  );
}
