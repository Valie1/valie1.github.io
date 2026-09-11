
const runtime = String.raw`
(function(){
  'use strict';

  var LEGAL_PATHS = ['/privacy','/cookies','/policies'];
  var LEGAL_SET = { '/privacy':true, '/cookies':true, '/policies':true };
  var CLOSE_MESSAGE = 'valie:legal-portal-close';
  var NAVIGATE_MESSAGE = 'valie:legal-portal-navigate';
  var OPEN_MESSAGE = 'valie:open-legal-portal';
  var PORTAL_MS = 560;
  var SWITCH_MS = 500;

  var body = document.body;
  var insideFrame = window.parent !== window;
  var portal = document.getElementById('cnh-policy-portal');
  var frames = {};
  var loaded = {};
  var open = false;
  var activePath = '';
  var pendingOpenPath = '';
  var pendingSwitchPath = '';
  var savedY = 0;
  var savedOpener = null;
  var switchTimer = 0;
  var closeTimer = 0;
  var warmed = false;
  var hydrationReady = document.documentElement.dataset.valieHydrated === 'true';
  var warmFallbackTimer = 0;
  var keepCookieSettingsOpen = false;
  var cookieSettingsOpener = null;
  var cookieSettingsScrollTop = 0;
  var suspendedCookieLayer = null;
  var suspendedCookieWasInert = false;
  var suspendedCookieAriaHidden = null;

  LEGAL_PATHS.forEach(function(path){
    var frame = document.querySelector('iframe.cnh-policy-frame[data-legal-path="' + path + '"]');
    if(!frame) return;
    frames[path] = frame;
    loaded[path] = false;
    try{
      if(frame.getAttribute('src') === path && frame.contentDocument && frame.contentDocument.readyState === 'complete') loaded[path] = true;
    }catch(_){}
    frame.addEventListener('load', function(){
      var actualPath = '';
      try{ actualPath = new URL(frame.getAttribute('src') || '', window.location.href).pathname; }catch(_){}
      loaded[path] = normalizePath(actualPath) === path;
      if(!loaded[path]) return; 
      forceFrameTop(frame);
      if(pendingOpenPath === path) activate(path);
      if(pendingSwitchPath === path) beginSwitch(path);
    });
  });

  function normalizePath(path){ if(!path || path === '/') return path || '/'; return path.replace(/\/+$/, ''); }

  if(insideFrame || LEGAL_SET[normalizePath(window.location.pathname)]) return;

  function warmFrames(){
    if(warmed) return;
    warmed = true;
    LEGAL_PATHS.forEach(function(path){
      var frame = frames[path];
      if(!frame) return;
      try{
        if(frame.getAttribute('src') !== path) frame.setAttribute('src', path);
      }catch(_){}
    });
  }

  function onHydrated(){
    if(hydrationReady) return;
    hydrationReady = true;
    if(warmFallbackTimer){ clearTimeout(warmFallbackTimer); warmFallbackTimer = 0; }
    warmFrames();
  }

  window.addEventListener('valie:hydrated', onHydrated, {once:true});
  if(hydrationReady){
    warmFrames();
  }else{
    warmFallbackTimer = window.setTimeout(function(){
      hydrationReady = true;
      warmFrames();
    }, 1800);
  }

  function isModifiedClick(event){
    return event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;
  }

  function reducedMotion(){
    try{return !!window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;}catch(_){return false;}
  }

  function legalPath(rawHref){
    if(!rawHref || rawHref.charAt(0) === '#') return '';
    try{
      var url = new URL(rawHref, window.location.href);
      var normalized = normalizePath(url.pathname);
      return LEGAL_SET[normalized] ? normalized : '';
    }catch(_){ return ''; }
  }

  

  function forceFrameTop(frame){
    if(!frame) return;
    try{
      var win = frame.contentWindow;
      var doc = frame.contentDocument;
      if(win){
        try{ win.history.scrollRestoration = 'manual'; }catch(_){}
        win.scrollTo({top:0,left:0,behavior:'auto'});
      }
      if(doc){
        if(doc.documentElement) doc.documentElement.scrollTop = 0;
        if(doc.body) doc.body.scrollTop = 0;
      }
    }catch(_){}
  }

  function sourceIsLegalFrame(source){
    for(var i=0;i<LEGAL_PATHS.length;i++){
      var frame = frames[LEGAL_PATHS[i]];
      if(frame && frame.contentWindow === source) return true;
    }
    return false;
  }

  function suspendCookieSettingsLayer(){
    if(!keepCookieSettingsOpen) return;
    var layer = document.querySelector('.cookie-consent-layer.is-settings-open');
    if(!(layer instanceof HTMLElement)) return;
    suspendedCookieLayer = layer;
    suspendedCookieWasInert = !!layer.inert;
    suspendedCookieAriaHidden = layer.getAttribute('aria-hidden');
    layer.inert = true;
    layer.setAttribute('aria-hidden','true');
  }

  function restoreCookieSettingsLayer(){
    var layer = suspendedCookieLayer;
    if(!(layer instanceof HTMLElement)) return;
    layer.inert = suspendedCookieWasInert;
    if(suspendedCookieAriaHidden === null) layer.removeAttribute('aria-hidden');
    else layer.setAttribute('aria-hidden', suspendedCookieAriaHidden);
    suspendedCookieLayer = null;
    suspendedCookieWasInert = false;
    suspendedCookieAriaHidden = null;
  }

  function resetFrame(frame){
    if(!frame) return;
    frame.classList.remove('is-active','is-entering','is-leaving');
    frame.setAttribute('aria-hidden','true');
    frame.setAttribute('tabindex','-1');
  }

  function prepareActiveFrame(path){
    var frame = frames[path];
    if(!frame) return null;
    frame.classList.remove('is-leaving');
    frame.classList.add('is-active','is-entering');
    frame.setAttribute('aria-hidden','false');
    frame.setAttribute('tabindex','0');
    forceFrameTop(frame);
    requestAnimationFrame(function(){ forceFrameTop(frame); });
    return frame;
  }

  function activate(path){
    if(!open || !portal || !frames[path]) return;
    pendingOpenPath = '';
    activePath = path;

    var frame = prepareActiveFrame(path);
    suspendCookieSettingsLayer();
    portal.setAttribute('aria-hidden','false');

    
    portal.classList.add('is-preparing');
    try{ portal.getBoundingClientRect(); if(frame) frame.getBoundingClientRect(); }catch(_){}

    requestAnimationFrame(function(){
      requestAnimationFrame(function(){
        if(!open || activePath !== path) return;
        portal.classList.remove('is-preparing');
        body.classList.add('cnh-policy-active');
        if(frame) frame.classList.remove('is-entering');
        forceFrameTop(frame);
        try{ if(frame && frame.focus) frame.focus({preventScroll:true}); }catch(_){}
        window.setTimeout(function(){ if(open && activePath === path) forceFrameTop(frame); }, 32);
      });
    });
  }

  function show(path, opener, capturedY, returnContext){
    if(hydrationReady) warmFrames();
    if(!portal || !frames[path]){
      window.location.assign(path);
      return;
    }

    if(open){
      if(path === activePath || path === pendingOpenPath || path === pendingSwitchPath) return;
      switchTo(path);
      return;
    }

    open = true;
    activePath = '';
    pendingSwitchPath = '';
    pendingOpenPath = path;
    savedY = typeof capturedY === 'number' ? capturedY : (window.scrollY || window.pageYOffset || 0);
    savedOpener = opener || (document.activeElement instanceof HTMLElement ? document.activeElement : null);
    keepCookieSettingsOpen = !!(returnContext && returnContext.cookieSettingsOpen);
    cookieSettingsOpener = returnContext && returnContext.cookieSettingsOpener instanceof HTMLElement ? returnContext.cookieSettingsOpener : null;
    cookieSettingsScrollTop = returnContext && typeof returnContext.cookieSettingsScrollTop === 'number' ? returnContext.cookieSettingsScrollTop : 0;

    try{
      portal.inert = false;
      portal.removeAttribute('inert');
    }catch(_){}

    if(closeTimer){ clearTimeout(closeTimer); closeTimer = 0; }
    if(loaded[path]) activate(path);
  }

  function hide(){
    if(!open) return;
    open = false;
    pendingOpenPath = '';
    pendingSwitchPath = '';
    if(switchTimer){ clearTimeout(switchTimer); switchTimer = 0; }

    
    if(portal) portal.classList.remove('is-preparing');
    body.classList.remove('cnh-policy-active');

    var delay = reducedMotion() ? 0 : PORTAL_MS;
    if(closeTimer) clearTimeout(closeTimer);
    closeTimer = window.setTimeout(function(){
      closeTimer = 0;
      LEGAL_PATHS.forEach(function(path){ resetFrame(frames[path]); });
      activePath = '';
      if(portal) portal.setAttribute('aria-hidden','true');
      try{ window.scrollTo({top:savedY,left:0,behavior:'auto'}); }catch(_){ window.scrollTo(0,savedY); }
      restoreCookieSettingsLayer();
      if(keepCookieSettingsOpen){
        var settingsDialog = document.querySelector('.cookie-consent.is-settings');
        if(settingsDialog && typeof cookieSettingsScrollTop === 'number') settingsDialog.scrollTop = cookieSettingsScrollTop;
        var settingsFocusTarget = cookieSettingsOpener && cookieSettingsOpener.isConnected ? cookieSettingsOpener : savedOpener;
        try{ if(settingsFocusTarget && settingsFocusTarget.isConnected && settingsFocusTarget.focus) settingsFocusTarget.focus({preventScroll:true}); }catch(_){}
      }else{
        try{ if(savedOpener && savedOpener.isConnected && savedOpener.focus) savedOpener.focus({preventScroll:true}); }catch(_){}
      }
      keepCookieSettingsOpen = false;
      cookieSettingsOpener = null;
      cookieSettingsScrollTop = 0;
      savedOpener = null;
    }, delay);
  }

  function beginSwitch(path){
    if(!open || !frames[path] || path === activePath) return;
    pendingSwitchPath = '';

    var oldPath = activePath;
    var oldFrame = frames[oldPath];
    var nextFrame = prepareActiveFrame(path);
    activePath = path;

    if(reducedMotion()){
      resetFrame(oldFrame);
      if(nextFrame) nextFrame.classList.remove('is-entering');
      return;
    }

    if(oldFrame){
      oldFrame.classList.remove('is-entering');
      oldFrame.classList.add('is-active','is-leaving');
      oldFrame.setAttribute('aria-hidden','true');
      oldFrame.setAttribute('tabindex','-1');
    }

    requestAnimationFrame(function(){
      requestAnimationFrame(function(){
        if(nextFrame) nextFrame.classList.remove('is-entering');
      });
    });

    if(switchTimer) clearTimeout(switchTimer);
    switchTimer = window.setTimeout(function(){
      switchTimer = 0;
      if(oldFrame && oldFrame !== frames[activePath]) resetFrame(oldFrame);
      forceFrameTop(nextFrame);
    }, SWITCH_MS);
  }

  function switchTo(path){
    warmFrames();
    if(!open || !frames[path] || path === activePath || path === pendingSwitchPath) return;
    pendingSwitchPath = path;
    if(loaded[path]) beginSwitch(path);
    
  }

  function handleClick(event){
    if(isModifiedClick(event)) return;
    var target = event.target;
    if(!(target instanceof Element)) return;

    var cookieTrigger = target.closest('button.cookie-settings-trigger');
    if(cookieTrigger){
      event.preventDefault();
      event.stopImmediatePropagation();
      
      try{
        window.__valieCookieSettingsPending = true;
        window.__valieCookieSettingsOpener = cookieTrigger;
        window.dispatchEvent(new Event('valie:open-cookie-settings'));
      }catch(_){}
      return;
    }

    var anchor = target.closest('a[href],a[data-valie-link-href]');
    if(!anchor || anchor.target === '_blank' || anchor.hasAttribute('data-valie-legal-deferred')) return;
    var path = legalPath(anchor.getAttribute('href') || anchor.getAttribute('data-valie-link-href') || '');
    if(!path) return;

    
    var clickY = window.scrollY || window.pageYOffset || 0;
    event.preventDefault();
    event.stopImmediatePropagation();
    show(path, anchor, clickY);
  }


  function handleOpenRequest(event){
    var detail = event && event.detail ? event.detail : null;
    if(!detail) return;
    var path = legalPath(detail.path || '');
    if(!path) return;
    var capturedY = typeof detail.capturedY === 'number' ? detail.capturedY : (window.scrollY || window.pageYOffset || 0);
    show(path, detail.cookieSettingsOpener || null, capturedY, {
      cookieSettingsOpen: detail.keepCookieSettingsOpen === true,
      cookieSettingsOpener: detail.cookieSettingsOpener || null,
      cookieSettingsScrollTop: typeof detail.cookieSettingsScrollTop === 'number' ? detail.cookieSettingsScrollTop : 0
    });
  }

  function handleMessage(event){
    if(event.origin !== window.location.origin || !event.data || !sourceIsLegalFrame(event.source)) return;
    if(event.data.type === CLOSE_MESSAGE){ hide(); return; }
    if(event.data.type === NAVIGATE_MESSAGE && event.data.path){
      var path = legalPath(event.data.path);
      if(path) switchTo(path);
    }
  }

  document.addEventListener('click', handleClick, true);
  window.addEventListener(OPEN_MESSAGE, handleOpenRequest);
  window.addEventListener('message', handleMessage);
  window.addEventListener('keydown', function(event){
    if(event.key !== 'Escape' || !open) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    hide();
  });
})();
`;

const documents = [
  ["/privacy", "VALIE Privacy Policy"],
  ["/cookies", "VALIE Cookie Policy"],
  ["/policies", "VALIE Site Policies"],
] as const;

export default function StaticLegalPortalRuntime() {
  return (
    <>
      <div className="cnh-site-fade-cover" aria-hidden="true" />
      <div className="cnh-global-grain" aria-hidden="true" />
      <div id="cnh-policy-portal" aria-hidden="true">
        {documents.map(([path, title]) => (
          <iframe
            key={path}
            className="cnh-policy-frame"
            title={title}
            src="about:blank"
            data-legal-path={path}
            suppressHydrationWarning
            loading="eager"
            aria-hidden="true"
            tabIndex={-1}
          />
        ))}
      </div>
      <script id="cnh-policy-navigation" dangerouslySetInnerHTML={{ __html: runtime }} />
    </>
  );
}
