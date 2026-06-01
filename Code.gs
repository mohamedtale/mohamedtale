/**
 * ═══════════════════════════════════════════════════════════════════
 *  نظام الإجازات الاحترافي 2026 — الإصدار الماسي المطور
 *  التحسينات الجوهرية:
 *    ✦ Singleton للـ Spreadsheet (فتح مرة واحدة طوال الجلسة)
 *    ✦ CacheService للعطلات (TTL 6 دقائق)
 *    ✦ Batch Writes — flush واحد فقط
 *    ✦ withRetry() — 3 محاولات تلقائية
 *    ✦ validateLeaveData() — تحقق شامل قبل الحفظ
 *    ✦ logError() — تسجيل الأخطاء في ورقة Log
 *    ✦ sanitize() — تعقيم جميع المدخلات
 *    ✦ warmCache() — تحميل مسبق يشتغل بـ Trigger
 *    ✦ getRecentLeaves() — آخر 5 إجازات للموظف
 *    ✦ isEdit: تحديث الصف الموجود + استعادة الرصيد القديم
 *    ✦ entryPerson: حفظ اسم مُدخل البيانات
 *    ✦ إصلاح bug ضرب أيام الغفارة مرتين
 * ═══════════════════════════════════════════════════════════════════
 */

// ─── الإعدادات المركزية ─────────────────────────────────────────
const CONFIG = {
  MASTER_SS_ID:     "18SyUPB3tlLxHR7h5m4s7T5ktTwTna4CbDrNsJ0Cwtnk",
  SHEET_EMPLOYEES:  "الموظفين",
  SHEET_LEAVES:     "الإجازات",
  SHEET_HOLIDAYS:   "العطلات",
  SHEET_LOG:        "السجل",
  TIMEZONE:         "GMT+2",
  CACHE_TTL:        360,
  MAX_RETRIES:      3,
  RETRY_DELAY_MS:   800,
  LOCK_TIMEOUT_MS:  25000,

  UNPAID_MIN_MONTHS: 2,
  UNPAID_MAX_MONTHS: 12,
  SICK_LIMIT_DAYS:   60,
  RECENT_LEAVES_MAX: 5,

  // أعمدة ورقة الموظفين (0-indexed)
  COL: {
    NAME:          0,   // A
    ID:            1,   // B
    ANNUAL_BAL:    3,   // D
    JOB_TITLE:     5,   // F
    DEPT:          6,   // G
    SECTION:       7,   // H
    EMERGENCY_BAL: 27,  // AB
    UNPAID_COUNT:  28,  // AC
    SICK_TOTAL:    29   // AD
  },

  // أعمدة ورقة الإجازات (0-indexed)
  LEAVES_COL: {
    NAME:         0,   // A — اسم الموظف
    ID:           1,   // B — الرقم الوظيفي
    TYPE:         2,   // C — نوع الإجازة
    START:        3,   // D — تاريخ البداية
    END:          4,   // E — تاريخ النهاية
    RETURN:       5,   // F — تاريخ المباشرة
    DAYS:         6,   // G — عدد الأيام
    NOTE:         7,   // H — ملاحظات / عنوان
    STATUS:       8,   // I — الحالة
    MSG:          9,   // J — رسالة إضافية
    LEAVE_PDF:    10,  // K — PDF الإجازة
    MEDICAL_PDF:  11,  // L — PDF التقرير الطبي
    ENTRY_PERSON: 12,  // M — مُدخل البيانات
    REMARKS:      13   // N — ملاحظات إضافية
  }
};

// ─── Singleton: Spreadsheet ─────────────────────────────────────
const _SS = (() => {
  let _instance = null;
  return {
    get: () => {
      if (!_instance) _instance = SpreadsheetApp.openById(CONFIG.MASTER_SS_ID);
      return _instance;
    },
    reset: () => { _instance = null; }
  };
})();

// ─── تعقيم المدخلات ─────────────────────────────────────────────
function sanitize(value, type = "string") {
  if (value === null || value === undefined) return type === "number" ? 0 : "";
  if (type === "number") return isNaN(Number(value)) ? 0 : Number(value);
  return String(value).trim().replace(/[<>"'`]/g, "");
}

// ─── Retry تلقائي ───────────────────────────────────────────────
function withRetry(fn, retries = CONFIG.MAX_RETRIES) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return fn();
    } catch (e) {
      if (attempt === retries) throw e;
      if (e.toString().includes("Sheets")) _SS.reset();
      Utilities.sleep(CONFIG.RETRY_DELAY_MS * attempt);
    }
  }
}

