const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const uploadDir = process.env.UPLOAD_DIR || './uploads';

// إنشاء مجلد الرفع إن لم يكن موجوداً
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// إعداد التخزين على القرص
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // توليد اسم فريد للملف باستخدام الوقت والأرقام العشوائية
    const uniqueName = `${Date.now()}-${Math.floor(Math.random() * 1000000000)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

// فلتر قبول ملفات PDF فقط
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('يُسمح فقط برفع ملفات PDF'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 52428800 // 50MB افتراضياً
  }
});

module.exports = upload;
