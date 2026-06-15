const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { pool } = require('../db/pool');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

const UPLOADS_DIR = process.env.UPLOADS_DIR || '/uploads';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(UPLOADS_DIR, req.body.job_id || 'misc');
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const safe = file.originalname.replace(/[^a-zA-Z0-9.؀-ۿ_-]/g, '_');
    cb(null, `${timestamp}_${safe}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }
});

// Search documents
router.get('/', async (req, res) => {
  try {
    const { q, type, status } = req.query;
    let sql = 'SELECT * FROM documents WHERE 1=1';
    const params = [];
    if (q) {
      params.push(`%${q}%`);
      sql += ` AND (employee_name ILIKE $${params.length} OR doc_type ILIKE $${params.length} OR job_id ILIKE $${params.length})`;
    }
    if (type) { params.push(type); sql += ` AND doc_type = $${params.length}`; }
    if (status === 'expiring') {
      sql += ` AND exp_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days'`;
    } else if (status === 'expired') {
      sql += ` AND exp_date < CURRENT_DATE`;
    } else if (status === 'secret') {
      sql += ` AND is_secret = TRUE`;
    }
    sql += ' ORDER BY created_at DESC LIMIT 200';
    const result = await pool.query(sql, params);
    const today = new Date();
    const in30 = new Date(); in30.setDate(in30.getDate() + 30);
    const rows = result.rows.map(d => ({
      ...d,
      is_expiring: d.exp_date && new Date(d.exp_date) > today && new Date(d.exp_date) <= in30,
      is_expired: d.exp_date && new Date(d.exp_date) < today,
      size: d.file_size ? (d.file_size / 1048576).toFixed(1) + ' MB' : '-'
    }));
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'خطأ في البحث' });
  }
});

// Upload document
router.post('/upload', upload.array('files', 10), async (req, res) => {
  try {
    const { job_id, doc_type, doc_date, exp_date, notes, is_secret } = req.body;
    if (!job_id || !doc_type || !req.files?.length) {
      return res.status(400).json({ error: 'الرقم الوظيفي ونوع الوثيقة والملفات مطلوبة' });
    }
    const emp = await pool.query('SELECT * FROM employees WHERE job_id = $1', [job_id]);
    const empName = emp.rows[0]?.full_name || job_id;
    const dept = emp.rows[0]?.department || '';
    const empId = emp.rows[0]?.id || null;

    const inserted = [];
    for (const file of req.files) {
      const result = await pool.query(`
        INSERT INTO documents (employee_id, job_id, employee_name, department, doc_type, doc_date, exp_date,
          file_name, file_path, file_size, file_mime, is_secret, notes, uploaded_by)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) RETURNING id`,
        [empId, job_id, empName, dept, doc_type, doc_date || null, exp_date || null,
         file.originalname, file.path, file.size, file.mimetype,
         is_secret === 'true', notes, req.user.full_name]
      );
      inserted.push(result.rows[0].id);
    }
    res.json({ success: true, msg: `تم رفع ${inserted.length} ملف بنجاح`, ids: inserted });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'خطأ في رفع الملفات' });
  }
});

// Preview/download document
router.get('/:id/file', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM documents WHERE id = $1', [req.params.id]);
    const doc = result.rows[0];
    if (!doc) return res.status(404).json({ error: 'الملف غير موجود' });
    if (!fs.existsSync(doc.file_path)) return res.status(404).json({ error: 'الملف غير موجود على القرص' });
    res.setHeader('Content-Type', doc.file_mime || 'application/octet-stream');
    res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(doc.file_name)}"`);
    fs.createReadStream(doc.file_path).pipe(res);
  } catch (err) {
    res.status(500).json({ error: 'خطأ في تحميل الملف' });
  }
});

// Delete document
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM documents WHERE id=$1 RETURNING file_path', [req.params.id]);
    const doc = result.rows[0];
    if (doc?.file_path && fs.existsSync(doc.file_path)) fs.unlinkSync(doc.file_path);
    res.json({ message: 'تم حذف الوثيقة' });
  } catch (err) {
    res.status(500).json({ error: 'خطأ في الحذف' });
  }
});

module.exports = router;
