/**
 * منظومة الجهاز التنفيذي 2026 - الإصدار الماسي (المسرع تقنياً - نسخة الأداء العالي)
 * مراجعة نهائية: تم دمج نموذج التوقيعات الديناميكي وحذف النموذج القديم بالكامل.
 */

const SS_ID = "18SyUPB3tlLxHR7h5m4s7T5ktTwTna4CbDrNsJ0Cwtnk";
const CURRENT_ADMIN = "مسؤول النظام";

// متغير عام لتخزين مرجع الملف لتقليل فتح الرابط المتكرر
let globalSS = null;
function getSpreadsheet() {
  if (!globalSS) globalSS = SpreadsheetApp.openById(SS_ID);
  return globalSS;
}
function doGet(e) {
  var page = e.parameter.p;
  var id = e.parameter.id;
  var pass = e.parameter.pass;

  // قائمة المسؤولين المعتمدين
  const admins = {
    "21249": { pass: "408404$$", name: "أ. محمد طالب" },
    "21290": { pass: "408404$$", name: "أ. رمضان ابوخشيم " },
    "21207": { pass: "408404$$", name: "أ. محمد البيزنطي " },
    "10191": { pass: "408404$$", name: "أ. فاطمة عمارة " }
  };

  // 1. التحقق من محاولة تسجيل دخول المسؤول (Admin Login)
  if (id && pass) {
    if (admins[id] && admins[id].pass === pass) {
      var tmp = HtmlService.createTemplateFromFile('admin');
      tmp.adminName = admins[id].name;

      return tmp.evaluate()
          .setTitle("لوحة المسؤول | " + admins[id].name)
          .addMetaTag('viewport', 'width=device-width, initial-scale=1')
          .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
    } else {
      return HtmlService.createHtmlOutput("<div dir='rtl' style='text-align:center; padding-top:50px; font-family:Arial;'><h2 style='color:red;'>❌ بيانات الدخول غير صحيحة</h2><br><a href='"+ScriptApp.getService().getUrl()+"' style='text-decoration:none; background:#c5a059; color:white; padding:10px 20px; border-radius:5px;'>العودة لصفحة الدخول</a></div>");
    }
  }

  // 2. التحقق من طلب صفحة الموظف (Employee Page)
  if (page === 'emp') {
    return HtmlService.createTemplateFromFile('employee').evaluate()
        .setTitle('بوابة الموظف')
        .addMetaTag('viewport', 'width=device-width, initial-scale=1')
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  }

  // 3. الصفحة الافتراضية (صفحة تسجيل الدخول Login)
  return HtmlService.createTemplateFromFile('login').evaluate()
      .setTitle('المنظومة الذكية | تسجيل الدخول')
      .addMetaTag('viewport', 'width=device-width, initial-scale=1')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// 3. طبقة إدارة البيانات المسرعة
const DataLayer = {
  getSheets: function() {
    const ss = getSpreadsheet();
    const sheets = ss.getSheets();
    const findS = (names) => sheets.find(s => names.includes(s.getName().trim()));
    const findOrCreate = (names, headers) => {
      let sh = findS(names);
      if (!sh) {
        sh = ss.insertSheet(names[0]);
        if (headers) sh.getRange(1, 1, 1, headers.length).setValues([headers]);
        sh.setFrozenRows(1);
      }
      return sh;
    };
    return {
      emp: findOrCreate(["الموظفين", "employees"], ["الاسم","الرقم الوظيفي","كلمة السر","رصيد الإجازة","المؤهل","المسمى الوظيفي","الإدارة","القسم","المدير المباشر","تاريخ المباشرة","الدرجة","علاوة الدرجة","نوع العقد","نهاية العقد","موقع العمل","","","حالة العمل","ملاحظات إدارية","راتب قديم","","موعد الاستحقاق","الراتب الحالي","قرار الترقية","ملاحظات مالية"]),
      lev: findOrCreate(["الإجازات", "Vacations"], ["الاسم","الرقم الوظيفي","نوع الإجازة","تاريخ البداية","تاريخ النهاية","تاريخ العودة","عدد الأيام","ملاحظات","الحالة"]),
      logs: findOrCreate(["سجل العمليات", "logs"], ["التاريخ","المستخدم","العملية","التفاصيل"]),
      holidays: findOrCreate(["العطلات", "holidays"], ["التاريخ","الوصف"])
    };
  },
  getRawData: function(sheetName) {
    const cache = CacheService.getScriptCache();
    const cachedData = cache.get("cache_" + sheetName);
    if (cachedData) return JSON.parse(cachedData);

    const s = this.getSheets();
    const sheet = (sheetName === "emp") ? s.emp : s.lev;
    const values = sheet.getDataRange().getValues();

    const processed = values.map(row => row.map(cell =>
      (cell instanceof Date) ? cell.getTime() : cell
    ));

    cache.put("cache_" + sheetName, JSON.stringify(processed), 300);
    return processed;
  },
  clearCache: function() {
    CacheService.getScriptCache().removeAll(["cache_emp", "cache_lev"]);
  }
};

// 4. إدارة الموظفين
function getOrgStructure() {
  return {
    jobCategories: [" موظف إغفارة", " موظف مواقع", " موظف إداري", " رئيس قسم", " مدير إدارة", " مدير عام الجهاز", " مدير مكتب"],
    departments: {
      "إدارة الشؤون الإدارية والمالية": ["قسم شؤون العاملين", "قسم الشؤون المالية", "قسم المشتريات", "قسم الشؤون الإدارية", "قسم المخازن", "قسم الأمن والسلامة", "قسم الاستثمار والتسويق", "قسم العقود"],
      "إدارة النقل والصيانة": ["قسم الحركة وصيانة الآليات", "قسم صيانة الحفارات"],
      "إدارة الشؤون الفنية": ["قسم المشروعات", "قسم الحفر", "قسم صيانة الآبار"],
      "المكاتب المستقلة": ["مدير مكتب  مدير عام الجهاز", " مدير مكتب الشؤون القانونية", "مكتب المراجعة الداخلية", "مكتب التدريب والتطوير", "مكتب الإعلام والتوثيق", "مكتب شؤون الفروع", "مكتب مكتب التخطيط والمتابعة"]
    },
    contractTypes: [" تعيين رسمي", " ندب خارجية", " ندب داخلي", " متعاون ", " عقد "],
    evaluations: ["ممتاز", "جيد جداً", "جيد", "ضعيف"],
    statuses: ["مستمر", "موقوف", "منتهي بعقد", "مستقيل", "متقاعد"]
  };
}

function saveFullEmployee(obj) {
  try {
    const s = DataLayer.getSheets().emp;
    const row = new Array(25).fill("");
    row[0] = obj.name; row[1] = obj.id; row[2] = obj.secretId;
    row[3] = parseFloat(obj.balance) || 30;
    row[4] = obj.qualification; row[5] = obj.jobTitle;
    row[6] = obj.department; row[7] = obj.section;
    row[8] = obj.manager; row[9] = obj.hireDate ? new Date(obj.hireDate) : "";
    row[10] = obj.grade; row[11] = obj.currentGradeBonus;
    row[12] = obj.contractType; row[13] = obj.contractEnd ? new Date(obj.contractEnd) : "";
    row[14] = obj.workLocation;
    row[17] = obj.empStatus; row[18] = obj.adminNotes;
    row[19] = obj.oldSalary; row[20] = obj.currentGradeBonus;
    row[21] = obj.dueDate ? new Date(obj.dueDate) : ""; row[22] = obj.currentSalary;
    row[23] = obj.promotionDecision; row[24] = obj.financialNotes;

    s.appendRow(row);
    DataLayer.clearCache();
    logAction(CURRENT_ADMIN, "إضافة موظف", obj.name);
    return "✅ تم تأسيس الملف بنجاح.";
  } catch (e) { return "❌ خطأ: " + e.message; }
}

function employeeLogin(empId, password) {
  try {
    const data = DataLayer.getRawData("emp");
    const idStr = empId.toString().trim();
    const passStr = password.toString().trim();
    const employee = data.find(row => row[1].toString().trim() === idStr && row[2].toString().trim() === passStr);

    if (employee) {
      return employee.map(cell => (typeof cell === 'number' && cell > 1000000000000) ? Utilities.formatDate(new Date(cell), "GMT+2", "yyyy-MM-dd") : cell);
    }
    return null;
  } catch (e) { return "Error: " + e.message; }
}

function updateEmployeeData(obj, adminName) {
  try {
    const s = DataLayer.getSheets().emp;
    const data = s.getDataRange().getValues();
    const idStr = obj.id.toString().trim();
    const idx = data.findIndex(r => r[1].toString().trim() === idStr);
    if (idx === -1) return "❌ عذراً، الرقم الوظيفي غير موجود.";
    const rowNum = idx + 1;
    const today = new Date();
    s.getRange(rowNum, 1, 1, 11).setValues([[obj.name, obj.id, obj.secretId, parseFloat(obj.balance) || 0, obj.qualification, obj.jobTitle, obj.department, obj.section, obj.manager, obj.hireDate ? new Date(obj.hireDate) : "", obj.grade ]]);
    s.getRange(rowNum, 12).setValue(obj.currentGradeBonus || "");
    s.getRange(rowNum, 13).setValue(obj.contractType || "");
    s.getRange(rowNum, 15).setValue(obj.workLocation || "");
    s.getRange(rowNum, 18, 1, 2).setValues([[ obj.empStatus || "مستمر", obj.adminNotes || "" ]]);
    s.getRange(rowNum, 21, 1, 5).setValues([[obj.currentGradeBonus || "", obj.dueDate ? new Date(obj.dueDate) : "", parseFloat(obj.currentSalary) || 0, obj.promotionDecision || "تعديل بيانات", obj.financialNotes || ""]]);
    s.getRange(rowNum, 20).setValue(obj.oldSalary || "");
    if (typeof DataLayer.clearCache === "function") { DataLayer.clearCache(); }
    logAction(adminName || CURRENT_ADMIN, "تعديل بيانات", obj.name);
    return "✅ تم تحديث بيانات الموظف بنجاح.";
  } catch(e) { return "❌ فشل التحديث: " + e.message; }
}

function removeEmployee(id, adminName) {
  const s = DataLayer.getSheets().emp;
  const data = s.getDataRange().getValues();
  const idx = data.findIndex(r => r[1].toString().trim() === id.toString().trim());
  if (idx !== -1) {
    s.deleteRow(idx + 1);
    DataLayer.clearCache();
    logAction(adminName || CURRENT_ADMIN, "حذف موظف", "ID: " + id);
    return "🗑️ تم حذف الملف نهائياً.";
  }
  return "❌ غير موجود.";
}

function calculateWorkingDays(startDate, endDate) {
  const s = DataLayer.getSheets();
  const holidayRows = s.holidays.getDataRange().getValues();
  const holidaySet = new Set(holidayRows.slice(1).map(d => new Date(d[0]).toDateString()));
  let count = 0; let cur = new Date(startDate); let end = new Date(endDate);
  while (cur <= end) {
    if (cur.getDay() !== 5 && cur.getDay() !== 6 && !holidaySet.has(cur.toDateString())) count++;
    cur.setDate(cur.getDate() + 1);
  }
  return count;
}

function saveNewLeave(obj) {
  try {
    const sheets = DataLayer.getSheets();
    const startDate = new Date(obj.startDate);
    const endDate = new Date(obj.endDate);

    const actualDays = calculateWorkingDays(startDate, endDate);

    const empData = sheets.emp.getDataRange().getValues();
    const idx = empData.findIndex(r => r[1].toString().trim() === obj.empId.toString().trim());

    if (idx === -1) return "❌ الرقم الوظيفي غير صحيح.";

    if (obj.leaveType === "سنوية") {
      let currentBal = parseFloat(empData[idx][3]) || 0;
      if (actualDays > currentBal) return "⚠️ الرصيد لا يكفي. المتاح: " + currentBal;
      sheets.emp.getRange(idx + 1, 4).setValue(currentBal - actualDays);
    }

    let retDate = new Date(endDate);
    retDate.setDate(retDate.getDate() + 1);

    sheets.lev.appendRow([
      obj.empName,      // A
      obj.empId,        // B
      obj.leaveType,    // C
      startDate,        // D
      endDate,          // E
      retDate,          // F
      actualDays,       // G
      obj.note || "",   // H
      "طلب معلق"        // I
    ]);

    DataLayer.clearCache();
    return `✅ تم الإرسال بنجاح. المدة: ${actualDays} يوم.`;

  } catch (e) {
    return "❌ خطأ في المطابقة: " + e.message;
  }
}

function getPendingLeavesCount() {
  try {
    const data = DataLayer.getRawData("lev");
    return data.filter(r => r[8] === "طلب معلق").length;
  } catch (e) { return 0; }
}

function getOnLeaveEmployees() {
  try {
    const data = DataLayer.getRawData("lev");
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return data.filter(function(r) {
      const returnDateRaw = r[5];
      const returnDate = new Date(returnDateRaw);
      const status = r[8];
      return (status === "لم يباشر" || status === "تم الخصم والطباعة") && returnDate >= today;
    }).map(function(r) {
      let formattedDate = "---";
      if (r[5]) {
        let d = new Date(r[5]);
        if (!isNaN(d.getTime())) {
          formattedDate = Utilities.formatDate(d, "GMT+2", "yyyy/MM/dd");
        }
      }
      return {
        name: r[0],
        id: r[1],
        leaveType: r[2],
        returnDate: formattedDate,
        row: data.indexOf(r) + 1
      };
    });
  } catch (e) {
    console.error("خطأ في getOnLeaveEmployees: " + e.message);
    return [];
  }
}

function processDirect(row, note, refNumber) {
  try {
    if (!refNumber || refNumber.trim() === "") return "⚠️ الرقم الإشاري مطلوب للمباشرة.";
    const sheet = DataLayer.getSheets().lev;
    const fullNote = `إشاري: ${refNumber} | ${note}`;
    sheet.getRange(row, 8).setValue(fullNote);
    sheet.getRange(row, 9).setValue("تمت المباشرة");
    DataLayer.clearCache();
    return "✅ تمت المباشرة بنجاح وتحديث السجل.";
  } catch (e) {
    return "❌ خطأ في دالة المباشرة: " + e.message;
  }
}

function getPendingRequestsData() {
  const data = DataLayer.getRawData("lev");
  return data.map((r, i) => ({
    name: r[0], id: r[1], type: r[2],
    start: (r[3] > 1000000) ? Utilities.formatDate(new Date(r[3]), "GMT+2", "dd/MM/yyyy") : r[3],
    end: (r[4] > 1000000) ? Utilities.formatDate(new Date(r[4]), "GMT+2", "dd/MM/yyyy") : r[4],
    days: r[6], status: r[8], row: i + 1
  })).filter(req => req.status === "طلب معلق");
}

// ====== تعديل: مطابقة قيم القرار مع admin.html الجديد ======
// admin.html يرسل: 'مقبول' أو 'مرفوض'
// عند القبول → الحالة تصبح "لم يباشر"
// عند الرفض → الحالة تصبح "مرفوض" (بدلاً من حذف الصف)
function processLeaveDecision(row, decision) {
  try {
    const s = DataLayer.getSheets();
    const leaveData = s.lev.getRange(row, 1, 1, 9).getValues()[0];
    const empName = leaveData[0];
    const days = parseFloat(leaveData[6]);
    const leaveType = leaveData[2];

    if (decision === "مقبول" || decision === "معتمد") {
      s.lev.getRange(row, 9).setValue("لم يباشر");
    } else {
      // رفض: إعادة الرصيد إن كانت إجازة سنوية + تغيير الحالة إلى مرفوض
      if (leaveType === "سنوية") {
        const empData = s.emp.getDataRange().getValues();
        const empIdx = empData.findIndex(r => r[0].toString().trim() === empName.trim());
        if (empIdx !== -1) {
          let currentBal = parseFloat(empData[empIdx][3]) || 0;
          s.emp.getRange(empIdx + 1, 4).setValue(currentBal + days);
        }
      }
      s.lev.getRange(row, 9).setValue("مرفوض");
    }

    DataLayer.clearCache();
    logAction(CURRENT_ADMIN, decision + " إجازة", empName);
    return "✅ تمت المعالجة بنجاح.";
  } catch (e) {
    return "❌ خطأ في دالة الاعتماد: " + e.message;
  }
}

function generatePrintableReport(selectedMonth) {
  const data = DataLayer.getRawData("emp");
  const targetMonth = parseInt(selectedMonth) || 1;
  const months = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
  const targetMonthName = months[targetMonth - 1];

  let employees = [];
  if (!data || data.length <= 1) return "⚠️ لا توجد بيانات في قاعدة البيانات";

  for (let i = 1; i < data.length; i++) {
    let dueDateRaw = data[i][21];
    let dueDate = (typeof dueDateRaw === 'number' && dueDateRaw > 1000000000) ? new Date(dueDateRaw) : parseAnyDate(dueDateRaw);

    if (dueDate && (dueDate.getMonth() + 1) === targetMonth) {
      let fullGrade = String(data[i][10] || "").trim();
      let parts = fullGrade.split('+');
      let gradeName = parts[0].trim();
      let currentStep = parts.length > 1 ? parseInt(parts[1].trim()) : 0;

      employees.push({
        rowId: i + 1,
        name: String(data[i][0] || "").trim(),
        id: String(data[i][1] || "").trim(),
        gradePrev: gradeName + " + " + currentStep,
        gradeCurr: gradeName + " + " + (currentStep + 1),
        dateCurr: Utilities.formatDate(dueDate, "GMT+2", "yyyy/MM/dd"),
        note: String(data[i][24] || "").trim()
      });
    }
  }

  employees.sort((a, b) => (parseInt(b.id) || 0) - (parseInt(a.id) || 0));

  let html = `
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;900&display=swap');
      @page { size: A4 landscape; margin: 5mm; }
      body { direction: rtl; font-family: 'Cairo', sans-serif; background: #f4f4f4; margin: 0; padding: 0; }
      .page-container { background: #fff; width: 287mm; height: 190mm; padding: 5mm; box-sizing: border-box; page-break-after: always; margin: 0 auto; display: flex; flex-direction: column; position: relative; }
      .outer-border { border: 3px double #000; padding: 4mm; flex-grow: 1; display: flex; flex-direction: column; box-sizing: border-box; }
      .header-table { width: 100%; border-collapse: collapse; border-bottom: 1.5px solid #000; margin-bottom: 3mm; }
      .main-table { width: 100%; border-collapse: collapse; table-layout: fixed; border: 1.5px solid #000; }
      .main-table th, .main-table td { border: 1.1px solid #000; padding: 5px; text-align: center; font-size: 9.5pt; font-weight: 700; }
      .main-table th { background-color: #f2f2f2 !important; font-weight: 900; }
      .footer-section { margin-top: auto; display: flex; justify-content: space-around; padding-top: 5mm; gap: 10px; }
      .sig-item { flex: 1; text-align: center; position: relative; min-width: 15%; }
      .sig-title { font-weight: 900; font-size: 9.5pt; display: block; min-height: 20px; outline: none; }
      .sig-line { border-top: 1px dotted #000; width: 80%; margin: 8mm auto 2mm; }
      .sig-controls { position: absolute; top: -20px; left: 50%; transform: translateX(-50%); display: none; }
      .sig-item:hover .sig-controls { display: flex; gap: 5px; }
      .btn-small { font-size: 8px; cursor: pointer; border-radius: 50%; border: 1px solid #ccc; background: #fff; }
      .no-print-toolbar { background: #333; color: white; padding: 10px; text-align: center; position: sticky; top: 0; z-index: 1000; }
      .btn-nav { padding: 8px 20px; cursor: pointer; font-family: 'Cairo'; font-weight: bold; margin: 0 5px; border: none; border-radius: 5px; }
      @media print { .no-print { display: none !important; } .page-container { border: none; height: 98%; } }
    </style>

    <div class="no-print no-print-toolbar">
       <button class="btn-nav" style="background: #28a745; color: white;" onclick="addNewSignature()">➕ إضافة طرف اعتماد</button>
       <button class="btn-nav" style="background: #c5a059; color: #1a365d;" onclick="window.print()">🖨️ طباعة الكشف النهائي</button>
    </div>

    <div class="page-container">
      <div class="outer-border">
        <table class="header-table">
          <tr>
            <td style="text-align: center; width: 35%; font-weight: 900;">دولة ليبيا<br>الجهاز التنفيذي لحفر وصيانة آبار المياه</td>
            <td style="text-align: center; width: 30%;"><img src="https://i.ibb.co/rf5pWjnT/image.png" width="120"></td>
            <td style="text-align: left; width: 35%; font-weight: 900; font-size: 9pt;">الرقم الإشاري: ...............................<br>التاريخ: ............................... </td>
          </tr>
        </table>

        <div style="text-align: center; font-size: 13pt; font-weight: 900; margin-bottom: 5mm; text-decoration: underline;">
          كشف مستحقي الزيادة السنوية لشهر (${targetMonthName}) لعام 2026م
        </div>

        <table class="main-table">
          <thead>
            <tr>
              <th style="width: 30px;">ت</th>
              <th style="width: 25%;">الأســــــــم الرباعي</th>
              <th style="width: 10%;">الرقم الوظيفي</th>
              <th>الدرجة السابقة</th>
              <th>الدرجة الحالية</th>
              <th style="width: 12%;">تاريخ الاستحقاق</th>
              <th style="width: 15%;">ملاحظات</th>
            </tr>
          </thead>
          <tbody>`;

  employees.forEach((emp, index) => {
    html += `
      <tr id="row-${emp.rowId}">
        <td>${index + 1}</td>
        <td contenteditable="true" onblur="saveData(${emp.rowId}, 0, this.innerText)">${emp.name}</td>
        <td>${emp.id}</td>
        <td>${emp.gradePrev}</td>
        <td>${emp.gradeCurr}</td>
        <td>${emp.dateCurr}</td>
        <td contenteditable="true" onblur="saveData(${emp.rowId}, 24, this.innerText)">${emp.note}</td>
      </tr>`;
  });

  html += `
          </tbody>
        </table>

        <div class="footer-section" id="signatureRow">
          <div class="sig-item">
            <div class="no-print sig-controls"><button class="btn-small" onclick="removeSig(this)">❌</button></div>
            <span class="sig-title" contenteditable="true">اعتماد / مدير مكتب المورد البشرية والتدريب </span>
            <div class="sig-line"></div>
          </div>
          <div class="sig-item">
            <div class="no-print sig-controls"><button class="btn-small" onclick="removeSig(this)">❌</button></div>
            <span class="sig-title" contenteditable="true">اعتماد / مدير عام الجهاز</span>
            <div class="sig-line"></div>
          </div>
        </div>
      </div>
    </div>

    <script>
      function saveData(row, col, val) { google.script.run.updateDatabaseValue(row, col, val); }
      function addNewSignature() {
        const row = document.getElementById('signatureRow');
        const newSig = document.createElement('div');
        newSig.className = 'sig-item';
        newSig.innerHTML = \`
          <div class="no-print sig-controls"><button class="btn-small" onclick="removeSig(this)">❌</button></div>
          <span class="sig-title" contenteditable="true">اضغط لتعديل المسمى</span>
          <div class="sig-line"></div>\`;
        row.appendChild(newSig);
      }
      function removeSig(btn) {
        if(confirm("هل تريد حذف خانة الاعتماد هذه؟")) btn.closest('.sig-item').remove();
      }
    </script>`;

  return html;
}

function parseAnyDate(v) { if (!v) return null; let d = new Date(v); return isNaN(d.getTime()) ? null : d; }
function logAction(u, t, d) { try { DataLayer.getSheets().logs.appendRow([new Date(), u, t, d]); } catch(e) {} }

function getEmployeeForEdit(id) {
  try {
    const data = DataLayer.getRawData("emp");
    const emp = data.find(r => r[1].toString().trim() === id.toString().trim());
    return emp ? emp.map(cell => (typeof cell === 'number' && cell > 1000000000000) ? Utilities.formatDate(new Date(cell), "GMT+2", "yyyy-MM-dd") : cell) : null;
  } catch (e) { return null; }
}

function getLateEmployees() {
  const data = DataLayer.getRawData("lev");
  const today = new Date().getTime();
  const late = data.slice(1).filter(r => r[6] === "لم يباشر" && r[4] < today).map(r => ({ name: r[0], date: Utilities.formatDate(new Date(r[4]), "GMT+2", "dd/MM/yyyy"), status: "متأخر" }));
  return { late: late };
}

function generateStaffListReport() {
  const rawData = DataLayer.getRawData("emp");
  let rows = rawData.slice(1);

  const getRank = (jobTitle) => {
    const title = String(jobTitle || "").trim();
    if (title.includes("مدير عام الجهاز")) return 1;
    if (title.includes("مدير إدارة") || title.includes("مدير مكتب")) return 2;
    if (title.includes("رئيس قسم")) return 3;
    return 4;
  };

  const gmList = [];
  const officeGroups = {};
  const deptGroups = {};

  rows.forEach(row => {
    const job = row[5] || "";
    const dept = row[6] || "غير مصنف";
    const section = row[7] || "عام";
    const rank = getRank(job);
    const empData = { data: row, rank: rank };

    if (rank === 1) {
      gmList.push(empData);
    } else if (dept.includes("مكتب")) {
      if (!officeGroups[dept]) officeGroups[dept] = [];
      officeGroups[dept].push(empData);
    } else {
      if (!deptGroups[dept]) deptGroups[dept] = {};
      if (!deptGroups[dept][section]) deptGroups[dept][section] = [];
      deptGroups[dept][section].push(empData);
    }
  });

  let html = `
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap');
      :root { --gov-navy: #0f172a; --gov-gold: #a88548; --gov-bg: #f8fafc; --border-color: #1e293b; }
      @page { size: A4 landscape; margin: 5mm; }
      body { direction: rtl; font-family: 'Cairo', sans-serif; background-color: #e2e8f0; margin: 0; padding: 0; color: var(--gov-navy); }
      .no-print-toolbar { background: var(--gov-navy); color: white; padding: 20px 30px; box-shadow: 0 4px 15px rgba(0,0,0,0.2); position: sticky; top: 0; z-index: 1000; }
      .toolbar-title { font-weight: 900; margin-bottom: 15px; display: flex; align-items: center; gap: 10px; font-size: 1.1rem; }
      .checkbox-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 12px; }
      .custom-checkbox { display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 0.9rem; transition: 0.3s; }
      .custom-checkbox:hover { color: var(--gov-gold); }
      .print-container { padding: 10mm; }
      .report-frame { background: white; border: 1px solid var(--border-color); padding: 8mm; position: relative; box-shadow: 0 0 40px rgba(0,0,0,0.1); }
      .header-zone { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid var(--gov-gold); padding-bottom: 15px; margin-bottom: 20px; }
      .header-right, .header-left { font-weight: 700; font-size: 10pt; line-height: 1.6; }
      .logo-box { text-align: center; }
      .logo-box img { width: 90px; filter: grayscale(0.2); }
      .category-banner { background: var(--gov-navy) !important; color: white !important; padding: 10px 20px; margin: 25px 0 0 0; font-size: 11pt; font-weight: 900; border-right: 6px solid var(--gov-gold); display: flex; justify-content: space-between; -webkit-print-color-adjust: exact; }
      .section-header { background: #f1f5f9; padding: 6px 20px; font-weight: 800; border: 1px solid var(--gov-navy); border-bottom: none; font-size: 9.5pt; color: var(--gov-navy); display: inline-block; margin-top: 10px; }
      table { width: 100%; border-collapse: collapse; table-layout: fixed; margin-bottom: 0px; }
      th { background: #f1f5f9 !important; color: var(--gov-navy); border: 1px solid var(--gov-navy); padding: 10px 5px; font-size: 8.5pt; font-weight: 900; -webkit-print-color-adjust: exact; }
      td { border: 1px solid #cbd5e1; padding: 8px 4px; font-size: 8.5pt; font-weight: 600; text-align: center; overflow: hidden; }
      tr:nth-child(even) { background-color: #f8fafc; }
      .rank-1 { background: #fffbeb !important; border-top: 2px solid var(--gov-gold); }
      .rank-1 td { font-weight: 900; font-size: 9.5pt; color: #854d0e; }
      .rank-2 { background: #f0fdf4 !important; }
      .rank-3 { background: #fef2f2 !important; }
      .search-box { margin-top: 15px; padding: 12px 20px; width: 400px; border: none; border-radius: 8px; font-family: 'Cairo'; font-weight: 600; box-shadow: inset 0 2px 4px rgba(0,0,0,0.1); }
      @media print { body { background: white; } .no-print-toolbar, .print-btn-container { display: none !important; } .print-container { padding: 0; } .report-frame { border: none; box-shadow: none; padding: 0; } .dept-wrapper { page-break-after: always; } }
    </style>

    <div class="no-print-toolbar">
      <div class="toolbar-title"> لوحة تحكم </div>
      <div class="checkbox-grid">
        <label class="custom-checkbox"><input type="checkbox" checked onclick="updateView('c-id')"> الرقم الوظيفي</label>
        <label class="custom-checkbox"><input type="checkbox" checked onclick="updateView('c-qual')"> المؤهل العلمي</label>
        <label class="custom-checkbox"><input type="checkbox" checked onclick="updateView('c-job')"> المسمى الوظيفي</label>
        <label class="custom-checkbox"><input type="checkbox" checked onclick="updateView('c-hire')"> تاريخ المباشرة</label>
        <label class="custom-checkbox"><input type="checkbox" checked onclick="updateView('c-due')"> موعد الاستحقاق</label>
        <label class="custom-checkbox"><input type="checkbox" checked onclick="updateView('c-grade')"> الدرجة</label>
        <label class="custom-checkbox"><input type="checkbox" checked onclick="updateView('c-bal')"> الرصيد</label>
        <label class="custom-checkbox"><input type="checkbox" checked onclick="updateView('c-status')"> حالة العمل</label>
        <label class="custom-checkbox"><input type="checkbox" checked onclick="updateView('c-admin')"> ملاحظات إدارية</label>
        <label class="custom-checkbox"><input type="checkbox" checked onclick="updateView('c-fin')"> ملاحظات مالية</label>
      </div>
      <input type="text" id="searchInput" onkeyup="searchTable()" class="search-box" placeholder="🔍 ابحث عن موظف بالاسم أو الرقم الوظيفي...">
    </div>

    <div class="print-container">
      <div class="report-frame">
        <div class="header-zone">
          <div class="header-right">دولة ليبيا<br>وزارة الموارد المائية<br>الجهاز التنفيذي لحفر وصيانة آبار المياه</div>
          <div class="logo-box">
            <img src="https://i.ibb.co/rf5pWjnT/image.png">
            <div style="font-weight: 900; margin-top: 5px; font-size: 11pt; color: var(--gov-gold);">قسم شؤون العاملين</div>
          </div>
          <div class="header-left">التاريخ: ${Utilities.formatDate(new Date(), "GMT+2", "yyyy/MM/dd")}م<br>الصفحة: ...................<br></div>
        </div>
        <h2 style="text-align:center; font-weight: 900; font-size: 16pt; margin: 10px 0; color: var(--gov-navy);">كشف العاملين الموحد للجهاز ( )</h2>`;

  const formatDate = (v) => { if (!v) return "---"; let d = new Date(v); return isNaN(d.getTime()) ? v : Utilities.formatDate(d, "GMT+2", "yyyy/MM/dd"); };

  const renderFullTable = (employees) => {
    let tableHtml = `<table>
      <thead>
        <tr>
          <th style="width:25px;">ت</th>
          <th style="width:16%;">الاسم الرباعي الكامل</th>
          <th class="c-id" style="width:40px;">الرقم</th>
          <th class="c-qual" style="width:60px;">المؤهل</th>
          <th class="c-job" style="width:12%;">المسمى الوظيفي</th>
          <th class="c-hire" style="width:60px;">المباشرة</th>
          <th class="c-due" style="width:60px;">الاستحقاق</th>
          <th class="c-grade" style="width:50px;">الدرجة</th>
          <th class="c-bal" style="width:30px;">رصيد</th>
          <th class="c-status" style="width:45px;">الحالة</th>
          <th class="c-admin" style="width:10%;">ملاحظات إدارية</th>
          <th class="c-fin" style="width:10%;">ملاحظات مالية</th>
        </tr>
      </thead>
      <tbody>`;
    employees.forEach((emp, index) => {
      const r = emp.data;
      tableHtml += `
        <tr class="emp-row rank-${emp.rank}" data-search="${r[0]} ${r[1]}">
          <td style="font-weight:900;">${index + 1}</td>
          <td style="text-align:right; font-weight:700; padding-right:8px; border-right: 3px solid var(--gov-navy);">${r[0]}</td>
          <td class="c-id" style="font-family:monospace;">${r[1]}</td>
          <td class="c-qual">${r[4] || "---"}</td>
          <td class="c-job">${r[5]}</td>
          <td class="c-hire">${formatDate(r[9])}</td>
          <td class="c-due">${formatDate(r[21])}</td>
          <td class="c-grade">${r[10]}</td>
          <td class="c-bal">${r[3]}</td>
          <td class="c-status"><span style="color:${r[17] === 'مستمر' ? '#166534' : '#991b1b'};">${r[17]}</span></td>
          <td class="c-admin" style="font-size:7.5pt; text-align:right;">${r[18] || ""}</td>
          <td class="c-fin" style="font-size:7.5pt; text-align:right;">${r[24] || ""}</td>
        </tr>`;
    });
    return tableHtml + `</tbody></table>`;
  };

  if (gmList.length > 0) {
    html += `<div class="category-banner" style="background:var(--gov-gold) !important; color:white !important;"><span>👑 السلطة العليا: </span><span style="font-size:9pt;">إجمالي القيادة: ${gmList.length}</span></div>`;
    html += renderFullTable(gmList);
  }

  for (let office in officeGroups) {
    html += `<div class="category-banner"><span>📂 المكاتب : ${office}</span><span style="font-size:9pt;">عدد الكادر: ${officeGroups[office].length}</span></div>`;
    officeGroups[office].sort((b, a) => b.rank - a.rank);
    html += renderFullTable(officeGroups[office]);
  }

  for (let dept in deptGroups) {
    html += `<div class="dept-wrapper"><div class="category-banner"><span>🏢 الإدارة : ${dept}</span><span style="font-size:9pt;">إجمالي القوة: ${Object.values(deptGroups[dept]).flat().length}</span></div>`;
    const sections = deptGroups[dept];
    for (let sec in sections) {
      html += `<div class="section-header">🔹 ${sec}</div>`;
      sections[sec].sort((a, b) => a.rank - b.rank);
      html += renderFullTable(sections[sec]);
    }
    html += `</div>`;
  }

  html += `
      </div>
    </div>
    <div class="print-btn-container" style="text-align:center; padding:30px 0;">
      <button onclick="window.print()" style="padding:15px 120px; background:var(--gov-gold); color:white; border-radius:12px; cursor:pointer; font-weight:900; border:none; font-family:Cairo; font-size:16pt; box-shadow: 0 10px 20px rgba(168, 133, 72, 0.3);">🖨️ طباعة السجل الرسمي العام</button>
    </div>
    <script>
      function updateView(cls) { var elms = document.getElementsByClassName(cls); for (var i = 0; i < elms.length; i++) { elms[i].style.display = elms[i].style.display === 'none' ? '' : 'none'; } }
      function searchTable() { var q = document.getElementById("searchInput").value.toLowerCase(); var rs = document.getElementsByClassName("emp-row"); for (var i = 0; i < rs.length; i++) { rs[i].style.display = rs[i].getAttribute("data-search").toLowerCase().includes(q) ? "" : "none"; } }
    </script>`;

  return html;
}

function getEmployeesByBonusMonth(selectedMonth) {
  const data = DataLayer.getRawData("emp");
  const target = parseInt(selectedMonth);
  return data.slice(1).filter(r => {
    let d = (typeof r[21] === 'number') ? new Date(r[21]) : parseAnyDate(r[21]);
    return d && (d.getMonth() + 1) === target;
  }).map(r => ({ id: r[1], name: r[0], currentStatus: r[10] + " +" + r[11], nextStatus: r[10] + " +" + (parseInt(r[11]) + 1), dueDate: (typeof r[21] === 'number') ? Utilities.formatDate(new Date(r[21]), "GMT+2", "yyyy/MM/dd") : r[21] }));
}

function updateDatabaseValue(row, col, val) {
  try {
    const sh = DataLayer.getSheets().emp;
    sh.getRange(row, col + 1).setValue(val);
    DataLayer.clearCache();
    return "ok";
  } catch(e) { return e.message; }
}

// ==================== ADDITIONS v2 - شؤون العاملين ====================

const NEW_SHEETS_CFG = {
  DOCS:  { name: "الأرشيف",        headers: ["معرف السجل","الرقم الوظيفي","الاسم","القسم","نوع المستند","اسم الملف","معرف Drive","رابط المعاينة","الحجم","تاريخ الوثيقة","تاريخ الانتهاء","ملاحظات","سري","أضيف بواسطة","تاريخ الإنشاء","محذوف"] },
  ATT:   { name: "سجل الحضور",     headers: ["الرقم الوظيفي","الاسم","القسم","التاريخ","وقت الدخول","وقت الخروج","الحالة","مدة العمل (ساعة)"] },
  PERMS: { name: "سجل الأذونات",   headers: ["المعرف","الرقم الوظيفي","الاسم","القسم","التاريخ","نوع الإذن","وقت الخروج","وقت العودة","المدة (دقيقة)","ملاحظات"] }
};

let _rootFolderIdV2 = null;

function _getNewSheet(key) {
  const ss = getSpreadsheet();
  const cfg = NEW_SHEETS_CFG[key];
  let sh = ss.getSheetByName(cfg.name);
  if (!sh) { sh = ss.insertSheet(cfg.name); sh.getRange(1,1,1,cfg.headers.length).setValues([cfg.headers]); sh.setFrozenRows(1); }
  return sh;
}

function initNewSheets() {
  try { ['DOCS','ATT','PERMS'].forEach(k => _getNewSheet(k)); return { success: true, msg: "✅ تم إنشاء الأوراق الجديدة بنجاح" }; }
  catch(e) { return { success: false, msg: e.message }; }
}

function _getDriveRootV2() {
  if (_rootFolderIdV2) { try { return DriveApp.getFolderById(_rootFolderIdV2); } catch(e) {} }
  const props = PropertiesService.getScriptProperties();
  let id = props.getProperty("ARCHIVE_ROOT_V2");
  if (id) { try { _rootFolderIdV2 = id; return DriveApp.getFolderById(id); } catch(e) {} }
  const iter = DriveApp.getFoldersByName("أرشيف ملفات الموظفين");
  const folder = iter.hasNext() ? iter.next() : DriveApp.createFolder("أرشيف ملفات الموظفين");
  props.setProperty("ARCHIVE_ROOT_V2", folder.getId());
  _rootFolderIdV2 = folder.getId();
  return folder;
}

function _findOrCreateV2(parent, name) {
  const iter = parent.getFoldersByName(name);
  return iter.hasNext() ? iter.next() : parent.createFolder(name);
}

// --- Dashboard ---
function getAdminDashboardStats() {
  try {
    const empData = DataLayer.getRawData("emp");
    const levData = DataLayer.getRawData("lev");
    const docSh = _getNewSheet('DOCS');
    const docs = docSh.getDataRange().getValues();
    const now = new Date();
    const soon = new Date(); soon.setDate(now.getDate() + 30);
    const total = empData.length - 1;
    const active = empData.slice(1).filter(r => !r[17] || r[17] === "مستمر").length;
    const pending = levData.filter(r => r[8] === "طلب معلق").length;
    const onLeave = levData.filter(r => r[8] === "لم يباشر").length;
    let expiring = 0, expiringList = [], recentDocs = [];
    for (let i = 1; i < docs.length; i++) {
      if (docs[i][15]) continue;
      if (docs[i][10]) { const exp = new Date(docs[i][10]); if (exp >= now && exp <= soon) { expiring++; expiringList.push({ emp: docs[i][2], doc: docs[i][4], days: Math.ceil((exp-now)/86400000), id: docs[i][1] }); } }
      if (i >= docs.length - 8) recentDocs.push({ name: docs[i][5], type: docs[i][4], date: docs[i][9] ? String(docs[i][9]).split('T')[0] : '', emp: docs[i][2], id: docs[i][6] });
    }
    const deptMap = {}, statusMap = {};
    empData.slice(1).forEach(r => { if (!String(r[0]).trim()) return; const d = r[6]||"غير محدد"; deptMap[d]=(deptMap[d]||0)+1; const s = r[17]||"مستمر"; statusMap[s]=(statusMap[s]||0)+1; });
    return { total, active, pending, onLeave, totalDocs: docs.length-1, expiring, expiringList: expiringList.sort((a,b)=>a.days-b.days).slice(0,6), recentDocs: recentDocs.reverse().slice(0,6), deptStats: deptMap, statusStats: statusMap };
  } catch(e) { return { error: e.message, total:0, active:0, pending:0, onLeave:0, totalDocs:0, expiring:0, expiringList:[], recentDocs:[], deptStats:{}, statusStats:{} }; }
}

// --- Documents ---
function uploadDocuments(filesData, meta) {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(25000)) return { success: false, msg: "النظام مشغول" };
  try {
    const root = _getDriveRootV2();
    const deptFolder = _findOrCreateV2(root, meta.dept || "عام");
    const empFolder = _findOrCreateV2(deptFolder, (meta.jobId||"") + " - " + (meta.name||"موظف"));
    const sh = _getNewSheet('DOCS');
    let count = 0;
    filesData.forEach(f => {
      const blob = Utilities.newBlob(Utilities.base64Decode(f.data), f.type, f.name);
      const file = empFolder.createFile(blob);
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      sh.appendRow([Utilities.getUuid(), meta.jobId||"", meta.name||"", meta.dept||"", meta.docType||"", f.name, file.getId(), "https://drive.google.com/file/d/"+file.getId()+"/preview", (f.size/1024/1024).toFixed(2)+" MB", meta.docDate||"", meta.expDate||"", meta.notes||"", meta.secret?"سري":"", Session.getActiveUser().getEmail(), Utilities.formatDate(new Date(),"GMT+2","yyyy-MM-dd HH:mm:ss"), ""]);
      count++;
    });
    logAction(meta.uploadedBy||"Admin", "رفع وثيقة", (meta.jobId||"")+" ("+count+" ملف)");
    return { success: true, count, msg: "تم رفع "+count+" ملف بنجاح" };
  } catch(e) { return { success: false, msg: e.message }; }
  finally { lock.releaseLock(); }
}

