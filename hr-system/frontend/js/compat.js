// Compatibility shim: maps legacy 'api' interface to window.API
// Some pages use api.employees.list() while api.js exports window.API.employees.getAll()
const api = {
  employees: {
    list: (q)       => window.API.employees.getAll(q || {}),
    get:  (id)      => window.API.employees.getOne(id),
    create: (d)     => window.API.employees.create(d),
    update: (id, d) => window.API.employees.update(id, d),
    delete: (id)    => window.API.employees.delete(id),
    leaves: (id)    => window.API.leaves.getAll({ employee_id: id }),
  },
  departments: {
    list:   ()      => window.API.departments.getAll(),
    tree:   ()      => window.API.departments.getAll(),
    create: (d)     => window.API.departments.create(d),
    update: (id, d) => window.API.departments.update(id, d),
    delete: (id)    => window.API.departments.delete ? window.API.departments.delete(id) : Promise.reject('not supported'),
  },
  leaves: {
    list:    (q)      => window.API.leaves.getAll(q || {}),
    get:     (id)     => window.API.leaves.getOne(id),
    create:  (d)      => window.API.leaves.create(d),
    approve: (id)     => window.API.leaves.approve(id),
    reject:  (id, r)  => window.API.leaves.reject(id, r),
    delete:  (id)     => window.API.leaves.delete(id),
    update:  (id, d)  => window.API.leaves.update ? window.API.leaves.update(id, d) : Promise.reject('not supported'),
  },
  permissions: {
    list:    (q)  => window.API.permissions.getAll(q || {}),
    create:  (d)  => window.API.permissions.create(d),
    approve: (id) => window.API.permissions.approve(id),
    reject:  (id) => window.API.permissions.reject(id),
    delete:  (id) => window.API.permissions.delete(id),
  },
  attendance: {
    list:    (q)          => window.API.attendance.getAll(q || {}),
    create:  (d)          => window.API.attendance.logFingerprint(d),
    summary: (year, month)=> window.API.attendance.getMonthlyReport(year, month),
  },
  allowances: {
    getRoster:    (q)    => window.API.allowances.getRoster(q.year, q.month),
    createRoster: (d)    => window.API.allowances.approveRoster(d.year, d.month, []),
    approveItem:  (id)   => window.API.allowances.approveRoster(null, null, [id]),
    promote:      (id, d)=> window.API.allowances.promote(id, d || {}),
  },
  documents: {
    list:   (empId)     => window.API.documents.getByEmployee(empId),
    upload: (empId, fd) => window.API.documents.upload(fd),
    delete: (id)        => window.API.documents.delete(id),
  },
  reports: {
    dashboard:   ()           => window.API.reports.getDashboard(),
    staffRoster: ()           => window.API.reports.getStaffRoster(),
    changes:     (y, m)       => window.API.reports.getChanges(y, m),
    allowances:  ()           => window.API.reports.getAllowances ? window.API.reports.getAllowances() : Promise.resolve([]),
  },
  settings: {
    get:    () => window.API.settings.get(),
    update: (d) => window.API.settings.update(d),
  },
};

// Helper shims for pages that use these utilities
window.fmtDate = function(str) {
  if (!str) return '-';
  return str.split('T')[0];
};

window.escHtml = function(str) {
  if (!str) return '';
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
};

// loadPage shim for pages that call loadPage() instead of navigate()
window.loadPage = function(name) {
  const routeMap = {
    dashboard: '/', employees: '/employees', leaves: '/leaves',
    permissions: '/permissions', attendance: '/attendance',
    allowances: '/allowances', documents: '/documents',
    reports: '/reports', settings: '/settings',
  };
  const path = routeMap[name] || '/' + name;
  if (typeof window.navigate === 'function') window.navigate(path);
};
