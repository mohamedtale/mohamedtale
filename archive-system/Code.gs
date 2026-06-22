// ============================================================
// Code.gs — نظام أرشفة الموظفين
// ============================================================

var SPREADSHEET_ID = '1YgAwYsMPKXL1xImr4hZmvHzSaScz0BXe_wA7g5htbfM';
var FOLDER_ID      = '1iNWhOcMh5UyPdx5R4f1DvX00Uewi98eV';
var SHEET_NAME     = 'الأرشيف';

var COL = {
  FILE_NUM  : 0,
  NAME      : 1,
  JOB_TITLE : 2,
  START_DATE: 3,
  END_DATE  : 4,
  STATUS    : 5,
  PDF_URL   : 6,
  FILE_ID   : 7,
  ENTRY_DATE: 8
};

var ALLOWED_STATUSES = { 'مستمر': true, 'تقاعد': true, 'استقالة': true, 'إنهاء خدمة': true, 'وفاة': true, 'غير محدد': true };

// ─────────────────────────────────────────────
function doGet() {
  return HtmlService.createTemplateFromFile('Index')
    .evaluate()
    .setTitle('نظام أرشفة الموظفين')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1.0');
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

// ─────────────────────────────────────────────
function _getSheet() {
  var ss    = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.getRange(1, 1, 1, 9).setValues([[
      'رقم الملف','الاسم الكامل','الوظيفة',
      'تاريخ المباشرة','تاريخ نهاية الخدمة','الحالة',
      'رابط PDF','Drive File ID','تاريخ الإدخال'
    ]]);
    sheet.getRange(1, 1, 1, 9).setFontWeight('bold');
  }
  return sheet;
}

function _getData() {
  var sheet   = _getSheet();
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];
  return sheet.getRange(2, 1, lastRow - 1, 9).getValues();
}