function searchDocuments(query, filters) {
  const sh = _getNewSheet('DOCS');
  const data = sh.getDataRange().getValues();
  const q = query ? query.toLowerCase() : "";
  const now = new Date(); const soon = new Date(); soon.setDate(now.getDate()+30);
  filters = filters || {};
  const results = [];
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (row[15]) continue;
    if (filters.dept && row[3] !== filters.dept) continue;
    if (filters.type && row[4] !== filters.type) continue;
    if (q && !row.some(c => String(c).toLowerCase().includes(q))) continue;
    const expDate = row[10] ? new Date(row[10]) : null;
    const isExpiring = !!(expDate && expDate >= now && expDate <= soon);
    const isExpired = !!(expDate && expDate < now);
    const isSecret = row[12] === "سري";
    if (filters.status === "expiring" && !isExpiring) continue;
    if (filters.status === "expired" && !isExpired) continue;
    if (filters.status === "secret" && !isSecret) continue;
    results.push({ driveId: row[6], fileName: row[5], emp: row[2], jobId: row[1], dept: row[3], type: row[4], size: row[8], docDate: row[9]?String(row[9]).split('T')[0]:'', expDate: row[10]?String(row[10]).split('T')[0]:'', previewUrl: row[7], isExpiring, isExpired, isSecret });
  }
  return results;
}

