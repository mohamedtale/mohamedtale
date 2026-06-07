// ══════════════════════════════════════════════════
//  نظام أرشفة شؤون الموظفين — الجهاز التنفيذي لحفر وصيانة آبار المياه
//  EmployeesCode.gs  — Google Apps Script Backend
// ══════════════════════════════════════════════════

// ── IDs — اربط هذا الملف بالـ Spreadsheet وتأكد من وجود مجلد Drive ──
const EMP_SS_ID     = PropertiesService.getScriptProperties().getProperty('EMP_SS_ID')     || '';
const EMP_FOLDER_ID = PropertiesService.getScriptProperties().getProperty('EMP_FOLDER_ID') || '';

// ── Sheet names ──
const SH = { EMPLOYEES: 'employees', ARCHIVE: 'archive', USERS: 'emp_users' };

// ── Employees sheet columns (0-indexed) ──
const E = {
  EMP_ID:0, NATIONAL_ID:1, JOB_ID:2, NAME:3, DEPARTMENT:4,
  TITLE:5, GRADE:6, PHONE:7, STATUS:8, HIRE_DATE:9, EMAIL:10, NOTES:11
};

// ── Archive sheet columns (0-indexed) ──
const A = {
  DOC_ID:0, NATIONAL_ID:1, JOB_ID:2, EMP_NAME:3, DOC_TYPE:4, DOC_DATE:5,
  EXP_DATE:6, FILE_ID:7, FILE_NAME:8, FILE_SIZE:9, MIME_TYPE:10,
  REF:11, ISSUER:12, TAGS:13, IS_SECRET:14, UPLOADED_BY:15, UPLOADED_AT:16, DEPARTMENT:17
};

// ── Users sheet columns ──
const U = { USERNAME:0, PASSWORD:1, NAME:2, ROLE:3, STATUS:4 };

// ──────────────────────────────────────────────────
//  Serve HTML
// ──────────────────────────────────────────────────
function doGet(e) {
  return HtmlService.createHtmlOutputFromFile('employees')
    .setTitle('أرشيف شؤون الموظفين')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport','width=device-width, initial-scale=1.0');
}

// ──────────────────────────────────────────────────
//  Helpers
// ──────────────────────────────────────────────────
function getSS() {
  const props = PropertiesService.getScriptProperties();
  let id = props.getProperty('EMP_SS_ID');
  if (id) {
    try { return SpreadsheetApp.openById(id); } catch(e) { /* id outdated — recreate below */ }
  }
  // Try active spreadsheet (container-bound script)
  try {
    const active = SpreadsheetApp.getActiveSpreadsheet();
    if (active) return active;
  } catch(e) {}
  // Standalone script — create a new spreadsheet and save its ID
  const ss = SpreadsheetApp.create('أرشيف شؤون الموظفين');
  props.setProperty('EMP_SS_ID', ss.getId());
  return ss;
}

function getSheet(name) {
  const ss = getSS();
  return ss.getSheetByName(name);
}

function eStr(v) { return (v === null || v === undefined) ? '' : String(v).trim(); }

function newId(prefix) {
  return prefix + '-' + new Date().getTime().toString(36).toUpperCase() + '-' + Math.random().toString(36).substring(2,6).toUpperCase();
}

function fmtSize(bytes) {
  if (!bytes || bytes === 0) return '—';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024*1024) return (bytes/1024).toFixed(1) + ' KB';
  return (bytes/(1024*1024)).toFixed(2) + ' MB';
}

function isExpiringSoon(expDateStr) {
  if (!expDateStr) return { isExpiring: false, isExpired: false };
  const exp = new Date(expDateStr);
  if (isNaN(exp)) return { isExpiring: false, isExpired: false };
  const today = new Date();
  today.setHours(0,0,0,0);
  const diff = Math.floor((exp - today) / (1000*60*60*24));
  return { isExpiring: diff >= 0 && diff <= 30, isExpired: diff < 0 };
}

