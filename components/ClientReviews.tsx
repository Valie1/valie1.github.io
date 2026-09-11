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
    if (!mobileQuery.matches || reducedMotionQuery.matches) return;

    let autoTimer = 0;
    let settleTimer = 0;
    let autoReleaseTimer = 0;
    let userInteracting = false;
    let autoScrolling = false;
    let direction = 1;

    const cards = () =>
      Array.from(viewport.querySelectorAll<HTMLElement>(".review-orbit__set:first-child .review-card"));

    const centeredLeft = (card: HTMLElement) =>
      Math.max(0, card.offsetLeft - (viewport.clientWidth - card.clientWidth) / 2);

    const nearestIndex = () => {
      const items = cards();
      if (!items.length) return 0;
      let nearest = 0;
      let distance = Number.POSITIVE_INFINITY;
      items.forEach((card, index) => {
        const delta = Math.abs(centeredLeft(card) - viewport.scrollLeft);
        if (delta < distance) {
          distance = delta;
          nearest = index;
        }
      });
      return nearest;
    };

    const clearAutoTimer = () => {
      if (autoTimer) window.clearTimeout(autoTimer);
      autoTimer = 0;
    };

    const scheduleAuto = (delay = 4400) => {
      clearAutoTimer();
      autoTimer = window.setTimeout(() => {
        if (document.hidden || userInteracting) {
          scheduleAuto(1200);
          return;
        }

        const items = cards();
        if (items.length < 2) return;

        const current = nearestIndex();
        if (current >= items.length - 1) direction = -1;
        else if (current <= 0) direction = 1;

        const next = Math.max(0, Math.min(items.length - 1, current + direction));
        autoScrolling = true;
        viewport.scrollTo({ left: centeredLeft(items[next]), behavior: "smooth" });
        if (autoReleaseTimer) window.clearTimeout(autoReleaseTimer);
        autoReleaseTimer = window.setTimeout(() => {
          autoScrolling = false;
          autoReleaseTimer = 0;
        }, 900);
        scheduleAuto(5200);
      }, delay);
    };

    const pauseAuto = () => {
      userInteracting = true;
      autoScrolling = false;
      clearAutoTimer();
      if (autoReleaseTimer) window.clearTimeout(autoReleaseTimer);
      autoReleaseTimer = 0;
    };

    const resumeAuto = () => {
      userInteracting = false;
      scheduleAuto(4200);
    };

    const onScroll = () => {
      if (autoScrolling) return;
      if (settleTimer) window.clearTimeout(settleTimer);
      settleTimer = window.setTimeout(() => {
        settleTimer = 0;
        if (!userInteracting) scheduleAuto(4200);
      }, 220);
    };

    const onVisibilityChange = () => {
      if (document.hidden) clearAutoTimer();
      else scheduleAuto(2600);
    };

    viewport.addEventListener("pointerdown", pauseAuto, { passive: true });
    window.addEventListener("pointerup", resumeAuto, { passive: true });
    window.addEventListener("pointercancel", resumeAuto, { passive: true });
    viewport.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("visibilitychange", onVisibilityChange);
    scheduleAuto(3200);

    return () => {
      clearAutoTimer();
      if (settleTimer) window.clearTimeout(settleTimer);
      if (autoReleaseTimer) window.clearTimeout(autoReleaseTimer);
      viewport.removeEventListener("pointerdown", pauseAuto);
      window.removeEventListener("pointerup", resumeAuto);
      window.removeEventListener("pointercancel", resumeAuto);
      viewport.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", onVisibilityChange);
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
