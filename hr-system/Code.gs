// ============================================================
// Code.gs — HR System Backend (Google Apps Script)
// ============================================================

var SPREADSHEET_ID = '18SyUPB3tlLxHR7h5m4s7T5ktTwTna4CbDrNsJ0Cwtnk';

// ضع هنا معرّف ملف الشعار من Google Drive (الجزء بعد /d/ في الرابط)
var LOGO_FILE_ID = '1lASyvunt77aZJu4ucsIOSYFilegLAnEW';

var SHEET_EMPLOYEES    = 'الموظفين';
var SHEET_ATTENDANCE   = 'الحضور_اليومي';
var SHEET_ASSIGNMENTS  = 'التكليفات';
var SHEET_EXIT_PERMITS = 'أذونات_الخروج';
var SHEET_LEAVES       = 'رصيد الإجازات';

// أعمدة ورقة الموظفين (تبدأ من العمود A = index 0)
// الترتيب الفعلي: الاسم | الرقم الوظيفي | الرقم السري | الرصيد | المؤهل | المسمى الوظيفي
//                | الإدارة/مكتب | القسم | المدير | التوظيف | الدرجة | آخر إجراء
//                | العقد | انتهاء العقد | المكان | التقييم | تاريخ التقييم | الحالة
//                | ملاحظات | إجمالي المرتب السابق | الدرجة والعلاوة الحالية
//                | تاريخ استحقاق الحالية | إجمالي المرتب الحالي | رقم قرار الترقية
//                | ملاحظات الإجراء المالي | وقت الحضور المخصص | وقت الانصراف المخصص
//                | رصيد الاجازة الطارئة | عدد مرات الإجازة بدون مرتب | إجمالي الأيام المرضية
var EMP_COL = {
  NAME              : 0,   // الاسم
  EMP_ID            : 1,   // الرقم الوظيفي
  PASSWORD          : 2,   // الرقم السري
  BALANCE           : 3,   // الرصيد
  QUALIFICATION     : 4,   // المؤهل
  JOB_TITLE         : 5,   // المسمى الوظيفي
  DEPARTMENT_OFFICE : 6,   // الإدارة/مكتب
  SECTION           : 7,   // القسم
  MANAGER           : 8,   // المدير
  EMPLOYMENT_TYPE   : 9,   // التوظيف
  GRADE             : 10,  // الدرجة
  LAST_ACTION       : 11,  // آخر إجراء
  CONTRACT          : 12,  // العقد
  CONTRACT_END      : 13,  // انتهاء العقد
  LOCATION          : 14,  // المكان
  EVALUATION        : 15,  // التقييم
  EVALUATION_DATE   : 16,  // تاريخ التقييم
  STATUS            : 17,  // الحالة
  NOTES             : 18,  // ملاحظات
  PREV_SALARY       : 19,  // إجمالي المرتب السابق
  CURRENT_GRADE     : 20,  // الدرجة والعلاوة الحالية
  GRADE_DATE        : 21,  // تاريخ استحقاق الحالية
  CURRENT_SALARY    : 22,  // إجمالي المرتب الحالي
  PROMOTION_ORDER   : 23,  // رقم قرار الترقية
  FINANCIAL_NOTES   : 24,  // ملاحظات الإجراء المالي
  CHECKIN_TIME      : 25,  // وقت الحضور المخصص
  CHECKOUT_TIME     : 26,  // وقت الانصراف المخصص
  EMERGENCY_LEAVE   : 27,  // رصيد الاجازة الطارئة
  UNPAID_LEAVE_COUNT: 28,  // عدد مرات الإجازة بدون مرتب
  SICK_DAYS_TOTAL   : 29   // إجمالي الأيام المرضية
};

// أعمدة ورقة الحضور اليومي
// الترتيب الفعلي: الرقم الوظيفي | التاريخ | وقت الحضور | وقت الانصراف
var ATT_COL = {
  EMP_ID      : 0,  // الرقم الوظيفي
  DATE        : 1,  // التاريخ
  CHECKIN     : 2,  // وقت الحضور
  CHECKOUT    : 3,  // وقت الانصراف
  PERMIT_TYPE : 4   // نوع الإذن (إذن خروج) — إن وُجد
};

