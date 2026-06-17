/**
 * ═══════════════════════════════════════════════════════════════
 *  منظومة متابعة الآبار 2026 — الكود الخلفي
 *  الجهاز التنفيذي لحفر وصيانة آبار المياه
 * ═══════════════════════════════════════════════════════════════
 *
 *  بنية ورقة "الآبار" (13 عمود):
 *    A: رقم البئر العام
 *    B: المنطقة / المدينة
 *    C: خط العرض (Latitude)
 *    D: خط الطول (Longitude)
 *    E: نوع العمل المستهدف
 *    F: العمق الحالي (متر)
 *    G: العمق المستهدف (متر)
 *    H: الإنتاجية المستهدفة (م³/يوم)
 *    I: الشركة المنفذة / المقاول
 *    J: نوع وقوة المضخة
 *    K: نسبة الإنجاز (%)
 *    L: الحالة التشغيلية
 *    M: لون الأيقونة المستهدف
 *
 *  بنية ورقة "المستخدمين":
 *    A: اسم المستخدم | B: كلمة المرور | C: الصلاحية | D: الاسم الكامل
 * ═══════════════════════════════════════════════════════════════
 */

// ─── الإعدادات ───────────────────────────────────────────────
const WELLS_CONFIG = {
  SS_ID:        "1Qsv0BVZ4-kagqcf9FAFxFhlE1tSsrcXB6WJyVrZSL4g",
  SHEET_WELLS:  "الآبار",
  SHEET_USERS:  "المستخدمين",
  SHEET_LOG:    "السجل",
  TIMEZONE:     "GMT+2",

  // أعمدة ورقة الآبار (0-indexed) — تطابق الشيت الفعلي
  W: {
    WELL_ID:      0,   // A: رقم البئر العام
    CITY_REGION:  1,   // B: المنطقة / المدينة
    LAT:          2,   // C: خط العرض
    LNG:          3,   // D: خط الطول
    WORK_TYPE:    4,   // E: نوع العمل المستهدف
    CURR_DEPTH:   5,   // F: العمق الحالي
    TGT_DEPTH:    6,   // G: العمق المستهدف
    PRODUCTIVITY: 7,   // H: الإنتاجية المستهدفة
    CONTRACTOR:   8,   // I: الشركة المنفذة
    PUMP_TYPE:    9,   // J: نوع وقوة المضخة
    COMPLETION:   10,  // K: نسبة الإنجاز
    STATUS:       11,  // L: الحالة التشغيلية
    ICON_COLOR:   12   // M: لون الأيقونة المستهدف
  },

  // أعمدة ورقة المستخدمين
  U: {
    USERNAME:  0,  // A
    PASSWORD:  1,  // B
    ROLE:      2,  // C
    FULL_NAME: 3   // D
  }
};

// ─── Singleton ───────────────────────────────────────────────
const _WSS = (() => {
  let inst = null;
  return {
    get: () => { if (!inst) inst = SpreadsheetApp.openById(WELLS_CONFIG.SS_ID); return inst; },
    reset: () => { inst = null; }
  };
})();

// ─── مساعدات ─────────────────────────────────────────────────
function wNum(v)  { const n = Number(v); return isNaN(n) ? 0 : n; }
function wStr(v)  { return v === null || v === undefined ? '' : String(v).trim(); }
function wCoord(v){ const n = parseFloat(v); return isNaN(n) ? '' : n; }
function wNow()   { return Utilities.formatDate(new Date(), WELLS_CONFIG.TIMEZONE, 'yyyy-MM-dd HH:mm'); }
function wDate(d) { if (!d) return ''; if (d instanceof Date) return Utilities.formatDate(d, WELLS_CONFIG.TIMEZONE, 'yyyy-MM-dd'); return String(d); }

function wLog(user, op, id, detail) {
  try {
    const ss = _WSS.get();
    let s = ss.getSheetByName(WELLS_CONFIG.SHEET_LOG);
    if (!s) { s = ss.insertSheet(WELLS_CONFIG.SHEET_LOG); s.appendRow(['الوقت','المستخدم','العملية','البئر','التفاصيل']); }
    s.appendRow([wNow(), wStr(user), wStr(op), wStr(id), wStr(detail)]);
  } catch(_) {}
}

