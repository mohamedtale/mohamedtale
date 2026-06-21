// ============================================================
// Code.gs — HR System Backend (Google Apps Script)
// ============================================================

var SPREADSHEET_ID = '18SyUPB3tlLxHR7h5m4s7T5ktTwTna4CbDrNsJ0Cwtnk';

var SHEET_EMPLOYEES   = 'الموظفين';
var SHEET_ATTENDANCE  = 'الحضور_اليومي';
var SHEET_ASSIGNMENTS = 'التكليفات';
var SHEET_LEAVES      = 'الإجازات';

// أعمدة ورقة الموظفين (تبدأ من العمود A = index 0)
var EMP_COL = {
  NAME            : 0,   // الاسم
  EMP_ID          : 1,   // الرقم الوظيفي
  PASSWORD        : 2,   // الرقم السري
  JOB_TITLE       : 3,   // المسمى الوظيفي
  DEPARTMENT_OFFICE: 4,  // الإدارة/مكتب
  SECTION         : 5,   // القسم
  GRADE           : 6,   // الدرجة
  CHECKIN_TIME    : 7,   // وقت الحضور المخصص
  CHECKOUT_TIME   : 8,   // وقت الانصراف المخصص
  EMERGENCY_LEAVE : 9    // رصيد الإجازة الطارئة
};

// أعمدة ورقة الحضور اليومي
var ATT_COL = {
  EMP_ID      : 0,  // الرقم الوظيفي
  DATE        : 1,  // التاريخ
  CHECKIN     : 2,  // وقت الحضور
  CHECKOUT    : 3,  // وقت الانصراف
  PERMIT_TYPE : 4   // نوع الإذن (إذن خروج، ...)
};

// أعمدة ورقة التكليفات
var ASSIGN_COL = {
  EMP_ID      : 0,  // الرقم الوظيفي
  DATE        : 1,  // التاريخ
  TYPE        : 2,  // نوع التكليف
  DESCRIPTION : 3   // الوصف
};

// أعمدة ورقة الإجازات
var LEAVE_COL = {
  EMP_ID     : 0,  // الرقم الوظيفي
  START_DATE : 1,  // تاريخ البداية
  END_DATE   : 2,  // تاريخ النهاية
  TYPE       : 3,  // نوع الإجازة
  DAYS       : 4   // عدد الأيام
};

// أنواع الإجازات
var LEAVE_TYPE_SICK    = 'مرضية';
var LEAVE_TYPE_UNPAID  = 'بدون مرتب';
var PERMIT_TYPE_EXIT   = 'إذن خروج';

// ─────────────────────────────────────────────
// نقطة الدخول الرئيسية للتطبيق
// ─────────────────────────────────────────────
function doGet() {
  return HtmlService
    .createTemplateFromFile('Index')
    .evaluate()
    .setTitle('نظام إدارة الموارد البشرية')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1.0');
}

// ─────────────────────────────────────────────
// دمج ملفات HTML (CSS & JS)
// ─────────────────────────────────────────────
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

// ─────────────────────────────────────────────
// الحصول على جدول البيانات
// ─────────────────────────────────────────────
function getSpreadsheet() {
  if (SPREADSHEET_ID && SPREADSHEET_ID.trim() !== '') {
    return SpreadsheetApp.openById(SPREADSHEET_ID);
  }
  return SpreadsheetApp.getActiveSpreadsheet();
}

// ─────────────────────────────────────────────
// قراءة بيانات ورقة كاملة (بدون رأس الجدول)
// ─────────────────────────────────────────────
function getSheetData(sheetName) {
  var ss    = getSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) return [];
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];
  var data = sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).getValues();
  return data;
}

// ─────────────────────────────────────────────
// حساب نطاق التاريخ بناءً على الفترة المختارة
// ─────────────────────────────────────────────
function getDateRange(period) {
  var today = new Date();
  var start = new Date();

  switch (period) {
    case 'month':
      start.setMonth(today.getMonth() - 1);
      break;
    case '3months':
      start.setMonth(today.getMonth() - 3);
      break;
    case '6months':
      start.setMonth(today.getMonth() - 6);
      break;
    case 'year':
      start.setFullYear(today.getFullYear() - 1);
      break;
    default:
      start.setMonth(today.getMonth() - 1);
  }

  start.setHours(0, 0, 0, 0);
  today.setHours(23, 59, 59, 999);
  return { start: start, end: today };
}

// ─────────────────────────────────────────────
// تحويل قيمة إلى كائن Date بأمان
// ─────────────────────────────────────────────
function toDate(value) {
  if (!value) return null;
  if (value instanceof Date) return value;
  var d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
}

