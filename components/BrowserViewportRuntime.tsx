"use client";

import { useEffect } from "react";

const PREVIEW_STAMP_PATTERN = /^PASS\s+\d+(?:\.\d+)+\s*[·•\-–—|]\s*PORT\s+\d+$/i;
const LEGACY_STAMP_SELECTOR = ".rk49-build-stamp,[data-build-stamp],[data-pass-stamp],[data-preview-stamp],#build-stamp,.dev-build-stamp,.pass-build-stamp";
const DRAG_EVENTS = ["dragstart", "drag", "dragenter", "dragover", "drop"] as const;
const POINTER_FOCUS_SELECTOR = 'a[href],a[data-valie-link-preview-lock],button,[role="button"],[role="tab"],summary,[tabindex],input[type="range"],input[type="checkbox"],input[type="radio"]';
const IMAGE_CONTEXT_SELECTOR = "img";

export default function BrowserViewportRuntime() {
  useEffect(() => {
    const root = document.documentElement;
    const visualViewport = window.visualViewport;
    let frame = 0;

    const sync = () => {
      frame = 0;
      const layoutWidth = Math.max(1, Math.round(window.innerWidth || document.documentElement.clientWidth));
      const layoutHeight = Math.max(1, Math.round(window.innerHeight || document.documentElement.clientHeight));
      const width = Math.max(1, Math.round(visualViewport?.width ?? layoutWidth));
      const height = Math.max(1, Math.round(visualViewport?.height ?? layoutHeight));
      const offsetTop = Math.max(0, Math.round(visualViewport?.offsetTop ?? 0));
      const offsetLeft = Math.max(0, Math.round(visualViewport?.offsetLeft ?? 0));
      const keyboardInset = Math.max(0, layoutHeight - height - offsetTop);
      root.style.setProperty("--valie-visual-width", `${width}px`);
      root.style.setProperty("--valie-visual-height", `${height}px`);
      root.style.setProperty("--valie-visual-top", `${offsetTop}px`);
      root.style.setProperty("--valie-visual-left", `${offsetLeft}px`);
      root.style.setProperty("--valie-keyboard-inset", `${keyboardInset}px`);
    };

    const requestSync = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(sync);
    };

    const removeStampCandidate = (node: HTMLElement) => {
      if (node.matches(LEGACY_STAMP_SELECTOR)) {
        node.remove();
        return;
      }
      const text = node.textContent?.replace(/\s+/g, " ").trim();
      if (!text || text.length > 56 || !PREVIEW_STAMP_PATTERN.test(text)) return;
      const rect = node.getBoundingClientRect();
      const style = window.getComputedStyle(node);
      const positioned = style.position === "fixed" || style.position === "absolute";
      if (positioned && rect.top < 150 && rect.left < 260 && rect.width < 420 && rect.height < 120) node.remove();
    };

    const scanForLegacyPreviewStamps = (scope: ParentNode) => {
      if (scope instanceof HTMLElement) removeStampCandidate(scope);
      scope.querySelectorAll<HTMLElement>(LEGACY_STAMP_SELECTOR).forEach((node) => node.remove());
      scope.querySelectorAll<HTMLElement>("*").forEach(removeStampCandidate);
    };

    const preventDrag = (event: DragEvent) => {
      event.preventDefault();
      event.stopPropagation();
      if (event.dataTransfer) event.dataTransfer.dropEffect = "none";
    };

    const preventSelectionDrag = (event: Event) => {
      const target = event.target instanceof Element ? event.target : null;
      if (target?.closest('input,textarea,select,[contenteditable="true"]')) return;
      event.preventDefault();
    };

    const preventImageContextMenu = (event: MouseEvent) => {
      const target = event.target instanceof Element ? event.target.closest(IMAGE_CONTEXT_SELECTOR) : null;
      if (!target) return;
      event.preventDefault();
      event.stopPropagation();
    };

    const setPointerModality = () => {
      root.dataset.valieInput = "pointer";
    };

    const setKeyboardModality = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      root.dataset.valieInput = "keyboard";
    };

    const releasePointerFocus = (event: PointerEvent) => {
      const source = event.target instanceof Element ? event.target : null;
      const target = source?.closest<HTMLElement>(POINTER_FOCUS_SELECTOR);
      if (!target || target.matches('textarea,select,[contenteditable="true"]') || target.closest('[contenteditable="true"]')) return;
      window.requestAnimationFrame(() => {
        if (document.activeElement === target) target.blur();
      });
    };

    root.dataset.valieHydrated = "true";
    window.dispatchEvent(new Event("valie:hydrated"));
    sync();
    scanForLegacyPreviewStamps(document.body);
    window.addEventListener("resize", requestSync, { passive: true });
    window.addEventListener("orientationchange", requestSync, { passive: true });
    visualViewport?.addEventListener("resize", requestSync, { passive: true });
    DRAG_EVENTS.forEach((eventName) => document.addEventListener(eventName, preventDrag, true));
    document.addEventListener("selectstart", preventSelectionDrag, true);
    document.addEventListener("contextmenu", preventImageContextMenu, true);
    document.addEventListener("pointerdown", setPointerModality, true);
    document.addEventListener("pointerup", releasePointerFocus, true);
    document.addEventListener("keydown", setKeyboardModality, true);

    const stampObserver = new MutationObserver((records) => {
      records.forEach((record) => {
        record.addedNodes.forEach((node) => {
          if (node instanceof HTMLElement) scanForLegacyPreviewStamps(node);
        });
      });
    });
    stampObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      stampObserver.disconnect();
      window.removeEventListener("resize", requestSync);
      window.removeEventListener("orientationchange", requestSync);
      visualViewport?.removeEventListener("resize", requestSync);
      DRAG_EVENTS.forEach((eventName) => document.removeEventListener(eventName, preventDrag, true));
      document.removeEventListener("selectstart", preventSelectionDrag, true);
      document.removeEventListener("contextmenu", preventImageContextMenu, true);
      document.removeEventListener("pointerdown", setPointerModality, true);
      document.removeEventListener("pointerup", releasePointerFocus, true);
      document.removeEventListener("keydown", setKeyboardModality, true);
      delete root.dataset.valieInput;
      delete root.dataset.valieHydrated;
      root.style.removeProperty("--valie-visual-width");
      root.style.removeProperty("--valie-visual-height");
      root.style.removeProperty("--valie-visual-top");
      root.style.removeProperty("--valie-visual-left");
      root.style.removeProperty("--valie-keyboard-inset");
    };
  }, []);

  return null;
}