// ─── تسجيل الأخطاء ─────────────────────────────────────────────
function logError(context, error, extraData) {
  try {
    const ss = _SS.get();
    let logSheet = ss.getSheetByName(CONFIG.SHEET_LOG);
    if (!logSheet) {
      logSheet = ss.insertSheet(CONFIG.SHEET_LOG);
      logSheet.appendRow(["التاريخ", "السياق", "الخطأ", "بيانات إضافية"]);
    }
    logSheet.appendRow([
      new Date(),
      sanitize(context),
      sanitize(error.toString()),
      JSON.stringify(extraData || {})
    ]);
  } catch (_) {}
}

// ─── Cache: العطلات ─────────────────────────────────────────────
function _getHolidaysMap() {
  const cache  = CacheService.getScriptCache();
  const cached = cache.get("HOLIDAYS_MAP");
  if (cached) {
    try { return JSON.parse(cached); } catch (_) {}
  }

  return withRetry(() => {
    const ss    = _SS.get();
    const sheet = ss.getSheetByName(CONFIG.SHEET_HOLIDAYS);
    if (!sheet) return {};
    const lastRow = sheet.getLastRow();
    if (lastRow < 2) return {};

    const data = sheet.getRange(2, 1, lastRow - 1, 3).getValues();
    const map  = {};
    for (const row of data) {
      if (row[0] instanceof Date) {
        const key = Utilities.formatDate(row[0], CONFIG.TIMEZONE, "yyyy-MM-dd");
        map[key]  = sanitize(row[2]);
      }
    }
    try { cache.put("HOLIDAYS_MAP", JSON.stringify(map), CONFIG.CACHE_TTL); } catch (_) {}
    return map;
  });
}

function warmCache() { _getHolidaysMap(); }
function clearHolidaysCache() { CacheService.getScriptCache().remove("HOLIDAYS_MAP"); }

// ─── جلب بيانات الموظفين ────────────────────────────────────────
function _getAllEmployees() {
  return withRetry(() => {
    const ss      = _SS.get();
    const sheet   = ss.getSheetByName(CONFIG.SHEET_EMPLOYEES);
    const lastRow = sheet.getLastRow();
    if (lastRow < 2) return [];
    const values = sheet.getRange(2, 1, lastRow - 1, 30).getValues();
    return values.map((row, i) => ({ rowIndex: i + 2, data: row }));
  });
}

function _findEmployee(empId) {
  const id   = sanitize(empId);
  const rows = _getAllEmployees();
  return rows.find(r => sanitize(r.data[CONFIG.COL.ID]) === id) || null;
}

// ─── جلب آخر إجازة (مُطوَّر: يُرجع rowIndex) ─────────────────────
/**
 * @returns {{ rowIndex, type, start, end, days, location }|null}
 */
function _findLastLeaveRow(empId) {
  return withRetry(() => {
    const ss    = _SS.get();
    const sheet = ss.getSheetByName(CONFIG.SHEET_LEAVES);
    if (!sheet) return null;
    const lastRow = sheet.getLastRow();
    if (lastRow < 2) return null;

    const LC   = CONFIG.LEAVES_COL;
    const cols = Math.max(LC.REMARKS + 1, 14);
    const data = sheet.getRange(2, 1, lastRow - 1, cols).getValues();
    const id   = sanitize(empId);

    for (let i = data.length - 1; i >= 0; i--) {
      if (sanitize(data[i][LC.ID]) !== id) continue;
      const startRaw = data[i][LC.START];
      const endRaw   = data[i][LC.END];
      return {
        rowIndex: i + 2,
        type:     sanitize(data[i][LC.TYPE]),
        start:    startRaw instanceof Date
                    ? Utilities.formatDate(startRaw, CONFIG.TIMEZONE, "yyyy-MM-dd")
                    : sanitize(startRaw),
        end:      endRaw instanceof Date
                    ? Utilities.formatDate(endRaw,   CONFIG.TIMEZONE, "yyyy-MM-dd")
                    : sanitize(endRaw),
        days:     sanitize(data[i][LC.DAYS], "number"),
        location: sanitize(data[i][LC.NOTE]) || "غير محدد"
      };
    }
    return null;
  });
}

