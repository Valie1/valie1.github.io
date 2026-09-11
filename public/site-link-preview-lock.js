(function () {
  "use strict";

  var HREF_ATTR = "data-valie-link-href";
  var MARK_ATTR = "data-valie-link-preview-lock";
  var booted = false;

  function shouldSkip(anchor) {
    return anchor instanceof HTMLAnchorElement && anchor.hasAttribute("data-valie-link-preview-skip");
  }

  function arm(anchor) {
    if (!(anchor instanceof HTMLAnchorElement) || shouldSkip(anchor)) return;
    if (anchor.hasAttribute(MARK_ATTR)) return;
    var href = anchor.getAttribute("href");
    if (href === null) return;
    anchor.setAttribute(HREF_ATTR, href);
    anchor.setAttribute(MARK_ATTR, "");
    anchor.removeAttribute("href");
    anchor.style.cursor = "pointer";
  }

  function disarm(anchor) {
    if (!(anchor instanceof HTMLAnchorElement) || shouldSkip(anchor)) return;
    if (!anchor.hasAttribute(MARK_ATTR)) return;
    var href = anchor.getAttribute(HREF_ATTR);
    if (href !== null) anchor.setAttribute("href", href);
    anchor.removeAttribute(HREF_ATTR);
    anchor.removeAttribute(MARK_ATTR);
    anchor.style.removeProperty("cursor");
  }

  function storedHref(anchor) {
    return anchor.getAttribute(HREF_ATTR) || anchor.getAttribute("href") || "";
  }

  function scrollToHash(url) {
    var hash = url.hash || "";
    if (!hash) {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      return;
    }
    var id = "";
    try { id = decodeURIComponent(hash.slice(1)); } catch (_) { id = hash.slice(1); }
    var target = id ? document.getElementById(id) : null;
    if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function navigate(anchor, event) {
    var raw = storedHref(anchor);
    if (!raw) return;

    if (anchor.hasAttribute("download")) {
      var temp = document.createElement("a");
      temp.href = raw;
      temp.download = anchor.getAttribute("download") || "";
      temp.style.display = "none";
      document.body.appendChild(temp);
      temp.click();
      temp.remove();
      return;
    }

    var url;
    try { url = new URL(raw, window.location.href); } catch (_) { return; }

    var newTab = anchor.target === "_blank" || event.metaKey || event.ctrlKey || event.shiftKey || event.button === 1;
    if (newTab) {
      var opened = window.open(url.href, "_blank", "noopener,noreferrer");
      if (opened) opened.opener = null;
      return;
    }

    if (url.protocol === "mailto:" || url.protocol === "tel:" || url.protocol === "sms:") {
      window.location.href = url.href;
      return;
    }

    if (url.origin === window.location.origin && url.pathname === window.location.pathname && url.search === window.location.search) {
      if (url.hash !== window.location.hash) {
        window.history.pushState(null, "", url.pathname + url.search + url.hash);
        window.dispatchEvent(new HashChangeEvent("hashchange"));
      }
      scrollToHash(url);
      return;
    }

    window.location.assign(url.href);
  }

  function closestAnchor(target, selector) {
    if (!(target instanceof Element)) return null;
    var anchor = target.closest(selector);
    return anchor instanceof HTMLAnchorElement ? anchor : null;
  }

  function onPointerOver(event) {
    var anchor = closestAnchor(event.target, "a[href]");
    if (!anchor) return;
    var related = event.relatedTarget;
    if (related instanceof Node && anchor.contains(related)) return;
    arm(anchor);
  }

  function onPointerOut(event) {
    var anchor = closestAnchor(event.target, "a[" + MARK_ATTR + "]");
    if (!anchor) return;
    var related = event.relatedTarget;
    if (related instanceof Node && anchor.contains(related)) return;
    disarm(anchor);
  }

  function onClick(event) {
    if (event.defaultPrevented || event.button !== 0) return;
    var anchor = closestAnchor(event.target, "a[" + HREF_ATTR + "]");
    if (!anchor || shouldSkip(anchor) || anchor.hasAttribute("data-valie-legal-deferred")) return;
    event.preventDefault();
    navigate(anchor, event);
  }

  function onAuxClick(event) {
    if (event.defaultPrevented || event.button !== 1) return;
    var anchor = closestAnchor(event.target, "a[" + HREF_ATTR + "]");
    if (!anchor) return;
    event.preventDefault();
    navigate(anchor, event);
  }

  function onContextMenu(event) {
    var anchor = closestAnchor(event.target, "a[" + HREF_ATTR + "]");
    if (anchor) disarm(anchor);
  }

  function boot() {
    if (booted) return;
    booted = true;
    document.addEventListener("pointerover", onPointerOver, true);
    document.addEventListener("pointerout", onPointerOut, true);
    document.addEventListener("click", onClick, true);
    document.addEventListener("auxclick", onAuxClick, true);
    document.addEventListener("contextmenu", onContextMenu, true);
  }

  function scheduleBoot() {
    window.setTimeout(function () {
      window.requestAnimationFrame(function () {
        window.requestAnimationFrame(boot);
      });
    }, 0);
  }

  if (document.readyState === "complete") scheduleBoot();
  else window.addEventListener("load", scheduleBoot, { once: true });
})();
