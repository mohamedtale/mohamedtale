const express = require('express');
const { query } = require('../config/database');
const { authenticate } = require('../middleware/auth');
const { requireMinRole } = require('../middleware/rbac');

const router = express.Router();

// GET /api/wells - List all wells with filters
router.get('/', authenticate, async (req, res) => {
  try {
    const { status, municipality, well_type, search, limit = 100, offset = 0 } = req.query;
    let conditions = [];
    let params = [];
    let idx = 1;

    if (status) { conditions.push(`status = $${idx++}`); params.push(status); }
    if (municipality) { conditions.push(`municipality ILIKE $${idx++}`); params.push(`%${municipality}%`); }
    if (well_type) { conditions.push(`well_type = $${idx++}`); params.push(well_type); }
    if (search) {
      conditions.push(`(name_ar ILIKE $${idx} OR name_en ILIKE $${idx} OR well_code ILIKE $${idx})`);
      params.push(`%${search}%`); idx++;
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    params.push(parseInt(limit), parseInt(offset));

    const result = await query(
      `SELECT id, well_code, name_ar, name_en, well_type, status, latitude, longitude,
              region, municipality, depth_meters, diameter_mm, water_level_meters,
              discharge_rate_m3h, water_quality, ec_microsiemens, ph_value, tds_mg_l,
              drilling_date, last_maintenance_date, next_maintenance_date,
              contractor_name, contract_number, notes, created_at, updated_at
       FROM wells ${where}
       ORDER BY created_at DESC
       LIMIT $${idx++} OFFSET $${idx++}`,
      params
    );

    const countResult = await query(`SELECT COUNT(*) FROM wells ${where}`, params.slice(0, -2));

    res.json({
      wells: result.rows,
      total: parseInt(countResult.rows[0].count),
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error('Get wells error:', error);
    res.status(500).json({ error: 'Server error', message_ar: 'خطأ في الخادم' });
  }
});

// GET /api/wells/stats - Stats summary
router.get('/stats', authenticate, async (req, res) => {
  try {
    const result = await query(`
      SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'active') as active,
        COUNT(*) FILTER (WHERE status = 'inactive') as inactive,
        COUNT(*) FILTER (WHERE status = 'under_maintenance') as under_maintenance,
        COUNT(*) FILTER (WHERE status = 'drilling') as drilling,
        COUNT(*) FILTER (WHERE status = 'suspended') as suspended,
        AVG(depth_meters) FILTER (WHERE depth_meters > 0) as avg_depth,
        AVG(discharge_rate_m3h) FILTER (WHERE discharge_rate_m3h > 0) as avg_discharge
      FROM wells
    `);
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/wells/:id
router.get('/:id', authenticate, async (req, res) => {
  try {
    const result = await query('SELECT * FROM wells WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Well not found', message_ar: 'البئر غير موجود' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/wells - Create well
router.post('/', authenticate, requireMinRole('section_head'), async (req, res) => {
  try {
    const {
      well_code, name_ar, name_en, well_type, status, latitude, longitude,
      region, municipality, depth_meters, diameter_mm, water_level_meters,
      discharge_rate_m3h, water_quality, ec_microsiemens, ph_value, tds_mg_l,
      drilling_date, last_maintenance_date, next_maintenance_date,
      contractor_name, contract_number, notes
    } = req.body;

    if (!well_code || !name_ar || !well_type) {
      return res.status(400).json({ error: 'Required fields missing', message_ar: 'الحقول المطلوبة مفقودة' });
    }

    const locationExpr = (latitude && longitude)
      ? `ST_SetSRID(ST_MakePoint($12, $11), 4326)`
      : 'NULL';

    const result = await query(
      `INSERT INTO wells (well_code, name_ar, name_en, well_type, status, latitude, longitude, location,
        region, municipality, depth_meters, diameter_mm, water_level_meters, discharge_rate_m3h,
        water_quality, ec_microsiemens, ph_value, tds_mg_l, drilling_date, last_maintenance_date,
        next_maintenance_date, contractor_name, contract_number, notes, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,${locationExpr},$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23)
       RETURNING *`,
      [well_code, name_ar, name_en || null, well_type, status || 'active',
       latitude || null, longitude || null,
       region || null, municipality || null,
       depth_meters || null, diameter_mm || null, water_level_meters || null,
       discharge_rate_m3h || null, water_quality || null, ec_microsiemens || null,
       ph_value || null, tds_mg_l || null, drilling_date || null,
       last_maintenance_date || null, next_maintenance_date || null,
       contractor_name || null, contract_number || null, notes || null, req.user.id]
    );

    // Audit log
    try {
      await query(
        'INSERT INTO audit_logs (user_id, action, entity_type, entity_id, new_values) VALUES ($1,$2,$3,$4,$5)',
        [req.user.id, 'create', 'well', result.rows[0].id, JSON.stringify(req.body)]
      );
    } catch (e) {}

    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Well code already exists', message_ar: 'رمز البئر مستخدم بالفعل' });
    }
    console.error('Create well error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/wells/:id - Update well
router.put('/:id', authenticate, requireMinRole('section_head'), async (req, res) => {
  try {
    const { id } = req.params;
    const fields = ['name_ar','name_en','well_type','status','latitude','longitude','region','municipality',
      'depth_meters','diameter_mm','water_level_meters','discharge_rate_m3h','water_quality',
      'ec_microsiemens','ph_value','tds_mg_l','drilling_date','last_maintenance_date',
      'next_maintenance_date','contractor_name','contract_number','notes'];

    const updates = [];
    const params = [];
    let idx = 1;

    fields.forEach(f => {
      if (req.body[f] !== undefined) {
        updates.push(`${f} = $${idx++}`);
        params.push(req.body[f]);
      }
    });

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updates.push(`updated_at = NOW()`);
    params.push(id);

    const result = await query(
      `UPDATE wells SET ${updates.join(', ')} WHERE id = $${idx} RETURNING *`,
      params
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Well not found' });
    }

    try {
      await query(
        'INSERT INTO audit_logs (user_id, action, entity_type, entity_id, new_values) VALUES ($1,$2,$3,$4,$5)',
        [req.user.id, 'update', 'well', id, JSON.stringify(req.body)]
      );
    } catch (e) {}

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/wells/:id
router.delete('/:id', authenticate, requireMinRole('department_manager'), async (req, res) => {
  try {
    const result = await query('DELETE FROM wells WHERE id = $1 RETURNING id, well_code', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Well not found' });
    }
    try {
      await query(
        'INSERT INTO audit_logs (user_id, action, entity_type, entity_id) VALUES ($1,$2,$3,$4)',
        [req.user.id, 'delete', 'well', req.params.id]
      );
    } catch (e) {}
    res.json({ success: true, message_ar: 'تم حذف البئر بنجاح' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/wells/:id/maintenance
router.get('/:id/maintenance', authenticate, async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM maintenance_records WHERE well_id = $1 ORDER BY start_date DESC',
      [req.params.id]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/wells/:id/maintenance
router.post('/:id/maintenance', authenticate, async (req, res) => {
  try {
    const { maintenance_type, description_ar, start_date, end_date, cost, contractor_name, technician_name, status, notes } = req.body;
    const result = await query(
      `INSERT INTO maintenance_records (well_id, maintenance_type, description_ar, start_date, end_date, cost, contractor_name, technician_name, status, notes, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
      [req.params.id, maintenance_type, description_ar || null, start_date, end_date || null,
       cost || null, contractor_name || null, technician_name || null, status || 'planned', notes || null, req.user.id]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