function getDocFilePreviewUrl(fileId) { return "https://drive.google.com/file/d/"+fileId+"/preview"; }
function getDocFileDownloadUrl(fileId) { try { return DriveApp.getFileById(fileId).getDownloadUrl(); } catch(e) { return ""; } }

// --- Attendance ---
function importAttendanceData(rows) {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(25000)) return { success: false, msg: "النظام مشغول" };
  try {
    const sh = _getNewSheet('ATT');
    const empData = DataLayer.getRawData("emp");
    const empMap = {};
    empData.slice(1).forEach(r => { if (r[1]) empMap[String(r[1]).trim()] = { name: r[0], dept: r[6] }; });
    let count = 0;
    rows.forEach(r => {
      const id = String(r.id||r[0]||"").trim();
      const info = empMap[id] || { name: r.name||r[1]||"", dept: r.dept||r[2]||"" };
      let dur = "";
      if (r.checkIn && r.checkOut) { try { const t1=new Date("2000-01-01 "+r.checkIn), t2=new Date("2000-01-01 "+r.checkOut); if(t2>t1) dur=((t2-t1)/3600000).toFixed(1); } catch(e) {} }
      sh.appendRow([id, info.name, info.dept, r.date||r[3]||"", r.checkIn||r[4]||"", r.checkOut||r[5]||"", r.status||"حضر", dur]);
      count++;
    });
    logAction("Admin","استيراد حضور",count+" سجل");
    return { success: true, count, msg: "تم استيراد "+count+" سجل حضور" };
  } catch(e) { return { success: false, msg: e.message }; }
  finally { lock.releaseLock(); }
}

