// ============================================================
// Code.gs — HR System Backend (Google Apps Script)
// ============================================================

var SPREADSHEET_ID    = '18SyUPB3tlLxHR7h5m4s7T5ktTwTna4CbDrNsJ0Cwtnk';
var LOGO_FILE_ID      = '1lASyvunt77aZJu4ucsIOSYFilegLAnEW';

var SHEET_EMPLOYEES    = 'الموظفين';
var SHEET_ATTENDANCE   = 'الحضور_اليومي';
var SHEET_ASSIGNMENTS  = 'التكليفات';
var SHEET_EXIT_PERMITS = 'أذونات_الخروج';
var SHEET_LEAVES       = 'الإجازات';

var LEAVE_TYPE_SICK   = 'مرضية';
var LEAVE_TYPE_UNPAID = 'بدون مرتب';

// حدود الحضور والانصراف الثابتة
var LATE_THRESHOLD_HOUR   = 8;   // بعد 08:30 = تأخير
var LATE_THRESHOLD_MINUTE = 30;
var EARLY_EXIT_HOUR       = 14;  // قبل 14:20 = خروج بغير إذن
var EARLY_EXIT_MINUTE     = 20;

// الفترات الزمنية المسموح بها فقط
var ALLOWED_PERIODS = { 'month': true, '3months': true, '6months': true, 'year': true };

// أعمدة ورقة الموظفين (0-based، من اليمين لليسار)
var EMP_COL = {
  NAME              : 0,
  EMP_ID            : 1,
  PASSWORD          : 2,
  BALANCE           : 3,
  QUALIFICATION     : 4,
  JOB_TITLE         : 5,
  DEPARTMENT_OFFICE : 6,
  SECTION           : 7,
  MANAGER           : 8,
  EMPLOYMENT_TYPE   : 9,
  GRADE             : 10,
  LAST_ACTION       : 11,
  CONTRACT          : 12,
  CONTRACT_END      : 13,
  LOCATION          : 14,
  EVALUATION        : 15,
  EVALUATION_DATE   : 16,
  STATUS            : 17,
  NOTES             : 18,
  PREV_SALARY       : 19,
  CURRENT_GRADE     : 20,
  GRADE_DATE        : 21,
  CURRENT_SALARY    : 22,
  PROMOTION_ORDER   : 23,
  FINANCIAL_NOTES   : 24,
  CHECKIN_TIME      : 25,
  CHECKOUT_TIME     : 26,
  EMERGENCY_LEAVE   : 27,
  UNPAID_LEAVE_COUNT: 28,
  SICK_DAYS_TOTAL   : 29
};

var ATT_COL = {
  EMP_ID  : 0,
  DATE    : 1,
  CHECKIN : 2,
  CHECKOUT: 3
};

var ASSIGN_COL = {
  EMP_NAME : 0,
  EMP_ID   : 1,
  TYPE     : 2,
  DATE_FROM: 3,
  DATE_TO  : 4,
  ORDER_NUM: 5
};

var EXIT_COL = {
  EMP_NAME   : 0,
  EMP_ID     : 1,
  TYPE       : 2,
  DATE       : 3,
  EXIT_TIME  : 4,
  RETURN_TIME: 5,
  REASON     : 6,
  ENTRY_TIME : 7
};

var LEAVE_COL = {
  EMP_NAME   : 0,
  EMP_ID     : 1,
  TYPE       : 2,
  START_DATE : 3,
  END_DATE   : 4,
  RETURN_DATE: 5,
  DAYS       : 6,
  NOTES      : 7,
  STATUS     : 8,
  MSG        : 9,
  BDF        : 10
};

// ─────────────────────────────────────────────
// التحقق من المدخلات وتنقيتها
// ─────────────────────────────────────────────
function _sanitizeEmpId(raw) {
  if (!raw) return null;
  var s = raw.toString().trim();
  // الرقم الوظيفي: أحرف وأرقام فقط، بحد أقصى 30 محرفاً
  if (s.length === 0 || s.length > 30) return null;
  if (!/^[a-zA-Z0-9؀-ۿ\-_]+$/.test(s)) return null;
  return s;
}

function _sanitizePeriod(raw) {
  var s = raw ? raw.toString().trim() : 'month';
  return ALLOWED_PERIODS[s] ? s : 'month';
}

