"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import CustomVideoPlayer from "@/components/CustomVideoPlayer";
import HoverVideoThumbnail from "@/components/HoverVideoThumbnail";
import { getProjectMediaAspect, getProjectPlaybackSource } from "@/lib/content";
import type { Project, MediaAspect } from "@/lib/content";
import { readMediaConsent } from "@/lib/mediaConsent";
import { lockDocumentScroll } from "@/lib/browserRuntime";
import { isolateDialog, restoreFocus, trapTabKey } from "@/lib/accessibility";

type Props = {
  projects: Project[];
  vertical?: boolean;
};

type ModalPhase = "entering" | "entered" | "closing";

function showcaseAspect(project: Project, verticalSection: boolean): MediaAspect {
  return verticalSection ? getProjectMediaAspect(project) : "landscape";
}

export default function OnePageVideoShowcase({ projects, vertical = false }: Props) {
  const [active, setActive] = useState<Project | null>(null);
  const [modalPhase, setModalPhase] = useState<ModalPhase>("entering");
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const openerRef = useRef<HTMLElement | null>(null);

  const warmPlaybackOrigin = useCallback((url?: string) => {
    if (!url || typeof document === "undefined") return;
    if (!/youtu(?:\.be|be\.com)/i.test(url)) return;
    if (readMediaConsent() !== "allowed") return;

    const origins = ["https://www.youtube-nocookie.com", "https://i.ytimg.com"];
    origins.forEach((origin) => {
      if (document.head.querySelector(`link[data-valie-preconnect="${origin}"]`)) return;
      const link = document.createElement("link");
      link.rel = "preconnect";
      link.href = origin;
      link.crossOrigin = "anonymous";
      link.dataset.valiePreconnect = origin;
      document.head.appendChild(link);
    });
  }, []);

  const openProject = useCallback((project: Project) => {
    if (
      document.documentElement.classList.contains("mobile-menu-locked") ||
      document.body.classList.contains("mobile-menu-locked") ||
      document.querySelector("[data-valie-menu-posttap-shield]")
    ) return;
    openerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setModalPhase("entering");
    setActive(project);
  }, []);

  const closeProject = useCallback(() => {
    if (!active || closeTimerRef.current) return;



    setModalPhase("closing");
    closeTimerRef.current = setTimeout(() => {
      setActive(null);
      setModalPhase("entering");
      closeTimerRef.current = null;
    }, 480);
  }, [active]);

  useEffect(() => () => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
  }, []);




  useEffect(() => {
    if (!active || modalPhase !== "entering") return;

    let secondFrame = 0;
    const firstFrame = window.requestAnimationFrame(() => {
      secondFrame = window.requestAnimationFrame(() => {
        setModalPhase("entered");
      });
    });

    return () => {
      window.cancelAnimationFrame(firstFrame);
      if (secondFrame) window.cancelAnimationFrame(secondFrame);
    };
  }, [active, modalPhase]);

  useEffect(() => {
    if (!active) return;

    const unlockScroll = lockDocumentScroll("video-modal-locked");
    const releaseIsolation = dialogRef.current ? isolateDialog(dialogRef.current) : () => {};
    const focusTimer = window.setTimeout(() => closeButtonRef.current?.focus({ preventScroll: true }), 0);

    const onKey = (event: KeyboardEvent) => {
      const dialog = dialogRef.current;
      if (event.key === "Escape") {
        event.preventDefault();
        closeProject();
        return;
      }
      if (dialog) trapTabKey(event, dialog);
    };
    window.addEventListener("keydown", onKey);

    return () => {
      window.clearTimeout(focusTimer);
      window.removeEventListener("keydown", onKey);
      releaseIsolation();
      unlockScroll();
      restoreFocus(openerRef.current);
    };
  }, [active, closeProject]);

  return (
    <>
      <div className={`reference-media-grid ${vertical ? "reference-media-grid--short" : "reference-media-grid--long"}`}>
        {projects.map((project) => {
          const playbackSource = getProjectPlaybackSource(project);
          const aspect = showcaseAspect(project, vertical);
          const aspectClass = `is-${aspect}`;
          const sizes = vertical
            ? aspect === "portrait"
              ? "(max-width: 700px) 48vw, (max-width: 1100px) 18vw, 160px"
              : aspect === "square"
                ? "(max-width: 700px) 96vw, (max-width: 1100px) 36vw, 280px"
                : "(max-width: 700px) 96vw, (max-width: 1100px) 36vw, 320px"
            : "(max-width: 700px) 100vw, (max-width: 900px) 50vw, 340px";

          return (
            <button
              className={`reference-media-card ${vertical ? "is-short" : "is-long"} ${aspectClass}`}
              key={project.slug}
              type="button"
              onPointerEnter={() => warmPlaybackOrigin(playbackSource)}
              onFocus={() => warmPlaybackOrigin(playbackSource)}
              disabled={!playbackSource}
              onClick={() => { if (playbackSource) openProject(project); }}
              aria-label={playbackSource ? `Play ${project.title}` : `${project.title} video unavailable`}
            >
              <HoverVideoThumbnail
                className={`reference-media-card__media ${aspectClass}`}
                poster={project.media.hero}
                video={project.media.hoverVideo || project.media.previewVideo}
                alt={`${project.title} preview`}
                sizes={sizes}
                priority={false}
                loop={vertical}
                hoverDelayMs={vertical ? 180 : 90}
              />

              <span className="reference-media-card__shade" aria-hidden="true" />
              <span className="reference-media-card__play" aria-hidden="true"><i /></span>

            </button>
          );
        })}
      </div>

      {active && typeof document !== "undefined"
        ? createPortal(
            <div
              ref={dialogRef}
              className={`one-video-modal is-${modalPhase}`}
              role="dialog"
              aria-modal="true"
              aria-labelledby={`video-dialog-title-${active.slug}`}
              onPointerDown={(event) => {
                if (event.currentTarget === event.target) closeProject();
              }}
            >
              <h2 id={`video-dialog-title-${active.slug}`} className="sr-only">{active.title} video</h2>
              <button
                ref={closeButtonRef}
                className="one-video-modal__close"
                type="button"
                onClick={closeProject}
                aria-label="Close video"
              >
                <X size={22} />
              </button>
              {(() => {
                const aspect = showcaseAspect(active, vertical);
                return (
                  <div className={`one-video-modal__panel ${aspect === "portrait" ? "is-vertical" : aspect === "square" ? "is-square" : ""}`}>
                    <CustomVideoPlayer
                      aspect={aspect}
                      src={getProjectPlaybackSource(active)}
                      poster={active.media.hero}
                      title={active.title}
                      autoPlay
                      onClose={closeProject}
                      showCloseButton={false}
                    />
                  </div>
                );
              })()}
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
