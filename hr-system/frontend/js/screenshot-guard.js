/**
 * Screenshot Guard — multiple layers of protection
 * Applied to all authenticated pages
 */
(function () {
  'use strict';

  // ── 1. CSS: prevent text selection & drag ──────────────────────────────
  const styleEl = document.createElement('style');
  styleEl.textContent = `
    * {
      -webkit-user-select: none !important;
      -moz-user-select: none !important;
      -ms-user-select: none !important;
      user-select: none !important;
      -webkit-user-drag: none !important;
    }
    /* Allow selection inside inputs/textareas for usability */
    input, textarea, [contenteditable="true"] {
      -webkit-user-select: text !important;
      -moz-user-select: text !important;
      user-select: text !important;
    }
    /* Block print */
    @media print {
      html, body { display: none !important; visibility: hidden !important; }
    }
  `;
  document.head.appendChild(styleEl);

  // ── 2. Block right-click context menu ─────────────────────────────────
  document.addEventListener('contextmenu', e => e.preventDefault());

  // ── 3. Block screenshot & print keyboard shortcuts ─────────────────────
  const BLOCKED_KEYS = new Set([
    'PrintScreen', 'F12',
  ]);
  const BLOCKED_COMBOS = [
    // Windows/Linux
    { ctrl: true,  shift: true, key: 'S' }, // Ctrl+Shift+S (snipping)
    { ctrl: true,  shift: true, key: 'I' }, // DevTools
    { ctrl: true,  shift: true, key: 'J' }, // DevTools
    { ctrl: true,  shift: true, key: 'C' }, // DevTools inspect
    { ctrl: true,  key: 'U' },              // View source
    { ctrl: true,  key: 'P' },              // Print
    { ctrl: true,  key: 'S' },              // Save page
    // macOS
    { meta: true, shift: true, key: '3' },  // Full screenshot
    { meta: true, shift: true, key: '4' },  // Selection screenshot
    { meta: true, shift: true, key: '5' },  // Screenshot UI
    { meta: true, shift: true, key: '6' },  // Touch bar screenshot
    { meta: true, ctrl: true,  key: ' ' },  // Spotlight (sometimes used)
    { meta: true, key: 'P' },               // Print
    { meta: true, key: 'S' },               // Save
    { meta: true, key: 'U' },               // View source
    { meta: true, shift: true, key: 'I' },  // DevTools
    { meta: true, alt: true,   key: 'I' },  // DevTools
  ];

  document.addEventListener('keydown', function (e) {
    // Block by key name
    if (BLOCKED_KEYS.has(e.key)) {
      e.preventDefault();
      e.stopPropagation();
      showWarning();
      return;
    }
    // Block by combo
    for (const combo of BLOCKED_COMBOS) {
      const ctrlMatch  = combo.ctrl  ? (e.ctrlKey  || e.metaKey) : true;
      const metaMatch  = combo.meta  ? e.metaKey  : true;
      const shiftMatch = combo.shift ? e.shiftKey : !e.shiftKey || combo.shift === undefined;
      const altMatch   = combo.alt   ? e.altKey   : true;
      const keyMatch   = combo.key   ? e.key.toUpperCase() === combo.key.toUpperCase() : true;

      // Simplified combo check
      const isCtrlS  = (e.ctrlKey || e.metaKey) && !e.shiftKey && e.key.toLowerCase() === 's';
      const isCtrlP  = (e.ctrlKey || e.metaKey) && !e.shiftKey && e.key.toLowerCase() === 'p';
      const isCtrlU  = (e.ctrlKey || e.metaKey) && !e.shiftKey && e.key.toLowerCase() === 'u';
      const isF12    = e.key === 'F12';
      const isCSSI   = (e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'i';
      const isCSSJ   = (e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'j';
      const isCSSC   = (e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'c';
      const isMacSS3 = e.metaKey && e.shiftKey && e.key === '3';
      const isMacSS4 = e.metaKey && e.shiftKey && e.key === '4';
      const isMacSS5 = e.metaKey && e.shiftKey && e.key === '5';

      if (isCtrlS || isCtrlP || isCtrlU || isF12 || isCSSI || isCSSJ || isCSSC || isMacSS3 || isMacSS4 || isMacSS5) {
        e.preventDefault();
        e.stopPropagation();
        showWarning();
        return;
      }
    }
  }, true);

  // ── 4. Blur page when window loses focus (PrtSc causes brief blur) ──────
  const BLUR_DELAY = 0; // immediate
  let blurTimeout;

  const blurOverlay = document.createElement('div');
  blurOverlay.id = 'security-blur-overlay';
  blurOverlay.style.cssText = `
    position: fixed;
    inset: 0;
    z-index: 999998;
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    background: rgba(11, 79, 108, 0.75);
    display: none;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    gap: 16px;
  `;
  blurOverlay.innerHTML = `
    <div style="
      background: rgba(255,255,255,0.12);
      border: 1.5px solid rgba(255,255,255,0.2);
      border-radius: 16px;
      padding: 32px 48px;
      text-align: center;
      color: white;
      font-family: Cairo, sans-serif;
    ">
      <div style="font-size:48px;margin-bottom:12px;">🔒</div>
      <div style="font-size:20px;font-weight:800;margin-bottom:8px;">المحتوى محمي</div>
      <div style="font-size:14px;opacity:0.75;">ارجع للنافذة للمتابعة</div>
    </div>
  `;

  window.addEventListener('load', () => {
    document.body.appendChild(blurOverlay);
  });

  function showBlur() {
    blurOverlay.style.display = 'flex';
  }

  function hideBlur() {
    blurOverlay.style.display = 'none';
  }

  window.addEventListener('blur', () => {
    blurTimeout = setTimeout(showBlur, BLUR_DELAY);
  });

  window.addEventListener('focus', () => {
    clearTimeout(blurTimeout);
    hideBlur();
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) showBlur();
    else hideBlur();
  });

  // ── 5. Block window.print() ───────────────────────────────────────────
  window.print = function () {
    showWarning();
    return false;
  };

  // ── 6. Detect screen capture API (Chrome/Edge) ────────────────────────
  if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
    const _orig = navigator.mediaDevices.getDisplayMedia.bind(navigator.mediaDevices);
    navigator.mediaDevices.getDisplayMedia = async function (...args) {
      showWarning();
      throw new DOMException('Screen capture is not allowed in this application.', 'NotAllowedError');
    };
  }

  // ── 7. Warning toast ──────────────────────────────────────────────────
  let warnEl = null;

  function showWarning() {
    if (!warnEl) {
      warnEl = document.createElement('div');
      warnEl.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 999999;
        background: #c53030;
        color: white;
        font-family: Cairo, sans-serif;
        font-size: 15px;
        font-weight: 700;
        padding: 14px 28px;
        border-radius: 10px;
        box-shadow: 0 8px 30px rgba(0,0,0,0.4);
        display: flex;
        align-items: center;
        gap: 10px;
        opacity: 0;
        transition: opacity 0.2s;
        pointer-events: none;
      `;
      document.body.appendChild(warnEl);
    }
    warnEl.innerHTML = '🚫 &nbsp; لقطات الشاشة غير مسموح بها في هذا النظام';
    warnEl.style.opacity = '1';
    clearTimeout(warnEl._t);
    warnEl._t = setTimeout(() => { warnEl.style.opacity = '0'; }, 3000);
  }

})();