// ─────────────────────────────────────────────
// البحث عن موظف بالرقم الوظيفي مع إحصاءات الفترة
// ─────────────────────────────────────────────
function searchEmployee(empId, period) {
  if (!empId || empId.toString().trim() === '') {
    return { success: false, message: 'يرجى إدخال الرقم الوظيفي.' };
  }

  empId = empId.toString().trim();

  // ── بيانات الموظف الأساسية ──
  var employees = getSheetData(SHEET_EMPLOYEES);
  var empRow    = null;

  for (var i = 0; i < employees.length; i++) {
    if (employees[i][EMP_COL.EMP_ID].toString().trim() === empId) {
      empRow = employees[i];
      break;
    }
  }

  if (!empRow) {
    return { success: false, message: 'لم يتم العثور على الموظف. تحقق من الرقم الوظيفي.' };
  }

  // ── نطاق التاريخ ──
  var range = getDateRange(period);

  // ── إحصاءات التكليفات ──
  var assignmentsCount = countAssignments(empId, range);

  // ── إحصاءات الحضور (أذونات الخروج) ──
  var exitPermitsCount = countExitPermits(empId, range);

  // ── إحصاءات الإجازات ──
  var leaveStats = calcLeaveStats(empId, range);

  // ── تنسيق الأوقات ──
  var checkInFormatted  = formatTime(empRow[EMP_COL.CHECKIN_TIME]);
  var checkOutFormatted = formatTime(empRow[EMP_COL.CHECKOUT_TIME]);

  return {
    success: true,
    employee: {
      name              : empRow[EMP_COL.NAME].toString(),
      empId             : empRow[EMP_COL.EMP_ID].toString(),
      jobTitle          : empRow[EMP_COL.JOB_TITLE].toString(),
      departmentOffice  : empRow[EMP_COL.DEPARTMENT_OFFICE].toString(),
      section           : empRow[EMP_COL.SECTION].toString(),
      grade             : empRow[EMP_COL.GRADE].toString(),
      checkInTime       : checkInFormatted,
      checkOutTime      : checkOutFormatted,
      emergencyLeaveBalance: empRow[EMP_COL.EMERGENCY_LEAVE].toString()
    },
    stats: {
      period          : period,
      periodLabel     : getPeriodLabel(period),
      assignmentsCount: assignmentsCount,
      exitPermitsCount: exitPermitsCount,
      leavesCount     : leaveStats.count,
      totalLeaveDays  : leaveStats.totalDays,
      unpaidLeaveDays : leaveStats.unpaidDays,
      sickLeaveDays   : leaveStats.sickDays
    }
  };
}

// ─────────────────────────────────────────────
// عدد التكليفات في الفترة
// ─────────────────────────────────────────────
function countAssignments(empId, range) {
  var data  = getSheetData(SHEET_ASSIGNMENTS);
  var count = 0;

  for (var i = 0; i < data.length; i++) {
    var row = data[i];
    if (row[ASSIGN_COL.EMP_ID].toString().trim() !== empId) continue;
    var d = toDate(row[ASSIGN_COL.DATE]);
    if (!d) continue;
    if (d >= range.start && d <= range.end) count++;
  }
  return count;
}

// ─────────────────────────────────────────────
// عدد أذونات الخروج في الفترة
// ─────────────────────────────────────────────
function countExitPermits(empId, range) {
  var data  = getSheetData(SHEET_ATTENDANCE);
  var count = 0;

  for (var i = 0; i < data.length; i++) {
    var row = data[i];
    if (row[ATT_COL.EMP_ID].toString().trim() !== empId) continue;
    var d = toDate(row[ATT_COL.DATE]);
    if (!d) continue;
    if (d < range.start || d > range.end) continue;
    var permitType = row[ATT_COL.PERMIT_TYPE].toString().trim();
    if (permitType === PERMIT_TYPE_EXIT) count++;
  }
  return count;
}

// ─────────────────────────────────────────────
// إحصاءات الإجازات في الفترة
// ─────────────────────────────────────────────
function calcLeaveStats(empId, range) {
  var data       = getSheetData(SHEET_LEAVES);
  var count      = 0;
  var totalDays  = 0;
  var unpaidDays = 0;
  var sickDays   = 0;

  for (var i = 0; i < data.length; i++) {
    var row = data[i];
    if (row[LEAVE_COL.EMP_ID].toString().trim() !== empId) continue;

    var startDate = toDate(row[LEAVE_COL.START_DATE]);
    var endDate   = toDate(row[LEAVE_COL.END_DATE]);
    if (!startDate) continue;

    // تحقق من التداخل مع نطاق الفترة
    var leaveEnd = endDate || startDate;
    if (startDate > range.end || leaveEnd < range.start) continue;

    var days      = parseFloat(row[LEAVE_COL.DAYS]) || 0;
    var leaveType = row[LEAVE_COL.TYPE].toString().trim();

    count++;
    totalDays += days;

    if (leaveType === LEAVE_TYPE_SICK)   sickDays   += days;
    if (leaveType === LEAVE_TYPE_UNPAID) unpaidDays += days;
  }

  return {
    count     : count,
    totalDays : totalDays,
    unpaidDays: unpaidDays,
    sickDays  : sickDays
  };
}

// ─────────────────────────────────────────────
// تنسيق الوقت
// ─────────────────────────────────────────────
function formatTime(value) {
  if (!value) return '—';
  if (value instanceof Date) {
    var h = value.getHours().toString().padStart(2, '0');
    var m = value.getMinutes().toString().padStart(2, '0');
    return h + ':' + m;
  }
  return value.toString();
}

// ─────────────────────────────────────────────
// تسمية الفترة الزمنية
// ─────────────────────────────────────────────
function getPeriodLabel(period) {
  var labels = {
    'month'  : 'آخر شهر',
    '3months': 'آخر 3 أشهر',
    '6months': 'آخر 6 أشهر',
    'year'   : 'آخر سنة'
  };
  return labels[period] || 'آخر شهر';
}

// ─────────────────────────────────────────────
// التحقق من صحة بيانات تسجيل الدخول
// ─────────────────────────────────────────────
function verifyLogin(empId, password) {
  if (!empId || !password) {
    return { success: false, message: 'يرجى إدخال الرقم الوظيفي وكلمة المرور.' };
  }

  empId    = empId.toString().trim();
  password = password.toString().trim();

  var employees = getSheetData(SHEET_EMPLOYEES);

  for (var i = 0; i < employees.length; i++) {
    var row = employees[i];
    if (row[EMP_COL.EMP_ID].toString().trim() === empId) {
      if (row[EMP_COL.PASSWORD].toString().trim() === password) {
        return { success: true, empId: empId };
      } else {
        return { success: false, message: 'كلمة المرور غير صحيحة.' };
      }
    }
  }

  return { success: false, message: 'الرقم الوظيفي غير موجود.' };
}
