// ============================================================
// Setup.gs — إعداد نظام أرشفة القسم (تشغيل مرة واحدة فقط)
// ============================================================

var SPREADSHEET_ID = '1lqcxBy7pzC-ahMjFO6WwpTfUkXE2qq9ZtI_sL_LQiwM';
var ROOT_FOLDER_ID = '1qvVAEA9uV069UgtFQegYKXehLIcuW1hP';

// قائمة أنواع الملفات
var FILE_TYPES = [
  { name: 'الوارد',                icon: '📥', field1: 'الجهة المرسلة',       field2: 'رقم الرسالة الواردة' },
  { name: 'الصادر',                icon: '📤', field1: 'الجهة المرسل إليها',  field2: 'مرجع الوارد'         },
  { name: 'القرارات الداخلية',     icon: '📋', field1: 'نوع القرار',           field2: 'اسم الموظف المعني'   },
  { name: 'القرارات الخارجية',     icon: '📋', field1: 'الجهة المصدرة',        field2: 'اسم الموظف المعني'   },
  { name: 'التأشيرات',             icon: '📝', field1: 'من أحال',              field2: 'إلى من أُحيل'        },
  { name: 'المراسلات',             icon: '📨', field1: 'الجهة',                field2: 'نوع المراسلة'        },
  { name: 'محاضر الاجتماعات',      icon: '📄', field1: 'رئيس الاجتماع',        field2: 'عدد الحاضرين'        },
  { name: 'شؤون الموظفين',         icon: '👤', field1: 'اسم الموظف',           field2: 'نوع الإجراء'         },
  { name: 'الغياب',                icon: '🗓️', field1: 'اسم الموظف',           field2: 'عدد أيام الغياب'     },
  { name: 'الإجازات السنوية',      icon: '🏖️', field1: 'اسم الموظف',           field2: 'المدة (من/إلى)'      },
  { name: 'مجلس التأديب',          icon: '⚖️', field1: 'اسم الموظف',           field2: 'سبب الإحالة'         },
  { name: 'الكشوفات',              icon: '📊', field1: 'نوع الكشف',             field2: 'الفترة'              },
  { name: 'الإجازات الطارئة',      icon: '🏥', field1: 'اسم الموظف',           field2: 'السبب والمدة'        },
  { name: 'التكليفات',             icon: '💰', field1: 'اسم الموظف',           field2: 'جهة التكليف والمدة'  },
  { name: 'الطلبات',               icon: '📬', field1: 'مقدم الطلب',           field2: 'نوع الطلب'           }
];

// الأعمدة الثابتة لكل ورقة
var FIXED_HEADERS = ['رقم القيد', 'التاريخ', 'الموضوع', 'ملاحظات', 'رابط PDF', 'Drive File ID', 'تاريخ الإدخال'];

// ─────────────────────────────────────────────
// الدالة الرئيسية — شغّلها مرة واحدة فقط
// ─────────────────────────────────────────────
function setupSystem() {
  try {
    Logger.log('=== بدء إعداد النظام ===');

    var ss         = SpreadsheetApp.openById(SPREADSHEET_ID);
    var rootFolder = DriveApp.getFolderById(ROOT_FOLDER_ID);

    // 1. إنشاء ورقة الإعدادات
    _createSettingsSheet(ss);

    // 2. إنشاء المجلدات والأوراق لكل نوع
    for (var i = 0; i < FILE_TYPES.length; i++) {
      var ft = FILE_TYPES[i];

      // إنشاء مجلد في Drive
      _createDriveFolder(rootFolder, ft.name);

      // إنشاء ورقة في Sheets
      _createSheet(ss, ft);

      Logger.log('✅ تم إنشاء: ' + ft.name);
    }

    // 3. حذف الورقة الافتراضية إن وجدت
    var defaultSheet = ss.getSheetByName('Sheet1') || ss.getSheetByName('ورقة1');
    if (defaultSheet && ss.getSheets().length > 1) ss.deleteSheet(defaultSheet);

    Logger.log('=== اكتمل الإعداد بنجاح ===');
    return '✅ تم إعداد النظام بنجاح! ' + FILE_TYPES.length + ' نوع ملف.';

  } catch (e) {
    Logger.log('خطأ: ' + e);
    return '❌ خطأ: ' + e.message;
  }
}