function getAttendanceReportData(from, to, empId, dept) {
  const sh = _getNewSheet('ATT');
  const data = sh.getDataRange().getValues();
  const fromD = from ? new Date(from) : null, toD = to ? new Date(to) : null;
  const summary = {};
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const id = String(row[0]);
    if (empId && id !== String(empId)) continue;
    if (dept && row[2] !== dept) continue;
    if (fromD && row[3] && new Date(row[3]) < fromD) continue;
    if (toD && row[3] && new Date(row[3]) > toD) continue;
    if (!summary[id]) summary[id] = { id, name: row[1], dept: row[2], present:0, absent:0, leave:0, mission:0, totalHours:0, details:[] };
    const st = String(row[6]);
    if (st==="حضر") summary[id].present++; else if(st==="غياب") summary[id].absent++; else if(st==="إجازة") summary[id].leave++; else if(st==="مأمورية") summary[id].mission++;
    summary[id].totalHours += parseFloat(row[7])||0;
    if (empId) summary[id].details.push({ date: String(row[3]).split('T')[0], checkIn: row[4], checkOut: row[5], status: st, hours: row[7] });
  }
  const result = Object.values(summary);
  result.forEach(r => r.totalHours = r.totalHours.toFixed(1));
  return result;
}

// --- Permissions ---
function addExitPermission(data) {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(25000)) return { success: false, msg: "النظام مشغول" };
  try {
    const sh = _getNewSheet('PERMS');
    const empData = DataLayer.getRawData("emp");
    const emp = empData.find(r => String(r[1]).trim() === String(data.jobId||"").trim());
    const name = emp ? emp[0] : (data.name||"");
    const dept = emp ? emp[6] : (data.dept||"");
    let dur = 0;
    if (data.checkOut && data.checkIn) { try { const t1=new Date("2000-01-01 "+data.checkOut), t2=new Date("2000-01-01 "+data.checkIn); if(t2>t1) dur=Math.round((t2-t1)/60000); } catch(e) {} }
    sh.appendRow([Utilities.getUuid(), data.jobId||"", name, dept, data.date||"", data.type||"", data.checkOut||"", data.checkIn||"", dur, data.notes||""]);
    logAction("Admin","إضافة إذن خروج",name);
    return { success: true, msg: "تم إضافة إذن الخروج" };
  } catch(e) { return { success: false, msg: e.message }; }
  finally { lock.releaseLock(); }
}