// ──────────────────────────────────────────────────
//  First-time Setup
// ──────────────────────────────────────────────────
function setupEmployeeSystem() {
  const ss = getSS();

  // ── employees sheet ──
  let empSh = ss.getSheetByName(SH.EMPLOYEES);
  if (!empSh) {
    empSh = ss.insertSheet(SH.EMPLOYEES);
    empSh.appendRow(['رقم السجل','الرقم الوطني','الرقم الوظيفي','الاسم الكامل','القسم / الإدارة',
      'المسمى الوظيفي','الدرجة','رقم الهاتف','الحالة','تاريخ التعيين','البريد الإلكتروني','ملاحظات']);
    empSh.getRange(1,1,1,12).setFontWeight('bold').setBackground('#1e3a8a').setFontColor('#ffffff');
    empSh.setFrozenRows(1);

    // Sample employees
    const depts = ['إدارة الحفر','الصيانة والتشغيل','الشؤون الإدارية','المالية','تقنية المعلومات'];
    const titles = ['مهندس حفر','فني صيانة','محاسب','مدير إدارة','مسؤول أرشيف'];
    const statuses = ['نشط','نشط','نشط','إجازة','موقوف'];
    for (let i = 1; i <= 10; i++) {
      empSh.appendRow([
        newId('E'),
        '21' + String(i).padStart(8,'0'),
        'J-' + String(1000+i),
        ['محمد أحمد الطاهر','خالد محمود عمر','فاطمة سالم العربي','يوسف علي الصالح','مريم حسن القاضي',
         'إبراهيم موسى النجار','سارة عبدالله البركة','عمر خليل الفرجاني','أسماء رمضان الزروق','سليمان عيسى المنفي'][i-1],
        depts[(i-1) % depts.length],
        titles[(i-1) % titles.length],
        ['أولى','ثانية','ثالثة','رابعة','خامسة'][i%5],
        '092' + String(1000000+i),
        statuses[(i-1) % statuses.length],
        '2020-0' + ((i%9)+1) + '-15',
        'emp'+i+'@org.ly', ''
      ]);
    }
  }

  // ── archive sheet ──
  let archSh = ss.getSheetByName(SH.ARCHIVE);
  if (!archSh) {
    archSh = ss.insertSheet(SH.ARCHIVE);
    archSh.appendRow(['رقم الوثيقة','الرقم الوطني','الرقم الوظيفي','اسم الموظف','نوع الوثيقة',
      'تاريخ الوثيقة','تاريخ الانتهاء','معرّف الملف','اسم الملف','الحجم (byte)','نوع MIME',
      'الرقم المرجعي','الجهة المُصدِرة','الوسوم','سري','رُفع بواسطة','تاريخ الرفع','القسم']);
    archSh.getRange(1,1,1,18).setFontWeight('bold').setBackground('#1e3a8a').setFontColor('#ffffff');
    archSh.setFrozenRows(1);
  }

  // ── users sheet ──
  let userSh = ss.getSheetByName(SH.USERS);
  if (!userSh) {
    userSh = ss.insertSheet(SH.USERS);
    userSh.appendRow(['اسم المستخدم','كلمة المرور','الاسم الكامل','الصلاحية','الحالة']);
    userSh.getRange(1,1,1,5).setFontWeight('bold').setBackground('#1e3a8a').setFontColor('#ffffff');
    userSh.setFrozenRows(1);
    userSh.appendRow(['admin',      'admin123',  'مدير النظام',       'مدير',    'active']);
    userSh.appendRow(['hr1',        'hr2026',    'مسؤول الموارد البشرية','محرر',   'active']);
    userSh.appendRow(['viewer1',    'view2026',  'مشاهد النظام',      'مشاهد',   'active']);
  }

  return { ok: true, message: 'تم الإعداد بنجاح' };
}

// ──────────────────────────────────────────────────
//  Authentication
// ──────────────────────────────────────────────────
function login(username, password) {
  try {
    let sh = getSheet(SH.USERS);
    if (!sh) { setupEmployeeSystem(); sh = getSheet(SH.USERS); }
    const data = sh.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
      const r = data[i];
      if (eStr(r[U.USERNAME]).toLowerCase() === eStr(username).toLowerCase() &&
          eStr(r[U.PASSWORD]) === eStr(password) &&
          eStr(r[U.STATUS]).toLowerCase() === 'active') {
        return { ok: true, name: eStr(r[U.NAME]), role: eStr(r[U.ROLE]) };
      }
    }
    return { ok: false, error: 'اسم المستخدم أو كلمة المرور غير صحيحة' };
  } catch(err) {
    return { ok: false, error: err.message };
  }
}