// ─────────────────────────────────────────────
// جلب شعار الجهة — يقبل صور فقط
// ─────────────────────────────────────────────
function getLogoBase64() {
  if (!LOGO_FILE_ID || LOGO_FILE_ID.trim() === '') return '';
  try {
    var file     = DriveApp.getFileById(LOGO_FILE_ID.trim());
    var blob     = file.getBlob();
    var mimeType = blob.getContentType();
    // قبول أنواع الصور فقط
    if (!mimeType || mimeType.indexOf('image/') !== 0) return '';
    var b64 = Utilities.base64Encode(blob.getBytes());
    return 'data:' + mimeType + ';base64,' + b64;
  } catch (e) {
    Logger.log('getLogoBase64 error: ' + e);
    return '';
  }
}

// ─────────────────────────────────────────────
// نقطة الدخول الرئيسية
// ─────────────────────────────────────────────
function doGet() {
  var template     = HtmlService.createTemplateFromFile('Index');
  template.logoSrc = getLogoBase64();
  return template
    .evaluate()
    .setTitle('نظام إدارة الموارد البشرية')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1.0');
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

// ─────────────────────────────────────────────
// قراءة ورقة بيانات (دوال داخلية)
// ─────────────────────────────────────────────
function _getSpreadsheet() {
  if (SPREADSHEET_ID && SPREADSHEET_ID.trim() !== '') {
    return SpreadsheetApp.openById(SPREADSHEET_ID);
  }
  return SpreadsheetApp.getActiveSpreadsheet();
}

function _getSheetData(sheetName) {
  var ss    = _getSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) return [];
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];
  return sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).getValues();
}

// ─────────────────────────────────────────────
// حساب نطاق التاريخ
// ─────────────────────────────────────────────
function _getDateRange(period) {
  var end   = new Date();
  var start = new Date();

  switch (period) {
    case '3months': start.setMonth(end.getMonth() - 3);      break;
    case '6months': start.setMonth(end.getMonth() - 6);      break;
    case 'year':    start.setFullYear(end.getFullYear() - 1); break;
    default:        start.setMonth(end.getMonth() - 1);
  }

  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);
  return { start: start, end: end };
}

// ─────────────────────────────────────────────
// تحويل قيمة إلى Date بأمان
// ─────────────────────────────────────────────
function _toDate(value) {
  if (!value) return null;
  if (value instanceof Date) return isNaN(value.getTime()) ? null : value;
  var d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
}

// ─────────────────────────────────────────────
// البحث عن موظف — الدالة العامة الوحيدة للبيانات
// ─────────────────────────────────────────────
function searchEmployee(empId, period) {
  try {
    var cleanId = _sanitizeEmpId(empId);
    if (!cleanId) {
      return { success: false, message: 'الرقم الوظيفي غير صالح. يجب أن يحتوي على حروف وأرقام فقط.' };
    }

    var cleanPeriod = _sanitizePeriod(period);
    var employees   = _getSheetData(SHEET_EMPLOYEES);

    if (!employees || employees.length === 0) {
      return { success: false, message: 'تعذّر قراءة بيانات الموظفين. تحقق من اسم الشيت.' };
    }

    var empRow = null;
    for (var i = 0; i < employees.length; i++) {
      var rowId = employees[i][EMP_COL.EMP_ID];
      if (rowId !== null && rowId !== undefined && rowId.toString().trim() === cleanId) {
        empRow = employees[i];
        break;
      }
    }

    if (!empRow) {
      return { success: false, message: 'لم يتم العثور على موظف بهذا الرقم. تحقق من الرقم الوظيفي.' };
    }

    var range = _getDateRange(cleanPeriod);

    var assignmentsCount = 0;
    var exitPermitsCount = 0;
    var leaveStats       = { count: 0, totalDays: 0, unpaidDays: 0, sickDays: 0 };
    var attendanceResult = { rows: [], lateCount: 0, totalLateMinutes: 0, earlyExitCount: 0 };

    try { assignmentsCount = _countAssignments(cleanId, range); }
    catch(e) { Logger.log('assignments err: ' + e); }

    try { exitPermitsCount = _countExitPermits(cleanId, range); }
    catch(e) { Logger.log('exit permits err: ' + e); }

    try { leaveStats = _calcLeaveStats(cleanId, range); }
    catch(e) { Logger.log('leave stats err: ' + e); }

    try { attendanceResult = _getAttendanceRecords(cleanId, range); }
    catch(e) { Logger.log('attendance err: ' + e); }

    return {
      success: true,
      employee: {
        name                 : (empRow[EMP_COL.NAME]              || '').toString(),
        empId                : (empRow[EMP_COL.EMP_ID]            || '').toString(),
        jobTitle             : (empRow[EMP_COL.JOB_TITLE]         || '').toString(),
        departmentOffice     : (empRow[EMP_COL.DEPARTMENT_OFFICE] || '').toString(),
        section              : (empRow[EMP_COL.SECTION]           || '').toString(),
        grade                : (empRow[EMP_COL.GRADE]             || '').toString(),
        manager              : (empRow[EMP_COL.MANAGER]           || '').toString(),
        qualification        : (empRow[EMP_COL.QUALIFICATION]     || '').toString(),
        location             : (empRow[EMP_COL.LOCATION]          || '').toString(),
        status               : (empRow[EMP_COL.STATUS]            || '').toString(),
        checkInTime          : _formatTime(empRow[EMP_COL.CHECKIN_TIME]),
        checkOutTime         : _formatTime(empRow[EMP_COL.CHECKOUT_TIME]),
        emergencyLeaveBalance: (empRow[EMP_COL.EMERGENCY_LEAVE]   || '0').toString()
      },
      stats: {
        period              : cleanPeriod,
        periodLabel         : _getPeriodLabel(cleanPeriod),
        assignmentsCount    : assignmentsCount,
        exitPermitsCount    : exitPermitsCount,
        leavesCount         : leaveStats.count,
        totalLeaveDays      : leaveStats.totalDays,
        unpaidLeaveDays     : leaveStats.unpaidDays,
        sickLeaveDays       : leaveStats.sickDays,
        lateCount           : attendanceResult.lateCount,
        totalLateMinutes    : attendanceResult.totalLateMinutes,
        earlyExitCount      : attendanceResult.earlyExitCount
      },
      attendance: attendanceResult.rows
    };

  } catch (e) {
    Logger.log('searchEmployee fatal: ' + e.toString());
    return { success: false, message: 'خطأ في النظام. يرجى المحاولة مرة أخرى.' };
  }
}