function getPermissionsData(from, to, empId, dept, type) {
  const sh = _getNewSheet('PERMS');
  const data = sh.getDataRange().getValues();
  const fromD = from ? new Date(from) : null, toD = to ? new Date(to) : null;
  const results = [];
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (empId && String(row[1]) !== String(empId)) continue;
    if (dept && row[3] !== dept) continue;
    if (type && row[5] !== type) continue;
    if (fromD && row[4] && new Date(row[4]) < fromD) continue;
    if (toD && row[4] && new Date(row[4]) > toD) continue;
    results.push({ id: row[0], jobId: row[1], name: row[2], dept: row[3], date: String(row[4]).split('T')[0], type: row[5], checkOut: row[6], checkIn: row[7], duration: row[8], notes: row[9] });
  }
  return results;
}

// --- التقارير الخمسة ---
function report_GeneralEmployees(filters) {
  filters = filters||{};
  const data = DataLayer.getRawData("emp");
  return data.slice(1).filter(r => {
    if (!String(r[0]).trim()) return false;
    if (filters.dept && r[6] !== filters.dept) return false;
    if (filters.jobTitle && !String(r[5]).includes(filters.jobTitle)) return false;
    if (filters.status && r[17] !== filters.status) return false;
    return true;
  }).map(r => ({
    name:r[0], id:r[1], qualification:r[4], title:r[5], dept:r[6], section:r[7],
    grade:r[10], status:r[17]||"مستمر", balance:r[3],
    hireDate: r[9]?(typeof r[9]==='number'?Utilities.formatDate(new Date(r[9]),"GMT+2","yyyy/MM/dd"):String(r[9])):"-",
    dueDate:  r[21]?(typeof r[21]==='number'?Utilities.formatDate(new Date(r[21]),"GMT+2","yyyy/MM/dd"):String(r[21])):"-"
  }));
}

