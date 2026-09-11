(function () {
  "use strict";

  var header = null;
  var button = null;
  var label = null;
  var menu = null;
  var links = [];
  var open = false;
  var touchY = null;
  var pointerStart = null;
  var suppressClickUntil = 0;
  var isolatedNodes = [];

  function now() {
    return window.performance && performance.now ? performance.now() : Date.now();
  }

  function focusable() {
    return [button].concat(links).filter(Boolean);
  }

  function setNodeInert(node, inert) {
    if (!node || !(node instanceof HTMLElement)) return;
    try { node.inert = inert; } catch (_) {}
    if (inert) node.setAttribute("inert", "");
    else node.removeAttribute("inert");
  }

  function isolateBackground(next) {
    if (next) {
      if (isolatedNodes.length) return;
      Array.prototype.forEach.call(document.body.children, function (node) {
        if (!(node instanceof HTMLElement) || node === header) return;
        var tag = node.tagName;
        if (tag === "SCRIPT" || tag === "STYLE" || tag === "LINK") return;
        isolatedNodes.push({
          node: node,
          inert: Boolean(node.inert || node.hasAttribute("inert")),
          ariaHidden: node.getAttribute("aria-hidden")
        });
        setNodeInert(node, true);
        node.setAttribute("aria-hidden", "true");
      });
      return;
    }

    isolatedNodes.forEach(function (record) {
      if (!record.node || !record.node.isConnected) return;
      setNodeInert(record.node, record.inert);
      if (record.ariaHidden === null) record.node.removeAttribute("aria-hidden");
      else record.node.setAttribute("aria-hidden", record.ariaHidden);
    });
    isolatedNodes = [];
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
    isolateBackground(open);
    if (open) {
      window.setTimeout(function () {
        if (!open || !links[0]) return;
        var keyboardMode = document.documentElement.dataset.valieInput === "keyboard";
        if (keyboardMode) links[0].focus({ preventScroll: true });
      }, 120);
    } else if (restore && button) {
      button.focus({ preventScroll: true });
    }
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
      window.scrollTo(0, 0);
      return;
    }

    var target = document.getElementById(id);
    if (!target) {
      window.location.assign(url.href);
      return;
    }

    var nextHash = "#" + encodeURIComponent(id);
    var nextUrl = url.pathname + url.search + nextHash;
    if (window.location.pathname + window.location.search + window.location.hash !== nextUrl) {
      window.history.pushState(null, "", nextUrl);
      try { window.dispatchEvent(new HashChangeEvent("hashchange")); }
      catch (_) { window.dispatchEvent(new Event("hashchange")); }
    }

    var headerHeight = header ? Math.max(0, header.getBoundingClientRect().height) : 0;
    var targetTop = window.scrollY + target.getBoundingClientRect().top;
    var top = Math.max(0, Math.round(targetTop - headerHeight - 8));
    window.scrollTo(0, top);
    window.setTimeout(function () {
      var current = document.getElementById(id);
      if (!current) return;
      var nextTop = Math.max(0, Math.round(window.scrollY + current.getBoundingClientRect().top - (header ? header.getBoundingClientRect().height : 0) - 8));
      if (Math.abs(nextTop - window.scrollY) > 2) window.scrollTo(0, nextTop);
    }, 90);
  }

  function navigateMobileLink(link) {
    var raw = storedHref(link);
    if (!raw) return;

    var url;
    try { url = new URL(raw, window.location.href); }
    catch (_) { return; }

    var id = targetId(link, url);
    var samePage = url.origin === window.location.origin && url.pathname === window.location.pathname && url.search === window.location.search;
    setOpen(false, false);

    if (!samePage) {
      window.location.assign(url.href);
      return;
    }

    window.requestAnimationFrame(function () {
      scrollToTarget(id, url);
    });
  }

  function activateMobileLink(event, link) {
    if (!link) return;
    if (event && typeof event.preventDefault === "function") event.preventDefault();
    if (event && typeof event.stopPropagation === "function") event.stopPropagation();
    navigateMobileLink(link);
  }

  function closestMobileLink(target) {
    if (!(target instanceof Element)) return null;
    var link = target.closest("[data-site-mobile-link]");
    return link instanceof HTMLAnchorElement && menu && menu.contains(link) ? link : null;
  }

  function onMenuPointerDown(event) {
    if (!open || event.pointerType === "mouse") return;
    var link = closestMobileLink(event.target);
    if (!link) {
      pointerStart = null;
      return;
    }
    pointerStart = { pointerId: event.pointerId, link: link, x: event.clientX, y: event.clientY };
  }

  function onMenuPointerUp(event) {
    if (!open || event.pointerType === "mouse" || !pointerStart) return;
    var start = pointerStart;
    pointerStart = null;
    if (start.pointerId !== event.pointerId) return;
    var link = closestMobileLink(event.target);
    if (!link || link !== start.link) return;
    if (Math.abs(event.clientX - start.x) > 38 || Math.abs(event.clientY - start.y) > 38) return;
    suppressClickUntil = now() + 900;
    activateMobileLink(event, link);
  }

  function onMenuPointerCancel() {
    pointerStart = null;
  }

  function onMenuClick(event) {
    if (!open) return;
    var link = closestMobileLink(event.target);
    if (!link) return;
    if (now() < suppressClickUntil) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      setOpen(false, false);
      return;
    }
    activateMobileLink(event, link);
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
    event.stopPropagation();
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
    event.stopPropagation();
  }

  function onDocumentPointerDown(event) {
    if (!open || !header) return;
    if (header.contains(event.target)) return;
    event.preventDefault();
    event.stopImmediatePropagation();
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
    menu.addEventListener("pointerdown", onMenuPointerDown, true);
    menu.addEventListener("pointerup", onMenuPointerUp, true);
    menu.addEventListener("pointercancel", onMenuPointerCancel, true);
    menu.addEventListener("click", onMenuClick, true);

    window.addEventListener("keydown", onKey, true);
    window.addEventListener("resize", function () { if (window.innerWidth > 760 && open) setOpen(false, false); }, { passive: true });
    document.addEventListener("wheel", onWheel, { passive: false, capture: true });
    document.addEventListener("touchstart", onTouchStart, { passive: true, capture: true });
    document.addEventListener("touchmove", onTouchMove, { passive: false, capture: true });
    document.addEventListener("pointerdown", onDocumentPointerDown, true);
    window.addEventListener("pageshow", function () { if (open) setOpen(false, false); });
    setOpen(false, false);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot, { once: true });
  else boot();
})();
