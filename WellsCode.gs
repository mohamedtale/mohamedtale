/**
 * ═══════════════════════════════════════════════════════════════
 *  منظومة متابعة الآبار 2026 — الكود الخلفي
 *  الجهاز التنفيذي لحفر وصيانة آبار المياه
 * ═══════════════════════════════════════════════════════════════
 *
 *  بنية Google Sheets المطلوبة:
 *  ─────────────────────────────
 *  ورقة "الآبار":
 *    A: رقم البئر | B: المدينة | C: المنطقة | D: خط العرض
 *    E: خط الطول | F: نوع العمل | G: العمق الحالي
 *    H: العمق المستهدف | I: الإنتاجية (م³/يوم) | J: الشركة
 *    K: نوع المضخة | L: نسبة الإنجاز | M: الحالة التشغيلية
 *    N: تاريخ البدء | O: تاريخ الانتهاء | P: ملاحظات
 *    Q: آخر تحديث | R: المحدِّث
 *
 *  ورقة "المستخدمين":
 *    A: اسم المستخدم | B: كلمة المرور | C: الصلاحية
 *    D: الاسم الكامل | E: تاريخ الإنشاء
 *
 *  ورقة "السجل":
 *    A: التاريخ والوقت | B: المستخدم | C: العملية
 *    D: رقم البئر | E: التفاصيل
 * ═══════════════════════════════════════════════════════════════
 */

// ─── الإعدادات المركزية ─────────────────────────────────────
const WELLS_CONFIG = {
  SS_ID:           "1Qsv0BVZ4-kagqcf9FAFxFhlE1tSsrcXB6WJyVrZSL4g",
  SHEET_WELLS:     "الآبار",
  SHEET_USERS:     "المستخدمين",
  SHEET_LOG:       "السجل",
  TIMEZONE:        "GMT+2",

  // أعمدة ورقة الآبار (0-indexed)
  W: {
    WELL_ID:       0,  // A
    CITY:          1,  // B
    REGION:        2,  // C
    LAT:           3,  // D
    LNG:           4,  // E
    WORK_TYPE:     5,  // F
    CURR_DEPTH:    6,  // G
    TGT_DEPTH:     7,  // H
    PRODUCTIVITY:  8,  // I
    CONTRACTOR:    9,  // J
    PUMP_TYPE:     10, // K
    COMPLETION:    11, // L
    STATUS:        12, // M
    START_DATE:    13, // N
    END_DATE:      14, // O
    NOTES:         15, // P
    LAST_UPDATE:   16, // Q
    UPDATED_BY:    17  // R
  },

  // أعمدة ورقة المستخدمين (0-indexed)
  U: {
    USERNAME:      0,  // A
    PASSWORD:      1,  // B
    ROLE:          2,  // C
    FULL_NAME:     3,  // D
    CREATED_AT:    4   // E
  }
};

// ─── Singleton للـ Spreadsheet ──────────────────────────────
const _WSS = (() => {
  let inst = null;
  return {
    get: () => {
      if (!inst) inst = SpreadsheetApp.openById(WELLS_CONFIG.SS_ID);
      return inst;
    },
    reset: () => { inst = null; }
  };
})();

