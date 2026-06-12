/**
 * API Client Module - Arabic RTL HR Management System
 * Base URL: http://localhost:3000
 */

const BASE_URL = 'http://localhost:3000';

/**
 * Generic request wrapper
 * @param {string} method - HTTP method
 * @param {string} path - API path (e.g. /api/employees)
 * @param {object|FormData|null} body - Request body
 * @param {boolean} isFormData - Whether body is FormData
 * @returns {Promise<any>} Parsed JSON response
 */
async function request(method, path, body = null, isFormData = false) {
  const options = {
    method,
    headers: {},
  };

  if (body !== null) {
    if (isFormData) {
      // Let browser set Content-Type with boundary for multipart
      options.body = body;
    } else {
      options.headers['Content-Type'] = 'application/json';
      options.body = JSON.stringify(body);
    }
  }

  let response;
  try {
    response = await fetch(`${BASE_URL}${path}`, options);
  } catch (networkError) {
    throw new Error('خطأ في الاتصال بالخادم. يرجى التحقق من الاتصال بالإنترنت.');
  }

  if (!response.ok) {
    let errorMessage = 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.';
    try {
      const errorData = await response.json();
      if (errorData && errorData.message) {
        errorMessage = errorData.message;
      } else if (errorData && errorData.error) {
        errorMessage = errorData.error;
      }
    } catch (_) {
      // Could not parse error body, use default Arabic message
    }
    const err = new Error(errorMessage);
    err.status = response.status;
    throw err;
  }

  // Handle empty responses (e.g. 204 No Content)
  const contentType = response.headers.get('Content-Type') || '';
  if (response.status === 204 || !contentType.includes('application/json')) {
    return null;
  }

  return response.json();
}

/**
 * Build query string from params object, filtering out null/undefined values
 * @param {object} params
 * @returns {string} Query string including leading '?' or empty string
 */
function buildParams(params) {
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      qs.append(key, value);
    }
  }
  const str = qs.toString();
  return str ? `?${str}` : '';
}