// أعمدة ورقة التكليفات
// الترتيب الفعلي: الاسم | الرقم الوظيفي | نوع الإجراء | من تاريخ | إلى تاريخ | رقم التكليف
var ASSIGN_COL = {
  EMP_NAME  : 0,  // الاسم
  EMP_ID    : 1,  // الرقم الوظيفي
  TYPE      : 2,  // نوع الإجراء (مهمة عمل، ...)
  DATE_FROM : 3,  // من تاريخ
  DATE_TO   : 4,  // إلى تاريخ
  ORDER_NUM : 5   // رقم التكليف
};

// أعمدة ورقة أذونات_الخروج
// الترتيب الفعلي: الاسم | الرقم الوظيفي | النوع (شخصي/عمل) | تاريخ
//               | وقت الخروج | وقت العودة | السبب | وقت الادخال
var EXIT_COL = {
  EMP_NAME    : 0,  // الاسم
  EMP_ID      : 1,  // الرقم الوظيفي
  TYPE        : 2,  // النوع (شخصي/عمل)
  DATE        : 3,  // تاريخ
  EXIT_TIME   : 4,  // وقت الخروج
  RETURN_TIME : 5,  // وقت العودة
  REASON      : 6,  // السبب
  ENTRY_TIME  : 7   // وقت الادخال
};

// أعمدة ورقة الإجازات
// الترتيب الفعلي: اسم الموظف | الرقم الوظيفي | نوع الإجازة | بداية الإجازة | نهاية الإجازة
//               | تاريخ العودة | عدد الأيام الفعلي | ملاحظات | الحالة | رسالة المباشرة
//               | رابط BDF | الاجازة بدون مرتب | التقرير الطبي BDF
var LEAVE_COL = {
  EMP_NAME   : 0,  // اسم الموظف
  EMP_ID     : 1,  // الرقم الوظيفي
  TYPE       : 2,  // نوع الإجازة
  START_DATE : 3,  // بداية الإجازة
  END_DATE   : 4,  // نهاية الإجازة
  RETURN_DATE: 5,  // تاريخ العودة
  DAYS       : 6,  // عدد الأيام الفعلي
  NOTES      : 7,  // ملاحظات
  STATUS     : 8,  // الحالة
  MSG        : 9,  // رسالة المباشرة
  BDF_LINK   : 10, // رابط BDF
  UNPAID     : 11, // الاجازة بدون مرتب
  MEDICAL    : 12  // التقرير الطبي BDF
};

// أنواع الإجازات
var LEAVE_TYPE_SICK    = 'مرضية';
var LEAVE_TYPE_UNPAID  = 'بدون مرتب';
var PERMIT_TYPE_EXIT   = 'إذن خروج';

// ─────────────────────────────────────────────
// جلب شعار الجهة من Google Drive بصيغة Base64
// ─────────────────────────────────────────────
function getLogoBase64() {
  if (!LOGO_FILE_ID || LOGO_FILE_ID.trim() === '') return '';
  try {
    var file     = DriveApp.getFileById(LOGO_FILE_ID.trim());
    var blob     = file.getBlob();
    var mimeType = blob.getContentType();
    var bytes    = blob.getBytes();
    var b64      = Utilities.base64Encode(bytes);
    return 'data:' + mimeType + ';base64,' + b64;
  } catch (e) {
    return '';
  }
}

