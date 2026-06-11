-- بيانات تجريبية لنظام إدارة الموارد البشرية

-- الأقسام والمكاتب والشعب
INSERT INTO departments (id, name, type, parent_id, sort_order) VALUES
(1, 'إدارة الموارد البشرية', 'office', NULL, 1),
(2, 'إدارة الشؤون المالية', 'office', NULL, 2),
(3, 'قسم التوظيف والتعيين', 'dept', 1, 1),
(4, 'قسم الرواتب والمزايا', 'dept', 2, 1),
(5, 'قسم التدريب والتطوير', 'dept', 1, 2),
(6, 'شعبة شؤون الموظفين', 'section', 3, 1),
(7, 'شعبة الأرشيف والتوثيق', 'section', 3, 2);

-- إعادة تعيين التسلسل
SELECT setval('departments_id_seq', 7);

-- الموظفون
INSERT INTO employees (
  emp_number, national_id, full_name, gender, birth_date,
  education_level, job_title, department_id, contract_type,
  start_date, grade_level, grade_allowance_count, allowance_due_date,
  settlement_date, settlement_type, work_start_time, work_end_time,
  no_fingerprint, leave_balance, status, notes
) VALUES
(
  'EMP001', '101234567890', 'أحمد محمد الزروق', 'male', '1980-05-15',
  'بكالوريوس إدارة أعمال', 'مدير الموارد البشرية', 1, 'تعيين',
  '2010-03-01', 12, 2, '2026-04-01',
  NULL, NULL, '08:00', '15:00',
  FALSE, 45, 'active', 'موظف متميز'
),
(
  'EMP002', '201345678901', 'فاطمة علي البوسيفي', 'female', '1985-09-22',
  'بكالوريوس محاسبة', 'محاسبة أول', 4, 'تعيين',
  '2012-07-15', 10, 3, '2026-08-01',
  NULL, NULL, '08:00', '15:00',
  FALSE, 38, 'active', NULL
),
(
  'EMP003', '301456789012', 'محمد سالم الورفلي', 'male', '1978-12-03',
  'ماجستير قانون', 'مستشار قانوني', 1, 'عقد دائم',
  '2008-01-10', 13, 1, '2026-02-01',
  '2015-06-01', 'ترقية', '08:00', '15:00',
  FALSE, 45, 'active', NULL
),
(
  'EMP004', '401567890123', 'عائشة خالد المريمي', 'female', '1990-03-17',
  'بكالوريوس علم نفس', 'أخصائية موارد بشرية', 3, 'تعيين',
  '2015-09-01', 8, 4, '2026-10-01',
  NULL, NULL, '08:00', '15:00',
  FALSE, 42, 'active', NULL
),
(
  'EMP005', '501678901234', 'عمر إبراهيم الشريف', 'male', '1983-07-28',
  'بكالوريوس تقنية معلومات', 'مختص تقنية معلومات', 2, 'عقد دائم',
  '2011-04-20', 9, 2, '2026-05-01',
  NULL, NULL, '08:00', '15:00',
  TRUE, 45, 'active', 'يعمل عن بعد بعض الأيام'
),
(
  'EMP006', '601789012345', 'مريم عبدالله الطرابلسي', 'female', '1992-11-05',
  'بكالوريوس لغة عربية', 'سكرتيرة تنفيذية', 6, 'عقد مؤقت',
  '2020-01-15', 6, 1, '2026-02-01',
  NULL, NULL, '08:00', '15:00',
  FALSE, 30, 'active', NULL
),
(
  'EMP007', '701890123456', 'يوسف مصطفى الغرياني', 'male', '1975-06-14',
  'دكتوراه إدارة عامة', 'رئيس قسم التدريب', 5, 'تعيين',
  '2005-10-01', 14, 0, '2026-11-01',
  '2020-03-15', 'علاوة', '08:00', '15:00',
  FALSE, 45, 'active', 'مسؤول برامج التدريب السنوية'
),
(
  'EMP008', '801901234567', 'سارة رمضان الكيلاني', 'female', '1995-02-20',
  'بكالوريوس إدارة مكتبية', 'موظفة أرشيف', 7, 'عقد مؤقت',
  '2022-06-01', 4, 0, '2026-07-01',
  NULL, NULL, '08:00', '15:00',
  FALSE, 20, 'leave', 'في إجازة أمومة'
);

-- إعدادات النظام الأساسية
INSERT INTO settings (key, value) VALUES
('org_name', 'وزارة الخدمة المدنية - الجماهيرية العربية الليبية'),
('org_logo', ''),
('work_start_time', '08:00'),
('work_end_time', '15:00'),
('annual_leave_days', '45'),
('emergency_leave_max_days', '12'),
('late_tolerance_minutes', '15'),
('no_fingerprint_employees', '[]'),
('fiscal_year_start_month', '1');

-- إجازة نموذجية للموظفة سارة (EMP008) - إجازة أمومة
INSERT INTO leaves (
  employee_id, leave_type, start_date, end_date, days_count,
  reason, residence_during_leave, balance_before, balance_after, status
) VALUES (
  8, 'maternity', '2026-04-01', '2026-06-28', 90,
  'إجازة الأمومة المقررة قانوناً', 'طرابلس',
  20, 20, 'approved'
);

-- علاوات نموذجية
INSERT INTO allowances (
  employee_id, allowance_date, grade_before, allowance_before,
  grade_after, allowance_after, promotion_eligible, status, notes
) VALUES
(1, '2025-04-01', 12, 1, 12, 2, FALSE, 'approved', 'علاوة سنوية'),
(4, '2025-10-01', 7, 3, 8, 0, TRUE, 'approved', 'ترقية إلى الدرجة الثامنة بعد استيفاء 4 علاوات');
