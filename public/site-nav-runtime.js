(function () {
  "use strict";

  var header = null;
  var button = null;
  var label = null;
  var menu = null;
  var links = [];
  var open = false;
  var isolatedNodes = [];
  var fallbackTimer = 0;
  var lastActivatedId = "";
  var lastActivatedAt = 0;

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

  function decodeHash(hash) {
    if (!hash) return "";
    try { return decodeURIComponent(hash.replace(/^#/, "")); }
    catch (_) { return hash.replace(/^#/, ""); }
  }

  function targetId(link) {
    if (!link) return "";
    return link.getAttribute("data-site-target") || decodeHash(link.hash || link.getAttribute("href") || "");
  }

  function scrollTargetIntoView(id) {
    if (!id) return false;
    var target = document.getElementById(id);
    if (!target) return false;
    var headerHeight = header ? Math.ceil(header.getBoundingClientRect().height) : 0;
    var top = Math.max(0, Math.round(window.scrollY + target.getBoundingClientRect().top - headerHeight));
    try { window.scrollTo({ top: top, left: 0, behavior: "auto" }); }
    catch (_) { window.scrollTo(0, top); }
    return true;
  }

  function forceHashAndScroll(id) {
    if (!id) return;
    var hash = "#" + encodeURIComponent(id);
    if (window.location.hash !== hash) {
      try { window.history.pushState(null, "", hash); }
      catch (_) { window.location.hash = hash; }
    }
    window.requestAnimationFrame(function () {
      window.requestAnimationFrame(function () { scrollTargetIntoView(id); });
    });
    window.setTimeout(function () { scrollTargetIntoView(id); }, 90);
  }

  function isPlainPrimaryClick(event) {
    return event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;
  }

  function directMobileLinkClick(event) {
    var link = event.currentTarget;
    if (!(link instanceof HTMLAnchorElement)) return;

    var id = targetId(link);
    var plain = isPlainPrimaryClick(event);

    setOpen(false, false);

    if (!plain || !id) return;

    lastActivatedId = id;
    lastActivatedAt = Date.now();

    window.clearTimeout(fallbackTimer);
    fallbackTimer = window.setTimeout(function () {
      scrollTargetIntoView(id);
    }, 40);

    if (event.defaultPrevented) forceHashAndScroll(id);
  }

  function closestMobileLink(target) {
    if (!(target instanceof Element)) return null;
    var link = target.closest("[data-site-mobile-link]");
    return link instanceof HTMLAnchorElement && menu && menu.contains(link) ? link : null;
  }

  function delegatedMenuClick(event) {
    var link = closestMobileLink(event.target);
    if (!link) return;
    if (open) setOpen(false, false);
    if (!isPlainPrimaryClick(event)) return;
    var id = targetId(link);
    if (!id) return;
    window.clearTimeout(fallbackTimer);
    fallbackTimer = window.setTimeout(function () { scrollTargetIntoView(id); }, 55);
  }

  function onHashChange() {
    if (open) setOpen(false, false);
    var id = decodeHash(window.location.hash);
    if (!id) return;
    window.requestAnimationFrame(function () {
      window.requestAnimationFrame(function () { scrollTargetIntoView(id); });
    });
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

  function onTouchMove(event) {
    if (!open || !menu) return;
    if (menu.contains(event.target)) return;
    event.preventDefault();
    event.stopPropagation();
  }

  function onDocumentPointerDown(event) {
    if (!open || !header) return;
    if (header.contains(event.target)) return;
    event.preventDefault();
    event.stopImmediatePropagation();
  }

  function bindLinks() {
    links.forEach(function (link) {
      if (link.dataset.valieMenuBound === "true") return;
      link.dataset.valieMenuBound = "true";
      link.addEventListener("click", directMobileLinkClick, true);
    });
  }

  function boot() {
    header = document.querySelector("[data-static-site-nav]");
    if (!header) return;
    button = header.querySelector("[data-site-menu-button]");
    label = header.querySelector("[data-site-menu-label]");
    menu = header.querySelector("[data-site-mobile-menu]");
    links = Array.prototype.slice.call(header.querySelectorAll("[data-site-mobile-link]"));
    if (!button || !menu) return;

    bindLinks();
    button.addEventListener("click", function () { setOpen(!open, false); });
    menu.addEventListener("click", delegatedMenuClick, false);

    window.addEventListener("keydown", onKey, true);
    window.addEventListener("hashchange", onHashChange, false);
    window.addEventListener("resize", function () { if (window.innerWidth > 760 && open) setOpen(false, false); }, { passive: true });
    document.addEventListener("wheel", onWheel, { passive: false, capture: true });
    document.addEventListener("touchmove", onTouchMove, { passive: false, capture: true });
    document.addEventListener("pointerdown", onDocumentPointerDown, true);
    window.addEventListener("pageshow", function () { if (open) setOpen(false, false); });
    setOpen(false, false);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot, { once: true });
  else boot();
})();