// ─────────────────────────────────────────────
// نقطة الدخول الرئيسية للتطبيق
// ─────────────────────────────────────────────
function doGet() {
  var template       = HtmlService.createTemplateFromFile('Index');
  template.logoSrc   = getLogoBase64();
  return template
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

  // ── إحصاءات أذونات الخروج ──
  var exitPermitsCount = countExitPermits(empId, range);

  // ── إحصاءات الإجازات ──
  var leaveStats = calcLeaveStats(empId, range);

  // ── تنسيق الأوقات المخصصة ──
  var checkInFormatted  = formatTime(empRow[EMP_COL.CHECKIN_TIME]);
  var checkOutFormatted = formatTime(empRow[EMP_COL.CHECKOUT_TIME]);

  // ── سجلات الحضور والانصراف والتأخير ──
  var attendanceRecords = getAttendanceRecords(
    empId,
    range,
    empRow[EMP_COL.CHECKIN_TIME],
    empRow[EMP_COL.CHECKOUT_TIME]
  );

  return {
    success: true,
    employee: {
      name                 : empRow[EMP_COL.NAME].toString(),
      empId                : empRow[EMP_COL.EMP_ID].toString(),
      jobTitle             : empRow[EMP_COL.JOB_TITLE].toString(),
      departmentOffice     : empRow[EMP_COL.DEPARTMENT_OFFICE].toString(),
      section              : empRow[EMP_COL.SECTION].toString(),
      grade                : empRow[EMP_COL.GRADE].toString(),
      manager              : empRow[EMP_COL.MANAGER].toString(),
      qualification        : empRow[EMP_COL.QUALIFICATION].toString(),
      location             : empRow[EMP_COL.LOCATION].toString(),
      status               : empRow[EMP_COL.STATUS].toString(),
      checkInTime          : checkInFormatted,
      checkOutTime         : checkOutFormatted,
      emergencyLeaveBalance: empRow[EMP_COL.EMERGENCY_LEAVE].toString()
    },
    stats: {
      period              : period,
      periodLabel         : getPeriodLabel(period),
      assignmentsCount    : assignmentsCount,
      exitPermitsCount    : exitPermitsCount,
      leavesCount         : leaveStats.count,
      totalLeaveDays      : leaveStats.totalDays,
      unpaidLeaveDays     : leaveStats.unpaidDays,
      sickLeaveDays       : leaveStats.sickDays,
      lateCount           : attendanceRecords.lateCount,
      totalLateMinutes    : attendanceRecords.totalLateMinutes
    },
    attendance: attendanceRecords.rows
  };
}

// ─────────────────────────────────────────────
// سجلات الحضور اليومي مع حساب التأخير
// ─────────────────────────────────────────────
function getAttendanceRecords(empId, range, scheduledCheckIn, scheduledCheckOut) {
  var data        = getSheetData(SHEET_ATTENDANCE);
  var rows        = [];
  var lateCount   = 0;
  var totalLateMin= 0;

  // استخراج دقائق الوقت المخصص من كائن Date أو نص
  var scheduledInMinutes  = extractMinutesFromDay(scheduledCheckIn);
  var scheduledOutMinutes = extractMinutesFromDay(scheduledCheckOut);

  for (var i = 0; i < data.length; i++) {
    var row = data[i];
    if (row[ATT_COL.EMP_ID].toString().trim() !== empId) continue;

    var d = toDate(row[ATT_COL.DATE]);
    if (!d) continue;
    if (d < range.start || d > range.end) continue;

    var checkInVal  = row[ATT_COL.CHECKIN];
    var checkOutVal = row[ATT_COL.CHECKOUT];

    var checkInFormatted  = formatTime(checkInVal);
    var checkOutFormatted = formatTime(checkOutVal);

    // حساب التأخير بالدقائق
    var actualInMinutes = extractMinutesFromDay(checkInVal);
    var lateMinutes     = 0;
    var isLate          = false;

    if (actualInMinutes !== null && scheduledInMinutes !== null) {
      var diff = actualInMinutes - scheduledInMinutes;
      if (diff > 0) {
        lateMinutes = diff;
        isLate      = true;
        lateCount++;
        totalLateMin += lateMinutes;
      }
    }

    rows.push({
      date        : formatDateAr(d),
      dayName     : getDayNameAr(d),
      checkIn     : checkInFormatted,
      checkOut    : checkOutFormatted,
      isLate      : isLate,
      lateMinutes : lateMinutes,
      lateText    : lateMinutes > 0 ? formatLateTime(lateMinutes) : '—'
    });
  }

  // ترتيب تنازلي (الأحدث أولاً)
  rows.sort(function(a, b) { return b.date > a.date ? 1 : -1; });

  return {
    rows            : rows,
    lateCount       : lateCount,
    totalLateMinutes: totalLateMin
  };
}

