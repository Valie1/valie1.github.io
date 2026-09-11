"use client";

import { useEffect, useRef } from "react";
import Skeleton from "@/components/Skeleton";
import type { Project } from "@/lib/content";

type Props = {
  projects: Project[];
};

type LaneItem = {
  slug: string;
  loop: string;
  mobileLoop: string;
  poster: string;
};

const longLane: LaneItem[] = [
  { slug: "sequence-01-13", loop: "/media/hero-loops/long-sequence-01-13.mp4", mobileLoop: "/media/hero-mobile/long-sequence-01-13.mp4", poster: "/media/hero-posters/long-sequence-01-13.webp" },
  { slug: "sequence-01-12", loop: "/media/hero-loops/long-sequence-01-12.mp4", mobileLoop: "/media/hero-mobile/long-sequence-01-12.mp4", poster: "/media/hero-posters/long-sequence-01-12.webp" },
  { slug: "sequence-01-10", loop: "/media/hero-loops/long-sequence-01-10.mp4", mobileLoop: "/media/hero-mobile/long-sequence-01-10.mp4", poster: "/media/hero-posters/long-sequence-01-10.webp" },
  { slug: "sequence-01-9", loop: "/media/hero-loops/long-sequence-01-9.mp4", mobileLoop: "/media/hero-mobile/long-sequence-01-9.mp4", poster: "/media/hero-posters/long-sequence-01-9.webp" },
  { slug: "sequence-01-8", loop: "/media/hero-loops/long-sequence-01-8.mp4", mobileLoop: "/media/hero-mobile/long-sequence-01-8.mp4", poster: "/media/hero-posters/long-sequence-01-8.webp" },
  { slug: "sequence-01-6", loop: "/media/hero-loops/long-sequence-01-6.mp4", mobileLoop: "/media/hero-mobile/long-sequence-01-6.mp4", poster: "/media/hero-posters/long-sequence-01-6.webp" },
];

const shortLane: LaneItem[] = [
  { slug: "rage-baiting-prank", loop: "/media/hero-loops/rage-baiting-prank.mp4", mobileLoop: "/media/hero-mobile/rage-baiting-prank.mp4", poster: "/media/hero-posters/rage-baiting-prank.webp" },
  { slug: "sequence-01", loop: "/media/hero-loops/sequence-01.mp4", mobileLoop: "/media/hero-mobile/sequence-01.mp4", poster: "/media/hero-posters/sequence-01.webp" },
  { slug: "sequence-01-4", loop: "/media/hero-loops/sequence-01-4.mp4", mobileLoop: "/media/hero-mobile/sequence-01-4.mp4", poster: "/media/hero-posters/sequence-01-4.webp" },
  { slug: "sequence-01-3", loop: "/media/hero-loops/sequence-01-3.mp4", mobileLoop: "/media/hero-mobile/sequence-01-3.mp4", poster: "/media/hero-posters/sequence-01-3.webp" },
  { slug: "sequence-01-2", loop: "/media/hero-loops/sequence-01-2.mp4", mobileLoop: "/media/hero-mobile/sequence-01-2.mp4", poster: "/media/hero-posters/sequence-01-2.webp" },
  { slug: "sequence-01-1", loop: "/media/hero-loops/sequence-01-1.mp4", mobileLoop: "/media/hero-mobile/sequence-01-1.mp4", poster: "/media/work-posters/sequence-01-1.webp" },
];

function LaneSequence({
  items,
  projects,
  kind,
  clone = false,
}: {
  items: LaneItem[];
  projects: Map<string, Project>;
  kind: "long" | "short";
  clone?: boolean;
}) {
  return (
    <div className="hero-media-sequence" aria-hidden={clone || undefined}>
      {items.map((item, index) => {
        const project = projects.get(item.slug);
        if (!project) return null;

        return (
          <div
            className={`hero-media-card hero-media-card--${kind}`}
            data-index={index + 1}
            key={`${clone ? "clone" : "main"}-${item.slug}`}
          >
            <Skeleton className="hero-media-card__skeleton" />
            <video
              data-hero-src={item.loop}
              data-hero-mobile-src={item.mobileLoop}
              data-hero-kind={kind}
              poster={item.poster}
              muted
              loop
              playsInline
              preload="none"
              tabIndex={-1}
              disablePictureInPicture
            />
            <span className="hero-media-card__glass" />
          </div>
        );
      })}
    </div>
  );
}

