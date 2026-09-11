"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import PortfolioImage from "@/components/PortfolioImage";
import Skeleton from "@/components/Skeleton";
import { lockDocumentScroll } from "@/lib/browserRuntime";
import { isolateDialog, restoreFocus, trapTabKey } from "@/lib/accessibility";

const reviews = [
  {
    id: "review-1",
    name: "bandit8078",
    pfp: "/media/reviews/pfp-review-1-optimized.webp",
    screenshot: "/media/reviews/review-1-optimized.webp",
    quote:
      "Valie was super patient throughout the whole process, really easy to work with, fast, communicative, and reliable.",
  },
  {
    id: "review-2",
    name: "Ricky Flicks",
    pfp: "/media/reviews/pfp-review-2-optimized.webp",
    screenshot: "/media/reviews/review-2-optimized.webp",
    quote:
      "Communication was always clear, feedback was handled quickly, and every revision genuinely improved the edit.",
  },
  {
    id: "review-3",
    name: "mdm2210",
    pfp: "/media/reviews/pfp-review-3-optimized.webp",
    screenshot: "/media/reviews/review-3-optimized.webp",
    quote:
      "10/10 — incredibly fast delivery, smooth communication, and editing quality that exceeded expectations.",
  },
] as const;

type Review = (typeof reviews)[number];
type ModalPhase = "entering" | "entered" | "closing";

