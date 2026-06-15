/**
 * Session Guard — auto-lock screen after inactivity + data masking
 */
(function () {
  'use strict';

  const IDLE_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes
  const WARN_BEFORE_MS  =  1 * 60 * 1000; // warn 1 minute before lock

  // ── Build lock overlay ─────────────────────────────────────────────────
  const lockOverlay = document.createElement('div');
  lockOverlay.id = 'session-lock-overlay';
  lockOverlay.style.cssText = `
    position: fixed; inset: 0; z-index: 1000000;
    background: linear-gradient(145deg, #062e40, #0B4F6C);
    display: none; flex-direction: column;
    align-items: center; justify-content: center; gap: 20px;
    font-family: Cairo, sans-serif;
  `;
  // Build overlay DOM without inline handlers (CSP compliance)
  lockOverlay.insertAdjacentHTML('beforeend', `
    <div style="text-align:center; color:white; margin-bottom:8px;">
      <div style="font-size:64px; margin-bottom:12px;">🔒</div>
      <div style="font-size:22px; font-weight:900; margin-bottom:6px;">الجلسة مقفلة</div>
      <div style="font-size:14px; opacity:.65;">أدخل كلمة المرور للمتابعة</div>
    </div>
    <div style="background:rgba(255,255,255,.08); border:1.5px solid rgba(255,255,255,.15);
                border-radius:14px; padding:28px 36px; min-width:300px;">
      <div id="lock-user" style="color:rgba(255,255,255,.7); font-size:13px; margin-bottom:14px; text-align:center;"></div>
      <div style="position:relative; margin-bottom:14px;">
        <input id="lock-password" type="password" placeholder="كلمة المرور"
               style="width:100%; padding:12px 14px; border-radius:10px; border:1.5px solid rgba(255,255,255,.2);
                      background:rgba(255,255,255,.08); color:white; font-family:Cairo,sans-serif;
                      font-size:15px; outline:none;">
      </div>
      <div id="lock-error" style="color:#fc8181; font-size:13px; font-weight:600;
                                   margin-bottom:10px; display:none; text-align:center;"></div>
      <button id="lock-unlock-btn"
              style="width:100%; padding:12px; background:linear-gradient(135deg,#0B4F6C,#00A8CC);
                     color:white; border:none; border-radius:10px; font-family:Cairo,sans-serif;
                     font-size:15px; font-weight:800; cursor:pointer;">
        فتح القفل
      </button>
      <button id="lock-logout-btn"
              style="width:100%; padding:10px; margin-top:10px; background:transparent;
                     color:rgba(255,255,255,.5); border:1px solid rgba(255,255,255,.15);
                     border-radius:10px; font-family:Cairo,sans-serif; font-size:13px; cursor:pointer;">
        تسجيل الخروج
      </button>
    </div>
    <div id="lock-countdown" style="color:rgba(255,255,255,.4); font-size:12px;"></div>
  `);

  // Warn toast
  const warnToast = document.createElement('div');
  warnToast.id = 'session-warn-toast';
  warnToast.style.cssText = `
    position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%);
    z-index: 999990; background: #d69e2e; color: white;
    font-family: Cairo, sans-serif; font-size: 14px; font-weight: 700;
    padding: 12px 24px; border-radius: 10px;
    box-shadow: 0 8px 30px rgba(0,0,0,.3);
    display: none; align-items: center; gap: 10px;
  `;
  warnToast.innerHTML = '⚠️ &nbsp; ستُقفل الجلسة خلال دقيقة واحدة بسبب عدم النشاط';

  window.addEventListener('load', () => {
    document.body.appendChild(lockOverlay);
    document.body.appendChild(warnToast);
    document.getElementById('lock-password').addEventListener('keydown', e => { if (e.key === 'Enter') window.unlockSession(); });
    document.getElementById('lock-unlock-btn').addEventListener('click', () => window.unlockSession());
    document.getElementById('lock-logout-btn').addEventListener('click', () => { if (window.doLogout) window.doLogout(); else { localStorage.clear(); window.location.replace('/login.html'); } });
  });

  // ── Timers ─────────────────────────────────────────────────────────────
  let idleTimer, warnTimer, locked = false;

  function resetTimers() {
    if (locked) return;
    clearTimeout(idleTimer);
    clearTimeout(warnTimer);
    warnToast.style.display = 'none';

    warnTimer = setTimeout(() => {
      warnToast.style.display = 'flex';
    }, IDLE_TIMEOUT_MS - WARN_BEFORE_MS);

    idleTimer = setTimeout(lockScreen, IDLE_TIMEOUT_MS);
  }

  ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click'].forEach(evt => {
    document.addEventListener(evt, resetTimers, { passive: true });
  });

  function lockScreen() {
    locked = true;
    warnToast.style.display = 'none';
    const user = JSON.parse(localStorage.getItem('hr_user') || '{}');
    const lockUser = document.getElementById('lock-user');
    if (lockUser) lockUser.textContent = user.full_name ? `👤 ${user.full_name}` : '';
    const lockErr = document.getElementById('lock-error');
    if (lockErr) lockErr.style.display = 'none';
    const lockPass = document.getElementById('lock-password');
    if (lockPass) lockPass.value = '';
    lockOverlay.style.display = 'flex';
    setTimeout(() => { if (lockPass) lockPass.focus(); }, 100);
  }

  window.unlockSession = async function () {
    const password = document.getElementById('lock-password').value;
    const errEl = document.getElementById('lock-error');
    if (!password) return;

    const user = JSON.parse(localStorage.getItem('hr_user') || '{}');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: user.username, password })
      });
      const data = await res.json();
      if (!res.ok) {
        errEl.textContent = 'كلمة المرور غير صحيحة';
        errEl.style.display = 'block';
        document.getElementById('lock-password').value = '';
        return;
      }
      // Refresh token
      localStorage.setItem('hr_token', data.token);
      lockOverlay.style.display = 'none';
      locked = false;
      resetTimers();
    } catch {
      errEl.textContent = 'تعذر الاتصال بالخادم';
      errEl.style.display = 'block';
    }
  };

  // ── Data masking helpers ───────────────────────────────────────────────
  /**
   * Mask national ID: show only last 4 digits
   * e.g. "123456789" → "•••••6789"
   */
  window.maskNationalId = function (id) {
    if (!id) return '—';
    const s = String(id);
    if (s.length <= 4) return s;
    return '•'.repeat(s.length - 4) + s.slice(-4);
  };

  /**
   * Mask phone number: show only last 4 digits
   * e.g. "0912345678" → "•••••5678"
   */
  window.maskPhone = function (phone) {
    if (!phone) return '—';
    const s = String(phone).replace(/\s/g, '');
    if (s.length <= 4) return s;
    return s.slice(0, 3) + '•'.repeat(Math.max(0, s.length - 7)) + s.slice(-4);
  };

  // Start idle timer on load
  resetTimers();

})();