// ─── doGet ───────────────────────────────────────────────────
function doGet() {
  return HtmlService.createTemplateFromFile('Wells')
    .evaluate()
    .setTitle('منظومة متابعة الآبار 2026')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// ─── تسجيل الدخول ────────────────────────────────────────────
function login(username, password) {
  try {
    const ss = _WSS.get();
    let sheet = ss.getSheetByName(WELLS_CONFIG.SHEET_USERS);

    // إنشاء ورقة المستخدمين تلقائياً
    if (!sheet) {
      sheet = ss.insertSheet(WELLS_CONFIG.SHEET_USERS);
      sheet.appendRow(['اسم المستخدم', 'كلمة المرور', 'الصلاحية', 'الاسم الكامل']);
      sheet.appendRow(['admin', 'admin123', 'مدير', 'المدير العام']);
      SpreadsheetApp.flush();
    }

    // إضافة admin إذا كانت الورقة فارغة
    if (sheet.getLastRow() < 2) {
      sheet.appendRow(['admin', 'admin123', 'مدير', 'المدير العام']);
      SpreadsheetApp.flush();
    }

    const U    = WELLS_CONFIG.U;
    const last = sheet.getLastRow();
    const rows = sheet.getRange(2, 1, last - 1, 4).getValues();

    const uIn = String(username).trim().toLowerCase();
    const pIn = String(password).trim();

    const found = rows.find(r =>
      String(r[U.USERNAME]).trim().toLowerCase() === uIn &&
      String(r[U.PASSWORD]).trim() === pIn
    );

    if (!found) {
      Logger.log('Login failed | user=' + uIn + ' | rows=' + rows.length);
      return { ok: false, error: 'اسم المستخدم أو كلمة المرور غير صحيحة' };
    }

    wLog(uIn, 'دخول', '-', 'ناجح');
    return {
      ok:   true,
      role: String(found[U.ROLE]).trim()     || 'مشاهد',
      name: String(found[U.FULL_NAME]).trim() || String(found[U.USERNAME]).trim()
    };

  } catch (e) {
    Logger.log('Login exception: ' + e);
    return { ok: false, error: 'خطأ: ' + e.message };
  }
}

// اختبار من المحرر مباشرة
function testLogin() {
  const r = login('admin', 'admin123');
  Logger.log('نتيجة testLogin: ' + JSON.stringify(r));
}

// ─── جلب الآبار ──────────────────────────────────────────────
function getWells() {
  try {
    const ss    = _WSS.get();
    const sheet = ss.getSheetByName(WELLS_CONFIG.SHEET_WELLS);
    if (!sheet || sheet.getLastRow() < 2) return [];

    const W    = WELLS_CONFIG.W;
    const data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 13).getValues();

    return data
      .filter(r => wStr(r[W.WELL_ID]))
      .map(r => ({
        wellId:       wStr(r[W.WELL_ID]),
        cityRegion:   wStr(r[W.CITY_REGION]),
        lat:          wCoord(r[W.LAT]),
        lng:          wCoord(r[W.LNG]),
        workType:     wStr(r[W.WORK_TYPE]),
        currentDepth: wNum(r[W.CURR_DEPTH]),
        targetDepth:  wNum(r[W.TGT_DEPTH]),
        productivity: wNum(r[W.PRODUCTIVITY]),
        contractor:   wStr(r[W.CONTRACTOR]),
        pumpType:     wStr(r[W.PUMP_TYPE]),
        completion:   wNum(r[W.COMPLETION]),
        status:       wStr(r[W.STATUS]),
        iconColor:    wStr(r[W.ICON_COLOR])
      }));
  } catch (e) {
    Logger.log('getWells: ' + e);
    return [];
  }
}