function _sanitize(val) {
  if (val === null || val === undefined) return '';
  return val.toString().trim().replace(/[<>"']/g, '');
}

function _fmtDate(val) {
  if (!val) return '';
  if (val instanceof Date) return Utilities.formatDate(val, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  return val.toString().trim();
}

function _rowToObj(row) {
  return {
    fileNum  : row[COL.FILE_NUM]   !== undefined ? row[COL.FILE_NUM].toString()  : '',
    name     : row[COL.NAME]       !== undefined ? row[COL.NAME].toString()      : '',
    jobTitle : row[COL.JOB_TITLE]  !== undefined ? row[COL.JOB_TITLE].toString() : '',
    startDate: _fmtDate(row[COL.START_DATE]),
    endDate  : _fmtDate(row[COL.END_DATE]),
    status   : row[COL.STATUS]     !== undefined ? row[COL.STATUS].toString()    : '',
    pdfUrl   : row[COL.PDF_URL]    !== undefined ? row[COL.PDF_URL].toString()   : '',
    fileId   : row[COL.FILE_ID]    !== undefined ? row[COL.FILE_ID].toString()   : '',
    entryDate: _fmtDate(row[COL.ENTRY_DATE])
  };
}

function _getNextFileNum(rows) {
  if (!rows || rows.length === 0) return 1;
  var max = 0;
  for (var i = 0; i < rows.length; i++) {
    var n = parseInt(rows[i][COL.FILE_NUM]);
    if (!isNaN(n) && n > max) max = n;
  }
  return max + 1;
}

// ─────────────────────────────────────────────
// إضافة موظف
// ─────────────────────────────────────────────
function addEmployee(data) {
  try {
    var name      = _sanitize(data.name);
    var jobTitle  = _sanitize(data.jobTitle);
    var startDate = _sanitize(data.startDate);
    var endDate   = _sanitize(data.endDate);
    var status    = _sanitize(data.status);
    var pdfUrl    = _sanitize(data.pdfUrl);
    var fileId    = _sanitize(data.fileId || '');

    if (!name)     return { success: false, message: 'الاسم الكامل مطلوب.' };
    if (!jobTitle) return { success: false, message: 'الوظيفة مطلوبة.' };
    if (!ALLOWED_STATUSES[status]) return { success: false, message: 'الحالة غير صالحة.' };

    var rows = _getData();

    // التحقق من التكرار (إلا إذا تم تجاوزه صراحةً)
    if (!data.forceAdd) {
      for (var i = 0; i < rows.length; i++) {
        if (rows[i][COL.NAME].toString().trim() === name) {
          return {
            success        : false,
            message        : 'تحذير: الموظف "' + name + '" مسجل مسبقاً برقم ملف ' + rows[i][COL.FILE_NUM] + '.',
            duplicate      : true,
            existingFileNum: rows[i][COL.FILE_NUM].toString()
          };
        }
      }
    }

    var fileNum = _getNextFileNum(rows);
    var today   = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');

    _getSheet().appendRow([fileNum, name, jobTitle, startDate, endDate, status, pdfUrl, fileId, today]);

    return { success: true, message: 'تم حفظ الموظف بنجاح برقم ملف ' + fileNum + '.', fileNum: fileNum };
  } catch (e) {
    Logger.log('addEmployee: ' + e);
    return { success: false, message: 'خطأ في الحفظ: ' + e.message };
  }
}

// ─────────────────────────────────────────────
// البحث
// ─────────────────────────────────────────────
function searchEmployee(query) {
  try {
    query = _sanitize(query).toLowerCase();
    if (!query) return { success: false, message: 'أدخل اسماً أو رقم ملف للبحث.' };

    var rows    = _getData();
    var results = [];
    for (var i = 0; i < rows.length; i++) {
      var nameMatch    = rows[i][COL.NAME].toString().toLowerCase().indexOf(query) !== -1;
      var fileNumMatch = rows[i][COL.FILE_NUM].toString() === query;
      if (nameMatch || fileNumMatch) results.push(_rowToObj(rows[i]));
    }

    if (results.length === 0) return { success: false, message: 'لم يتم العثور على نتائج لـ "' + query + '".' };
    return { success: true, results: results };
  } catch (e) {
    Logger.log('searchEmployee: ' + e);
    return { success: false, message: 'خطأ في البحث.' };
  }
}

// ─────────────────────────────────────────────
// تعديل موظف
// ─────────────────────────────────────────────
function updateEmployee(fileNum, data) {
  try {
    fileNum = parseInt(fileNum);
    if (isNaN(fileNum)) return { success: false, message: 'رقم ملف غير صالح.' };

    var rows     = _getData();
    var rowIndex = -1;
    for (var i = 0; i < rows.length; i++) {
      if (parseInt(rows[i][COL.FILE_NUM]) === fileNum) { rowIndex = i; break; }
    }
    if (rowIndex === -1) return { success: false, message: 'الموظف غير موجود.' };

    var name      = _sanitize(data.name);
    var jobTitle  = _sanitize(data.jobTitle);
    var startDate = _sanitize(data.startDate);
    var endDate   = _sanitize(data.endDate);
    var status    = _sanitize(data.status);
    var pdfUrl    = _sanitize(data.pdfUrl);
    var newFileId = _sanitize(data.fileId || rows[rowIndex][COL.FILE_ID]);

    if (!name)     return { success: false, message: 'الاسم مطلوب.' };
    if (!ALLOWED_STATUSES[status]) return { success: false, message: 'الحالة غير صالحة.' };

    _getSheet().getRange(rowIndex + 2, 2, 1, 7).setValues([[
      name, jobTitle, startDate, endDate, status, pdfUrl, newFileId
    ]]);

    return { success: true, message: 'تم تعديل بيانات الموظف بنجاح.' };
  } catch (e) {
    Logger.log('updateEmployee: ' + e);
    return { success: false, message: 'خطأ في التعديل: ' + e.message };
  }
}

// ─────────────────────────────────────────────
// حذف موظف
// ─────────────────────────────────────────────
function deleteEmployee(fileNum) {
  try {
    fileNum = parseInt(fileNum);
    if (isNaN(fileNum)) return { success: false, message: 'رقم ملف غير صالح.' };

    var rows     = _getData();
    var rowIndex = -1;
    for (var i = 0; i < rows.length; i++) {
      if (parseInt(rows[i][COL.FILE_NUM]) === fileNum) { rowIndex = i; break; }
    }
    if (rowIndex === -1) return { success: false, message: 'الموظف غير موجود.' };

    var driveFileId = rows[rowIndex][COL.FILE_ID].toString().trim();
    if (driveFileId) {
      try { DriveApp.getFileById(driveFileId).setTrashed(true); } catch (e) {}
    }

    _getSheet().deleteRow(rowIndex + 2);
    return { success: true, message: 'تم حذف الموظف بنجاح.' };
  } catch (e) {
    Logger.log('deleteEmployee: ' + e);
    return { success: false, message: 'خطأ في الحذف: ' + e.message };
  }
}

// ─────────────────────────────────────────────
// الإحصاءات
// ─────────────────────────────────────────────
function getStats() {
  try {
    var rows  = _getData();
    var stats = { total: rows.length, مستمر: 0, تقاعد: 0, استقالة: 0, 'إنهاء خدمة': 0, 'وفاة': 0, 'غير محدد': 0, recent: [] };

    for (var i = 0; i < rows.length; i++) {
      var s = rows[i][COL.STATUS].toString().trim();
      if (stats[s] !== undefined) stats[s]++;
    }

    var recentRows = rows.slice(-10).reverse();
    for (var j = 0; j < recentRows.length; j++) {
      stats.recent.push(_rowToObj(recentRows[j]));
    }

    return { success: true, stats: stats };
  } catch (e) {
    Logger.log('getStats: ' + e);
    return { success: false, message: 'خطأ في جلب الإحصاءات.' };
  }
}

// ─────────────────────────────────────────────
// تصفية حسب الحالة
// ─────────────────────────────────────────────
function getByStatus(status) {
  try {
    status = _sanitize(status);
    if (!ALLOWED_STATUSES[status]) return { success: false, message: 'حالة غير صالحة.' };

    var rows    = _getData();
    var results = [];
    for (var i = 0; i < rows.length; i++) {
      if (rows[i][COL.STATUS].toString().trim() === status) results.push(_rowToObj(rows[i]));
    }

    return { success: true, results: results, count: results.length };
  } catch (e) {
    Logger.log('getByStatus: ' + e);
    return { success: false, message: 'خطأ في التصفية.' };
  }
}

// ─────────────────────────────────────────────
// رفع PDF إلى Drive
// ─────────────────────────────────────────────
function uploadPDF(base64Data, fileName, mimeType) {
  try {
    if (!base64Data || !fileName) return { success: false, message: 'بيانات الملف ناقصة.' };

    var allowed = { 'application/pdf': true, 'image/jpeg': true, 'image/png': true };
    if (!allowed[mimeType]) return { success: false, message: 'نوع الملف غير مدعوم. يُقبل PDF والصور فقط.' };

    var bytes = Utilities.base64Decode(base64Data);
    if (bytes.length > 10 * 1024 * 1024) return { success: false, message: 'حجم الملف يتجاوز 10 ميجابايت.' };

    var safeName = fileName.replace(/[^a-zA-Z0-9؀-ۿ._\- ]/g, '').substring(0, 100);
    var blob     = Utilities.newBlob(bytes, mimeType, safeName);
    var folder   = DriveApp.getFolderById(FOLDER_ID);
    var file     = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    return {
      success: true,
      fileId : file.getId(),
      fileUrl: 'https://drive.google.com/file/d/' + file.getId() + '/view'
    };
  } catch (e) {
    Logger.log('uploadPDF: ' + e);
    return { success: false, message: 'خطأ في رفع الملف: ' + e.message };
  }
}

// ─────────────────────────────────────────────
// تصدير كل البيانات
// ─────────────────────────────────────────────
function exportData() {
  try {
    var rows   = _getData();
    var result = [];
    for (var i = 0; i < rows.length; i++) result.push(_rowToObj(rows[i]));
    return { success: true, data: result };
  } catch (e) {
    Logger.log('exportData: ' + e);
    return { success: false, message: 'خطأ في التصدير.' };
  }
}
