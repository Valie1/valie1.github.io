(function () {
  "use strict";

  var header = null;
  var button = null;
  var label = null;
  var menu = null;
  var links = [];
  var open = false;
  var touchY = null;
  var touchStart = null;
  var suppressClickUntil = 0;

  function now() {
    return window.performance && performance.now ? performance.now() : Date.now();
  }

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
    return link.getAttribute("href") || link.getAttribute("data-valie-link-href") || "";
  }

  function decodeHash(hash) {
    if (!hash) return "";
    try { return decodeURIComponent(hash.replace(/^#/, "")); }
    catch (_) { return hash.replace(/^#/, ""); }
  }

  function targetId(link, url) {
    return (link && link.getAttribute("data-site-target")) || decodeHash(url.hash || "");
  }

  function scrollToTarget(id, url) {
    if (!id) {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      return;
    }

    var target = document.getElementById(id);
    if (!target) {
      window.location.assign(url.href);
      return;
    }

    var nextUrl = url.pathname + url.search + "#" + encodeURIComponent(id);
    if (window.location.hash !== "#" + encodeURIComponent(id)) {
      window.history.pushState(null, "", nextUrl);
      try { window.dispatchEvent(new HashChangeEvent("hashchange")); }
      catch (_) { window.dispatchEvent(new Event("hashchange")); }
    }

    var reduceMotion = false;
    try { reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (_) {}

    var headerHeight = header ? Math.max(0, header.getBoundingClientRect().height) : 0;
    var targetTop = window.scrollY + target.getBoundingClientRect().top;
    var top = Math.max(0, targetTop - headerHeight - 8);
    window.scrollTo({ top: top, left: 0, behavior: reduceMotion ? "auto" : "smooth" });
  }

  function navigateMobileLink(link) {
    var raw = storedHref(link);
    if (!raw) return;

    var url;
    try { url = new URL(raw, window.location.href); }
    catch (_) { return; }

    var id = targetId(link, url);
    setOpen(false, false);

    window.requestAnimationFrame(function () {
      window.requestAnimationFrame(function () {
        window.setTimeout(function () {
          if (url.origin === window.location.origin && url.pathname === window.location.pathname && url.search === window.location.search) {
            scrollToTarget(id, url);
          } else {
            window.location.assign(url.href);
          }
        }, 0);
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

  function rememberLinkTouch(event, link) {
    if (!open || !event.touches || !event.touches.length) return;
    var touch = event.touches[0];
    touchStart = { link: link, x: touch.clientX, y: touch.clientY };
  }

  function finishLinkTouch(event, link) {
    if (!open || !touchStart || touchStart.link !== link) return;
    var start = touchStart;
    touchStart = null;
    var touch = event.changedTouches && event.changedTouches[0];
    if (!touch) return;
    if (Math.abs(touch.clientX - start.x) > 22 || Math.abs(touch.clientY - start.y) > 22) return;
    suppressClickUntil = now() + 800;
    activateMobileLink(event, link);
  }

  function cancelLinkTouch() {
    touchStart = null;
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
      link.addEventListener("touchstart", function (event) { rememberLinkTouch(event, link); }, { passive: true });
      link.addEventListener("touchend", function (event) { finishLinkTouch(event, link); }, { passive: false });
      link.addEventListener("touchcancel", cancelLinkTouch, { passive: true });
      link.addEventListener("click", function (event) {
        if (now() < suppressClickUntil) {
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
