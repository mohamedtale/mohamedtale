// معالج الأخطاء العام للتطبيق
const errorHandler = (err, req, res, next) => {
  console.error('خطأ في التطبيق:', err.stack || err.message);

  // خطأ رفع الملفات
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      success: false,
      error: 'حجم الملف يتجاوز الحد المسموح به (50 ميجابايت)'
    });
  }

  if (err.message === 'يُسمح فقط برفع ملفات PDF') {
    return res.status(400).json({
      success: false,
      error: err.message
    });
  }

  // أخطاء قاعدة البيانات
  if (err.code === '23505') {
    return res.status(409).json({
      success: false,
      error: 'البيانات موجودة مسبقاً - تعارض في القيم الفريدة'
    });
  }

  if (err.code === '23503') {
    return res.status(400).json({
      success: false,
      error: 'البيانات المرجعية غير موجودة'
    });
  }

  if (err.code === '23514') {
    return res.status(400).json({
      success: false,
      error: 'البيانات المدخلة لا تستوفي الشروط المطلوبة'
    });
  }

  // الخطأ الافتراضي
  const statusCode = err.statusCode || err.status || 500;
  res.status(statusCode).json({
    success: false,
    error: err.message || 'حدث خطأ داخلي في الخادم'
  });
};

module.exports = errorHandler;