// ──────────────────────────────────────────────────
//  Dashboard Stats
// ──────────────────────────────────────────────────
function getDashboardStats() {
  try {
    const empSh  = getSheet(SH.EMPLOYEES);
    const archSh = getSheet(SH.ARCHIVE);
    if (!empSh || !archSh) return null;

    const empData  = empSh.getDataRange().getValues().slice(1);
    const archData = archSh.getDataRange().getValues().slice(1);

    const totalEmployees = empData.length;
    const activeEmployees = empData.filter(r => eStr(r[E.STATUS]) === 'نشط').length;
    const totalDocs       = archData.length;

    // Expiring in 30 days
    const today = new Date(); today.setHours(0,0,0,0);
    let expiringSoon = 0, expired = 0;
    archData.forEach(r => {
      const exp = eStr(r[A.EXP_DATE]);
      if (!exp) return;
      const d = new Date(exp);
      if (isNaN(d)) return;
      const diff = Math.floor((d - today)/(1000*60*60*24));
      if (diff < 0) expired++;
      else if (diff <= 30) expiringSoon++;
    });

    // Docs by type (top 6)
    const byType = {};
    archData.forEach(r => {
      const t = eStr(r[A.DOC_TYPE]) || 'غير محدد';
      byType[t] = (byType[t]||0) + 1;
    });
    const docTypes = Object.entries(byType)
      .sort((a,b) => b[1]-a[1]).slice(0,6)
      .map(([type,count]) => ({type, count}));

    // Recent uploads (last 8)
    const recent = archData
      .filter(r => eStr(r[A.UPLOADED_AT]))
      .sort((a,b) => new Date(b[A.UPLOADED_AT]) - new Date(a[A.UPLOADED_AT]))
      .slice(0,8)
      .map(r => ({
        id:           eStr(r[A.DOC_ID]),
        employeeName: eStr(r[A.EMP_NAME]),
        docType:      eStr(r[A.DOC_TYPE]),
        fileName:     eStr(r[A.FILE_NAME]),
        uploadedAt:   eStr(r[A.UPLOADED_AT]),
        size:         fmtSize(parseInt(r[A.FILE_SIZE])||0)
      }));

    // Departments with incomplete files (< 5 docs)
    const empByNid = {};
    empData.forEach(r => { empByNid[eStr(r[E.NATIONAL_ID])] = eStr(r[E.DEPARTMENT]); });
    const docsByNid = {};
    archData.forEach(r => {
      const nid = eStr(r[A.NATIONAL_ID]);
      docsByNid[nid] = (docsByNid[nid]||0) + 1;
    });
    const incomplete = empData
      .filter(r => (docsByNid[eStr(r[E.NATIONAL_ID])]||0) < 5)
      .length;

    return {
      totalEmployees, activeEmployees, totalDocs,
      expiringSoon, expired, incomplete,
      docTypes, recent
    };
  } catch(err) {
    Logger.log('getDashboardStats error: ' + err.message);
    return null;
  }
}

// ──────────────────────────────────────────────────
//  Employee lookup by National ID
// ──────────────────────────────────────────────────
function getEmployeeByNationalId(nid) {
  try {
    const sh = getSheet(SH.EMPLOYEES);
    if (!sh) return null;
    const data = sh.getDataRange().getValues().slice(1);
    const r = data.find(row => eStr(row[E.NATIONAL_ID]) === eStr(nid));
    if (!r) return null;
    return {
      empId:      eStr(r[E.EMP_ID]),
      nationalId: eStr(r[E.NATIONAL_ID]),
      jobId:      eStr(r[E.JOB_ID]),
      name:       eStr(r[E.NAME]),
      department: eStr(r[E.DEPARTMENT]),
      title:      eStr(r[E.TITLE]),
      grade:      eStr(r[E.GRADE]),
      phone:      eStr(r[E.PHONE]),
      status:     eStr(r[E.STATUS]),
      email:      eStr(r[E.EMAIL])
    };
  } catch(err) {
    return null;
  }
}

