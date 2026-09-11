(function () {
  "use strict";

  var header = null;
  var button = null;
  var label = null;
  var menu = null;
  var links = [];
  var open = false;
  var isolatedNodes = [];
  var isolatedHeaderNodes = [];
  var fallbackTimer = 0;
  var lastActivationAt = 0;
  var lastActivationId = "";
  var press = null;
  var lockedScrollX = 0;
  var lockedScrollY = 0;
  var restoringScroll = false;
  var postTapGuardUntil = 0;
  var postTapShield = null;
  var postTapShieldTimer = 0;

  function focusable() {
    return [button].concat(links).filter(Boolean);
  }

  function setNodeInert(node, inert) {
    if (!node || !(node instanceof HTMLElement)) return;
    try { node.inert = inert; } catch (_) {}
    if (inert) node.setAttribute("inert", "");
    else node.removeAttribute("inert");
  }

  function rememberIsolation(node, bucket) {
    if (!(node instanceof HTMLElement)) return;
    bucket.push({
      node: node,
      inert: Boolean(node.inert || node.hasAttribute("inert")),
      ariaHidden: node.getAttribute("aria-hidden")
    });
    setNodeInert(node, true);
    node.setAttribute("aria-hidden", "true");
  }

  function restoreIsolation(bucket) {
    bucket.forEach(function (record) {
      if (!record.node || !record.node.isConnected) return;
      setNodeInert(record.node, record.inert);
      if (record.ariaHidden === null) record.node.removeAttribute("aria-hidden");
      else record.node.setAttribute("aria-hidden", record.ariaHidden);
    });
    bucket.length = 0;
  }

  function isolateBackground(next) {
    if (next) {
      if (isolatedNodes.length) return;
      Array.prototype.forEach.call(document.body.children, function (node) {
        if (!(node instanceof HTMLElement) || node === header) return;
        var tag = node.tagName;
        if (tag === "SCRIPT" || tag === "STYLE" || tag === "LINK") return;
        rememberIsolation(node, isolatedNodes);
      });
      return;
    }
    restoreIsolation(isolatedNodes);
  }

  function isolateHeaderChrome(next) {
    if (!header) return;
    if (next) {
      if (isolatedHeaderNodes.length) return;
      var chrome = header.querySelectorAll(".minimal-site-brand, .minimal-site-links");
      Array.prototype.forEach.call(chrome, function (node) {
        if (node === button || node === menu || (menu && menu.contains(node))) return;
        rememberIsolation(node, isolatedHeaderNodes);
      });
      return;
    }
    restoreIsolation(isolatedHeaderNodes);
  }

  function setOpen(next, restore) {
    if (!header || !button || !menu) return;
    var wasOpen = open;
    open = Boolean(next);
    if (open && !wasOpen) {
      lockedScrollX = window.scrollX || window.pageXOffset || 0;
      lockedScrollY = window.scrollY || window.pageYOffset || 0;
    }

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
    isolateHeaderChrome(open);

    if (!open) press = null;

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

  function writeHash(id) {
    if (!id) return;
    var hash = "#" + encodeURIComponent(id);
    if (window.location.hash === hash) return;
    try { window.history.pushState(null, "", hash); }
    catch (_) { window.location.hash = hash; }
  }

  function removePostTapShield() {
    window.clearTimeout(postTapShieldTimer);
    postTapShieldTimer = 0;
    if (postTapShield && postTapShield.parentNode) postTapShield.parentNode.removeChild(postTapShield);
    postTapShield = null;
  }

  function armPostTapShield() {
    postTapGuardUntil = Date.now() + 760;
    removePostTapShield();

    var shield = document.createElement("div");
    shield.className = "valie-mobile-menu-posttap-shield";
    shield.setAttribute("aria-hidden", "true");
    shield.setAttribute("data-valie-menu-posttap-shield", "");

    function swallow(event) { blockEvent(event); }
    ["pointerdown", "pointerup", "touchstart", "touchend", "click", "dblclick", "contextmenu"].forEach(function (type) {
      shield.addEventListener(type, swallow, { capture: true, passive: false });
    });

    document.body.appendChild(shield);
    postTapShield = shield;
    postTapShieldTimer = window.setTimeout(function () {
      removePostTapShield();
      if (Date.now() >= postTapGuardUntil) postTapGuardUntil = 0;
    }, 760);
  }

  function finishNavigation(id) {
    if (!id) return;
    if (open) armPostTapShield();
    setOpen(false, false);
    writeHash(id);
    window.clearTimeout(fallbackTimer);
    window.requestAnimationFrame(function () {
      window.requestAnimationFrame(function () { scrollTargetIntoView(id); });
    });
    fallbackTimer = window.setTimeout(function () { scrollTargetIntoView(id); }, 120);
  }

  function isPlainPrimaryClick(event) {
    return event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;
  }

  function pointInside(element, x, y) {
    if (!(element instanceof Element) || typeof x !== "number" || typeof y !== "number") return false;
    var rect = element.getBoundingClientRect();
    return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
  }

  function linkAtPoint(x, y) {
    if (!open || !links.length) return null;
    var hit = document.elementFromPoint(x, y);
    if (hit instanceof Element) {
      var closest = hit.closest("[data-site-mobile-link]");
      if (closest instanceof HTMLAnchorElement && menu && menu.contains(closest)) return closest;
    }
    for (var i = 0; i < links.length; i += 1) {
      var rect = links[i].getBoundingClientRect();
      if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) return links[i];
    }
    return null;
  }

  function isAllowedModalTarget(target, x, y) {
    if (!open) return true;
    if (target instanceof Node) {
      if (button && button.contains(target)) return true;
      if (menu && menu.contains(target)) return true;
    }
    if (pointInside(button, x, y)) return true;
    if (menu && pointInside(menu, x, y)) return true;
    if (typeof x === "number" && typeof y === "number" && linkAtPoint(x, y)) return true;
    return false;
  }

  function blockEvent(event) {
    if (event.cancelable) event.preventDefault();
    event.stopImmediatePropagation();
  }

  function rememberPress(event) {
    if (!open || event.button !== 0) return;
    var link = linkAtPoint(event.clientX, event.clientY);
    press = link ? { link: link, x: event.clientX, y: event.clientY, pointerId: event.pointerId } : null;
  }

  function activateFromPointer(event) {
    if (!open || event.button !== 0 || !press) return false;
    if (press.pointerId !== event.pointerId) return false;
    var dx = event.clientX - press.x;
    var dy = event.clientY - press.y;
    var startLink = press.link;
    press = null;
    if (Math.hypot(dx, dy) > 18) return false;
    var endLink = linkAtPoint(event.clientX, event.clientY);
    var link = endLink === startLink ? startLink : null;
    if (!link) return false;
    var id = targetId(link);
    if (!id) return false;
    event.preventDefault();
    event.stopPropagation();
    lastActivationAt = Date.now();
    lastActivationId = id;
    finishNavigation(id);
    return true;
  }

  function directMobileLinkClick(event) {
    var link = event.currentTarget;
    if (!(link instanceof HTMLAnchorElement) || !isPlainPrimaryClick(event)) return;
    var id = targetId(link);
    if (!id) return;
    event.preventDefault();
    if (Date.now() - lastActivationAt < 700 && lastActivationId === id) return;
    lastActivationAt = Date.now();
    lastActivationId = id;
    finishNavigation(id);
  }

  function closestMobileLink(target) {
    if (!(target instanceof Element)) return null;
    var link = target.closest("[data-site-mobile-link]");
    return link instanceof HTMLAnchorElement && menu && menu.contains(link) ? link : null;
  }

  function delegatedMenuClick(event) {
    var link = closestMobileLink(event.target);
    if (!link || !isPlainPrimaryClick(event)) return;
    var id = targetId(link);
    if (!id) return;
    event.preventDefault();
    if (Date.now() - lastActivationAt < 700 && lastActivationId === id) return;
    lastActivationAt = Date.now();
    lastActivationId = id;
    finishNavigation(id);
  }

  function activateFromTouchEnd(event) {
    if (!open || Date.now() - lastActivationAt < 700) return;
    var touch = event.changedTouches && event.changedTouches[0];
    if (!touch) return;
    var link = linkAtPoint(touch.clientX, touch.clientY);
    if (!link) return;
    var id = targetId(link);
    if (!id) return;
    event.preventDefault();
    lastActivationAt = Date.now();
    lastActivationId = id;
    finishNavigation(id);
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
    blockEvent(event);
  }

  function onTouchMove(event) {
    if (!open || !menu) return;
    if (menu.contains(event.target)) return;
    blockEvent(event);
  }

  function onStrictPointer(event) {
    if (!open) return;
    if (isAllowedModalTarget(event.target, event.clientX, event.clientY)) return;
    blockEvent(event);
  }

  function onStrictTouch(event) {
    if (!open) return;
    var touch = (event.changedTouches && event.changedTouches[0]) || (event.touches && event.touches[0]);
    var x = touch ? touch.clientX : undefined;
    var y = touch ? touch.clientY : undefined;
    if (isAllowedModalTarget(event.target, x, y)) return;
    blockEvent(event);
  }

  function onStrictClick(event) {
    if (postTapGuardUntil && Date.now() < postTapGuardUntil) {
      blockEvent(event);
      return;
    }
    if (!open) return;
    if (isAllowedModalTarget(event.target, event.clientX, event.clientY)) return;
    blockEvent(event);
  }

  function onFocusIn(event) {
    if (!open) return;
    if (isAllowedModalTarget(event.target)) return;
    var target = links[0] || button;
    if (target) target.focus({ preventScroll: true });
  }

  function onWindowScroll() {
    if (!open || restoringScroll) return;
    var x = window.scrollX || window.pageXOffset || 0;
    var y = window.scrollY || window.pageYOffset || 0;
    if (Math.abs(x - lockedScrollX) < 1 && Math.abs(y - lockedScrollY) < 1) return;
    restoringScroll = true;
    try { window.scrollTo(lockedScrollX, lockedScrollY); }
    catch (_) {}
    window.requestAnimationFrame(function () { restoringScroll = false; });
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
    window.addEventListener("scroll", onWindowScroll, { passive: true });
    window.addEventListener("focusin", onFocusIn, true);

    document.addEventListener("wheel", onWheel, { passive: false, capture: true });
    document.addEventListener("touchmove", onTouchMove, { passive: false, capture: true });

    document.addEventListener("pointerdown", rememberPress, true);
    document.addEventListener("pointerdown", onStrictPointer, true);
    document.addEventListener("pointerup", activateFromPointer, true);
    document.addEventListener("pointerup", onStrictPointer, true);
    document.addEventListener("pointercancel", function () { press = null; }, true);

    document.addEventListener("touchstart", onStrictTouch, { passive: false, capture: true });
    document.addEventListener("touchend", activateFromTouchEnd, { passive: false, capture: true });
    document.addEventListener("touchend", onStrictTouch, { passive: false, capture: true });

    document.addEventListener("click", onStrictClick, true);
    document.addEventListener("dblclick", onStrictClick, true);
    document.addEventListener("contextmenu", onStrictClick, true);

    window.addEventListener("pageshow", function () { removePostTapShield(); postTapGuardUntil = 0; if (open) setOpen(false, false); });
    setOpen(false, false);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot, { once: true });
  else boot();
})();
