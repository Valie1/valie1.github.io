"use client";

import { ArrowLeft, Check, PlayCircle, ShieldCheck, ShieldOff, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { MouseEvent as ReactMouseEvent } from "react";
import { createPortal } from "react-dom";
import { showSuccess } from "@/lib/feedback";
import { isolateDialog, restoreFocus, trapTabKey } from "@/lib/accessibility";
import { lockDocumentScroll } from "@/lib/browserRuntime";
import {
  MEDIA_CONSENT_CHANGE_EVENT,
  OPEN_COOKIE_SETTINGS_EVENT,
  readMediaConsent,
  writeMediaConsent,
  type MediaConsent,
} from "@/lib/mediaConsent";

const COOKIE_SETTINGS_TRANSITION_MS = 560;

export default function CookieConsent({ isHome = false }: { isHome?: boolean }) {
  const [ready, setReady] = useState(false);
  const [choice, setChoice] = useState<MediaConsent>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsClosing, setSettingsClosing] = useState(false);
  const dialogRef = useRef<HTMLElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const settingsOpenerRef = useRef<HTMLElement | null>(null);
  const settingsClosingRef = useRef(false);
  const settingsOpenRef = useRef(false);
  const closeTimerRef = useRef<number | null>(null);

  const closeSettings = useCallback((afterClose?: () => void) => {
    if (!settingsOpen || settingsClosingRef.current) return;

    settingsClosingRef.current = true;
    setSettingsClosing(true);
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    const delay = reduced ? 0 : COOKIE_SETTINGS_TRANSITION_MS;

    if (closeTimerRef.current !== null) window.clearTimeout(closeTimerRef.current);
    closeTimerRef.current = window.setTimeout(() => {
      closeTimerRef.current = null;
      settingsOpenRef.current = false;
      setSettingsOpen(false);
      setSettingsClosing(false);
      settingsClosingRef.current = false;
      restoreFocus(settingsOpenerRef.current);
      afterClose?.();
    }, delay);
  }, [settingsOpen]);

  useEffect(() => {
    setChoice(readMediaConsent());
    setReady(true);

    const onConsentChange = (event: Event) => {
      const detail = (event as CustomEvent<Exclude<MediaConsent, null>>).detail;
      if (detail === "allowed" || detail === "rejected") setChoice(detail);
    };

    const openSettings = (opener?: HTMLElement | null) => {
      if (settingsOpenRef.current || settingsClosingRef.current) return;
      settingsOpenRef.current = true;
      settingsOpenerRef.current = opener ?? (document.activeElement instanceof HTMLElement ? document.activeElement : null);
      settingsClosingRef.current = false;
      setSettingsClosing(false);
      setSettingsOpen(true);
    };




    const runtimeWindow = window as Window & {
      __valieCookieSettingsPending?: boolean;
      __valieCookieSettingsOpener?: HTMLElement | null;
      __valieCookieSettingsRestoreScrollTop?: number;
    };

    const onOpenSettings = () => {
      const opener = runtimeWindow.__valieCookieSettingsOpener ?? null;
      const restoreScrollTop = runtimeWindow.__valieCookieSettingsRestoreScrollTop;
      runtimeWindow.__valieCookieSettingsPending = false;
      runtimeWindow.__valieCookieSettingsOpener = null;
      runtimeWindow.__valieCookieSettingsRestoreScrollTop = undefined;
      openSettings(opener);
      if (typeof restoreScrollTop === "number") {
        window.requestAnimationFrame(() => {
          window.requestAnimationFrame(() => {
            if (dialogRef.current) dialogRef.current.scrollTop = restoreScrollTop;
          });
        });
      }
    };

    window.addEventListener(MEDIA_CONSENT_CHANGE_EVENT, onConsentChange as EventListener);
    window.addEventListener(OPEN_COOKIE_SETTINGS_EVENT, onOpenSettings);

    if (runtimeWindow.__valieCookieSettingsPending) {
      window.setTimeout(onOpenSettings, 0);
    }

    return () => {
      window.removeEventListener(MEDIA_CONSENT_CHANGE_EVENT, onConsentChange as EventListener);
      window.removeEventListener(OPEN_COOKIE_SETTINGS_EVENT, onOpenSettings);
    };
  }, []);


  useEffect(() => {
    if (!settingsOpen) return;

    const unlockScroll = lockDocumentScroll("cookie-settings-locked");
    const releaseIsolation = dialogRef.current ? isolateDialog(dialogRef.current) : () => {};
    const focusTimer = window.setTimeout(() => closeButtonRef.current?.focus({ preventScroll: true }), 0);
    const onKey = (event: KeyboardEvent) => {
      const dialog = dialogRef.current;
      if (event.key === "Escape") {
        event.preventDefault();
        closeSettings();
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
    };
  }, [closeSettings, settingsOpen]);

  useEffect(() => () => {
    if (closeTimerRef.current !== null) window.clearTimeout(closeTimerRef.current);
  }, []);

  const openLegalFromSettings = useCallback((path: "/privacy" | "/cookies" | "/policies", event: ReactMouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    if (settingsClosingRef.current) return;

    const capturedY = window.scrollY || window.pageYOffset || 0;
    const cookieSettingsOpener = event.currentTarget;
    const cookieSettingsScrollTop = dialogRef.current?.scrollTop ?? 0;

    window.dispatchEvent(new CustomEvent("valie:open-legal-portal", {
      detail: {
        path,
        capturedY,
        keepCookieSettingsOpen: true,
        cookieSettingsOpener,
        cookieSettingsScrollTop,
      },
    }));
  }, []);

  const saveChoice = useCallback((next: Exclude<MediaConsent, null>) => {
    writeMediaConsent(next);
    setChoice(next);

    const notify = () => {
      showSuccess(
        next === "allowed"
          ? "Optional YouTube media is allowed. You can change this anytime in Cookie Settings."
          : "Optional YouTube media will stay blocked until you allow it.",
        { title: "PRIVACY SAVED", duration: 3200 },
      );
    };

    if (settingsOpen) closeSettings(notify);
    else notify();
  }, [closeSettings, settingsOpen]);

  if (!ready) return null;

  const firstChoice = choice === null;
  const showFirstChoice = firstChoice && isHome;
  const visible = showFirstChoice || settingsOpen;
  if (!visible) return null;

  const layer = (
    <div
      className={`cookie-consent-layer ${settingsOpen ? "is-settings-open" : ""} ${settingsClosing ? "is-settings-closing" : ""}`.trim()}
      aria-live="polite"
      onPointerDown={(event) => {
        if (settingsOpen && event.target === event.currentTarget) closeSettings();
      }}
    >
      <section
        ref={dialogRef}
        className={`cookie-consent ${settingsOpen ? "is-settings" : "is-first-choice"}`}
        role="dialog"
        aria-modal={settingsOpen ? "true" : "false"}
        aria-labelledby="cookie-consent-title"
        aria-describedby="cookie-consent-description"
      >
        <span className="cookie-consent__accent" aria-hidden="true" />

        {settingsOpen ? (
          <div className="cookie-settings-panel">
            <div className="cookie-settings-panel__top">
              <div className="cookie-settings-panel__identity">
                <span className="cookie-settings-panel__icon" aria-hidden="true"><ShieldCheck size={18} strokeWidth={1.8} /></span>
                <div>
                  <p className="cookie-consent__eyebrow">PRIVACY PREFERENCES</p>
                  <h2 id="cookie-consent-title">COOKIE SETTINGS.</h2>
                </div>
              </div>
              <button
                ref={closeButtonRef}
                className="cookie-consent__close cookie-settings-panel__close"
                type="button"
                onClick={() => closeSettings()}
                disabled={settingsClosing}
                aria-label="Close cookie settings"
              >
                <X size={16} />
              </button>
            </div>

            <p id="cookie-consent-description" className="cookie-settings-panel__intro">
              VALIE does not use advertising or analytics trackers in this build. Choose whether optional YouTube portfolio media may connect to YouTube/Google on this device.
            </p>

            <div className="cookie-settings-panel__status" role="status">
              <span>CURRENT MEDIA STATE</span>
              <strong className={choice === "allowed" ? "is-allowed" : "is-blocked"}>
                <i aria-hidden="true" />
                {choice === "allowed" ? "MEDIA ALLOWED" : choice === "rejected" ? "MEDIA BLOCKED" : "NOT SET"}
              </strong>
            </div>

            <div className="cookie-settings-panel__choices" aria-label="Optional media preference">
              <button
                className={`cookie-settings-choice ${choice === "rejected" ? "is-selected" : ""}`}
                type="button"
                aria-pressed={choice === "rejected"}
                disabled={settingsClosing}
                onClick={() => saveChoice("rejected")}
              >
                <span className="cookie-settings-choice__icon" aria-hidden="true"><ShieldOff size={18} /></span>
                <span className="cookie-settings-choice__copy">
                  <strong>KEEP MEDIA BLOCKED</strong>
                  <small>No YouTube embed is loaded until you change this setting.</small>
                </span>
                {choice === "rejected" ? <Check className="cookie-settings-choice__check" size={15} aria-hidden="true" /> : null}
              </button>

              <button
                className={`cookie-settings-choice cookie-settings-choice--allow ${choice === "allowed" ? "is-selected" : ""}`}
                type="button"
                aria-pressed={choice === "allowed"}
                disabled={settingsClosing}
                onClick={() => saveChoice("allowed")}
              >
                <span className="cookie-settings-choice__icon" aria-hidden="true"><PlayCircle size={18} /></span>
                <span className="cookie-settings-choice__copy">
                  <strong>ALLOW YOUTUBE MEDIA</strong>
                  <small>Portfolio videos may connect to YouTube/Google and play normally.</small>
                </span>
                {choice === "allowed" ? <Check className="cookie-settings-choice__check" size={15} aria-hidden="true" /> : null}
              </button>
            </div>

            <div className="cookie-settings-panel__legal">
              <span>READ MORE</span>
              <div>
                <a href="/cookies" data-valie-legal-deferred onClick={(event) => openLegalFromSettings("/cookies", event)}>COOKIE POLICY</a>
                <a href="/privacy" data-valie-legal-deferred onClick={(event) => openLegalFromSettings("/privacy", event)}>PRIVACY POLICY</a>
                <a href="/policies" data-valie-legal-deferred onClick={(event) => openLegalFromSettings("/policies", event)}>SITE POLICIES</a>
              </div>
            </div>

            <div className="cookie-settings-panel__footer">
              <button type="button" className="portfolio-back-button cookie-settings-panel__back" onClick={() => closeSettings()} disabled={settingsClosing}><ArrowLeft size={13} strokeWidth={1.8} aria-hidden="true" /><span>BACK TO PORTFOLIO</span></button>
              <button className="cookie-settings-panel__done" type="button" onClick={() => closeSettings()} disabled={settingsClosing}>DONE</button>
            </div>
          </div>
        ) : (
          <>
            <div className="cookie-consent__icon" aria-hidden="true">
              <ShieldCheck size={19} strokeWidth={2} />
            </div>

            <div className="cookie-consent__copy">
              <p className="cookie-consent__eyebrow">PRIVACY CONTROL</p>
              <h2 id="cookie-consent-title">OPTIONAL MEDIA</h2>
              <p id="cookie-consent-description">
                VALIE does not use advertising or analytics trackers in this build. YouTube videos stay blocked until you allow optional media. Your choice is remembered on this device.
              </p>
              <div className="cookie-consent__links">
                <a href="/cookies">COOKIE POLICY</a>
                <a href="/privacy">PRIVACY POLICY</a>
              </div>
            </div>

            <div className="cookie-consent__actions">
              <button
                className="cookie-consent__button cookie-consent__button--secondary"
                type="button"
                onClick={() => saveChoice("rejected")}
              >
                REJECT NON-ESSENTIAL
              </button>
              <button
                className="cookie-consent__button cookie-consent__button--primary"
                type="button"
                onClick={() => saveChoice("allowed")}
              >
                ALLOW MEDIA
              </button>
            </div>
          </>
        )}
      </section>
    </div>
  );







  if (settingsOpen) return createPortal(layer, document.body);

  return layer;
}