// ─── حفظ / تعديل بئر ─────────────────────────────────────────
function saveWell(data) {
  const lock = LockService.getScriptLock();
  try {
    if (!lock.tryLock(20000)) return { ok: false, error: 'النظام مشغول' };

    const ss  = _WSS.get();
    let sheet = ss.getSheetByName(WELLS_CONFIG.SHEET_WELLS);
    if (!sheet) {
      sheet = ss.insertSheet(WELLS_CONFIG.SHEET_WELLS);
      sheet.appendRow([
        'رقم البئر العام', 'المنطقة / المدينة',
        'خط العرض (Latitude)', 'خط الطول (Longitude)',
        'نوع العمل المستهدف', 'العمق الحالي (متر)', 'العمق المستهدف (متر)',
        'الإنتاجية المستهدفة (م³/يوم)', 'الشركة المنفذة / المقاول',
        'نوع وقوة المضخة', 'نسبة الإنجاز (%)',
        'الحالة التشغيلية', 'لون الأيقونة المستهدف'
      ]);
    }

    const wellId = wStr(data.wellId);
    const isEdit = data.isEdit === true || data.isEdit === 'true';
    const origId = wStr(data.originalId || wellId);

    const row = [
      wellId,
      wStr(data.cityRegion),
      wCoord(data.lat),
      wCoord(data.lng),
      wStr(data.workType),
      wNum(data.currentDepth),
      wNum(data.targetDepth),
      wNum(data.productivity),
      wStr(data.contractor),
      wStr(data.pumpType),
      wNum(data.completion),
      wStr(data.status),
      wStr(data.iconColor)
    ];

    if (isEdit) {
      const vals   = sheet.getRange(2, 1, sheet.getLastRow() - 1, 1).getValues();
      const rowIdx = vals.findIndex(r => wStr(r[0]) === origId);
      if (rowIdx === -1) return { ok: false, error: 'رقم البئر غير موجود: ' + origId };
      sheet.getRange(rowIdx + 2, 1, 1, row.length).setValues([row]);
      wLog(wStr(data.user), 'تعديل', wellId, 'تحديث');
    } else {
      const last = sheet.getLastRow();
      if (last >= 2) {
        const ex = sheet.getRange(2, 1, last - 1, 1).getValues();
        if (ex.some(r => wStr(r[0]) === wellId))
          return { ok: false, error: 'رقم البئر موجود مسبقاً: ' + wellId };
      }
      sheet.appendRow(row);
      wLog(wStr(data.user), 'إضافة', wellId, 'جديد');
    }

    SpreadsheetApp.flush();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e.message };
  } finally {
    if (lock.hasLock()) lock.releaseLock();
  }
}

// ─── حذف بئر ─────────────────────────────────────────────────
function deleteWell(wellId) {
  const lock = LockService.getScriptLock();
  try {
    if (!lock.tryLock(15000)) return { ok: false, error: 'النظام مشغول' };
    const ss    = _WSS.get();
    const sheet = ss.getSheetByName(WELLS_CONFIG.SHEET_WELLS);
    if (!sheet) return { ok: false, error: 'الورقة غير موجودة' };
    const id     = wStr(wellId);
    const vals   = sheet.getRange(2, 1, sheet.getLastRow() - 1, 1).getValues();
    const rowIdx = vals.findIndex(r => wStr(r[0]) === id);
    if (rowIdx === -1) return { ok: false, error: 'البئر غير موجود' };
    sheet.deleteRow(rowIdx + 2);
    SpreadsheetApp.flush();
    wLog('-', 'حذف', wellId, 'تم');
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e.message };
  } finally {
    if (lock.hasLock()) lock.releaseLock();
  }
}

// ─── المستخدمون ──────────────────────────────────────────────
function getUsers() {
  try {
    const ss    = _WSS.get();
    const sheet = ss.getSheetByName(WELLS_CONFIG.SHEET_USERS);
    if (!sheet || sheet.getLastRow() < 2) return [];
    const U    = WELLS_CONFIG.U;
    const rows = sheet.getRange(2, 1, sheet.getLastRow() - 1, 4).getValues();
    return rows.filter(r => wStr(r[U.USERNAME])).map(r => ({
      username: wStr(r[U.USERNAME]),
      role:     wStr(r[U.ROLE]),
      fullName: wStr(r[U.FULL_NAME])
    }));
  } catch (e) { return []; }
}

function saveUser(data) {
  const lock = LockService.getScriptLock();
  try {
    if (!lock.tryLock(15000)) return { ok: false, error: 'النظام مشغول' };
    const ss  = _WSS.get();
    let sheet = ss.getSheetByName(WELLS_CONFIG.SHEET_USERS);
    if (!sheet) {
      sheet = ss.insertSheet(WELLS_CONFIG.SHEET_USERS);
      sheet.appendRow(['اسم المستخدم', 'كلمة المرور', 'الصلاحية', 'الاسم الكامل']);
    }
    const U        = WELLS_CONFIG.U;
    const username = wStr(data.username);
    const isEdit   = data.isEdit === true || data.isEdit === 'true';
    const origUser = wStr(data.originalUsername || username);
    const row      = [username, String(data.password || ''), wStr(data.role), wStr(data.fullName)];

    if (isEdit) {
      const vals   = sheet.getRange(2, 1, sheet.getLastRow() - 1, 1).getValues();
      const rowIdx = vals.findIndex(r => wStr(r[0]) === origUser);
      if (rowIdx === -1) return { ok: false, error: 'المستخدم غير موجود' };
      sheet.getRange(rowIdx + 2, 1, 1, 4).setValues([row]);
    } else {
      const last = sheet.getLastRow();
      if (last >= 2) {
        const ex = sheet.getRange(2, 1, last - 1, 1).getValues();
        if (ex.some(r => wStr(r[0]) === username))
          return { ok: false, error: 'اسم المستخدم موجود مسبقاً' };
      }
      sheet.appendRow(row);
    }
    SpreadsheetApp.flush();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e.message };
  } finally {
    if (lock.hasLock()) lock.releaseLock();
  }
}

