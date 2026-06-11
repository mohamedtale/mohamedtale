const router = require('express').Router();
const db = require('../db');
const upload = require('../middleware/upload');
const path = require('path');
const fs = require('fs');

router.get('/', async (req, res, next) => {
  const { employee_id } = req.query;
  let q = `SELECT d.*, e.full_name FROM documents d JOIN employees e ON d.employee_id=e.id WHERE 1=1`;
  const params = [];
  if (employee_id) { params.push(employee_id); q += ` AND d.employee_id=$${params.length}`; }
  q += ' ORDER BY d.created_at DESC';
  try {
    const { rows } = await db.query(q, params);
    res.json({ success: true, data: rows });
  } catch (e) { next(e); }
});

router.post('/', upload.single('file'), async (req, res, next) => {
  if (!req.file) return res.status(400).json({ success:false, message:'لم يتم رفع أي ملف' });
  const { employee_id, doc_type, doc_name, notes } = req.body;
  try {
    const { rows } = await db.query(
      `INSERT INTO documents (employee_id,doc_type,doc_name,file_path,file_size,notes)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [employee_id, doc_type, doc_name, req.file.filename, req.file.size, notes||'']
    );
    res.json({ success: true, data: rows[0] });
  } catch (e) { next(e); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const { rows } = await db.query('SELECT file_path FROM documents WHERE id=$1', [req.params.id]);
    if (rows[0]) {
      const filePath = path.join(__dirname, '../uploads', rows[0].file_path);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
    await db.query('DELETE FROM documents WHERE id=$1', [req.params.id]);
    res.json({ success: true });
  } catch (e) { next(e); }
});

router.get('/:id/download', async (req, res, next) => {
  try {
    const { rows } = await db.query('SELECT * FROM documents WHERE id=$1', [req.params.id]);
    if (!rows[0]) return res.status(404).json({ success:false, message:'الملف غير موجود' });
    const filePath = path.join(__dirname, '../uploads', rows[0].file_path);
    res.download(filePath, rows[0].doc_name + '.pdf');
  } catch (e) { next(e); }
});

module.exports = router;