function report_LeavesQuarterly(from, to, empId, leaveType) {
  const data = DataLayer.getRawData("lev");
  const fromD = from ? new Date(from) : null, toD = to ? new Date(to) : null;
  const fmtDate = (v) => { if (!v) return ""; let d=new Date(v); return isNaN(d.getTime())?"":Utilities.formatDate(d,"GMT+2","yyyy/MM/dd"); };
  if (empId && String(empId).trim()) {
    const empStr = String(empId).trim();
    const empRow = DataLayer.getRawData("emp").find(r => String(r[1]).trim() === empStr);
    const details = data.slice(1).filter(r => {
      if (String(r[1]).trim() !== empStr) return false;
      if (leaveType && r[2] !== leaveType) return false;
      if (fromD && r[3] && new Date(r[3]) < fromD) return false;
      if (toD && r[4] && new Date(r[4]) > toD) return false;
      return true;
    }).map(r => ({ type:r[2], start:fmtDate(r[3]), end:fmtDate(r[4]), days:r[6], notes:r[7], status:r[8] }));
    return { mode:"detail", empName: empRow?empRow[0]:"", data:details };
  }
  const summary = {};
  data.slice(1).forEach(r => {
    if (!String(r[0]).trim()) return;
    if (fromD && r[3] && new Date(r[3]) < fromD) return;
    if (toD && r[4] && new Date(r[4]) > toD) return;
    if (leaveType && r[2] !== leaveType) return;
    const id = String(r[1]);
    if (!summary[id]) summary[id] = { id, name:r[0], سنوية:0, مرضية:0, طارئة:0, أخرى:0, total:0 };
    const days = parseFloat(r[6])||0, type = r[2];
    if (["سنوية","مرضية","طارئة"].includes(type)) summary[id][type]+=days; else summary[id].أخرى+=days;
    summary[id].total+=days;
  });
  return { mode:"summary", data:Object.values(summary) };
}

