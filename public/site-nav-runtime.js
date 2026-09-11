(function () {
  "use strict";

  var header = null;
  var button = null;
  var label = null;
  var menu = null;
  var links = [];
  var open = false;
  var touchY = null;
  var isolatedNodes = [];

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
    if (!id) return;
    var target = document.getElementById(id);
    if (!target) return;
    try { target.scrollIntoView({ block: "start", behavior: "auto" }); }
    catch (_) { target.scrollIntoView(true); }
  }

  function closestMobileLink(target) {
    if (!(target instanceof Element)) return null;
    var link = target.closest("[data-site-mobile-link]");
    return link instanceof HTMLAnchorElement && menu && menu.contains(link) ? link : null;
  }

  function onMenuClick(event) {
    if (!open) return;
    var link = closestMobileLink(event.target);
    if (!link) return;

    var isPrimary = event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;
    var id = targetId(link);

    setOpen(false, false);

    if (!isPrimary || !id) return;

    window.setTimeout(function () {
      scrollTargetIntoView(id);
    }, 0);

    window.setTimeout(function () {
      scrollTargetIntoView(id);
    }, 120);
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
    menu.addEventListener("click", onMenuClick, false);

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
