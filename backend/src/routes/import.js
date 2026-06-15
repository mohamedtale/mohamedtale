const express = require('express');
const multer = require('multer');
const XLSX = require('xlsx');
const { query } = require('../config/database');
const { authenticate } = require('../middleware/auth');
const { requireMinRole } = require('../middleware/rbac');

const router = express.Router();

// Use memory storage - don't save to disk
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      file.mimetype === 'application/vnd.ms-excel' ||
      file.originalname.endsWith('.xlsx') ||
      file.originalname.endsWith('.xls')
    ) {
      cb(null, true);
    } else {
      cb(new Error('Only Excel files (.xls, .xlsx) are allowed'));
    }
  }
});

/**
 * Parse a numeric value from a cell that may contain Arabic text.
 * Returns null for non-numeric / known Arabic placeholders.
 */
function parseNumeric(val) {
  if (val === null || val === undefined || val === '') return null;
  const s = String(val).trim();
  if (!s) return null;
  // Known non-numeric Arabic strings
  const invalid = ['بدون تحليل', 'غير منتج', 'لاتوجد بيانات', 'لا توجد بيانات', 'غير متوفر', '-', '—', 'N/A'];
  for (const inv of invalid) {
    if (s.includes(inv)) return null;
  }
  const n = parseFloat(s.replace(/,/g, ''));
  return isNaN(n) ? null : n;
}

/**
 * Map Arabic water quality text to enum value.
 */
function mapWaterQuality(val) {
  if (!val) return null;
  const s = String(val).trim();
  if (s.includes('ملوث') || s.includes('غير صالح')) return 'poor';
  if (s.includes('ممتاز') || s.includes('ممتازة')) return 'excellent';
  if (s.includes('صالحة للشرب') || s.includes('صالح للشرب') || s.includes('جيد')) return 'good';
  if (s) return 'acceptable';
  return null;
}

/**
 * Determine well status from notes.
 */
function mapStatus(notes) {
  if (notes && String(notes).includes('غير منتج')) return 'inactive';
  return 'active';
}

/**
 * Determine well type from drilling method.
 */
function mapWellType(drillingMethod) {
  if (drillingMethod && String(drillingMethod).includes('ارتوازي')) return 'artesian';
  return 'drilled';
}

/**
 * Parse coordinate - returns null for "لاتوجد بيانات" or non-numeric.
 */
function parseCoord(val) {
  if (!val) return null;
  const s = String(val).trim();
  if (s.includes('لاتوجد') || s.includes('لا توجد') || s.includes('لاتوفر')) return null;
  const n = parseFloat(s);
  return isNaN(n) ? null : n;
}