function report_Employee360(empId, year) {
  const fmtD = (v) => { if(!v) return ""; let d=(typeof v==='number')?new Date(v):new Date(v); return isNaN(d.getTime())?"":Utilities.formatDate(d,"GMT+2","yyyy/MM/dd"); };
  const empData = DataLayer.getRawData("emp");
  const emp = empData.find(r => String(r[1]).trim() === String(empId||"").trim());
  if (!emp) return null;
  const y = parseInt(year)||new Date().getFullYear();
  const from = y+"-01-01", to = y+"-12-31";
  const att = getAttendanceReportData(from, to, String(emp[1]).trim(), "");
  const leaves = report_LeavesQuarterly(from, to, String(emp[1]).trim(), "");
  const perms = getPermissionsData(from, to, String(emp[1]).trim(), "", "");
  const docSh = _getNewSheet('DOCS');
  const docData = docSh.getDataRange().getValues();
  const empDocs = docData.slice(1).filter(r => String(r[1]).trim()===String(emp[1]).trim()&&!r[15]).map(r => ({ type:r[4], name:r[5], date:String(r[9]).split('T')[0], expDate:String(r[10]).split('T')[0], size:r[8] }));
  return {
    employee: { name:emp[0], id:emp[1], qualification:emp[4], title:emp[5], dept:emp[6], section:emp[7], grade:emp[10], status:emp[17]||"مستمر", balance:emp[3], hireDate:fmtD(emp[9]), dueDate:fmtD(emp[21]) },
    year: y, attendance: att[0]||{present:0,absent:0,leave:0,mission:0,totalHours:0},
    leaves: leaves.data||[], totalLeaveDays: (leaves.data||[]).reduce((s,r)=>s+(parseFloat(r.days)||0),0),
    permissions: perms, totalPermMinutes: perms.reduce((s,r)=>s+(parseInt(r.duration)||0),0),
    documents: empDocs
  };
}

