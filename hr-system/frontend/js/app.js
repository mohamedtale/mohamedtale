/**
 * SPA Router & Global Helpers - Arabic RTL HR Management System
 */

// ─── ROUTES ─────────────────────────────────────────────────────────────────
const routes = {
  '/': { file: null, init: initDashboard, title: 'الرئيسية' },
  '/employees': { file: 'pages/employees.html', init: 'initEmployees', title: 'الموظفين' },
  '/leaves': { file: 'pages/leaves.html', init: 'initLeaves', title: 'الإجازات' },
  '/permissions': { file: 'pages/permissions.html', init: 'initPermissions', title: 'إذن الخروج' },
  '/attendance': { file: 'pages/attendance.html', init: 'initAttendance', title: 'الحضور والغياب' },
  '/allowances': { file: 'pages/allowances.html', init: 'initAllowances', title: 'بدل التنقل والترقيات' },
  '/documents': { file: 'pages/documents.html', init: 'initDocuments', title: 'الوثائق' },
  '/reports': { file: 'pages/reports.html', init: 'initReports', title: 'التقارير' },
  '/settings': { file: 'pages/settings.html', init: 'initSettings', title: 'الإعدادات' },
};

// ─── NAVIGATE ────────────────────────────────────────────────────────────────
/**
 * Navigate to a route path
 * @param {string} path - Route path (e.g. '/', '/employees')
 */
async function navigate(path) {
  const route = routes[path] || routes['/'];
  showLoading();

  try {
    const contentEl = document.getElementById('content');

    if (route.file === null) {
      // Dashboard: rendered inline
      await initDashboard();
    } else {
      // Fetch the page HTML file
      let html;
      try {
        const res = await fetch(route.file);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        html = await res.text();
      } catch (fetchErr) {
        contentEl.innerHTML = `
          <div class="error-state">
            <p>تعذّر تحميل الصفحة. يرجى المحاولة مرة أخرى.</p>
          </div>`;
        hideLoading();
        return;
      }
      contentEl.innerHTML = html;

      // Run the init function after content is inserted
      const initFn = route.init;
      if (typeof initFn === 'function') {
        await initFn();
      } else if (typeof initFn === 'string') {
        if (typeof window[initFn] === 'function') {
          await window[initFn]();
        }
      }
    }

    // Update sidebar active state
    document.querySelectorAll('.nav-link, nav a, sidebar a, [data-route]').forEach((link) => {
      link.classList.remove('active');
    });
    // Try matching by href or data-route attribute
    const activeLink =
      document.querySelector(`[href="#${path}"]`) ||
      document.querySelector(`[href="${path}"]`) ||
      document.querySelector(`[data-route="${path}"]`);
    if (activeLink) activeLink.classList.add('active');

    // Update page title in header
    const headerTitle = document.getElementById('page-title');
    if (headerTitle) headerTitle.textContent = route.title;
    document.title = `${route.title} - نظام الموارد البشرية`;

  } catch (err) {
    console.error('Navigation error:', err);
    showToast('حدث خطأ أثناء تحميل الصفحة. يرجى المحاولة مرة أخرى.', 'error');
  } finally {
    hideLoading();
  }
}

// ─── DASHBOARD ───────────────────────────────────────────────────────────────
/**
 * Render the dashboard page with stats from the API
 */
