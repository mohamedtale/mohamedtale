-- HR System Migration v2
-- إضافة أعمدة جديدة للموظفين وتحديث القيود

-- 1. إضافة أعمدة جديدة للموظفين
ALTER TABLE employees ADD COLUMN IF NOT EXISTS section VARCHAR(255);
ALTER TABLE employees ADD COLUMN IF NOT EXISTS manager VARCHAR(255);
ALTER TABLE employees ADD COLUMN IF NOT EXISTS work_location VARCHAR(255);
ALTER TABLE employees ADD COLUMN IF NOT EXISTS current_salary NUMERIC(10,2);
ALTER TABLE employees ADD COLUMN IF NOT EXISTS old_salary NUMERIC(10,2);
ALTER TABLE employees ADD COLUMN IF NOT EXISTS promotion_decision VARCHAR(255);
ALTER TABLE employees ADD COLUMN IF NOT EXISTS financial_notes TEXT;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS evaluation VARCHAR(50);

-- 2. تحديث قيد نوع التعيين
DO $$ BEGIN
  ALTER TABLE employees DROP CONSTRAINT IF EXISTS employees_contract_type_check;
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

ALTER TABLE employees ADD CONSTRAINT employees_contract_type_check
  CHECK (contract_type IN ('تعيين رسمي', 'ندب خارجية', 'ندب داخلي', 'متعاون', 'عقد', 'تعيين', 'عقد دائم', 'عقد مؤقت'));

-- 3. تحديث قيد الحالة الوظيفية
DO $$ BEGIN
  ALTER TABLE employees DROP CONSTRAINT IF EXISTS employees_status_check;
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

ALTER TABLE employees ADD CONSTRAINT employees_status_check
  CHECK (status IN ('active', 'leave', 'suspended', 'مستمر', 'موقوف', 'منتهي بعقد', 'مستقيل', 'متقاعد'));

-- 4. إدراج الإدارات والأقسام
-- الإدارة الأولى: إدارة الشؤون الإدارية والمالية
INSERT INTO departments (name, type, parent_id, sort_order)
SELECT 'إدارة الشؤون الإدارية والمالية', 'dept', NULL, 10
WHERE NOT EXISTS (SELECT 1 FROM departments WHERE name = 'إدارة الشؤون الإدارية والمالية');

-- أقسام إدارة الشؤون الإدارية والمالية
INSERT INTO departments (name, type, parent_id, sort_order)
SELECT 'قسم شؤون العاملين', 'section',
  (SELECT id FROM departments WHERE name = 'إدارة الشؤون الإدارية والمالية' LIMIT 1), 11
WHERE NOT EXISTS (SELECT 1 FROM departments WHERE name = 'قسم شؤون العاملين');

INSERT INTO departments (name, type, parent_id, sort_order)
SELECT 'قسم الشؤون المالية', 'section',
  (SELECT id FROM departments WHERE name = 'إدارة الشؤون الإدارية والمالية' LIMIT 1), 12
WHERE NOT EXISTS (SELECT 1 FROM departments WHERE name = 'قسم الشؤون المالية');

INSERT INTO departments (name, type, parent_id, sort_order)
SELECT 'قسم المشتريات', 'section',
  (SELECT id FROM departments WHERE name = 'إدارة الشؤون الإدارية والمالية' LIMIT 1), 13
WHERE NOT EXISTS (SELECT 1 FROM departments WHERE name = 'قسم المشتريات');

INSERT INTO departments (name, type, parent_id, sort_order)
SELECT 'قسم الشؤون الإدارية', 'section',
  (SELECT id FROM departments WHERE name = 'إدارة الشؤون الإدارية والمالية' LIMIT 1), 14
WHERE NOT EXISTS (SELECT 1 FROM departments WHERE name = 'قسم الشؤون الإدارية');

INSERT INTO departments (name, type, parent_id, sort_order)
SELECT 'قسم المخازن', 'section',
  (SELECT id FROM departments WHERE name = 'إدارة الشؤون الإدارية والمالية' LIMIT 1), 15
WHERE NOT EXISTS (SELECT 1 FROM departments WHERE name = 'قسم المخازن');

INSERT INTO departments (name, type, parent_id, sort_order)
SELECT 'قسم الأمن والسلامة', 'section',
  (SELECT id FROM departments WHERE name = 'إدارة الشؤون الإدارية والمالية' LIMIT 1), 16
WHERE NOT EXISTS (SELECT 1 FROM departments WHERE name = 'قسم الأمن والسلامة');

INSERT INTO departments (name, type, parent_id, sort_order)
SELECT 'قسم الاستثمار والتسويق', 'section',
  (SELECT id FROM departments WHERE name = 'إدارة الشؤون الإدارية والمالية' LIMIT 1), 17
WHERE NOT EXISTS (SELECT 1 FROM departments WHERE name = 'قسم الاستثمار والتسويق');

INSERT INTO departments (name, type, parent_id, sort_order)
SELECT 'قسم العقود', 'section',
  (SELECT id FROM departments WHERE name = 'إدارة الشؤون الإدارية والمالية' LIMIT 1), 18
WHERE NOT EXISTS (SELECT 1 FROM departments WHERE name = 'قسم العقود');

-- الإدارة الثانية: إدارة النقل والصيانة
INSERT INTO departments (name, type, parent_id, sort_order)
SELECT 'إدارة النقل والصيانة', 'dept', NULL, 20
WHERE NOT EXISTS (SELECT 1 FROM departments WHERE name = 'إدارة النقل والصيانة');