// ─── مساعدات عامة ───────────────────────────────────────────
function wSanitize(val, type) {
  if (val === null || val === undefined) return type === 'number' ? 0 : '';
  if (type === 'number') return isNaN(Number(val)) ? 0 : Number(val);
  return String(val).trim().replace(/[<>"'`]/g, '');
}

function wFormatDate(d) {
  if (!d) return '';
  if (d instanceof Date) return Utilities.formatDate(d, WELLS_CONFIG.TIMEZONE, 'yyyy-MM-dd');
  return String(d);
}

function wNow() {
  return Utilities.formatDate(new Date(), WELLS_CONFIG.TIMEZONE, 'yyyy-MM-dd HH:mm');
}

function wLogActivity(user, operation, wellId, details) {
  try {
    const ss    = _WSS.get();
    let log     = ss.getSheetByName(WELLS_CONFIG.SHEET_LOG);
    if (!log) {
      log = ss.insertSheet(WELLS_CONFIG.SHEET_LOG);
      log.appendRow(['التاريخ والوقت','المستخدم','العملية','رقم البئر','التفاصيل']);
    }
    log.appendRow([wNow(), wSanitize(user), wSanitize(operation), wSanitize(wellId), wSanitize(details)]);
  } catch (_) {}
}

// ─── تشغيل التطبيق ──────────────────────────────────────────
function doGet() {
  return HtmlService.createTemplateFromFile('Wells')
    .evaluate()
    .setTitle('منظومة متابعة الآبار 2026')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// ─── تسجيل الدخول ───────────────────────────────────────────
/**
 * @param {string} username
 * @param {string} password
 * @returns {{ ok:boolean, role?:string, name?:string, error?:string }}
 */
function login(username, password) {
  try {
    const ss    = _WSS.get();
    const sheet = ss.getSheetByName(WELLS_CONFIG.SHEET_USERS);
    if (!sheet) {
      // إنشاء أول مستخدم admin تلقائياً إذا لم توجد الورقة
      const newSheet = ss.insertSheet(WELLS_CONFIG.SHEET_USERS);
      newSheet.appendRow(['اسم المستخدم','كلمة المرور','الصلاحية','الاسم الكامل','تاريخ الإنشاء']);
      newSheet.appendRow(['admin','admin123','مدير','المدير العام', wNow()]);
      if (username === 'admin' && password === 'admin123') {
        return { ok: true, role: 'مدير', name: 'المدير العام' };
      }
      return { ok: false, error: 'بيانات غير صحيحة' };
    }

    const lastRow = sheet.getLastRow();
    if (lastRow < 2) return { ok: false, error: 'لا يوجد مستخدمون مسجلون' };

    const U    = WELLS_CONFIG.U;
    const rows = sheet.getRange(2, 1, lastRow - 1, 5).getValues();
    const user = rows.find(r =>
      wSanitize(r[U.USERNAME]) === wSanitize(username) &&
      String(r[U.PASSWORD])    === String(password)
    );

    if (!user) return { ok: false, error: 'اسم المستخدم أو كلمة المرور غير صحيحة' };

    wLogActivity(username, 'تسجيل دخول', '—', 'دخول ناجح');
    return {
      ok:   true,
      role: wSanitize(user[U.ROLE]),
      name: wSanitize(user[U.FULL_NAME]) || wSanitize(user[U.USERNAME])
    };
  } catch (e) {
    return { ok: false, error: 'خطأ في الخادم: ' + e.toString() };
  }
}

// ─── جلب كل الآبار ──────────────────────────────────────────
/**
 * @returns {Array<Object>} مصفوفة كائنات البيانات
 */
function getWells() {
  try {
    const ss    = _WSS.get();
    const sheet = ss.getSheetByName(WELLS_CONFIG.SHEET_WELLS);
    if (!sheet) return [];

    const lastRow = sheet.getLastRow();
    if (lastRow < 2) return [];

    const W    = WELLS_CONFIG.W;
    const data = sheet.getRange(2, 1, lastRow - 1, 18).getValues();

    return data
      .filter(r => wSanitize(r[W.WELL_ID]))   // تجاهل الصفوف الفارغة
      .map(r => ({
        wellId:       wSanitize(r[W.WELL_ID]),
        city:         wSanitize(r[W.CITY]),
        region:       wSanitize(r[W.REGION]),
        lat:          wSanitize(r[W.LAT]),
        lng:          wSanitize(r[W.LNG]),
        workType:     wSanitize(r[W.WORK_TYPE]),
        currentDepth: wSanitize(r[W.CURR_DEPTH],  'number'),
        targetDepth:  wSanitize(r[W.TGT_DEPTH],   'number'),
        productivity: wSanitize(r[W.PRODUCTIVITY], 'number'),
        contractor:   wSanitize(r[W.CONTRACTOR]),
        pumpType:     wSanitize(r[W.PUMP_TYPE]),
        completion:   wSanitize(r[W.COMPLETION],   'number'),
        status:       wSanitize(r[W.STATUS]),
        startDate:    wFormatDate(r[W.START_DATE]),
        endDate:      wFormatDate(r[W.END_DATE]),
        notes:        wSanitize(r[W.NOTES]),
        lastUpdate:   wSanitize(r[W.LAST_UPDATE]),
        updatedBy:    wSanitize(r[W.UPDATED_BY])
      }));
  } catch (e) {
    Logger.log('getWells error: ' + e);
    return [];
  }
}

// ─── حفظ أو تعديل بئر ───────────────────────────────────────
/**
 * @param {Object} data  بيانات البئر من الواجهة
 * @returns {{ ok:boolean, error?:string }}
 */
function saveWell(data) {
  const lock = LockService.getScriptLock();
  try {
    if (!lock.tryLock(20000)) return { ok: false, error: 'النظام مشغول، حاول مجدداً' };

    const ss    = _WSS.get();
    let sheet   = ss.getSheetByName(WELLS_CONFIG.SHEET_WELLS);

    // إنشاء الورقة تلقائياً إذا لم توجد مع إضافة الترويسة
    if (!sheet) {
      sheet = ss.insertSheet(WELLS_CONFIG.SHEET_WELLS);
      sheet.appendRow([
        'رقم البئر','المدينة','المنطقة','خط العرض','خط الطول',
        'نوع العمل','العمق الحالي (م)','العمق المستهدف (م)',
        'الإنتاجية (م³/يوم)','الشركة المنفذة','نوع المضخة',
        'نسبة الإنجاز (%)','الحالة التشغيلية',
        'تاريخ البدء','تاريخ الانتهاء','ملاحظات',
        'آخر تحديث','المحدِّث'
      ]);
    }

    const W       = WELLS_CONFIG.W;
    const wellId  = wSanitize(data.wellId);
    const isEdit  = data.isEdit === true || data.isEdit === 'true';
    const origId  = wSanitize(data.originalId || wellId);
    const now     = wNow();

    const rowData = [
      wellId,
      wSanitize(data.city),
      wSanitize(data.region),
      wSanitize(data.lat),
      wSanitize(data.lng),
      wSanitize(data.workType),
      wSanitize(data.currentDepth, 'number'),
      wSanitize(data.targetDepth,  'number'),
      wSanitize(data.productivity, 'number'),
      wSanitize(data.contractor),
      wSanitize(data.pumpType),
      wSanitize(data.completion,   'number'),
      wSanitize(data.status),
      wSanitize(data.startDate),
      wSanitize(data.endDate),
      wSanitize(data.notes),
      now,
      wSanitize(data.updatedBy || '—')
    ];

    if (isEdit) {
      const lastRow = sheet.getLastRow();
      if (lastRow < 2) return { ok: false, error: 'لا توجد بيانات للتعديل' };
      const values  = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
      const rowIdx  = values.findIndex(r => wSanitize(r[0]) === origId);
      if (rowIdx === -1) return { ok: false, error: 'رقم البئر غير موجود: ' + origId };
      sheet.getRange(rowIdx + 2, 1, 1, rowData.length).setValues([rowData]);
      wLogActivity(data.updatedBy || '—', 'تعديل بئر', wellId, 'تحديث البيانات');
    } else {
      // التحقق من عدم تكرار رقم البئر
      const lastRow = sheet.getLastRow();
      if (lastRow >= 2) {
        const existing = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
        if (existing.some(r => wSanitize(r[0]) === wellId)) {
          return { ok: false, error: 'رقم البئر موجود مسبقاً: ' + wellId };
        }
      }
      sheet.appendRow(rowData);
      wLogActivity(data.updatedBy || '—', 'إضافة بئر', wellId, 'بئر جديد');
    }

    SpreadsheetApp.flush();
    return { ok: true };

  } catch (e) {
    Logger.log('saveWell error: ' + e);
    return { ok: false, error: e.toString() };
  } finally {
    if (lock.hasLock()) lock.releaseLock();
  }
}

// ─── حذف بئر ────────────────────────────────────────────────
/**
 * @param {string} wellId  رقم البئر
 * @returns {{ ok:boolean, error?:string }}
 */
function deleteWell(wellId) {
  const lock = LockService.getScriptLock();
  try {
    if (!lock.tryLock(15000)) return { ok: false, error: 'النظام مشغول' };

    const ss    = _WSS.get();
    const sheet = ss.getSheetByName(WELLS_CONFIG.SHEET_WELLS);
    if (!sheet) return { ok: false, error: 'ورقة الآبار غير موجودة' };

    const lastRow = sheet.getLastRow();
    if (lastRow < 2) return { ok: false, error: 'لا توجد بيانات' };

    const id      = wSanitize(wellId);
    const values  = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
    const rowIdx  = values.findIndex(r => wSanitize(r[0]) === id);
    if (rowIdx === -1) return { ok: false, error: 'رقم البئر غير موجود' };

    sheet.deleteRow(rowIdx + 2);
    SpreadsheetApp.flush();
    wLogActivity('—', 'حذف بئر', wellId, 'تم الحذف');
    return { ok: true };

  } catch (e) {
    return { ok: false, error: e.toString() };
  } finally {
    if (lock.hasLock()) lock.releaseLock();
  }
}

// ─── إدارة المستخدمين ────────────────────────────────────────
/**
 * جلب كل المستخدمين (للمدير فقط)
 * @returns {Array<{username, role, fullName}>}
 */
function getUsers() {
  try {
    const ss    = _WSS.get();
    const sheet = ss.getSheetByName(WELLS_CONFIG.SHEET_USERS);
    if (!sheet) return [];
    const lastRow = sheet.getLastRow();
    if (lastRow < 2) return [];
    const U    = WELLS_CONFIG.U;
    const data = sheet.getRange(2, 1, lastRow - 1, 5).getValues();
    return data
      .filter(r => wSanitize(r[U.USERNAME]))
      .map(r => ({
        username: wSanitize(r[U.USERNAME]),
        role:     wSanitize(r[U.ROLE]),
        fullName: wSanitize(r[U.FULL_NAME])
      }));
  } catch (e) {
    return [];
  }
}

/**
 * حفظ أو تعديل مستخدم
 * @param {Object} data
 * @returns {{ ok:boolean, error?:string }}
 */
function saveUser(data) {
  const lock = LockService.getScriptLock();
  try {
    if (!lock.tryLock(15000)) return { ok: false, error: 'النظام مشغول' };

    const ss    = _WSS.get();
    let sheet   = ss.getSheetByName(WELLS_CONFIG.SHEET_USERS);
    if (!sheet) {
      sheet = ss.insertSheet(WELLS_CONFIG.SHEET_USERS);
      sheet.appendRow(['اسم المستخدم','كلمة المرور','الصلاحية','الاسم الكامل','تاريخ الإنشاء']);
    }

    const U        = WELLS_CONFIG.U;
    const username = wSanitize(data.username);
    const isEdit   = data.isEdit === true || data.isEdit === 'true';
    const origUser = wSanitize(data.originalUsername || username);

    const rowData = [
      username,
      String(data.password || ''),
      wSanitize(data.role),
      wSanitize(data.fullName),
      isEdit ? '' : wNow()
    ];

    if (isEdit) {
      const lastRow = sheet.getLastRow();
      if (lastRow < 2) return { ok: false, error: 'المستخدم غير موجود' };
      const values  = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
      const rowIdx  = values.findIndex(r => wSanitize(r[0]) === origUser);
      if (rowIdx === -1) return { ok: false, error: 'المستخدم غير موجود' };
      // لا نغيّر تاريخ الإنشاء عند التعديل
      const existing = sheet.getRange(rowIdx + 2, 1, 1, 5).getValues()[0];
      rowData[U.CREATED_AT] = existing[U.CREATED_AT];
      sheet.getRange(rowIdx + 2, 1, 1, 5).setValues([rowData]);
    } else {
      // التحقق من عدم تكرار اسم المستخدم
      const lastRow = sheet.getLastRow();
      if (lastRow >= 2) {
        const existing = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
        if (existing.some(r => wSanitize(r[0]) === username)) {
          return { ok: false, error: 'اسم المستخدم موجود مسبقاً' };
        }
      }
      sheet.appendRow(rowData);
    }

    SpreadsheetApp.flush();
    return { ok: true };

  } catch (e) {
    return { ok: false, error: e.toString() };
  } finally {
    if (lock.hasLock()) lock.releaseLock();
  }
}

/**
 * حذف مستخدم
 * @param {string} username
 * @returns {{ ok:boolean, error?:string }}
 */
function deleteUser(username) {
  const lock = LockService.getScriptLock();
  try {
    if (!lock.tryLock(15000)) return { ok: false, error: 'النظام مشغول' };

    const ss    = _WSS.get();
    const sheet = ss.getSheetByName(WELLS_CONFIG.SHEET_USERS);
    if (!sheet) return { ok: false, error: 'ورقة المستخدمين غير موجودة' };

    const lastRow = sheet.getLastRow();
    if (lastRow < 2) return { ok: false, error: 'لا يوجد مستخدمون' };

    const id     = wSanitize(username);
    const values = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
    const rowIdx = values.findIndex(r => wSanitize(r[0]) === id);
    if (rowIdx === -1) return { ok: false, error: 'المستخدم غير موجود' };

    sheet.deleteRow(rowIdx + 2);
    SpreadsheetApp.flush();
    return { ok: true };

  } catch (e) {
    return { ok: false, error: e.toString() };
  } finally {
    if (lock.hasLock()) lock.releaseLock();
  }
}

// ─── إنشاء هيكل الشيت من الصفر ─────────────────────────────
/**
 * شغّل هذه الدالة مرة واحدة من المحرر لإنشاء الأوراق وإضافة بيانات تجريبية.
 */
function setupSpreadsheet() {
  const ss = _WSS.get();

  // ── ورقة الآبار ──
  let wellsSheet = ss.getSheetByName(WELLS_CONFIG.SHEET_WELLS);
  if (!wellsSheet) wellsSheet = ss.insertSheet(WELLS_CONFIG.SHEET_WELLS);
  wellsSheet.clearContents();
  wellsSheet.appendRow([
    'رقم البئر','المدينة','المنطقة','خط العرض','خط الطول',
    'نوع العمل','العمق الحالي (م)','العمق المستهدف (م)',
    'الإنتاجية (م³/يوم)','الشركة المنفذة','نوع المضخة',
    'نسبة الإنجاز (%)','الحالة التشغيلية',
    'تاريخ البدء','تاريخ الانتهاء','ملاحظات',
    'آخر تحديث','المحدِّث'
  ]);
  // بيانات تجريبية
  const samples = [
    ['W-LY-001','طرابلس','منطقة سوق الجمعة','32.8872','13.1913','حفر جديد',180,250,500,'شركة الأمل','طاردة مياه 15HP',75,'قيد التنفيذ','2025-01-10','2026-03-01','الحفر جارٍ بصورة منتظمة',wNow(),'المهندس علي'],
    ['W-LY-002','بنغازي','سبخة الدولة','32.1150','20.0695','صيانة بئر قائم',320,320,800,'شركة الخليج','طاردة 25HP',100,'جاهز','2024-06-01','2024-12-01','تمت الصيانة وجاهز للضخ',wNow(),'المهندس محمد'],
    ['W-LY-003','سبها','الجنوب الغربي','27.0377','14.4290','حفر جديد',0,350,600,'شركة الجنوب','—',0,'متوقف','2025-03-01','','توقف بسبب نقص الوقود',wNow(),'المهندس عمر'],
    ['W-LY-004','الجفرة','هون','29.1167','15.9500','حفر جديد',200,300,450,'شركة الوسط','طاردة 20HP',65,'قيد التنفيذ','2025-02-15','2026-02-15','',wNow(),'المهندس خالد'],
    ['W-LY-005','مصراتة','القصبات','32.3754','15.0925','صيانة بئر قائم',0,0,0,'—','—',0,'خارج الخدمة','','','البئر جاف — يحتاج إعادة تقييم',wNow(),'المهندس سالم'],
  ];
  samples.forEach(r => wellsSheet.appendRow(r));

  // ── ورقة المستخدمين ──
  let usersSheet = ss.getSheetByName(WELLS_CONFIG.SHEET_USERS);
  if (!usersSheet) usersSheet = ss.insertSheet(WELLS_CONFIG.SHEET_USERS);
  usersSheet.clearContents();
  usersSheet.appendRow(['اسم المستخدم','كلمة المرور','الصلاحية','الاسم الكامل','تاريخ الإنشاء']);
  usersSheet.appendRow(['admin',     'admin123',  'مدير',    'المدير العام',           wNow()]);
  usersSheet.appendRow(['engineer1', 'eng2026',   'مهندس',   'المهندس أحمد المنتصر', wNow()]);
  usersSheet.appendRow(['viewer1',   'view2026',  'مشاهد',   'المراقب الميداني',       wNow()]);

  // ── ورقة السجل ──
  let logSheet = ss.getSheetByName(WELLS_CONFIG.SHEET_LOG);
  if (!logSheet) logSheet = ss.insertSheet(WELLS_CONFIG.SHEET_LOG);
  logSheet.clearContents();
  logSheet.appendRow(['التاريخ والوقت','المستخدم','العملية','رقم البئر','التفاصيل']);

  Logger.log('✅ تم إنشاء هيكل الـ Spreadsheet بنجاح مع بيانات تجريبية');
  Logger.log('🔐 بيانات الدخول التجريبية:');
  Logger.log('   admin / admin123 → مدير');
  Logger.log('   engineer1 / eng2026 → مهندس');
  Logger.log('   viewer1 / view2026 → مشاهد');
}