async function initDashboard() {
  const contentEl = document.getElementById('content');

  // Today's date in Arabic
  const todayArabic = new Date().toLocaleDateString('ar-IQ', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Placeholder skeleton while loading
  contentEl.innerHTML = `
    <div class="page-header">
      <h1 class="page-title">لوحة التحكم</h1>
      <p class="page-date">${todayArabic}</p>
    </div>
    <div class="stats-grid">
      <div class="stat-card loading-skeleton"></div>
      <div class="stat-card loading-skeleton"></div>
      <div class="stat-card loading-skeleton"></div>
      <div class="stat-card loading-skeleton"></div>
    </div>`;

  let stats = {
    total_employees: 0,
    pending_leaves: 0,
    pending_permissions: 0,
    eligible_promotions: 0,
  };

  try {
    const data = await window.API.reports.getDashboard();
    if (data) {
      stats = { ...stats, ...data };
    }
  } catch (err) {
    console.error('Dashboard stats error:', err);
    showToast('تعذّر تحميل إحصائيات لوحة التحكم.', 'error');
  }

  contentEl.innerHTML = `
    <div class="page-header">
      <h1 class="page-title">لوحة التحكم</h1>
      <p class="page-date">${todayArabic}</p>
    </div>

    <div class="stats-grid">
      <!-- إجمالي الموظفين -->
      <div class="stat-card stat-card--turquoise">
        <div class="stat-card__icon">👥</div>
        <div class="stat-card__body">
          <div class="stat-card__value">${stats.total_employees ?? 0}</div>
          <div class="stat-card__label">إجمالي الموظفين</div>
        </div>
      </div>

      <!-- إجازات معلقة -->
      <div class="stat-card stat-card--gold">
        <div class="stat-card__icon">📋</div>
        <div class="stat-card__body">
          <div class="stat-card__value">${stats.pending_leaves ?? 0}</div>
          <div class="stat-card__label">إجازات معلقة</div>
        </div>
      </div>

      <!-- أذونات معلقة -->
      <div class="stat-card stat-card--navy">
        <div class="stat-card__icon">🚪</div>
        <div class="stat-card__body">
          <div class="stat-card__value">${stats.pending_permissions ?? 0}</div>
          <div class="stat-card__label">أذونات معلقة</div>
        </div>
      </div>

      <!-- مرشحون للترقية -->
      <div class="stat-card stat-card--green">
        <div class="stat-card__icon">⭐</div>
        <div class="stat-card__body">
          <div class="stat-card__value">${stats.eligible_promotions ?? 0}</div>
          <div class="stat-card__label">مرشحون للترقية</div>
        </div>
      </div>
    </div>`;
}

// ─── GLOBAL HELPERS ──────────────────────────────────────────────────────────

/**
 * Show a toast notification
 * @param {string} message - Message text
 * @param {'success'|'error'|'warning'|'info'} type - Toast type
 */
window.showToast = function showToast(message, type = 'success') {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    document.body.appendChild(toast);
  }

  // Remove any existing type classes
  toast.className = '';
  toast.classList.add(`toast-${type}`);
  toast.textContent = message;

  // Trigger show
  // Use rAF to ensure class transition fires
  requestAnimationFrame(() => {
    toast.classList.add('show');
  });

  // Auto-hide after 3.5 seconds
  clearTimeout(toast._hideTimeout);
  toast._hideTimeout = setTimeout(() => {
    toast.classList.remove('show');
  }, 3500);
};

/**
 * Show the loading spinner overlay
 */
window.showLoading = function showLoading() {
  const el = document.getElementById('loading');
  if (el) el.style.display = 'flex';
};

/**
 * Hide the loading spinner overlay
 */
window.hideLoading = function hideLoading() {
  const el = document.getElementById('loading');
  if (el) el.style.display = 'none';
};

/**
 * Show a modal dialog
 * @param {string} title - Modal title
 * @param {string} bodyHtml - HTML content for the modal body
 * @param {string} footerHtml - HTML content for the modal footer (buttons, etc.)
 */
window.showModal = function showModal(title, bodyHtml, footerHtml = '') {
  const overlay = document.getElementById('modal-overlay');
  if (!overlay) return;

  const titleEl = overlay.querySelector('.modal-title, #modal-title');
  const bodyEl = overlay.querySelector('.modal-body, #modal-body');
  const footerEl = overlay.querySelector('.modal-footer, #modal-footer');

  if (titleEl) titleEl.textContent = title;
  if (bodyEl) bodyEl.innerHTML = bodyHtml;
  if (footerEl) footerEl.innerHTML = footerHtml;

  overlay.style.display = 'flex';
  overlay.classList.add('active');
  document.body.classList.add('modal-open');
};

/**
 * Hide the modal dialog
 */
window.hideModal = function hideModal() {
  const overlay = document.getElementById('modal-overlay');
  if (!overlay) return;
  overlay.style.display = 'none';
  overlay.classList.remove('active');
  document.body.classList.remove('modal-open');
};

/**
 * Show a custom Arabic confirmation dialog
 * @param {string} message - Confirmation message in Arabic
 * @returns {Promise<boolean>} Resolves to true if confirmed, false if cancelled
 */