// ──────────────────────────────────────────────────
//  Upload Files to Drive + log to Archive sheet
// ──────────────────────────────────────────────────
function uploadFiles(filesData, metadata) {
  try {
    const rootFolder = EMP_FOLDER_ID
      ? DriveApp.getFolderById(EMP_FOLDER_ID)
      : DriveApp.getRootFolder();

    // Get or create "أرشيف الموظفين" sub-folder
    let archFolder;
    const folderIter = rootFolder.getFoldersByName('أرشيف الموظفين');
    archFolder = folderIter.hasNext() ? folderIter.next() : rootFolder.createFolder('أرشيف الموظفين');

    // Per-employee folder named by NationalId / Name
    const folderName = (metadata.nationalId || 'غير محدد') + ' — ' + (metadata.name || '');
    let empFolder;
    const empIter = archFolder.getFoldersByName(folderName);
    empFolder = empIter.hasNext() ? empIter.next() : archFolder.createFolder(folderName);

    // Ensure employees record exists — auto-add if new
    let empRecord = getEmployeeByNationalId(metadata.nationalId);
    if (!empRecord && metadata.name && metadata.nationalId) {
      const empSh = getSheet(SH.EMPLOYEES);
      if (empSh) {
        const newEmpId = newId('E');
        empSh.appendRow([
          newEmpId,
          metadata.nationalId,
          metadata.jobId  || '',
          metadata.name,
          metadata.department || '',
          metadata.title  || '',
          '',
          '',
          'نشط',
          '',
          '', ''
        ]);
        empRecord = { empId: newEmpId, nationalId: metadata.nationalId, jobId: metadata.jobId||'', name: metadata.name };
      }
    }

    const archSh = getSheet(SH.ARCHIVE);
    if (!archSh) return { ok: false, error: 'ورقة الأرشيف غير موجودة' };

    let count = 0;
    const now = new Date().toISOString().slice(0,10);
    const uploadedBy = metadata.uploadedBy || 'النظام';

    filesData.forEach(f => {
      try {
        const blob = Utilities.newBlob(
          Utilities.base64Decode(f.data),
          f.type || 'application/octet-stream',
          f.name
        );
        const driveFile = empFolder.createFile(blob);
        driveFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

        archSh.appendRow([
          newId('D'),
          metadata.nationalId || '',
          metadata.jobId      || (empRecord ? empRecord.jobId : ''),
          metadata.name       || (empRecord ? empRecord.name  : ''),
          metadata.docType    || '',
          metadata.docDate    || '',
          metadata.expDate    || '',
          driveFile.getId(),
          f.name,
          f.size  || 0,
          f.type  || '',
          metadata.ref        || '',
          metadata.issuer     || '',
          metadata.tags       || '',
          metadata.secret     ? true : false,
          uploadedBy,
          now,
          metadata.department || (empRecord ? empRecord.department : '')
        ]);
        count++;
      } catch(e2) {
        Logger.log('File upload error: ' + f.name + ' — ' + e2.message);
      }
    });

    return { ok: true, count };
  } catch(err) {
    Logger.log('uploadFiles error: ' + err.message);
    return { ok: false, error: err.message };
  }
}