export default function HeroVideoWall({ projects }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const videos = Array.from(root.querySelectorAll<HTMLVideoElement>("video[data-hero-src]"));
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    const visibleRatios = new Map<HTMLVideoElement, number>();
    let heroVisible = true;
    let pointerRaf = 0;
    let scrollRaf = 0;

    const hardwareConcurrency = navigator.hardwareConcurrency || 4;
    const deviceMemory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory || 4;
    const network = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
    const saveData = Boolean(network?.saveData);
    const slowNetwork = Boolean(network?.effectiveType && /(^|-)2g$/i.test(network.effectiveType));
    const mobileHero = window.matchMedia("(max-width: 700px)").matches;
    const constrainedDevice = hardwareConcurrency <= 4 || deviceMemory <= 4;
    const maxPlaying = saveData || slowNetwork ? 0 : mobileHero ? (constrainedDevice ? 2 : 4) : constrainedDevice ? 2 : 4;
    const mobilePerLaneLimit = constrainedDevice ? 1 : 2;
    const mobileUnloadTimers = new Map<HTMLVideoElement, number>();
    root.classList.toggle("is-mobile-live-mode", mobileHero);

    const ensureSource = (video: HTMLVideoElement) => {
      const existingTimer = mobileUnloadTimers.get(video);
      if (existingTimer) {
        window.clearTimeout(existingTimer);
        mobileUnloadTimers.delete(video);
      }
      if (video.getAttribute("src")) return;
      const src = mobileHero ? video.dataset.heroMobileSrc || video.dataset.heroSrc : video.dataset.heroSrc;
      if (!src) return;
      video.src = src;
      video.load();
    };

    const pauseVideo = (video: HTMLVideoElement) => {
      if (!video.paused) video.pause();
    };

    const resetToPoster = (video: HTMLVideoElement) => {
      const existingTimer = mobileUnloadTimers.get(video);
      if (existingTimer) {
        window.clearTimeout(existingTimer);
        mobileUnloadTimers.delete(video);
      }
      pauseVideo(video);
      if (!video.getAttribute("src")) return;
      video.removeAttribute("src");
      try {
        video.load();
      } catch {}
    };

    const scheduleMobileUnload = (video: HTMLVideoElement) => {
      pauseVideo(video);
      if (!mobileHero || !video.getAttribute("src") || mobileUnloadTimers.has(video)) return;
      const timer = window.setTimeout(() => {
        mobileUnloadTimers.delete(video);
        if (!visibleRatios.has(video)) resetToPoster(video);
      }, 2200);
      mobileUnloadTimers.set(video, timer);
    };

    const unloadAll = () => {
      videos.forEach(resetToPoster);
      visibleRatios.clear();
    };

    const syncPlayback = () => {
      if (!heroVisible || document.hidden || reducedMotion.matches || maxPlaying === 0) {
        videos.forEach(pauseVideo);
        return;
      }

      const ranked = Array.from(visibleRatios.entries())
        .filter(([, ratio]) => ratio > (mobileHero ? 0.12 : 0.08))
        .sort((a, b) => b[1] - a[1]);

      let allowed: Set<HTMLVideoElement>;
      if (mobileHero) {
        const perLane = new Map<string, number>();
        const selected: HTMLVideoElement[] = [];
        for (const [video] of ranked) {
          const kind = video.dataset.heroKind || "hero";
          const count = perLane.get(kind) || 0;
          if (count >= mobilePerLaneLimit) continue;
          perLane.set(kind, count + 1);
          selected.push(video);
          if (selected.length >= maxPlaying) break;
        }
        allowed = new Set(selected);
      } else {
        allowed = new Set(ranked.slice(0, maxPlaying).map(([video]) => video));
      }

      videos.forEach((video) => {
        if (!allowed.has(video)) {
          if (mobileHero) scheduleMobileUnload(video);
          else pauseVideo(video);
          return;
        }
        ensureSource(video);
        if (video.paused) void video.play().catch(() => {});
      });
    };

    let videoObserver: IntersectionObserver | null = null;
    if (maxPlaying > 0) {
      videoObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const video = entry.target as HTMLVideoElement;
            if (entry.isIntersecting) visibleRatios.set(video, entry.intersectionRatio);
            else visibleRatios.delete(video);
          });
          syncPlayback();
        },
        mobileHero
          ? { threshold: [0, 0.06, 0.18, 0.4, 0.7], rootMargin: "12% 0px" }
          : { threshold: [0, 0.08, 0.25, 0.5, 0.8], rootMargin: "70px 0px" },
      );
      videos.forEach((video) => videoObserver?.observe(video));
    }

    const resetHeroMotion = () => {
      root.style.setProperty("--hero-wall-y", "0px");
      root.style.setProperty("--hero-wall-scale", "1");
      root.style.setProperty("--hero-wall-opacity", "1");
      root.style.setProperty("--hero-long-x", "0px");
      root.style.setProperty("--hero-long-y", "0px");
      root.style.setProperty("--hero-short-x", "0px");
      root.style.setProperty("--hero-short-y", "0px");
    };

    const updateScroll = () => {
      if (!heroVisible) return;
      if (mobileHero || reducedMotion.matches) {
        cancelAnimationFrame(scrollRaf);
        resetHeroMotion();
        return;
      }
      cancelAnimationFrame(scrollRaf);
      scrollRaf = requestAnimationFrame(() => {
        const rect = root.getBoundingClientRect();
        const progress = Math.max(0, Math.min(1, -rect.top / Math.max(1, window.innerHeight * 0.82)));
        root.style.setProperty("--hero-wall-y", `${progress * -20}px`);
        root.style.setProperty("--hero-wall-scale", `${1 - progress * 0.016}`);
        root.style.setProperty("--hero-wall-opacity", `${1 - progress * 0.34}`);
      });
    };

    const rootObserver = new IntersectionObserver(
      ([entry]) => {
        heroVisible = entry.isIntersecting;
        root.classList.toggle("is-offscreen", !heroVisible);
        if (heroVisible) {
          updateScroll();
          syncPlayback();
        } else {
          unloadAll();
        }
      },
      { threshold: 0, rootMargin: "120px 0px" },
    );
    rootObserver.observe(root);

    const onPointerMove = (event: PointerEvent) => {
      if (!heroVisible || reducedMotion.matches || constrainedDevice || !finePointer.matches || event.pointerType === "touch") return;
      if (pointerRaf) return;
      const clientX = event.clientX;
      const clientY = event.clientY;
      pointerRaf = requestAnimationFrame(() => {
        pointerRaf = 0;
        const rect = root.getBoundingClientRect();
        if (!rect.width || !rect.height) return;
        const nx = ((clientX - rect.left) / rect.width - 0.5) * 2;
        const ny = ((clientY - rect.top) / rect.height - 0.5) * 2;
        root.style.setProperty("--hero-long-x", `${nx * -1.8}px`);
        root.style.setProperty("--hero-long-y", `${ny * -0.9}px`);
        root.style.setProperty("--hero-short-x", `${nx * 1.8}px`);
        root.style.setProperty("--hero-short-y", `${ny * 0.9}px`);
      });
    };

    const resetPointer = () => {
      root.style.setProperty("--hero-long-x", "0px");
      root.style.setProperty("--hero-long-y", "0px");
      root.style.setProperty("--hero-short-x", "0px");
      root.style.setProperty("--hero-short-y", "0px");
    };

    const onVisibilityChange = () => {
      root.classList.toggle("is-page-hidden", document.hidden);
      syncPlayback();
    };

    const onMotionPreferenceChange = () => {
      if (reducedMotion.matches) resetHeroMotion();
      else updateScroll();
      syncPlayback();
    };

    const unbindMotion = (() => {
      if (typeof reducedMotion.addEventListener === "function") {
        reducedMotion.addEventListener("change", onMotionPreferenceChange);
        return () => reducedMotion.removeEventListener("change", onMotionPreferenceChange);
      }
      reducedMotion.addListener(onMotionPreferenceChange);
      return () => reducedMotion.removeListener(onMotionPreferenceChange);
    })();

    updateScroll();
    if (!mobileHero) {
      window.addEventListener("scroll", updateScroll, { passive: true });
      window.addEventListener("resize", updateScroll, { passive: true });
    }
    root.addEventListener("pointermove", onPointerMove, { passive: true });
    root.addEventListener("pointerleave", resetPointer);
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      rootObserver.disconnect();
      videoObserver?.disconnect();
      cancelAnimationFrame(pointerRaf);
      cancelAnimationFrame(scrollRaf);
      if (!mobileHero) {
        window.removeEventListener("scroll", updateScroll);
        window.removeEventListener("resize", updateScroll);
      }
      root.removeEventListener("pointermove", onPointerMove);
      root.removeEventListener("pointerleave", resetPointer);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      unbindMotion();
      unloadAll();
      mobileUnloadTimers.forEach((timer) => window.clearTimeout(timer));
      mobileUnloadTimers.clear();
      root.classList.remove("is-offscreen", "is-page-hidden", "is-mobile-live-mode");
      resetHeroMotion();
    };
  }, []);

  const projectMap = new Map(projects.map((project) => [project.slug, project]));

  return (
    <div className="hero-video-wall hero-video-wall--split" ref={rootRef} aria-hidden="true">
      <div className="hero-media-lane hero-media-lane--long">
        <div className="hero-media-track hero-media-track--up">
          <LaneSequence items={longLane} projects={projectMap} kind="long" />
          <LaneSequence items={longLane} projects={projectMap} kind="long" clone />
        </div>
      </div>

      <div className="hero-media-lane hero-media-lane--short">
        <div className="hero-media-track hero-media-track--down">
          <LaneSequence items={shortLane} projects={projectMap} kind="short" />
          <LaneSequence items={shortLane} projects={projectMap} kind="short" clone />
        </div>
      </div>

      <span className="hero-video-wall__center-mask" />
      <span className="hero-video-wall__edge-mask" />
    </div>
  );
}