window.API = {
  // ─── EMPLOYEES ──────────────────────────────────────────────────────────────
  employees: {
    /**
     * GET /api/employees
     * @param {object} params - Query parameters (e.g. { department_id, status, page, limit })
     */
    getAll: (params = {}) =>
      request('GET', `/api/employees${buildParams(params)}`),

    /**
     * GET /api/employees/:id
     */
    getOne: (id) =>
      request('GET', `/api/employees/${id}`),

    /**
     * GET /api/employees/search/:query
     */
    search: (query) =>
      request('GET', `/api/employees/search/${encodeURIComponent(query)}`),

    /**
     * POST /api/employees
     */
    create: (data) =>
      request('POST', '/api/employees', data),

    /**
     * PUT /api/employees/:id
     */
    update: (id, data) =>
      request('PUT', `/api/employees/${id}`, data),

    /**
     * DELETE /api/employees/:id  (soft delete)
     */
    delete: (id) =>
      request('DELETE', `/api/employees/${id}`),
  },

  // ─── DEPARTMENTS ────────────────────────────────────────────────────────────
  departments: {
    /**
     * GET /api/departments
     * Returns { data, flat }
     */
    getAll: () =>
      request('GET', '/api/departments'),

    /**
     * POST /api/departments
     */
    create: (data) =>
      request('POST', '/api/departments', data),

    /**
     * PUT /api/departments/:id
     */
    update: (id, data) =>
      request('PUT', `/api/departments/${id}`, data),

    /**
     * PUT /api/departments/reorder
     * @param {Array} items - Ordered array of department items
     */
    reorder: (items) =>
      request('PUT', '/api/departments/reorder', { items }),
  },

  // ─── LEAVES ─────────────────────────────────────────────────────────────────
  leaves: {
    /**
     * GET /api/leaves
     * @param {object} params - Query parameters (e.g. { employee_id, status, type, year })
     */
    getAll: (params = {}) =>
      request('GET', `/api/leaves${buildParams(params)}`),

    /**
     * GET /api/leaves/:id
     */
    getOne: (id) =>
      request('GET', `/api/leaves/${id}`),

    /**
     * POST /api/leaves
     */
    create: (data) =>
      request('POST', '/api/leaves', data),

    /**
     * PUT /api/leaves/:id/approve
     */
    approve: (id) =>
      request('PUT', `/api/leaves/${id}/approve`),

    /**
     * PUT /api/leaves/:id/reject
     */
    reject: (id) =>
      request('PUT', `/api/leaves/${id}/reject`),

    /**
     * DELETE /api/leaves/:id
     */
    delete: (id) =>
      request('DELETE', `/api/leaves/${id}`),
  },

  // ─── PERMISSIONS (exit permissions) ─────────────────────────────────────────
  permissions: {
    /**
     * GET /api/permissions
     * @param {object} params - Query parameters
     */
    getAll: (params = {}) =>
      request('GET', `/api/permissions${buildParams(params)}`),

    /**
     * POST /api/permissions
     */
    create: (data) =>
      request('POST', '/api/permissions', data),

    /**
     * PUT /api/permissions/:id/approve
     */
    approve: (id) =>
      request('PUT', `/api/permissions/${id}/approve`),

    /**
     * PUT /api/permissions/:id/reject
     */
    reject: (id) =>
      request('PUT', `/api/permissions/${id}/reject`),

    /**
     * DELETE /api/permissions/:id
     */
    delete: (id) =>
      request('DELETE', `/api/permissions/${id}`),
  },

  // ─── ATTENDANCE ─────────────────────────────────────────────────────────────
  attendance: {
    /**
     * GET /api/attendance
     * @param {object} params - Query parameters (e.g. { employee_id, date, month, year })
     */
    getAll: (params = {}) =>
      request('GET', `/api/attendance${buildParams(params)}`),

    /**
     * POST /api/attendance/fingerprint
     * @param {object} data - Fingerprint log data
     */
    logFingerprint: (data) =>
      request('POST', '/api/attendance/fingerprint', data),

    /**
     * GET /api/attendance/report/:year/:month
     */
    getMonthlyReport: (year, month) =>
      request('GET', `/api/attendance/report/${year}/${month}`),

    /**
     * GET /api/attendance/absent/:date
     */
    getAbsent: (date) =>
      request('GET', `/api/attendance/absent/${date}`),
  },

  // ─── ALLOWANCES ─────────────────────────────────────────────────────────────
  allowances: {
    /**
     * GET /api/allowances/roster/:year/:month
     */
    getRoster: (year, month) =>
      request('GET', `/api/allowances/roster/${year}/${month}`),

    /**
     * POST /api/allowances/roster/:year/:month/approve
     * @param {number} year
     * @param {number} month
     * @param {Array} items - Array of allowance items to approve
     */
    approveRoster: (year, month, items) =>
      request('POST', `/api/allowances/roster/${year}/${month}/approve`, { items }),

    /**
     * GET /api/allowances/roster/history/all
     */
    getRosterHistory: () =>
      request('GET', '/api/allowances/roster/history/all'),

    /**
     * GET /api/allowances/eligible-promotions
     */
    getEligiblePromotions: () =>
      request('GET', '/api/allowances/eligible-promotions'),

    /**
     * POST /api/allowances/promote/:employee_id
     * @param {number|string} employeeId
     * @param {object} data - { new_grade, decision_number, decision_date }
     */
    promote: (employeeId, data) =>
      request('POST', `/api/allowances/promote/${employeeId}`, {
        new_grade: data.new_grade,
        decision_number: data.decision_number,
        decision_date: data.decision_date,
      }),
  },

  // ─── DOCUMENTS ──────────────────────────────────────────────────────────────
  documents: {
    /**
     * GET /api/documents
     * @param {object} params - Query parameters (e.g. { employee_id })
     */
    getAll: (params = {}) =>
      request('GET', `/api/documents${buildParams(params)}`),

    /**
     * GET /api/documents?employee_id=:id
     */
    getByEmployee: (employeeId) =>
      request('GET', `/api/documents?employee_id=${encodeURIComponent(employeeId)}`),

    /**
     * POST /api/documents  (multipart/form-data)
     * @param {FormData} formData - FormData object with file and metadata
     */
    upload: (formData) =>
      request('POST', '/api/documents', formData, true),

    /**
     * DELETE /api/documents/:id
     */
    delete: (id) =>
      request('DELETE', `/api/documents/${id}`),

    /**
     * Returns direct download URL for a document
     * @param {number|string} id
     * @returns {string}
     */
    getDownloadUrl: (id) => `${BASE_URL}/api/documents/${id}/download`,
  },

  // ─── REPORTS ────────────────────────────────────────────────────────────────
  reports: {
    /**
     * GET /api/reports/dashboard-stats
     */
    getDashboard: () =>
      request('GET', '/api/reports/dashboard-stats'),

    /**
     * GET /api/reports/staff-roster
     */
    getStaffRoster: () =>
      request('GET', '/api/reports/staff-roster'),

    /**
     * GET /api/reports/changes/:year/:month
     */
    getChanges: (year, month) =>
      request('GET', `/api/reports/changes/${year}/${month}`),

    /**
     * GET /api/reports/allowances/:year/:month
     */
    getAllowances: (year, month) =>
      request('GET', `/api/reports/allowances/${year}/${month}`),
  },

  // ─── SETTINGS ───────────────────────────────────────────────────────────────
  settings: {
    /**
     * GET /api/settings
     */
    get: () =>
      request('GET', '/api/settings'),

    /**
     * PUT /api/settings
     * @param {object} data - Key-value pairs of settings to update
     */
    update: (data) =>
      request('PUT', '/api/settings', data),
  },
};