function deleteUser(username) {
  const lock = LockService.getScriptLock();
  try {
    if (!lock.tryLock(15000)) return { ok: false, error: 'النظام مشغول' };
    const ss    = _WSS.get();
    const sheet = ss.getSheetByName(WELLS_CONFIG.SHEET_USERS);
    if (!sheet) return { ok: false, error: 'ورقة المستخدمين غير موجودة' };
    const id     = wStr(username);
    const vals   = sheet.getRange(2, 1, sheet.getLastRow() - 1, 1).getValues();
    const rowIdx = vals.findIndex(r => wStr(r[0]) === id);
    if (rowIdx === -1) return { ok: false, error: 'المستخدم غير موجود' };
    sheet.deleteRow(rowIdx + 2);
    SpreadsheetApp.flush();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e.message };
  } finally {
    if (lock.hasLock()) lock.releaseLock();
  }
}

// ─── إعداد الشيت من الصفر ────────────────────────────────────
/**
 * شغّلها مرة واحدة من المحرر لإنشاء الأوراق.
 */
function setupSpreadsheet() {
  const ss = _WSS.get();

  // ورقة الآبار
  let ws = ss.getSheetByName(WELLS_CONFIG.SHEET_WELLS);
  if (!ws) ws = ss.insertSheet(WELLS_CONFIG.SHEET_WELLS);
  ws.clearContents();
  ws.appendRow([
    'رقم البئر العام', 'المنطقة / المدينة',
    'خط العرض (Latitude)', 'خط الطول (Longitude)',
    'نوع العمل المستهدف', 'العمق الحالي (متر)', 'العمق المستهدف (متر)',
    'الإنتاجية المستهدفة (م³/يوم)', 'الشركة المنفذة / المقاول',
    'نوع وقوة المضخة', 'نسبة الإنجاز (%)',
    'الحالة التشغيلية', 'لون الأيقونة المستهدف'
  ]);
  // بيانات تجريبية
  ws.appendRow(['W-LY-001','طرابلس — سوق الجمعة',32.8872,13.1913,'حفر جديد',180,250,500,'شركة الأمل','15HP طاردة',75,'قيد التنفيذ','أصفر']);
  ws.appendRow(['W-LY-002','بنغازي — الصابري',32.1150,20.0695,'صيانة',320,320,800,'شركة الخليج','25HP طاردة',100,'جاهز','أخضر']);
  ws.appendRow(['W-LY-003','سبها — الجنوب',27.0377,14.4290,'حفر جديد',0,350,600,'شركة الجنوب','—',0,'متوقف','أحمر']);
  ws.appendRow(['W-LY-004','الجفرة — هون',29.1167,15.9500,'حفر جديد',200,300,450,'شركة الوسط','20HP طاردة',65,'قيد التنفيذ','أصفر']);
  ws.appendRow(['W-LY-005','مصراتة — القصبات',32.3754,15.0925,'صيانة',0,0,0,'—','—',0,'خارج الخدمة','رمادي']);

  // ورقة المستخدمين
  let us = ss.getSheetByName(WELLS_CONFIG.SHEET_USERS);
  if (!us) us = ss.insertSheet(WELLS_CONFIG.SHEET_USERS);
  us.clearContents();
  us.appendRow(['اسم المستخدم', 'كلمة المرور', 'الصلاحية', 'الاسم الكامل']);
  us.appendRow(['admin',     'admin123', 'مدير',   'المدير العام']);
  us.appendRow(['engineer1', 'eng2026',  'مهندس',  'المهندس أحمد']);
  us.appendRow(['viewer1',   'view2026', 'مشاهد',  'المراقب الميداني']);

  // ورقة السجل
  let lg = ss.getSheetByName(WELLS_CONFIG.SHEET_LOG);
  if (!lg) lg = ss.insertSheet(WELLS_CONFIG.SHEET_LOG);
  lg.clearContents();
  lg.appendRow(['الوقت','المستخدم','العملية','البئر','التفاصيل']);

  Logger.log('✅ تم الإعداد بنجاح');
  Logger.log('admin / admin123 → مدير');
  Logger.log('engineer1 / eng2026 → مهندس');
  Logger.log('viewer1 / view2026 → مشاهد');
}