/** الواجهة تستخدمه عبر getEmployeeInfo لعرض إشعار التعديل */
function _getLastLeave(empId) {
  const row = _findLastLeaveRow(empId);
  if (!row) return null;
  return { type: row.type, start: row.start, end: row.end, location: row.location };
}

// ─── التحقق من صحة البيانات ─────────────────────────────────────
function validateLeaveData(data) {
  const errors = [];
  if (!sanitize(data.empId))    errors.push("الرقم الوظيفي مطلوب.");
  if (!sanitize(data.empName))  errors.push("اسم الموظف مطلوب.");
  if (!data.start || !data.end) errors.push("تواريخ الإجازة مطلوبة.");

  const validTypes = ["سنوية", "طارئة", "مرضية", "بدون مرتب"];
  if (!validTypes.includes(sanitize(data.leaveType))) {
    errors.push("نوع الإجازة غير صالح.");
  }
  if (data.start && data.end) {
    const s = new Date(data.start), e = new Date(data.end);
    if (isNaN(s) || isNaN(e)) errors.push("تنسيق التاريخ غير صحيح.");
    else if (e < s)           errors.push("تاريخ الانتهاء قبل تاريخ البداية.");
  }
  return errors;
}

// ─── حسابات مساعدة ──────────────────────────────────────────────
function getMonthsDiff(startDate, endDate) {
  const s = new Date(startDate), e = new Date(endDate);
  return (e.getFullYear() - s.getFullYear()) * 12 - s.getMonth() + e.getMonth();
}

function calculateReturnDate(endDate) {
  const d = new Date(endDate);
  d.setDate(d.getDate() + 1);
  return Utilities.formatDate(d, CONFIG.TIMEZONE, "yyyy-MM-dd");
}

// ─── حساب أيام الإجازة ──────────────────────────────────────────
/**
 * مُصحَّح: الغفارة يتم ضربها هنا مرة واحدة فقط.
 * saveLeaveRequest يستخدم الرقم كما يأتي من الواجهة (لا ضرب مكرر).
 */
function calculateLeaveDays(start, end, jobTitle, leaveType) {
  if (!start || !end) return 0;
  const s       = new Date(start);
  const e       = new Date(end);
  const totalDays = Math.ceil(Math.abs(e - s) / 86400000) + 1;

  // مرضية وبدون مرتب: المدة الكاملة شاملة العطل
  if (leaveType === "بدون مرتب" || leaveType === "مرضية") return totalDays;

  try {
    const holidaysMap = _getHolidaysMap();
    const isEghfara   = /غفارة|إغفارة/.test(String(jobTitle));

    s.setHours(0, 0, 0, 0);
    e.setHours(0, 0, 0, 0);
    let actualDays = 0;
    const cur = new Date(s);

    while (cur <= e) {
      const dateStr   = Utilities.formatDate(cur, CONFIG.TIMEZONE, "yyyy-MM-dd");
      const dayOfWeek = cur.getDay();
      if (holidaysMap[dateStr]) {
        if (holidaysMap[dateStr] === "تخصم") actualDays++;
      } else if (dayOfWeek === 5 || dayOfWeek === 6) {
        if (isEghfara) actualDays++;
      } else {
        actualDays++;
      }
      cur.setDate(cur.getDate() + 1);
    }

    // ضرب الغفارة مرة واحدة هنا فقط — لا يُعاد الضرب في saveLeaveRequest
    return (isEghfara && leaveType === "طارئة") ? actualDays * 3 : actualDays;

  } catch (err) {
    logError("calculateLeaveDays", err, { start, end, leaveType });
    return 0;
  }
}

// ═══════════════════════════════════════════════════════════════
//  الدوال العامة (Public API)
// ═══════════════════════════════════════════════════════════════