// ─────────────────────────────────────────────
// سجلات الحضور والانصراف (بدون تكرار + كشف التأخير)
// ─────────────────────────────────────────────
function _getAttendanceRecords(empId, range) {
  var data           = _getSheetData(SHEET_ATTENDANCE);
  var seen           = {};
  var rows           = [];
  var lateCount      = 0;
  var totalLateMin   = 0;
  var earlyExitCount = 0;

  var lateThreshold      = LATE_THRESHOLD_HOUR  * 60 + LATE_THRESHOLD_MINUTE;  // 510
  var earlyExitThreshold = EARLY_EXIT_HOUR * 60 + EARLY_EXIT_MINUTE;           // 860

  for (var i = 0; i < data.length; i++) {
    var row = data[i];
    if ((row[ATT_COL.EMP_ID] || '').toString().trim() !== empId) continue;

    var d = _toDate(row[ATT_COL.DATE]);
    if (!d) continue;
    if (d < range.start || d > range.end) continue;

    var dateKey = _formatDateKey(d);
    if (seen[dateKey]) continue;
    seen[dateKey] = true;

    var checkInVal  = row[ATT_COL.CHECKIN];
    var checkOutVal = row[ATT_COL.CHECKOUT];

    var actualInMinutes  = _extractMinutes(checkInVal);
    var actualOutMinutes = _extractMinutes(checkOutVal);

    var lateMinutes = 0;
    var isLate      = false;
    var isEarlyExit = false;

    if (actualInMinutes !== null && actualInMinutes > lateThreshold) {
      lateMinutes = actualInMinutes - lateThreshold;
      isLate      = true;
      lateCount++;
      totalLateMin += lateMinutes;
    }

    if (actualOutMinutes !== null && actualOutMinutes < earlyExitThreshold) {
      isEarlyExit = true;
      earlyExitCount++;
    }

    var status = 'ok';
    if      (isLate && isEarlyExit) status = 'both';
    else if (isLate)                status = 'late';
    else if (isEarlyExit)           status = 'early';

    rows.push({
      date        : dateKey,
      dayName     : _getDayNameAr(d),
      checkIn     : _formatTime(checkInVal),
      checkOut    : _formatTime(checkOutVal),
      isLate      : isLate,
      isEarlyExit : isEarlyExit,
      status      : status,
      lateMinutes : lateMinutes,
      lateText    : lateMinutes > 0 ? _formatLateTime(lateMinutes) : '—',
      _ts         : d.getTime()
    });
  }

  rows.sort(function(a, b) { return b._ts - a._ts; });

  return {
    rows            : rows,
    lateCount       : lateCount,
    totalLateMinutes: totalLateMin,
    earlyExitCount  : earlyExitCount
  };
}