// POST /api/import/wells
router.post('/wells', authenticate, requireMinRole('section_head'), upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  let imported = 0;
  let skipped = 0;
  const errors = [];

  try {
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    // Convert to array of arrays (raw rows); headers in row 0
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

    if (rows.length < 2) {
      return res.status(400).json({ error: 'Excel file has no data rows', imported: 0, skipped: 0, errors: [] });
    }

    // Skip header row (index 0), process from index 1
    const dataRows = rows.slice(1);

    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i];
      const rowNum = i + 2; // 1-based Excel row (row 1 = header)

      try {
        // Column mapping (0-based index):
        // 0: ر.ت, 1: رقم العقد, 2: اسم العقد, 3: الجهة المنفذة,
        // 4: الموقع, 5: رقم البئر, 6: العمق الكلي, 7: طريقة الحفر,
        // 8: نوع وطول انبوب الوقاية, 9: نوع وطول أنابيب التغليف,
        // 10: نوع وطول المصافي, 11: نوع وطول انابيب الرفع,
        // 12: قوة المضخة, 13: مجموع الأملاح الذائبة,
        // 14: العسر الكلي, 15: نوع المياة,
        // 16: مستوى الماء الساكن, 17: مستوى الماء المتحرك,
        // 18: الإنتاجية, 19: قيمة العقد,
        // 20: X (longitude), 21: Y (latitude), 22: ملاحظات

        const contractNumber = String(row[1] || '').trim();
        const contractName   = String(row[2] || '').trim();
        const contractor     = String(row[3] || '').trim();
        const location       = String(row[4] || '').trim();
        const wellNumber     = String(row[5] || '').trim();
        const totalDepth     = parseNumeric(row[6]);
        const drillingMethod = String(row[7] || '').trim();
        // columns 8-12 are pipe/pump descriptions - store in notes or ignore
        const tds            = parseNumeric(row[13]);
        const hardness       = parseNumeric(row[14]);
        const waterType      = String(row[15] || '').trim();
        const staticLevel    = parseNumeric(row[16]);
        const dynamicLevel   = parseNumeric(row[17]);
        const productivity   = parseNumeric(row[18]);
        const contractValue  = parseNumeric(row[19]);
        const longitude      = parseCoord(row[20]);
        const latitude       = parseCoord(row[21]);
        const notes          = String(row[22] || '').trim();

        // Skip completely empty rows
        if (!contractName && !wellNumber && !contractNumber && !location) {
          skipped++;
          continue;
        }

        // Generate well_code
        let wellCode;
        if (wellNumber) {
          wellCode = wellNumber;
        } else if (contractNumber) {
          wellCode = contractNumber;
        } else {
          wellCode = `IMPORT-${Date.now()}-${rowNum}`;
        }

        // Check if well_code already exists
        const existing = await query('SELECT id FROM wells WHERE well_code = $1', [wellCode]);
        if (existing.rows.length > 0) {
          // Make it unique by appending row number
          wellCode = `${wellCode}-R${rowNum}`;
        }

        const nameAr       = contractName || wellCode;
        const status       = mapStatus(notes);
        const wellType     = mapWellType(drillingMethod);
        const waterQuality = mapWaterQuality(waterType);

        // Build extra notes including pipe/pump info
        const pipeInfo = [
          row[8] ? `انبوب الوقاية: ${row[8]}` : '',
          row[9] ? `أنابيب التغليف: ${row[9]}` : '',
          row[10] ? `المصافي: ${row[10]}` : '',
          row[11] ? `انابيب الرفع: ${row[11]}` : '',
          row[12] ? `قوة المضخة: ${row[12]}` : '',
          contractValue ? `قيمة العقد: ${contractValue}` : '',
          hardness ? `العسر الكلي: ${hardness}` : '',
          notes || '',
        ].filter(Boolean).join(' | ');

        await query(
          `INSERT INTO wells (
            well_code, name_ar, well_type, status,
            latitude, longitude,
            region, municipality,
            depth_meters,
            discharge_rate_m3h,
            water_quality,
            tds_mg_l,
            water_level_meters,
            contractor_name,
            contract_number,
            notes,
            created_at, updated_at
          ) VALUES (
            $1, $2, $3, $4,
            $5, $6,
            $7, $8,
            $9,
            $10,
            $11,
            $12,
            $13,
            $14,
            $15,
            $16,
            NOW(), NOW()
          )`,
          [
            wellCode,
            nameAr,
            wellType,
            status,
            latitude,
            longitude,
            location,    // region
            location,    // municipality (same source)
            totalDepth,
            productivity,
            waterQuality,
            tds,
            staticLevel,
            contractor || null,
            contractNumber || null,
            pipeInfo || null,
          ]
        );

        imported++;
      } catch (rowErr) {
        console.error(`Row ${rowNum} error:`, rowErr.message);
        errors.push(`سطر ${rowNum}: ${rowErr.message}`);
        skipped++;
      }
    }

    res.json({
      imported,
      skipped,
      errors,
      message: `تم استيراد ${imported} بئر بنجاح، تم تخطي ${skipped} سطر`
    });
  } catch (err) {
    console.error('Import error:', err);
    res.status(500).json({ error: 'Failed to process Excel file', message_ar: 'فشل في معالجة ملف Excel', details: err.message });
  }
});

module.exports = router;