INSERT INTO departments (name, type, parent_id, sort_order)
SELECT 'قسم الحركة وصيانة الآليات', 'section',
  (SELECT id FROM departments WHERE name = 'إدارة النقل والصيانة' LIMIT 1), 21
WHERE NOT EXISTS (SELECT 1 FROM departments WHERE name = 'قسم الحركة وصيانة الآليات');

INSERT INTO departments (name, type, parent_id, sort_order)
SELECT 'قسم صيانة الحفارات', 'section',
  (SELECT id FROM departments WHERE name = 'إدارة النقل والصيانة' LIMIT 1), 22
WHERE NOT EXISTS (SELECT 1 FROM departments WHERE name = 'قسم صيانة الحفارات');

-- الإدارة الثالثة: إدارة الشؤون الفنية
INSERT INTO departments (name, type, parent_id, sort_order)
SELECT 'إدارة الشؤون الفنية', 'dept', NULL, 30
WHERE NOT EXISTS (SELECT 1 FROM departments WHERE name = 'إدارة الشؤون الفنية');

INSERT INTO departments (name, type, parent_id, sort_order)
SELECT 'قسم المشروعات', 'section',
  (SELECT id FROM departments WHERE name = 'إدارة الشؤون الفنية' LIMIT 1), 31
WHERE NOT EXISTS (SELECT 1 FROM departments WHERE name = 'قسم المشروعات');

INSERT INTO departments (name, type, parent_id, sort_order)
SELECT 'قسم الحفر', 'section',
  (SELECT id FROM departments WHERE name = 'إدارة الشؤون الفنية' LIMIT 1), 32
WHERE NOT EXISTS (SELECT 1 FROM departments WHERE name = 'قسم الحفر');

INSERT INTO departments (name, type, parent_id, sort_order)
SELECT 'قسم صيانة الآبار', 'section',
  (SELECT id FROM departments WHERE name = 'إدارة الشؤون الفنية' LIMIT 1), 33
WHERE NOT EXISTS (SELECT 1 FROM departments WHERE name = 'قسم صيانة الآبار');

-- المكاتب المستقلة
INSERT INTO departments (name, type, parent_id, sort_order)
SELECT 'المكاتب المستقلة', 'dept', NULL, 40
WHERE NOT EXISTS (SELECT 1 FROM departments WHERE name = 'المكاتب المستقلة');

INSERT INTO departments (name, type, parent_id, sort_order)
SELECT 'مدير مكتب مدير عام الجهاز', 'office',
  (SELECT id FROM departments WHERE name = 'المكاتب المستقلة' LIMIT 1), 41
WHERE NOT EXISTS (SELECT 1 FROM departments WHERE name = 'مدير مكتب مدير عام الجهاز');

INSERT INTO departments (name, type, parent_id, sort_order)
SELECT 'مدير مكتب الشؤون القانونية', 'office',
  (SELECT id FROM departments WHERE name = 'المكاتب المستقلة' LIMIT 1), 42
WHERE NOT EXISTS (SELECT 1 FROM departments WHERE name = 'مدير مكتب الشؤون القانونية');

INSERT INTO departments (name, type, parent_id, sort_order)
SELECT 'مكتب المراجعة الداخلية', 'office',
  (SELECT id FROM departments WHERE name = 'المكاتب المستقلة' LIMIT 1), 43
WHERE NOT EXISTS (SELECT 1 FROM departments WHERE name = 'مكتب المراجعة الداخلية');

INSERT INTO departments (name, type, parent_id, sort_order)
SELECT 'مكتب التدريب والتطوير', 'office',
  (SELECT id FROM departments WHERE name = 'المكاتب المستقلة' LIMIT 1), 44
WHERE NOT EXISTS (SELECT 1 FROM departments WHERE name = 'مكتب التدريب والتطوير');

INSERT INTO departments (name, type, parent_id, sort_order)
SELECT 'مكتب الإعلام والتوثيق', 'office',
  (SELECT id FROM departments WHERE name = 'المكاتب المستقلة' LIMIT 1), 45
WHERE NOT EXISTS (SELECT 1 FROM departments WHERE name = 'مكتب الإعلام والتوثيق');

INSERT INTO departments (name, type, parent_id, sort_order)
SELECT 'مكتب شؤون الفروع', 'office',
  (SELECT id FROM departments WHERE name = 'المكاتب المستقلة' LIMIT 1), 46
WHERE NOT EXISTS (SELECT 1 FROM departments WHERE name = 'مكتب شؤون الفروع');

INSERT INTO departments (name, type, parent_id, sort_order)
SELECT 'مكتب التخطيط والمتابعة', 'office',
  (SELECT id FROM departments WHERE name = 'المكاتب المستقلة' LIMIT 1), 47
WHERE NOT EXISTS (SELECT 1 FROM departments WHERE name = 'مكتب التخطيط والمتابعة');

-- تحديث قيد نوع القسم للسماح بـ office
DO $$ BEGIN
  ALTER TABLE departments DROP CONSTRAINT IF EXISTS departments_type_check;
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

ALTER TABLE departments ADD CONSTRAINT departments_type_check
  CHECK (type IN ('office', 'dept', 'section'));

SELECT 'Migration v2 completed successfully' AS result;