// ─────────────────────────────────────────────
// استخراج الدقائق من وقت اليوم
// يتعامل مع: Date object، نص "HH:MM:SS"، نص يحتوي "ص/م"
// ─────────────────────────────────────────────
function _extractMinutes(value) {
  if (value === null || value === undefined || value === '') return null;

  // Date object مباشرة من Sheets (الأكثر شيوعاً)
  if (value instanceof Date) {
    if (isNaN(value.getTime())) return null;
    return value.getHours() * 60 + value.getMinutes();
  }

  var str = value.toString().trim();
  if (!str) return null;

  // محاولة تفسير كـ Date
  var d = new Date(str);
  if (!isNaN(d.getTime())) {
    return d.getHours() * 60 + d.getMinutes();
  }

  // نص قد يحتوي على "ص" أو "م" (صباحاً/مساءً)
  var isPM = str.indexOf('م') !== -1 || str.toLowerCase().indexOf('pm') !== -1;
  var parts = str.match(/(\d{1,2}):(\d{2})/);
  if (!parts) return null;

  var h = parseInt(parts[1], 10);
  var m = parseInt(parts[2], 10);

  // تحويل 12-hour إلى 24-hour إذا تضمن "م"
  if (isPM && h < 12) h += 12;
  if (!isPM && str.indexOf('ص') !== -1 && h === 12) h = 0;

  return h * 60 + m;
}

// ─────────────────────────────────────────────
// إحصاءات التكليفات
// ─────────────────────────────────────────────
function _countAssignments(empId, range) {
  var data  = _getSheetData(SHEET_ASSIGNMENTS);
  var count = 0;
  for (var i = 0; i < data.length; i++) {
    var row = data[i];
    if ((row[ASSIGN_COL.EMP_ID] || '').toString().trim() !== empId) continue;
    var d = _toDate(row[ASSIGN_COL.DATE_FROM]);
    if (d && d >= range.start && d <= range.end) count++;
  }
  return count;
}

// ─────────────────────────────────────────────
// إحصاءات أذونات الخروج
// ─────────────────────────────────────────────
function _countExitPermits(empId, range) {
  var data  = _getSheetData(SHEET_EXIT_PERMITS);
  var count = 0;
  for (var i = 0; i < data.length; i++) {
    var row = data[i];
    if ((row[EXIT_COL.EMP_ID] || '').toString().trim() !== empId) continue;
    var d = _toDate(row[EXIT_COL.DATE]);
    if (d && d >= range.start && d <= range.end) count++;
  }
  return count;
}

// ─────────────────────────────────────────────
// إحصاءات الإجازات
// ─────────────────────────────────────────────
function _calcLeaveStats(empId, range) {
  var data       = _getSheetData(SHEET_LEAVES);
  var count      = 0;
  var totalDays  = 0;
  var unpaidDays = 0;
  var sickDays   = 0;

  for (var i = 0; i < data.length; i++) {
    var row = data[i];
    if ((row[LEAVE_COL.EMP_ID] || '').toString().trim() !== empId) continue;

    var startDate = _toDate(row[LEAVE_COL.START_DATE]);
    if (!startDate) continue;

    var endDate  = _toDate(row[LEAVE_COL.END_DATE]);
    var leaveEnd = endDate || startDate;
    if (startDate > range.end || leaveEnd < range.start) continue;

    var days      = parseFloat(row[LEAVE_COL.DAYS]) || 0;
    var leaveType = (row[LEAVE_COL.TYPE] || '').toString().trim();

    count++;
    totalDays += days;
    if (leaveType === LEAVE_TYPE_SICK)   sickDays   += days;
    if (leaveType === LEAVE_TYPE_UNPAID) unpaidDays += days;
  }

  return { count: count, totalDays: totalDays, unpaidDays: unpaidDays, sickDays: sickDays };
}

// ─────────────────────────────────────────────
// دوال مساعدة
// ─────────────────────────────────────────────
function _formatTime(value) {
  if (!value) return '—';
  if (value instanceof Date && !isNaN(value.getTime())) {
    return value.getHours().toString().padStart(2, '0') + ':' +
           value.getMinutes().toString().padStart(2, '0');
  }
  return value.toString();
}

function _formatDateKey(date) {
  var d = date.getDate().toString().padStart(2, '0');
  var m = (date.getMonth() + 1).toString().padStart(2, '0');
  return date.getFullYear() + '-' + m + '-' + d;
}

function _getDayNameAr(date) {
  return ['الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'][date.getDay()];
}

function _formatLateTime(minutes) {
  if (minutes < 60) return minutes + ' د';
  var h = Math.floor(minutes / 60);
  var m = minutes % 60;
  return h + ' س' + (m > 0 ? ' ' + m + ' د' : '');
}

function _getPeriodLabel(period) {
  var labels = { month: 'آخر شهر', '3months': 'آخر 3 أشهر', '6months': 'آخر 6 أشهر', year: 'آخر سنة' };
  return labels[period] || 'آخر شهر';
}