// ──────────────────────────────────────────────────
//  Search Archive
// ──────────────────────────────────────────────────
function searchArchive(query, filters) {
  try {
    const sh = getSheet(SH.ARCHIVE);
    if (!sh) return [];
    const data = sh.getDataRange().getValues().slice(1);
    const q    = eStr(query).toLowerCase();
    const today = new Date(); today.setHours(0,0,0,0);

    const results = data.filter(r => {
      // Text search across name, nid, type, filename, tags
      if (q) {
        const haystack = [
          eStr(r[A.EMP_NAME]), eStr(r[A.NATIONAL_ID]), eStr(r[A.DOC_TYPE]),
          eStr(r[A.FILE_NAME]), eStr(r[A.TAGS]), eStr(r[A.REF]), eStr(r[A.ISSUER]),
          eStr(r[A.DEPARTMENT])
        ].join(' ').toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      // Filters
      if (filters) {
        if (filters.type   && eStr(r[A.DOC_TYPE])    !== filters.type)   return false;
        if (filters.dept   && eStr(r[A.DEPARTMENT])  !== filters.dept)   return false;
        if (filters.secret === 'true'  && !r[A.IS_SECRET])  return false;
        if (filters.secret === 'false' &&  r[A.IS_SECRET])  return false;
        if (filters.from) {
          const docD = new Date(eStr(r[A.DOC_DATE]));
          if (!isNaN(docD) && docD < new Date(filters.from)) return false;
        }
        if (filters.to) {
          const docD = new Date(eStr(r[A.DOC_DATE]));
          if (!isNaN(docD) && docD > new Date(filters.to)) return false;
        }
      }
      return true;
    });

    return results.map(r => {
      const exp    = eStr(r[A.EXP_DATE]);
      const expRes = isExpiringSoon(exp);
      return {
        id:           eStr(r[A.DOC_ID]),
        nationalId:   eStr(r[A.NATIONAL_ID]),
        jobId:        eStr(r[A.JOB_ID]),
        employeeName: eStr(r[A.EMP_NAME]),
        department:   eStr(r[A.DEPARTMENT]),
        docType:      eStr(r[A.DOC_TYPE]),
        docDate:      eStr(r[A.DOC_DATE]),
        expDate:      exp,
        fileName:     eStr(r[A.FILE_NAME]),
        size:         fmtSize(parseInt(r[A.FILE_SIZE])||0),
        isSecret:     !!r[A.IS_SECRET],
        isExpiring:   expRes.isExpiring,
        isExpired:    expRes.isExpired,
        uploadedAt:   eStr(r[A.UPLOADED_AT])
      };
    });
  } catch(err) {
    Logger.log('searchArchive error: ' + err.message);
    return [];
  }
}

// ──────────────────────────────────────────────────
//  Employee Profile (with all documents)
// ──────────────────────────────────────────────────
function getEmployeeProfile(nationalId) {
  try {
    const empSh  = getSheet(SH.EMPLOYEES);
    const archSh = getSheet(SH.ARCHIVE);
    if (!empSh || !archSh) return null;

    const empData = empSh.getDataRange().getValues().slice(1);
    let empRow = null;

    // Search by national ID or by job ID
    empRow = empData.find(r =>
      eStr(r[E.NATIONAL_ID]) === eStr(nationalId) ||
      eStr(r[E.JOB_ID])      === eStr(nationalId) ||
      eStr(r[E.EMP_ID])      === eStr(nationalId)
    );
    if (!empRow) return null;

    const nid = eStr(empRow[E.NATIONAL_ID]);
    const archData = archSh.getDataRange().getValues().slice(1);

    const documents = archData
      .filter(r => eStr(r[A.NATIONAL_ID]) === nid)
      .map(r => {
        const exp    = eStr(r[A.EXP_DATE]);
        const expRes = isExpiringSoon(exp);
        return {
          id:         eStr(r[A.DOC_ID]),
          type:       eStr(r[A.DOC_TYPE]),
          date:       eStr(r[A.DOC_DATE]),
          expDate:    exp,
          fileName:   eStr(r[A.FILE_NAME]),
          fileId:     eStr(r[A.FILE_ID]),
          size:       fmtSize(parseInt(r[A.FILE_SIZE])||0),
          isSecret:   !!r[A.IS_SECRET],
          isExpiring: expRes.isExpiring || expRes.isExpired,
          ref:        eStr(r[A.REF]),
          issuer:     eStr(r[A.ISSUER]),
          uploadedAt: eStr(r[A.UPLOADED_AT])
        };
      })
      .sort((a,b) => new Date(b.uploadedAt||0) - new Date(a.uploadedAt||0));

    return {
      empId:      eStr(empRow[E.EMP_ID]),
      nationalId: nid,
      jobId:      eStr(empRow[E.JOB_ID]),
      name:       eStr(empRow[E.NAME]),
      department: eStr(empRow[E.DEPARTMENT]),
      title:      eStr(empRow[E.TITLE]),
      grade:      eStr(empRow[E.GRADE]),
      phone:      eStr(empRow[E.PHONE]),
      status:     eStr(empRow[E.STATUS]),
      hireDate:   eStr(empRow[E.HIRE_DATE]),
      email:      eStr(empRow[E.EMAIL]),
      notes:      eStr(empRow[E.NOTES]),
      documents
    };
  } catch(err) {
    Logger.log('getEmployeeProfile error: ' + err.message);
    return null;
  }
}

// ──────────────────────────────────────────────────
//  File Preview URL
// ──────────────────────────────────────────────────
function getFilePreviewUrl(docId) {
  try {
    const row = _findArchiveRow(docId);
    if (!row) return null;
    const fileId   = eStr(row[A.FILE_ID]);
    const fileName = eStr(row[A.FILE_NAME]);
    const docType  = eStr(row[A.DOC_TYPE]);
    const docDate  = eStr(row[A.DOC_DATE]);
    if (!fileId) return null;

    const file = DriveApp.getFileById(fileId);
    // Embed URL (works for PDFs and images)
    const mime  = eStr(row[A.MIME_TYPE]);
    let previewUrl;
    if (mime === 'application/vnd.google-apps.document') {
      previewUrl = 'https://docs.google.com/document/d/' + fileId + '/preview';
    } else if (mime === 'application/vnd.google-apps.spreadsheet') {
      previewUrl = 'https://docs.google.com/spreadsheets/d/' + fileId + '/preview';
    } else {
      previewUrl = 'https://drive.google.com/file/d/' + fileId + '/preview';
    }
    return { url: previewUrl, fileName, docType, date: docDate };
  } catch(err) {
    Logger.log('getFilePreviewUrl error: ' + err.message);
    return null;
  }
}

// ──────────────────────────────────────────────────
//  File Download URL
// ──────────────────────────────────────────────────
function getFileDownloadUrl(docId) {
  try {
    const row = _findArchiveRow(docId);
    if (!row) return null;
    const fileId = eStr(row[A.FILE_ID]);
    if (!fileId) return null;
    return 'https://drive.google.com/uc?export=download&id=' + fileId;
  } catch(err) {
    Logger.log('getFileDownloadUrl error: ' + err.message);
    return null;
  }
}

// ──────────────────────────────────────────────────
//  Delete File
// ──────────────────────────────────────────────────
function deleteFile(docId) {
  try {
    const sh = getSheet(SH.ARCHIVE);
    if (!sh) return { ok: false, error: 'ورقة الأرشيف غير موجودة' };

    const data = sh.getDataRange().getValues();
    let rowIdx = -1;
    let fileId = '';
    for (let i = 1; i < data.length; i++) {
      if (eStr(data[i][A.DOC_ID]) === eStr(docId)) {
        rowIdx = i + 1; // 1-based row number in sheet
        fileId = eStr(data[i][A.FILE_ID]);
        break;
      }
    }
    if (rowIdx === -1) return { ok: false, error: 'السجل غير موجود' };

    // Move file to trash in Drive
    if (fileId) {
      try { DriveApp.getFileById(fileId).setTrashed(true); } catch(e2) { /* file may already be gone */ }
    }

    sh.deleteRow(rowIdx);
    return { ok: true };
  } catch(err) {
    Logger.log('deleteFile error: ' + err.message);
    return { ok: false, error: err.message };
  }
}

// ──────────────────────────────────────────────────
//  Generate Reports
// ──────────────────────────────────────────────────
function generateReport(type) {
  try {
    const ss   = getSS();
    const ts   = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd_HH-mm');
    let   title, reportSS;

    switch (type) {
      case 'full_export':
        return _reportFullExport(ts);
      case 'expiring':
        return _reportExpiring(ts);
      case 'incomplete':
        return _reportIncomplete(ts);
      case 'summary':
        return _reportSummary(ts);
      default:
        return _reportFullExport(ts);
    }
  } catch(err) {
    Logger.log('generateReport error: ' + err.message);
    throw err;
  }
}

function _reportFullExport(ts) {
  const sh = getSheet(SH.ARCHIVE);
  if (!sh) return null;
  const data = sh.getDataRange().getValues();

  const rss = SpreadsheetApp.create('تقرير_الأرشيف_الكامل_' + ts);
  const rsh = rss.getActiveSheet();
  rsh.setName('الأرشيف');
  const headers = ['رقم الوثيقة','الرقم الوطني','الرقم الوظيفي','الموظف','القسم','نوع الوثيقة',
    'تاريخ الوثيقة','تاريخ الانتهاء','اسم الملف','الحجم','رقم مرجعي','الجهة المُصدِرة','وسوم','سري','رُفع في'];
  rsh.appendRow(headers);
  rsh.getRange(1,1,1,headers.length).setFontWeight('bold').setBackground('#1e3a8a').setFontColor('#ffffff');

  data.slice(1).forEach(r => {
    rsh.appendRow([
      eStr(r[A.DOC_ID]), eStr(r[A.NATIONAL_ID]), eStr(r[A.JOB_ID]), eStr(r[A.EMP_NAME]),
      eStr(r[A.DEPARTMENT]), eStr(r[A.DOC_TYPE]), eStr(r[A.DOC_DATE]), eStr(r[A.EXP_DATE]),
      eStr(r[A.FILE_NAME]), fmtSize(parseInt(r[A.FILE_SIZE])||0), eStr(r[A.REF]),
      eStr(r[A.ISSUER]), eStr(r[A.TAGS]), r[A.IS_SECRET]?'نعم':'لا', eStr(r[A.UPLOADED_AT])
    ]);
  });
  rsh.autoResizeColumns(1, headers.length);
  return rss.getUrl();
}

function _reportExpiring(ts) {
  const sh = getSheet(SH.ARCHIVE);
  if (!sh) return null;
  const data  = sh.getDataRange().getValues().slice(1);
  const today = new Date(); today.setHours(0,0,0,0);

  const rows = data.filter(r => {
    const exp = new Date(eStr(r[A.EXP_DATE]));
    if (isNaN(exp)) return false;
    const diff = Math.floor((exp - today)/(1000*60*60*24));
    return diff <= 60;
  }).sort((a,b) => new Date(a[A.EXP_DATE]) - new Date(b[A.EXP_DATE]));

  const rss = SpreadsheetApp.create('تقرير_الوثائق_المنتهية_' + ts);
  const rsh = rss.getActiveSheet();
  rsh.setName('وثائق منتهية');
  const headers = ['الموظف','الرقم الوطني','القسم','نوع الوثيقة','تاريخ الانتهاء','الحالة'];
  rsh.appendRow(headers);
  rsh.getRange(1,1,1,headers.length).setFontWeight('bold').setBackground('#dc2626').setFontColor('#ffffff');

  rows.forEach(r => {
    const exp  = new Date(eStr(r[A.EXP_DATE]));
    const diff = Math.floor((exp - today)/(1000*60*60*24));
    const status = diff < 0 ? 'منتهي الصلاحية' : `ينتهي خلال ${diff} يوم`;
    const row = rsh.appendRow([
      eStr(r[A.EMP_NAME]), eStr(r[A.NATIONAL_ID]), eStr(r[A.DEPARTMENT]),
      eStr(r[A.DOC_TYPE]), eStr(r[A.EXP_DATE]), status
    ]);
    if (diff < 0) rsh.getRange(rsh.getLastRow(),1,1,6).setBackground('#fee2e2');
    else if (diff <= 30) rsh.getRange(rsh.getLastRow(),1,1,6).setBackground('#fef9c3');
  });
  rsh.autoResizeColumns(1, headers.length);
  return rss.getUrl();
}

function _reportIncomplete(ts) {
  const empSh  = getSheet(SH.EMPLOYEES);
  const archSh = getSheet(SH.ARCHIVE);
  if (!empSh || !archSh) return null;

  const empData  = empSh.getDataRange().getValues().slice(1);
  const archData = archSh.getDataRange().getValues().slice(1);

  const docCountByNid = {};
  archData.forEach(r => {
    const nid = eStr(r[A.NATIONAL_ID]);
    docCountByNid[nid] = (docCountByNid[nid]||0) + 1;
  });

  const rss = SpreadsheetApp.create('تقرير_ملفات_ناقصة_' + ts);
  const rsh = rss.getActiveSheet();
  rsh.setName('ملفات ناقصة');
  const headers = ['الرقم الوظيفي','الرقم الوطني','الاسم','القسم','المسمى الوظيفي','الحالة','عدد الوثائق','النسبة'];
  rsh.appendRow(headers);
  rsh.getRange(1,1,1,headers.length).setFontWeight('bold').setBackground('#d97706').setFontColor('#ffffff');

  const TARGET = 10;
  empData
    .filter(r => (docCountByNid[eStr(r[E.NATIONAL_ID])]||0) < TARGET)
    .sort((a,b) => (docCountByNid[eStr(a[E.NATIONAL_ID])]||0) - (docCountByNid[eStr(b[E.NATIONAL_ID])]||0))
    .forEach(r => {
      const count = docCountByNid[eStr(r[E.NATIONAL_ID])]||0;
      rsh.appendRow([
        eStr(r[E.JOB_ID]), eStr(r[E.NATIONAL_ID]), eStr(r[E.NAME]),
        eStr(r[E.DEPARTMENT]), eStr(r[E.TITLE]), eStr(r[E.STATUS]),
        count, Math.round((count/TARGET)*100) + '%'
      ]);
    });
  rsh.autoResizeColumns(1, headers.length);
  return rss.getUrl();
}

function _reportSummary(ts) {
  const stats = getDashboardStats();
  if (!stats) return null;

  const rss = SpreadsheetApp.create('تقرير_ملخص_' + ts);
  const rsh = rss.getActiveSheet();
  rsh.setName('الملخص');
  rsh.appendRow(['نظام أرشفة شؤون الموظفين — تقرير ملخص']);
  rsh.getRange(1,1).setFontSize(14).setFontWeight('bold').setFontColor('#1e3a8a');
  rsh.appendRow(['تاريخ التقرير', new Date().toLocaleDateString('ar-LY')]);
  rsh.appendRow([]);
  rsh.appendRow(['إجمالي الموظفين',     stats.totalEmployees]);
  rsh.appendRow(['الموظفون النشطون',    stats.activeEmployees]);
  rsh.appendRow(['إجمالي الوثائق',      stats.totalDocs]);
  rsh.appendRow(['وثائق ستنتهي (30 يوم)', stats.expiringSoon]);
  rsh.appendRow(['وثائق منتهية الصلاحية', stats.expired]);
  rsh.appendRow(['ملفات ناقصة',          stats.incomplete]);
  rsh.appendRow([]);
  rsh.appendRow(['الوثائق حسب النوع','العدد']);
  rsh.getRange(rsh.getLastRow(),1,1,2).setFontWeight('bold').setBackground('#e2e8f0');
  stats.docTypes.forEach(d => rsh.appendRow([d.type, d.count]));
  rsh.autoResizeColumns(1,2);
  return rss.getUrl();
}

// ──────────────────────────────────────────────────
//  Get filter options (distinct values)
// ──────────────────────────────────────────────────
function getFilterOptions() {
  try {
    const empSh  = getSheet(SH.EMPLOYEES);
    const archSh = getSheet(SH.ARCHIVE);

    const depts   = new Set();
    const docTypes = new Set();
    const statuses = new Set();

    if (empSh) {
      empSh.getDataRange().getValues().slice(1).forEach(r => {
        if (r[E.DEPARTMENT]) depts.add(eStr(r[E.DEPARTMENT]));
        if (r[E.STATUS])     statuses.add(eStr(r[E.STATUS]));
      });
    }
    if (archSh) {
      archSh.getDataRange().getValues().slice(1).forEach(r => {
        if (r[A.DOC_TYPE]) docTypes.add(eStr(r[A.DOC_TYPE]));
      });
    }

    return {
      departments: Array.from(depts).sort(),
      docTypes:    Array.from(docTypes).sort(),
      statuses:    Array.from(statuses).sort()
    };
  } catch(err) {
    return { departments: [], docTypes: [], statuses: [] };
  }
}

// ──────────────────────────────────────────────────
//  Private helpers
// ──────────────────────────────────────────────────
function _findArchiveRow(docId) {
  const sh = getSheet(SH.ARCHIVE);
  if (!sh) return null;
  const data = sh.getDataRange().getValues().slice(1);
  return data.find(r => eStr(r[A.DOC_ID]) === eStr(docId)) || null;
}
