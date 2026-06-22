// ============================================================
// Code.gs — نظام أرشفة القسم
// ============================================================

var SPREADSHEET_ID = '1lqcxBy7pzC-ahMjFO6WwpTfUkXE2qq9ZtI_sL_LQiwM';
var ROOT_FOLDER_ID = '1qvVAEA9uV069UgtFQegYKXehLIcuW1hP';

// أعمدة كل ورقة (تتطابق مع ما أنشأه Setup.gs)
var COL = {
  REF_NUM   : 0,  // رقم القيد
  DOC_DATE  : 1,  // تاريخ الوثيقة
  SUBJECT   : 2,  // الموضوع
  FIELD1    : 3,  // الحقل الإضافي 1
  FIELD2    : 4,  // الحقل الإضافي 2
  NOTES     : 5,  // ملاحظات
  PDF_URL   : 6,  // رابط PDF
  FILE_ID   : 7,  // Drive File ID
  ENTRY_DATE: 8   // تاريخ الإدخال
};
var NUM_COLS = 9;

// ─────────────────────────────────────────────
function doGet() {
  return HtmlService.createTemplateFromFile('Index')
    .evaluate()
    .setTitle('نظام أرشفة القسم')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1.0');
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

// ─────────────────────────────────────────────
// جلب أنواع الملفات من ورقة الإعدادات
// ─────────────────────────────────────────────
function getFileTypes() {
  try {
    var ss    = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheetByName('الإعدادات');
    if (!sheet) return { success: false, message: 'ورقة الإعدادات غير موجودة.' };

    var lastRow = sheet.getLastRow();
    if (lastRow < 2) return { success: true, types: [] };

    var rows  = sheet.getRange(2, 1, lastRow - 1, 5).getValues();
    var types = [];
    for (var i = 0; i < rows.length; i++) {
      if (rows[i][4].toString().trim() === 'نعم') {
        types.push({
          name  : rows[i][0].toString().trim(),
          icon  : rows[i][1].toString().trim(),
          field1: rows[i][2].toString().trim(),
          field2: rows[i][3].toString().trim()
        });
      }
    }
    return { success: true, types: types };
  } catch (e) {
    Logger.log('getFileTypes: ' + e);
    return { success: false, message: e.message };
  }
}

// ─────────────────────────────────────────────
// إحصاءات — عدد السجلات لكل نوع
// ─────────────────────────────────────────────
function getStats() {
  try {
    var res = getFileTypes();
    if (!res.success) return res;

    var ss    = SpreadsheetApp.openById(SPREADSHEET_ID);
    var stats = {};

    for (var i = 0; i < res.types.length; i++) {
      var name  = res.types[i].name;
      var sheet = ss.getSheetByName(name);
      stats[name] = sheet ? Math.max(0, sheet.getLastRow() - 1) : 0;
    }

    return { success: true, stats: stats, total: _sumObj(stats) };
  } catch (e) {
    Logger.log('getStats: ' + e);
    return { success: false, message: e.message };
  }
}

function _sumObj(obj) {
  var sum = 0;
  for (var k in obj) sum += obj[k];
  return sum;
}

// ─────────────────────────────────────────────
// جلب سجلات نوع معين
// ─────────────────────────────────────────────
function getRecords(typeName) {
  try {
    var ss    = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheetByName(typeName);
    if (!sheet) return { success: false, message: 'الورقة غير موجودة.' };

    var lastRow = sheet.getLastRow();
    if (lastRow < 2) return { success: true, records: [] };

    var rows    = sheet.getRange(2, 1, lastRow - 1, NUM_COLS).getValues();
    var records = [];
    for (var i = 0; i < rows.length; i++) {
      // seq = رقم الصف الفعلي في الورقة (يُستخدم للتعديل والحذف)
      records.push(_rowToObj(rows[i], i + 2));
    }
    return { success: true, records: records };
  } catch (e) {
    Logger.log('getRecords: ' + e);
    return { success: false, message: e.message };
  }
}

// ─────────────────────────────────────────────
// إضافة سجل
// ─────────────────────────────────────────────
function addRecord(typeName, data) {
  try {
    var ss    = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheetByName(typeName);
    if (!sheet) return { success: false, message: 'الورقة غير موجودة.' };

    var subject = _sanitize(data.subject);
    if (!subject) return { success: false, message: 'الموضوع مطلوب.' };

    var today = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');

    sheet.appendRow([
      _sanitize(data.refNum  || ''),
      _sanitize(data.docDate || ''),
      subject,
      _sanitize(data.field1  || ''),
      _sanitize(data.field2  || ''),
      _sanitize(data.notes   || ''),
      _sanitize(data.pdfUrl  || ''),
      _sanitize(data.fileId  || ''),
      today
    ]);

    return { success: true, message: 'تم الحفظ بنجاح.' };
  } catch (e) {
    Logger.log('addRecord: ' + e);
    return { success: false, message: 'خطأ في الحفظ: ' + e.message };
  }
}

// ─────────────────────────────────────────────
// تعديل سجل (seq = رقم الصف في الورقة)
// ─────────────────────────────────────────────
function updateRecord(typeName, seq, data) {
  try {
    var ss    = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheetByName(typeName);
    if (!sheet) return { success: false, message: 'الورقة غير موجودة.' };

    seq = parseInt(seq);
    if (isNaN(seq) || seq < 2) return { success: false, message: 'رقم الصف غير صحيح.' };
    if (seq > sheet.getLastRow()) return { success: false, message: 'السجل غير موجود.' };

    // الاحتفاظ بالملف القديم إن لم يُرفع ملف جديد
    var oldFileId = sheet.getRange(seq, COL.FILE_ID + 1).getValue().toString();
    var fileId    = _sanitize(data.fileId || oldFileId);
    var pdfUrl    = _sanitize(data.pdfUrl || sheet.getRange(seq, COL.PDF_URL + 1).getValue().toString());

    sheet.getRange(seq, 1, 1, NUM_COLS).setValues([[
      _sanitize(data.refNum  || ''),
      _sanitize(data.docDate || ''),
      _sanitize(data.subject || ''),
      _sanitize(data.field1  || ''),
      _sanitize(data.field2  || ''),
      _sanitize(data.notes   || ''),
      pdfUrl,
      fileId,
      sheet.getRange(seq, COL.ENTRY_DATE + 1).getValue()  // الاحتفاظ بتاريخ الإدخال الأصلي
    ]]);

    return { success: true, message: 'تم التعديل بنجاح.' };
  } catch (e) {
    Logger.log('updateRecord: ' + e);
    return { success: false, message: 'خطأ في التعديل: ' + e.message };
  }
}

// ─────────────────────────────────────────────
// حذف سجل (seq = رقم الصف في الورقة)
// ─────────────────────────────────────────────
function deleteRecord(typeName, seq) {
  try {
    var ss    = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheetByName(typeName);
    if (!sheet) return { success: false, message: 'الورقة غير موجودة.' };

    seq = parseInt(seq);
    if (isNaN(seq) || seq < 2) return { success: false, message: 'رقم الصف غير صحيح.' };
    if (seq > sheet.getLastRow()) return { success: false, message: 'السجل غير موجود.' };

    // حذف ملف Drive إن وجد
    var driveFileId = sheet.getRange(seq, COL.FILE_ID + 1).getValue().toString().trim();
    if (driveFileId) {
      try { DriveApp.getFileById(driveFileId).setTrashed(true); } catch (e) {}
    }

    sheet.deleteRow(seq);
    return { success: true, message: 'تم الحذف بنجاح.' };
  } catch (e) {
    Logger.log('deleteRecord: ' + e);
    return { success: false, message: 'خطأ في الحذف: ' + e.message };
  }
}

// ─────────────────────────────────────────────
// بحث
// ─────────────────────────────────────────────
function searchRecords(typeName, query) {
  try {
    query = _sanitize(query).toLowerCase();
    if (!query) return { success: false, message: 'أدخل كلمة للبحث.' };

    var res = getRecords(typeName);
    if (!res.success) return res;

    var results = res.records.filter(function(r) {
      return r.subject.toLowerCase().indexOf(query)  !== -1 ||
             r.refNum.toLowerCase().indexOf(query)   !== -1 ||
             r.field1.toLowerCase().indexOf(query)   !== -1 ||
             r.field2.toLowerCase().indexOf(query)   !== -1;
    });

    if (results.length === 0) return { success: false, message: 'لا توجد نتائج لـ "' + query + '".' };
    return { success: true, records: results };
  } catch (e) {
    Logger.log('searchRecords: ' + e);
    return { success: false, message: 'خطأ في البحث.' };
  }
}

// ─────────────────────────────────────────────
// رفع ملف إلى Drive
// ─────────────────────────────────────────────
function uploadPDF(base64Data, fileName, mimeType, typeName) {
  try {
    if (!base64Data || !fileName) return { success: false, message: 'بيانات الملف ناقصة.' };

    var allowed = { 'application/pdf': true, 'image/jpeg': true, 'image/png': true };
    if (!allowed[mimeType]) return { success: false, message: 'نوع الملف غير مدعوم.' };

    var bytes = Utilities.base64Decode(base64Data);
    if (bytes.length > 150 * 1024 * 1024) return { success: false, message: 'حجم الملف يتجاوز 150 ميجابايت.' };

    var rootFolder = DriveApp.getFolderById(ROOT_FOLDER_ID);
    var folders    = rootFolder.getFoldersByName(typeName);
    var folder     = folders.hasNext() ? folders.next() : rootFolder;

    var safeName = fileName.replace(/[^a-zA-Z0-9؀-ۿ._\- ]/g, '').substring(0, 100);
    var blob     = Utilities.newBlob(bytes, mimeType, safeName);
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
// تصدير بيانات نوع معين
// ─────────────────────────────────────────────
function exportRecords(typeName) {
  try {
    var res = getRecords(typeName);
    if (!res.success) return res;
    return { success: true, data: res.records, typeName: typeName };
  } catch (e) {
    return { success: false, message: e.message };
  }
}

// ─────────────────────────────────────────────
// مساعدات
// ─────────────────────────────────────────────
function _sanitize(val) {
  if (val === null || val === undefined) return '';
  return val.toString().trim().replace(/[<>"']/g, '');
}

function _fmtDate(val) {
  if (!val) return '';
  if (val instanceof Date) return Utilities.formatDate(val, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  return val.toString().trim();
}

function _rowToObj(row, sheetRowNum) {
  return {
    seq      : sheetRowNum.toString(),   // رقم الصف الفعلي للتعديل والحذف
    refNum   : (row[COL.REF_NUM]    || '').toString(),
    docDate  : _fmtDate(row[COL.DOC_DATE]),
    subject  : (row[COL.SUBJECT]    || '').toString(),
    field1   : (row[COL.FIELD1]     || '').toString(),
    field2   : (row[COL.FIELD2]     || '').toString(),
    notes    : (row[COL.NOTES]      || '').toString(),
    pdfUrl   : (row[COL.PDF_URL]    || '').toString(),
    fileId   : (row[COL.FILE_ID]    || '').toString(),
    entryDate: _fmtDate(row[COL.ENTRY_DATE])
  };
}
