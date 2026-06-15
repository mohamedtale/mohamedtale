const router = require('express').Router();
const db = require('../db');
const upload = require('../middleware/upload');
const path = require('path');
const fs = require('fs');
const requireRole = require('../middleware/rbac');

const UPLOAD_DIR = path.resolve(process.env.UPLOAD_DIR || './uploads');

// Prevent path traversal — ensure resolved path stays inside uploads dir
function safeFilePath(filename) {
  const resolved = path.resolve(UPLOAD_DIR, path.basename(filename));
  if (!resolved.startsWith(UPLOAD_DIR + path.sep) && resolved !== UPLOAD_DIR) {
    return null;
  }
  return resolved;
}

router.get('/', async (req, res, next) => {
  const { employee_id } = req.query;
  let q = `SELECT d.id, d.employee_id, d.doc_type, d.doc_name, d.file_size, d.notes, d.created_at, e.full_name
           FROM documents d JOIN employees e ON d.employee_id = e.id WHERE 1=1`;
  const params = [];
  if (employee_id) {
    params.push(parseInt(employee_id, 10));
    if (isNaN(params[0])) return res.status(400).json({ success: false, error: 'معرف موظف غير صالح' });
    q += ` AND d.employee_id = $${params.length}`;
  }
  q += ' ORDER BY d.created_at DESC';
  try {
    const { rows } = await db.query(q, params);
    res.json({ success: true, data: rows });
  } catch (e) { next(e); }
});

router.post('/', upload.single('file'), async (req, res, next) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'لم يتم رفع أي ملف' });
  const { employee_id, doc_type, doc_name, notes } = req.body;
  if (!employee_id || !doc_type || !doc_name) {
    return res.status(400).json({ success: false, message: 'بيانات ناقصة' });
  }
  try {
    const { rows } = await db.query(
      `INSERT INTO documents (employee_id, doc_type, doc_name, file_path, file_size, notes)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, employee_id, doc_type, doc_name, file_size, notes, created_at`,
      [parseInt(employee_id, 10), doc_type.slice(0, 50), doc_name.slice(0, 200), req.file.filename, req.file.size, (notes || '').slice(0, 500)]
    );
    res.json({ success: true, data: rows[0] });
  } catch (e) { next(e); }
});

// Authenticated download — never expose raw file_path to client
router.get('/:id/download', async (req, res, next) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ success: false, error: 'معرف غير صالح' });
  try {
    const { rows } = await db.query('SELECT doc_name, file_path FROM documents WHERE id = $1', [id]);
    if (!rows[0]) return res.status(404).json({ success: false, message: 'الملف غير موجود' });
    const filePath = safeFilePath(rows[0].file_path);
    if (!filePath || !fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: 'الملف غير موجود على الخادم' });
    }
    res.download(filePath, rows[0].doc_name + '.pdf');
  } catch (e) { next(e); }
});

// Only admin/manager can delete documents
router.delete('/:id', requireRole('admin', 'manager'), async (req, res, next) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ success: false, error: 'معرف غير صالح' });
  try {
    const { rows } = await db.query('SELECT file_path FROM documents WHERE id = $1', [id]);
    if (rows[0]) {
      const filePath = safeFilePath(rows[0].file_path);
      if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
    await db.query('DELETE FROM documents WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (e) { next(e); }
});

module.exports = router;