function getMyLeaves(empId) {
  const data = DataLayer.getRawData("lev");
  const fmt = (v) => { if(!v) return ""; try { let d = (typeof v==='number') ? new Date(v) : new Date(v); return isNaN(d.getTime()) ? String(v) : Utilities.formatDate(d,"GMT+2","yyyy/MM/dd"); } catch(e){ return String(v); } };
  return data.filter(r => String(r[1]).trim() === String(empId).trim() && String(r[0]).trim() !== "الاسم الكامل" && String(r[0]).trim() !== "").map(r => ({
    type: r[2], start: fmt(r[3]), end: fmt(r[4]),
    days: r[6], notes: r[7], status: r[8]
  })).reverse();
}

function getEmpDocuments(jobId) {
  try {
    const sh = _getNewSheet('DOCS');
    const data = sh.getDataRange().getValues();
    return data.slice(1).filter(r => String(r[1]).trim() === String(jobId).trim() && !r[15]).map(r => ({
      type: r[4], name: r[5], driveId: r[6], previewUrl: r[7], size: r[8],
      date: r[9] ? String(r[9]).split('T')[0] : '',
      expDate: r[10] ? String(r[10]).split('T')[0] : ''
    }));
  } catch(e) { return []; }
}

function changeEmpPassword(empId, currentPass, newPass) {
  if (!newPass || String(newPass).trim().length < 4) return { success: false, msg: "كلمة المرور الجديدة قصيرة جداً (4 أحرف على الأقل)" };
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(10000)) return { success: false, msg: "النظام مشغول" };
  try {
    const sh = DataLayer.getSheets().emp;
    const data = sh.getDataRange().getValues();
    const idx = data.findIndex(r => String(r[1]).trim() === String(empId).trim() && String(r[2]).trim() === String(currentPass).trim());
    if (idx === -1) return { success: false, msg: "كلمة المرور الحالية غير صحيحة" };
    sh.getRange(idx+1, 3).setValue(String(newPass).trim());
    DataLayer.clearCache();
    logAction("موظف:" + empId, "تغيير كلمة مرور", empId);
    return { success: true, msg: "✅ تم تحديث كلمة المرور بنجاح" };
  } catch(e) { return { success: false, msg: e.message }; }
  finally { lock.releaseLock(); }
}

function getDepartmentStatsList() {
  const empData = DataLayer.getRawData("emp");
  const levData = DataLayer.getRawData("lev");
  const stats = {};
  empData.slice(1).forEach(r => {
    if (!String(r[0]).trim()) return;
    const d = r[6]||"غير محدد";
    if (!stats[d]) stats[d] = { dept:d, employees:0, active:0, onLeave:0 };
    stats[d].employees++;
    if (!r[17]||r[17]==="مستمر") stats[d].active++;
  });
  levData.filter(r=>r[8]==="لم يباشر").forEach(r => {
    const empRow = DataLayer.getRawData("emp").find(e=>String(e[1]).trim()===String(r[1]).trim());
    if (empRow) { const d=empRow[6]||"غير محدد"; if(stats[d]) stats[d].onLeave++; }
  });
  return Object.values(stats);
}