// ─────────────────────────────────────────────
// استخراج عدد الدقائق من بداية اليوم
// ─────────────────────────────────────────────
function extractMinutesFromDay(value) {
  if (!value) return null;
  var d;
  if (value instanceof Date) {
    d = value;
  } else {
    d = new Date(value);
    if (isNaN(d.getTime())) {
      // محاولة تفسير النص كـ HH:MM
      var parts = value.toString().match(/(\d{1,2}):(\d{2})/);
      if (!parts) return null;
      return parseInt(parts[1]) * 60 + parseInt(parts[2]);
    }
  }
  return d.getHours() * 60 + d.getMinutes();
}

// ─────────────────────────────────────────────
// تنسيق التأخير (ساعات ودقائق)
// ─────────────────────────────────────────────
function formatLateTime(minutes) {
  if (minutes < 60) return minutes + ' د';
  var h = Math.floor(minutes / 60);
  var m = minutes % 60;
  return h + ' س' + (m > 0 ? ' ' + m + ' د' : '');
}

// ─────────────────────────────────────────────
// تنسيق التاريخ بالعربية
// ─────────────────────────────────────────────
function formatDateAr(date) {
  var d = date.getDate().toString().padStart(2, '0');
  var m = (date.getMonth() + 1).toString().padStart(2, '0');
  var y = date.getFullYear();
  return y + '-' + m + '-' + d;
}

// ─────────────────────────────────────────────
// اسم اليوم بالعربية
// ─────────────────────────────────────────────
function getDayNameAr(date) {
  var days = ['الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'];
  return days[date.getDay()];
}

// ─────────────────────────────────────────────
// عدد التكليفات في الفترة (من ورقة التكليفات)
// ─────────────────────────────────────────────
function countAssignments(empId, range) {
  var data  = getSheetData(SHEET_ASSIGNMENTS);
  var count = 0;

  for (var i = 0; i < data.length; i++) {
    var row = data[i];
    if (row[ASSIGN_COL.EMP_ID].toString().trim() !== empId) continue;
    var d = toDate(row[ASSIGN_COL.DATE_FROM]);
    if (!d) continue;
    if (d >= range.start && d <= range.end) count++;
  }
  return count;
}

// ─────────────────────────────────────────────
// عدد أذونات الخروج في الفترة (من ورقة أذونات_الخروج)
// ─────────────────────────────────────────────
function countExitPermits(empId, range) {
  var data  = getSheetData(SHEET_EXIT_PERMITS);
  var count = 0;

  for (var i = 0; i < data.length; i++) {
    var row = data[i];
    if (row[EXIT_COL.EMP_ID].toString().trim() !== empId) continue;
    var d = toDate(row[EXIT_COL.DATE]);
    if (!d) continue;
    if (d >= range.start && d <= range.end) count++;
  }
  return count;
}

// ─────────────────────────────────────────────
// إحصاءات الإجازات في الفترة (من ورقة الإجازات)
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

    var leaveEnd = endDate || startDate;
    if (startDate > range.end || leaveEnd < range.start) continue;

    var days      = parseFloat(row[LEAVE_COL.DAYS]) || 0;
    var leaveType = row[LEAVE_COL.TYPE].toString().trim();
    // عمود "الاجازة بدون مرتب" — إذا كانت قيمته غير فارغة تُحسب بدون مرتب
    var isUnpaid  = row[LEAVE_COL.UNPAID].toString().trim() !== '';
    // نوع مرضية
    var isSick    = leaveType.indexOf(LEAVE_TYPE_SICK) !== -1;

    count++;
    totalDays += days;

    if (isSick)    sickDays   += days;
    if (isUnpaid)  unpaidDays += days;
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