export default function ClientReviews({ headingId = "reviews-title" }: { headingId?: string } = {}) {
  const [active, setActive] = useState<Review | null>(null);
  const [modalPhase, setModalPhase] = useState<ModalPhase>("entering");
  const [activeImageLoaded, setActiveImageLoaded] = useState(false);
  const [activeSkeletonVisible, setActiveSkeletonVisible] = useState(true);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const imageSettleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const reviewViewportRef = useRef<HTMLDivElement | null>(null);

  const openReview = useCallback((review: Review) => {
    openerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    if (imageSettleTimerRef.current) {
      clearTimeout(imageSettleTimerRef.current);
      imageSettleTimerRef.current = null;
    }
    setModalPhase("entering");
    setActiveImageLoaded(false);
    setActiveSkeletonVisible(true);
    setActive(review);
  }, []);

  const closeReview = useCallback(() => {
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
    if (imageSettleTimerRef.current) clearTimeout(imageSettleTimerRef.current);
  }, []);

  const settleActiveImage = useCallback(() => {
    setActiveImageLoaded(true);
    if (imageSettleTimerRef.current) clearTimeout(imageSettleTimerRef.current);
    imageSettleTimerRef.current = setTimeout(() => {
      setActiveSkeletonVisible(false);
      imageSettleTimerRef.current = null;
    }, 220);
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
    const viewport = reviewViewportRef.current;
    if (!viewport || active) return;

    const mobileQuery = window.matchMedia("(max-width: 760px)");
    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!mobileQuery.matches) return;

    let frame = 0;
    let previousTime = 0;
    let initialized = false;
    let autoPosition = 0;
    const autoSpeed = 42;
    const manualSyncThreshold = 2;

    const sets = () =>
      Array.from(viewport.querySelectorAll<HTMLElement>(".review-orbit__set"));

    const loopWidth = () => {
      const items = sets();
      if (items.length < 2) return 0;
      return items[1].offsetLeft - items[0].offsetLeft;
    };

    const normalizeLoopPosition = () => {
      const width = loopWidth();
      if (!width) return;
      let next = autoPosition;
      while (next < width * 0.55) next += width;
      while (next > width * 2.45) next -= width;
      if (Math.abs(next - autoPosition) > 0.5) {
        autoPosition = next;
        viewport.scrollLeft = autoPosition;
      }
    };

    const initialize = () => {
      const width = loopWidth();
      if (!width) return false;
      autoPosition = width;
      viewport.scrollLeft = autoPosition;
      initialized = true;
      return true;
    };

    const syncManualPosition = () => {
      const actual = viewport.scrollLeft;
      if (Math.abs(actual - autoPosition) > manualSyncThreshold) {
        autoPosition = actual;
      }
    };

    const syncInteractionStart = () => {
      autoPosition = viewport.scrollLeft;
    };

    const syncInteractionEnd = () => {
      autoPosition = viewport.scrollLeft;
      normalizeLoopPosition();
    };

    const animate = (time: number) => {
      if (!initialized) initialize();

      if (!previousTime) previousTime = time;
      const elapsed = Math.min(48, time - previousTime);
      previousTime = time;

      if (initialized && !document.hidden && !reducedMotionQuery.matches) {
        autoPosition += (autoSpeed * elapsed) / 1000;
        viewport.scrollLeft = autoPosition;
        normalizeLoopPosition();
      }

      frame = window.requestAnimationFrame(animate);
    };

    const initFrame = window.requestAnimationFrame(() => {
      initialize();
      frame = window.requestAnimationFrame(animate);
    });

    viewport.addEventListener("pointerdown", syncInteractionStart, { passive: true });
    window.addEventListener("pointerup", syncInteractionEnd, { passive: true });
    window.addEventListener("pointercancel", syncInteractionEnd, { passive: true });
    viewport.addEventListener("touchstart", syncInteractionStart, { passive: true });
    viewport.addEventListener("touchend", syncInteractionEnd, { passive: true });
    viewport.addEventListener("touchcancel", syncInteractionEnd, { passive: true });
    viewport.addEventListener("wheel", syncManualPosition, { passive: true });
    viewport.addEventListener("scroll", syncManualPosition, { passive: true });

    return () => {
      window.cancelAnimationFrame(initFrame);
      if (frame) window.cancelAnimationFrame(frame);
      viewport.removeEventListener("pointerdown", syncInteractionStart);
      window.removeEventListener("pointerup", syncInteractionEnd);
      window.removeEventListener("pointercancel", syncInteractionEnd);
      viewport.removeEventListener("touchstart", syncInteractionStart);
      viewport.removeEventListener("touchend", syncInteractionEnd);
      viewport.removeEventListener("touchcancel", syncInteractionEnd);
      viewport.removeEventListener("wheel", syncManualPosition);
      viewport.removeEventListener("scroll", syncManualPosition);
    };
  }, [active]);

  useEffect(() => {
    if (!active) return;

    const unlockScroll = lockDocumentScroll("review-modal-locked");
    const releaseIsolation = dialogRef.current ? isolateDialog(dialogRef.current) : () => {};
    const focusTimer = window.setTimeout(() => closeButtonRef.current?.focus({ preventScroll: true }), 0);

    const onKey = (event: KeyboardEvent) => {
      const dialog = dialogRef.current;
      if (event.key === "Escape") {
        event.preventDefault();
        closeReview();
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
  }, [active, closeReview]);

  return (
    <>
      <div className="client-reviews">
        <div className="client-reviews__intro">
          <div>
            <span className="client-reviews__eyebrow">CLIENT REVIEWS</span>
            <h2 id={headingId}>Words from people<br /><em>I&apos;ve edited for.</em></h2>
          </div>
          <p>
            Real feedback from real projects. The cards keep moving; on mobile, swipe left or right, or tap any one to open the original review screenshot.
          </p>
        </div>

        <div






          className="review-orbit is-performance-paused"
          aria-label="Client reviews"
        >
          <span className="review-orbit__signal" aria-hidden="true" />
          <div ref={reviewViewportRef} className="review-orbit__viewport">
            <div className="review-orbit__track">
              {[0, 1, 2, 3].map((setIndex) => (
                <div className="review-orbit__set" aria-hidden={setIndex !== 0} key={setIndex}>
                  {reviews.map((review, index) => (
                    <button
                      key={`${setIndex}-${review.id}`}
                      type="button"
                      className={`review-card review-card--${index + 1}`}
                      tabIndex={setIndex === 0 ? 0 : -1}
                      onClick={() => openReview(review)}
                      aria-label={`Open original review from ${review.name}`}
                    >
                      <span className="review-card__avatar">
                        <PortfolioImage
                          src={review.pfp}
                          alt={`${review.name} profile picture`}
                          className="review-card__avatar-image"
                          sizes="58px"
                        />
                      </span>
                      <span className="review-card__content">
                        <span className="review-card__meta">
                          <strong>{review.name}</strong>
                        </span>
                        <span className="review-card__quote">“{review.quote}”</span>
                      </span>
                      <span className="review-card__glow" aria-hidden="true" />
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {active && typeof document !== "undefined"
        ? createPortal(
            <div
              ref={dialogRef}
              className={`review-lightbox is-${modalPhase}`}
              role="dialog"
              aria-modal="true"
              aria-labelledby={`review-dialog-title-${active.id}`}
              onPointerDown={(event) => {
                if (event.currentTarget === event.target) closeReview();
              }}
            >
              <h2 id={`review-dialog-title-${active.id}`} className="sr-only">Original review from {active.name}</h2>
              <button ref={closeButtonRef} className="review-lightbox__close" type="button" onClick={closeReview} aria-label="Close review">
                <X size={20} />
              </button>
              <div className="review-lightbox__panel">
                <div className="review-lightbox__top">
                  <span className="review-lightbox__avatar">
                    <PortfolioImage
                      src={active.pfp}
                      alt={`${active.name} profile picture`}
                      className="review-card__avatar-image"
                      sizes="42px"
                    />
                  </span>
                  <div>
                    <strong>{active.name}</strong>
                  </div>
                </div>
                <div className={`review-lightbox__image-wrap ${activeImageLoaded ? "is-loaded" : "is-loading"}`}>
                  {activeSkeletonVisible ? (
                    <Skeleton className={`review-lightbox__skeleton media-skeleton ${activeImageLoaded ? "is-exiting" : ""}`} />
                  ) : null}
                  <img
                    src={active.screenshot}
                    alt={`Original client review from ${active.name}`}
                    className={`review-lightbox__image ${activeImageLoaded ? "is-loaded" : "is-loading"}`}
                    loading="eager"
                    decoding="async"
                    fetchPriority="high"
                    onLoad={settleActiveImage}
                    onError={settleActiveImage}
                  />
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