// ─────────────────────────────────────────────
// إنشاء ورقة الإعدادات
// ─────────────────────────────────────────────
function _createSettingsSheet(ss) {
  var sheet = ss.getSheetByName('الإعدادات');
  if (!sheet) sheet = ss.insertSheet('الإعدادات', 0);
  else sheet.clearContents();

  // رأس الجدول
  var headers = ['اسم النوع', 'الأيقونة', 'الحقل الإضافي 1', 'الحقل الإضافي 2', 'مفعّل'];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight('bold')
    .setBackground('#1a3a5c').setFontColor('#ffffff');

  // البيانات
  var rows = FILE_TYPES.map(function (ft) {
    return [ft.name, ft.icon, ft.field1, ft.field2, 'نعم'];
  });
  sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
  sheet.setColumnWidth(1, 180);
  sheet.setColumnWidth(3, 200);
  sheet.setColumnWidth(4, 200);

  Logger.log('✅ ورقة الإعدادات');
}

// ─────────────────────────────────────────────
// إنشاء ورقة لنوع ملف
// ─────────────────────────────────────────────
function _createSheet(ss, ft) {
  var sheet = ss.getSheetByName(ft.name);
  if (!sheet) sheet = ss.insertSheet(ft.name);
  else sheet.clearContents();

  // الأعمدة: ثابتة + خاصة
  var headers = ['رقم القيد', 'التاريخ', 'الموضوع', ft.field1, ft.field2, 'ملاحظات', 'رابط PDF', 'Drive File ID', 'تاريخ الإدخال'];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers])
    .setFontWeight('bold')
    .setBackground('#1a3a5c')
    .setFontColor('#ffffff');

  sheet.setColumnWidth(1, 90);
  sheet.setColumnWidth(2, 110);
  sheet.setColumnWidth(3, 220);
  sheet.setColumnWidth(4, 180);
  sheet.setColumnWidth(5, 180);
  sheet.setColumnWidth(6, 180);
  sheet.setColumnWidth(7, 220);
  sheet.setColumnWidth(8, 160);
  sheet.setColumnWidth(9, 120);

  sheet.setFrozenRows(1);
}

// ─────────────────────────────────────────────
// إنشاء مجلد في Drive
// ─────────────────────────────────────────────
function _createDriveFolder(rootFolder, name) {
  var folders = rootFolder.getFoldersByName(name);
  if (!folders.hasNext()) {
    rootFolder.createFolder(name);
    Logger.log('📁 مجلد جديد: ' + name);
  } else {
    Logger.log('📁 موجود مسبقاً: ' + name);
  }
}

// ─────────────────────────────────────────────
// إضافة نوع ملف جديد (للاستخدام مستقبلاً)
// ─────────────────────────────────────────────
function addNewFileType(name, icon, field1, field2) {
  try {
    var ss         = SpreadsheetApp.openById(SPREADSHEET_ID);
    var rootFolder = DriveApp.getFolderById(ROOT_FOLDER_ID);
    var ft         = { name: name, icon: icon || '📁', field1: field1 || 'الحقل 1', field2: field2 || 'الحقل 2' };

    // إضافة للإعدادات
    var settingsSheet = ss.getSheetByName('الإعدادات');
    settingsSheet.appendRow([ft.name, ft.icon, ft.field1, ft.field2, 'نعم']);

    // إنشاء المجلد والورقة
    _createDriveFolder(rootFolder, ft.name);
    _createSheet(ss, ft);

    return { success: true, message: 'تم إضافة نوع الملف "' + name + '" بنجاح.' };
  } catch (e) {
    return { success: false, message: 'خطأ: ' + e.message };
  }
}
