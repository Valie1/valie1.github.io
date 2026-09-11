(function () {
  "use strict";

  var header = null;
  var button = null;
  var label = null;
  var menu = null;
  var links = [];
  var open = false;
  var touchY = null;
  var touchActivation = null;
  var suppressClickUntil = 0;

  function focusable() {
    return [button].concat(links).filter(Boolean);
  }

  function setOpen(next, restore) {
    if (!header || !button || !menu) return;
    open = Boolean(next);
    header.classList.toggle("is-menu-open", open);
    menu.classList.toggle("is-open", open);
    button.setAttribute("aria-expanded", open ? "true" : "false");
    button.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    menu.setAttribute("aria-hidden", open ? "false" : "true");
    if (label) label.textContent = open ? "CLOSE" : "MENU";
    links.forEach(function (link) { link.tabIndex = open ? 0 : -1; });
    document.documentElement.classList.toggle("mobile-menu-locked", open);
    document.body.classList.toggle("mobile-menu-locked", open);
    if (open) window.setTimeout(function () { if (links[0]) links[0].focus({ preventScroll: true }); }, 180);
    else if (restore && button) button.focus({ preventScroll: true });
  }

  function storedHref(link) {
    if (!link) return "";
    return link.getAttribute("data-valie-link-href") || link.getAttribute("href") || "";
  }

  function decodeHash(hash) {
    if (!hash) return "";
    try { return decodeURIComponent(hash.replace(/^#/, "")); }
    catch (_) { return hash.replace(/^#/, ""); }
  }

  function scrollToTarget(url) {
    var hash = url.hash || "";
    if (!hash) {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      return;
    }
    var id = decodeHash(hash);
    var target = id ? document.getElementById(id) : null;
    if (!target) {
      window.location.assign(url.href);
      return;
    }

    if (url.hash !== window.location.hash) {
      window.history.pushState(null, "", url.pathname + url.search + url.hash);
      try { window.dispatchEvent(new HashChangeEvent("hashchange")); }
      catch (_) { window.dispatchEvent(new Event("hashchange")); }
    }

    var reduceMotion = false;
    try { reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (_) {}
    target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
  }

  function navigateMobileLink(link) {
    var raw = storedHref(link);
    if (!raw) return;

    var url;
    try { url = new URL(raw, window.location.href); }
    catch (_) { return; }

    setOpen(false, false);

    window.requestAnimationFrame(function () {
      window.requestAnimationFrame(function () {
        if (url.origin === window.location.origin && url.pathname === window.location.pathname && url.search === window.location.search) {
          scrollToTarget(url);
        } else {
          window.location.assign(url.href);
        }
      });
    });
  }

  function activateMobileLink(event, link) {
    if (!link) return;
    if (event && typeof event.preventDefault === "function") event.preventDefault();
    navigateMobileLink(link);
  }

  function onKey(event) {
    if (!open) return;
    if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false, true);
      return;
    }
    if (event.key !== "Tab") return;
    var items = focusable();
    if (!items.length) return;
    var first = items[0];
    var last = items[items.length - 1];
    var active = document.activeElement;
    if (event.shiftKey && (active === first || items.indexOf(active) === -1)) {
      event.preventDefault();
      last.focus({ preventScroll: true });
    } else if (!event.shiftKey && (active === last || items.indexOf(active) === -1)) {
      event.preventDefault();
      first.focus({ preventScroll: true });
    }
  }

  function onWheel(event) {
    if (!open || !menu) return;
    if (menu.contains(event.target)) return;
    event.preventDefault();
  }

  function onTouchStart(event) {
    if (!open || !event.touches.length) return;
    touchY = event.touches[0].clientY;
  }

  function onTouchMove(event) {
    if (!open || !menu) return;
    if (menu.contains(event.target)) return;
    if (touchY !== null && event.touches.length) touchY = event.touches[0].clientY;
    event.preventDefault();
  }

  function armTouchActivation(event, link) {
    if (!open || !event.isPrimary || (event.pointerType !== "touch" && event.pointerType !== "pen")) return;
    touchActivation = {
      pointerId: event.pointerId,
      link: link,
      x: event.clientX,
      y: event.clientY,
      moved: false
    };
  }

  function trackTouchActivation(event) {
    if (!touchActivation || touchActivation.pointerId !== event.pointerId) return;
    if (Math.abs(event.clientX - touchActivation.x) > 12 || Math.abs(event.clientY - touchActivation.y) > 12) {
      touchActivation.moved = true;
    }
  }

  function finishTouchActivation(event) {
    if (!touchActivation || touchActivation.pointerId !== event.pointerId) return;
    var activation = touchActivation;
    touchActivation = null;
    if (activation.moved) return;
    suppressClickUntil = (window.performance && performance.now ? performance.now() : Date.now()) + 700;
    activateMobileLink(event, activation.link);
  }

  function cancelTouchActivation(event) {
    if (!touchActivation) return;
    if (!event || touchActivation.pointerId === event.pointerId) touchActivation = null;
  }

  function boot() {
    header = document.querySelector("[data-static-site-nav]");
    if (!header) return;
    button = header.querySelector("[data-site-menu-button]");
    label = header.querySelector("[data-site-menu-label]");
    menu = header.querySelector("[data-site-mobile-menu]");
    links = Array.prototype.slice.call(header.querySelectorAll("[data-site-mobile-link]"));
    if (!button || !menu) return;

    button.addEventListener("click", function () { setOpen(!open, false); });

    links.forEach(function (link) {
      link.addEventListener("pointerdown", function (event) { armTouchActivation(event, link); });
      link.addEventListener("pointermove", trackTouchActivation);
      link.addEventListener("pointerup", finishTouchActivation);
      link.addEventListener("pointercancel", cancelTouchActivation);
      link.addEventListener("click", function (event) {
        var now = window.performance && performance.now ? performance.now() : Date.now();
        if (now < suppressClickUntil) {
          event.preventDefault();
          return;
        }
        if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
          setOpen(false, false);
          return;
        }
        activateMobileLink(event, link);
      });
    });

    window.addEventListener("keydown", onKey, true);
    window.addEventListener("resize", function () { if (window.innerWidth > 760 && open) setOpen(false, false); }, { passive: true });
    document.addEventListener("wheel", onWheel, { passive: false, capture: true });
    document.addEventListener("touchstart", onTouchStart, { passive: true, capture: true });
    document.addEventListener("touchmove", onTouchMove, { passive: false, capture: true });
    setOpen(false, false);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot, { once: true });
  else boot();
})();