function doGet() {
  return HtmlService.createTemplateFromFile("Index").evaluate()
    .setTitle("نظام الإجازات - الجهاز التنفيذي")
    .addMetaTag("viewport", "width=device-width, initial-scale=1")
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/** مساعد لتضمين ملفات HTML جزئية */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

// ─── جلب بيانات الموظف ──────────────────────────────────────────
function getEmployeeInfo(empId) {
  try {
    const emp = _findEmployee(empId);
    if (!emp) return { found: false };

    const d = emp.data;
    const C = CONFIG.COL;

    return {
      found:         true,
      name:          sanitize(d[C.NAME]),
      id:            sanitize(d[C.ID]),
      balance:       sanitize(d[C.ANNUAL_BAL],    "number"),
      jobTitle:      sanitize(d[C.JOB_TITLE]),
      dept:          sanitize(d[C.DEPT]),
      section:       sanitize(d[C.SECTION]),
      emergencyBal:  sanitize(d[C.EMERGENCY_BAL], "number"),
      unpaidCount:   sanitize(d[C.UNPAID_COUNT],  "number"),
      sickTotal:     sanitize(d[C.SICK_TOTAL],    "number"),
      existingLeave: _getLastLeave(empId)
    };
  } catch (e) {
    logError("getEmployeeInfo", e, { empId });
    return { found: false, error: "فشل جلب البيانات: " + e.toString() };
  }
}

// ─── آخر الإجازات للموظف (للواجهة) ──────────────────────────────
/**
 * تُعيد آخر CONFIG.RECENT_LEAVES_MAX إجازات للموظف.
 * @returns {Array<{start, end, type, days, location}>}
 */
function getRecentLeaves(empId) {
  try {
    return withRetry(() => {
      const ss    = _SS.get();
      const sheet = ss.getSheetByName(CONFIG.SHEET_LEAVES);
      if (!sheet) return [];
      const lastRow = sheet.getLastRow();
      if (lastRow < 2) return [];

      const LC   = CONFIG.LEAVES_COL;
      const cols = LC.REMARKS + 1;
      const data = sheet.getRange(2, 1, lastRow - 1, cols).getValues();
      const id   = sanitize(empId);
      const results = [];

      for (let i = data.length - 1; i >= 0 && results.length < CONFIG.RECENT_LEAVES_MAX; i--) {
        if (sanitize(data[i][LC.ID]) !== id) continue;
        const startRaw = data[i][LC.START];
        const endRaw   = data[i][LC.END];
        results.push({
          start:    startRaw instanceof Date
                      ? Utilities.formatDate(startRaw, CONFIG.TIMEZONE, "yyyy-MM-dd")
                      : sanitize(startRaw),
          end:      endRaw instanceof Date
                      ? Utilities.formatDate(endRaw,   CONFIG.TIMEZONE, "yyyy-MM-dd")
                      : sanitize(endRaw),
          type:     sanitize(data[i][LC.TYPE]),
          days:     sanitize(data[i][LC.DAYS], "number"),
          location: sanitize(data[i][LC.NOTE]) || "داخل ليبيا"
        });
      }
      return results;
    });
  } catch (e) {
    logError("getRecentLeaves", e, { empId });
    return [];
  }
}

// ─── استعادة الرصيد القديم عند التعديل ──────────────────────────
/**
 * تعيد الرصيد الذي خُصم في الإجازة السابقة.
 * تُعدِّل empRow in-place وتُطبِّق على الشيت مباشرة.
 */
function _restoreOldBalance(sheetEmp, empRowIndex, empRow, oldLeave) {
  const C = CONFIG.COL;
  const t = oldLeave.type;
  const d = sanitize(oldLeave.days, "number");

  const updates = [];

  if (t === "سنوية") {
    const newBal = sanitize(empRow[C.ANNUAL_BAL], "number") + d;
    empRow[C.ANNUAL_BAL] = newBal;
    updates.push([C.ANNUAL_BAL + 1, newBal]);

  } else if (t === "طارئة") {
    const newBal = sanitize(empRow[C.EMERGENCY_BAL], "number") + d;
    empRow[C.EMERGENCY_BAL] = newBal;
    updates.push([C.EMERGENCY_BAL + 1, newBal]);

  } else if (t === "مرضية") {
    const newSick = Math.max(0, sanitize(empRow[C.SICK_TOTAL], "number") - d);
    empRow[C.SICK_TOTAL] = newSick;
    updates.push([C.SICK_TOTAL + 1, newSick]);

  } else if (t === "بدون مرتب") {
    const newCount = Math.max(0, sanitize(empRow[C.UNPAID_COUNT], "number") - 1);
    empRow[C.UNPAID_COUNT] = newCount;
    updates.push([C.UNPAID_COUNT + 1, newCount]);
  }

  for (const [col, val] of updates) {
    sheetEmp.getRange(empRowIndex, col).setValue(val);
  }
}

// ─── حفظ / تعديل طلب الإجازة ────────────────────────────────────
/**
 * التحسينات:
 *  - إصلاح bug الغفارة: daysToProcess لا يُضرب مجدداً (الواجهة أرسلت القيمة الصحيحة)
 *  - isEdit: يستعيد الرصيد القديم ويُحدِّث الصف الموجود بدلاً من إضافة صف جديد
 *  - يحفظ entryPerson في العمود 13
 *  - يحفظ reportPdfUrl في العمود 12
 */
function saveLeaveRequest(data) {
  const validationErrors = validateLeaveData(data);
  if (validationErrors.length > 0) {
    return { status: "error", msg: validationErrors.join(" | ") };
  }

  const lock = LockService.getScriptLock();
  try {
    if (!lock.tryLock(CONFIG.LOCK_TIMEOUT_MS)) {
      return { status: "error", msg: "النظام مشغول، حاول بعد لحظات." };
    }

    return withRetry(() => {
      const ss       = _SS.get();
      const sheetEmp = ss.getSheetByName(CONFIG.SHEET_EMPLOYEES);
      const sheetLev = ss.getSheetByName(CONFIG.SHEET_LEAVES);

      if (!sheetEmp) throw new Error("ورقة الموظفين غير موجودة — تحقق من الاسم: \"" + CONFIG.SHEET_EMPLOYEES + "\"");
      if (!sheetLev) throw new Error("ورقة الإجازات غير موجودة — تحقق من الاسم: \"" + CONFIG.SHEET_LEAVES + "\"");

      const emp = _findEmployee(data.empId);
      if (!emp) throw new Error("الموظف غير مسجل في المنظومة.");

      const { rowIndex, data: empRow } = emp;
      const C           = CONFIG.COL;
      const LC          = CONFIG.LEAVES_COL;
      const leaveType   = sanitize(data.leaveType || "سنوية");
      const jobTitle    = sanitize(empRow[C.JOB_TITLE]);
      const isEghfara   = /غفارة|إغفارة/.test(jobTitle);
      const isEdit      = data.isEdit === true;

      // ─── القيمة من الواجهة تحمل ×3 للغفارة مسبقاً ───
      // لا ضرب إضافي هنا (bug fix)
      let daysToProcess  = sanitize(data.days, "number");
      let statusMsg      = isEdit ? "تم التعديل بنجاح" : "تم الاعتماد";
      let note           = sanitize(data.location || "داخل ليبيا");
      const reportPdfUrl = sanitize(data.reportPdfUrl  || "");
      const entryPerson  = sanitize(data.entryPerson   || "—");
      const remarks      = sanitize(data.remarks       || "");
      const returnDt     = calculateReturnDate(data.end);

      // ─── وضع التعديل: استعادة الرصيد القديم أولاً ───
      let leaveRowIndex = null;
      if (isEdit) {
        const oldLeave = _findLastLeaveRow(data.empId);
        if (oldLeave) {
          leaveRowIndex = oldLeave.rowIndex;
          _restoreOldBalance(sheetEmp, rowIndex, empRow, oldLeave);
        }
      }

      // ─── تطبيق الخصم الجديد ─────────────────────────
      if (leaveType === "مرضية") {
        const currentTotal = sanitize(empRow[C.SICK_TOTAL], "number");
        const newTotal     = currentTotal + daysToProcess;
        sheetEmp.getRange(rowIndex, C.SICK_TOTAL + 1).setValue(newTotal);
        if (newTotal > CONFIG.SICK_LIMIT_DAYS) {
          statusMsg = `تنبيه: تجاوز السقف المسموح (${CONFIG.SICK_LIMIT_DAYS} يوم)`;
        }
        note = `إجمالي المرضي: ${newTotal}`;

      } else if (leaveType === "بدون مرتب") {
        const months = getMonthsDiff(data.start, data.end);
        if (months < CONFIG.UNPAID_MIN_MONTHS) {
          throw new Error(`الإجازة بدون مرتب لا تقل عن ${CONFIG.UNPAID_MIN_MONTHS} شهرين.`);
        }
        if (months > CONFIG.UNPAID_MAX_MONTHS) {
          throw new Error(`الإجازة بدون مرتب لا تتجاوز ${CONFIG.UNPAID_MAX_MONTHS} شهراً.`);
        }
        // لا نزيد العداد عند التعديل (الإجازة موجودة مسبقاً)
        if (!isEdit) {
          const unpaidCount = sanitize(empRow[C.UNPAID_COUNT], "number");
          sheetEmp.getRange(rowIndex, C.UNPAID_COUNT + 1).setValue(unpaidCount + 1);
        }
        note = "إجازة بدون مرتب مسجلة";

      } else {
        // ─── سنوية / طارئة ───────────────────────────
        const isEmergency  = leaveType === "طارئة";
        const balCol       = isEmergency ? C.EMERGENCY_BAL : C.ANNUAL_BAL;
        const currentBal   = sanitize(empRow[balCol], "number");

        if (daysToProcess > currentBal) {
          throw new Error(
            `الرصيد غير كافٍ — المتاح: ${currentBal} يوم، المطلوب: ${daysToProcess} يوم.`
          );
        }
        sheetEmp.getRange(rowIndex, balCol + 1).setValue(currentBal - daysToProcess);
      }

      // ─── بناء الصف (14 عمود) ────────────────────────
      const rowData = [
        sanitize(data.empName),  // A: اسم الموظف
        sanitize(data.empId),    // B: الرقم الوظيفي
        leaveType,               // C: نوع الإجازة
        data.start,              // D: البداية
        data.end,                // E: النهاية
        returnDt,                // F: المباشرة
        daysToProcess,           // G: الأيام
        note,                    // H: ملاحظات
        statusMsg,               // I: الحالة
        "",                      // J: رسالة المباشرة
        "",                      // K: PDF الإجازة
        reportPdfUrl,            // L: PDF التقرير الطبي
        entryPerson,             // M: مُدخل البيانات
        remarks                  // N: ملاحظات إضافية
      ];

      if (isEdit && leaveRowIndex) {
        // تحديث الصف الموجود في مكانه
        sheetLev.getRange(leaveRowIndex, 1, 1, rowData.length).setValues([rowData]);
      } else {
        sheetLev.appendRow(rowData);
      }

      SpreadsheetApp.flush();
      return { status: "success", returnDate: returnDt, statusMsg };
    });

  } catch (e) {
    logError("saveLeaveRequest", e, { empId: data.empId, leaveType: data.leaveType });
    return { status: "error", msg: e.toString() };
  } finally {
    if (lock.hasLock()) lock.releaseLock();
  }
}

// ─── إحصائيات الموظف ────────────────────────────────────────────
function getEmployeeStats(empId) {
  try {
    const emp = _findEmployee(empId);
    if (!emp) return null;
    const d = emp.data;
    const C = CONFIG.COL;
    return {
      annual:    sanitize(d[C.ANNUAL_BAL],    "number"),
      emergency: sanitize(d[C.EMERGENCY_BAL], "number"),
      sick:      sanitize(d[C.SICK_TOTAL],    "number"),
      unpaid:    sanitize(d[C.UNPAID_COUNT],  "number")
    };
  } catch (e) {
    logError("getEmployeeStats", e, { empId });
    return null;
  }
}

// ─── إنشاء Trigger لتسخين الكاش ─────────────────────────────────
/**
 * شغِّل هذه الدالة مرة واحدة من المحرر لإنشاء Trigger كل 5 دقائق.
 * لا تُستدعى تلقائياً.
 */
function createWarmCacheTrigger() {
  // حذف Triggers القديمة لتجنب التكرار
  ScriptApp.getProjectTriggers()
    .filter(t => t.getHandlerFunction() === "warmCache")
    .forEach(t => ScriptApp.deleteTrigger(t));

  ScriptApp.newTrigger("warmCache")
    .timeBased()
    .everyMinutes(5)
    .create();

  Logger.log("✅ تم إنشاء Trigger warmCache (كل 5 دقائق)");
}