window.confirmAction = function confirmAction(message) {
  return new Promise((resolve) => {
    // Try to use a custom modal if available
    const overlay = document.getElementById('modal-overlay');
    if (overlay) {
      showModal(
        'تأكيد العملية',
        `<p class="confirm-message">${message}</p>`,
        `<button class="btn btn-danger" id="confirm-yes-btn">تأكيد</button>
         <button class="btn btn-secondary" id="confirm-no-btn">إلغاء</button>`
      );

      const yesBtn = document.getElementById('confirm-yes-btn');
      const noBtn = document.getElementById('confirm-no-btn');

      const cleanup = () => {
        hideModal();
        if (yesBtn) yesBtn.removeEventListener('click', onYes);
        if (noBtn) noBtn.removeEventListener('click', onNo);
      };

      const onYes = () => { cleanup(); resolve(true); };
      const onNo = () => { cleanup(); resolve(false); };

      if (yesBtn) yesBtn.addEventListener('click', onYes);
      if (noBtn) noBtn.addEventListener('click', onNo);
    } else {
      // Fallback to native confirm
      resolve(window.confirm(message));
    }
  });
};

/**
 * Format an ISO date string to Arabic locale display format
 * @param {string} dateStr - ISO date string (e.g. '2024-03-15' or '2024-03-15T10:00:00Z')
 * @returns {string} Formatted Arabic date string
 */
window.formatDate = function formatDate(dateStr) {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString('ar-IQ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch (_) {
    return dateStr;
  }
};

/**
 * Format an ISO date string to YYYY-MM-DD for use in input[type=date]
 * @param {string} dateStr - ISO date string
 * @returns {string} Date in YYYY-MM-DD format
 */
window.formatDateInput = function formatDateInput(dateStr) {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch (_) {
    return '';
  }
};

/**
 * Get an HTML badge string for a status value
 * @param {string} status - Status value (e.g. 'pending', 'approved', 'rejected')
 * @param {'leave'|'permission'} type - Context type
 * @returns {string} HTML badge string
 */
window.getStatusBadge = function getStatusBadge(status, type = 'leave') {
  const statusMap = {
    pending: { label: 'معلق', cssClass: 'badge--warning' },
    approved: { label: 'موافق عليه', cssClass: 'badge--success' },
    rejected: { label: 'مرفوض', cssClass: 'badge--danger' },
    cancelled: { label: 'ملغى', cssClass: 'badge--secondary' },
    active: { label: 'نشط', cssClass: 'badge--success' },
    inactive: { label: 'غير نشط', cssClass: 'badge--secondary' },
    on_leave: { label: 'في إجازة', cssClass: 'badge--info' },
  };

  const info = statusMap[status] || { label: status || 'غير محدد', cssClass: 'badge--secondary' };
  return `<span class="badge ${info.cssClass}">${info.label}</span>`;
};

/**
 * Get the Arabic name for a leave type
 * @param {string} type - Leave type key
 * @returns {string} Arabic leave type name
 */
window.getLeaveTypeName = function getLeaveTypeName(type) {
  const typeMap = {
    annual: 'سنوية',
    emergency: 'طارئة',
    sick: 'مرضية',
    hajj: 'حج',
    maternity: 'أمومة',
    study: 'دراسية',
  };
  return typeMap[type] || type || 'غير محدد';
};

/**
 * Build a URL query string from a params object, skipping null/undefined values
 * @param {object} params
 * @returns {string} Query string including leading '?' or empty string
 */
window.buildQueryString = function buildQueryString(params) {
  if (!params || typeof params !== 'object') return '';
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      qs.append(key, value);
    }
  }
  const str = qs.toString();
  return str ? `?${str}` : '';
};

// ─── ROUTING ─────────────────────────────────────────────────────────────────

/**
 * Parse current hash and navigate to the matching route
 */
function handleHashChange() {
  let hash = window.location.hash || '';
  // Remove leading '#'
  if (hash.startsWith('#')) hash = hash.slice(1);
  // Normalize: empty or missing → '/'
  const path = hash || '/';
  navigate(path);
}

window.addEventListener('hashchange', handleHashChange);

document.addEventListener('DOMContentLoaded', () => {
  // Initial route on page load
  handleHashChange();

  // Mobile sidebar toggle
  const sidebarToggle = document.getElementById('sidebar-toggle');
  const sidebar = document.getElementById('sidebar');
  if (sidebarToggle && sidebar) {
    sidebarToggle.addEventListener('click', () => {
      sidebar.classList.toggle('open');
    });
  }

  // Close modal when clicking outside the modal box
  const modalOverlay = document.getElementById('modal-overlay');
  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) {
        hideModal();
      }
    });
  }

  // Close modal on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const overlay = document.getElementById('modal-overlay');
      if (overlay && overlay.classList.contains('active')) {
        hideModal();
      }
    }
  });
});
