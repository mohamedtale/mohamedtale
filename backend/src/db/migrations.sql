-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username VARCHAR(100) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name_ar VARCHAR(255) NOT NULL,
  full_name_en VARCHAR(255),
  role VARCHAR(50) NOT NULL CHECK (role IN ('system_admin', 'department_manager', 'section_head', 'employee')),
  section VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Wells table with PostGIS geometry
CREATE TABLE IF NOT EXISTS wells (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  well_code VARCHAR(100) UNIQUE NOT NULL,
  name_ar VARCHAR(255) NOT NULL,
  name_en VARCHAR(255),
  well_type VARCHAR(50) NOT NULL CHECK (well_type IN ('artesian', 'semi_artesian', 'drilled', 'dug', 'spring')),
  status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'under_maintenance', 'drilling', 'suspended', 'abandoned')),
  location GEOMETRY(POINT, 4326),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  region VARCHAR(255),
  municipality VARCHAR(255),
  depth_meters DECIMAL(10, 2),
  diameter_mm DECIMAL(10, 2),
  water_level_meters DECIMAL(10, 2),
  discharge_rate_m3h DECIMAL(10, 2),
  water_quality VARCHAR(50) CHECK (water_quality IN ('excellent', 'good', 'acceptable', 'poor')),
  ec_microsiemens DECIMAL(10, 2),
  ph_value DECIMAL(5, 2),
  tds_mg_l DECIMAL(10, 2),
  drilling_date DATE,
  last_maintenance_date DATE,
  next_maintenance_date DATE,
  contractor_name VARCHAR(255),
  contract_number VARCHAR(100),
  notes TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create spatial index on wells location
CREATE INDEX IF NOT EXISTS wells_location_idx ON wells USING GIST (location);

-- Reports table
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_type VARCHAR(50) NOT NULL CHECK (report_type IN ('weekly', 'monthly', 'annual', 'technical', 'maintenance')),
  title_ar VARCHAR(500) NOT NULL,
  title_en VARCHAR(500),
  report_date DATE NOT NULL,
  period_start DATE,
  period_end DATE,
  section VARCHAR(100),
  well_id UUID REFERENCES wells(id),
  content JSONB,
  summary_ar TEXT,
  summary_en TEXT,
  status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'under_review', 'approved', 'rejected')),
  file_path VARCHAR(500),
  created_by UUID REFERENCES users(id),
  approved_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Workflows table
CREATE TABLE IF NOT EXISTS workflows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title_ar VARCHAR(500) NOT NULL,
  title_en VARCHAR(500),
  workflow_type VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50) CHECK (entity_type IN ('report', 'well', 'maintenance', 'contract')),
  entity_id UUID,
  current_status VARCHAR(50) DEFAULT 'submitted' CHECK (current_status IN ('submitted', 'under_review', 'approved', 'rejected', 'returned')),
  priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  submitted_by UUID REFERENCES users(id),
  assigned_to UUID REFERENCES users(id),
  description_ar TEXT,
  description_en TEXT,
  due_date DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Workflow steps table
CREATE TABLE IF NOT EXISTS workflow_steps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workflow_id UUID REFERENCES workflows(id) ON DELETE CASCADE,
  step_number INTEGER NOT NULL,
  action VARCHAR(50) NOT NULL CHECK (action IN ('submitted', 'reviewed', 'approved', 'rejected', 'returned', 'commented')),
  actor_id UUID REFERENCES users(id),
  comment TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Maintenance records
CREATE TABLE IF NOT EXISTS maintenance_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  well_id UUID REFERENCES wells(id) ON DELETE CASCADE,
  maintenance_type VARCHAR(100) NOT NULL,
  description_ar TEXT,
  description_en TEXT,
  start_date DATE NOT NULL,
  end_date DATE,
  cost DECIMAL(15, 2),
  contractor_name VARCHAR(255),
  technician_name VARCHAR(255),
  status VARCHAR(50) DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'completed', 'cancelled')),
  notes TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Soil and water samples
CREATE TABLE IF NOT EXISTS water_samples (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  well_id UUID REFERENCES wells(id) ON DELETE CASCADE,
  sample_date DATE NOT NULL,
  sample_type VARCHAR(50) CHECK (sample_type IN ('water', 'soil', 'rock')),
  lab_reference VARCHAR(100),
  ph DECIMAL(5, 2),
  ec DECIMAL(10, 2),
  tds DECIMAL(10, 2),
  turbidity DECIMAL(10, 2),
  hardness DECIMAL(10, 2),
  chloride DECIMAL(10, 2),
  sulfate DECIMAL(10, 2),
  nitrate DECIMAL(10, 2),
  iron DECIMAL(10, 2),
  manganese DECIMAL(10, 2),
  results JSONB,
  quality_rating VARCHAR(50),
  notes TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Contracts table
CREATE TABLE IF NOT EXISTS contracts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contract_number VARCHAR(100) UNIQUE NOT NULL,
  title_ar VARCHAR(500) NOT NULL,
  title_en VARCHAR(500),
  contractor_name VARCHAR(255) NOT NULL,
  contractor_code VARCHAR(100),
  contract_type VARCHAR(100),
  well_id UUID REFERENCES wells(id),
  contract_value DECIMAL(15, 2),
  currency VARCHAR(10) DEFAULT 'LYD',
  start_date DATE,
  end_date DATE,
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('draft', 'active', 'completed', 'cancelled', 'suspended')),
  description TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Audit logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(100),
  entity_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_wells_status ON wells(status);
CREATE INDEX IF NOT EXISTS idx_wells_municipality ON wells(municipality);
CREATE INDEX IF NOT EXISTS idx_reports_type ON reports(report_type);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_workflows_status ON workflows(current_status);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at);

-- Insert demo admin user (password: admin123)
-- Hash generated by bcryptjs with saltRounds=12
INSERT INTO users (id, username, email, password_hash, full_name_ar, full_name_en, role, is_active)
VALUES (
  uuid_generate_v4(),
  'admin',
  'admin@water.gov.ly',
  '$2a$12$DV0pbTzmoizZ06gZO6P6eOnIVMsC5dMk5aSfcZD6vBDevLbqKzG/y',
  'مدير النظام',
  'System Administrator',
  'system_admin',
  true
) ON CONFLICT (username) DO UPDATE SET password_hash = EXCLUDED.password_hash;

-- Insert demo manager (password: manager123)
INSERT INTO users (id, username, email, password_hash, full_name_ar, full_name_en, role, section, is_active)
VALUES (
  uuid_generate_v4(),
  'manager',
  'manager@water.gov.ly',
  '$2a$12$nLI3hC/RUtzXvRRtveK5XeFPf32LlO17QNAm5WO8r3fpnGlmsSauO',
  'مدير القسم',
  'Department Manager',
  'department_manager',
  'wells_map',
  true
) ON CONFLICT (username) DO UPDATE SET password_hash = EXCLUDED.password_hash;

-- Insert demo employee (password: employee123)
INSERT INTO users (id, username, email, password_hash, full_name_ar, full_name_en, role, section, is_active)
VALUES (
  uuid_generate_v4(),
  'employee',
  'employee@water.gov.ly',
  '$2a$12$Y5UeMpb/iQQjsSpSHNCJ6ewsM7uzBFtq0yrpdi0Mk3bRTJkEehMxu',
  'موظف',
  'Employee',
  'employee',
  'technical_reports',
  true
) ON CONFLICT (username) DO UPDATE SET password_hash = EXCLUDED.password_hash;

-- Insert sample wells in Libya
INSERT INTO wells (well_code, name_ar, name_en, well_type, status, latitude, longitude, location, region, municipality, depth_meters, diameter_mm, water_level_meters, discharge_rate_m3h, water_quality, ec_microsiemens, ph_value, tds_mg_l, drilling_date, contractor_name)
VALUES
  ('WL-2024-001', 'بئر الجفارة-1', 'Jefara Well-1', 'drilled', 'active', 32.8872, 13.1913, ST_SetSRID(ST_MakePoint(13.1913, 32.8872), 4326), 'منطقة الجفارة', 'طرابلس', 180.5, 250, 45.2, 85.0, 'good', 1250.0, 7.2, 850.0, '2022-03-15', 'شركة الحفر الليبية'),
  ('WL-2024-002', 'بئر الشويرف', 'Shwairif Well', 'artesian', 'active', 32.9512, 13.0234, ST_SetSRID(ST_MakePoint(13.0234, 32.9512), 4326), 'منطقة الشويرف', 'طرابلس', 220.0, 300, 38.5, 120.0, 'excellent', 980.0, 7.5, 620.0, '2021-07-20', 'شركة المياه الجوفية'),
  ('WL-2024-003', 'بئر بني وليد', 'Bani Walid Well', 'semi_artesian', 'under_maintenance', 31.7558, 13.9935, ST_SetSRID(ST_MakePoint(13.9935, 31.7558), 4326), 'منطقة بني وليد', 'بني وليد', 350.0, 200, 120.0, 45.0, 'acceptable', 2100.0, 7.8, 1400.0, '2020-01-10', 'مؤسسة الآبار الوطنية'),
  ('WL-2024-004', 'بئر الزاوية-3', 'Zawiya Well-3', 'drilled', 'active', 32.7522, 12.7278, ST_SetSRID(ST_MakePoint(12.7278, 32.7522), 4326), 'منطقة الزاوية', 'الزاوية', 160.0, 250, 52.0, 95.0, 'good', 1150.0, 7.3, 780.0, '2023-04-05', 'شركة الحفر الليبية'),
  ('WL-2024-005', 'بئر مصراتة-7', 'Misrata Well-7', 'drilled', 'active', 32.3754, 15.0924, ST_SetSRID(ST_MakePoint(15.0924, 32.3754), 4326), 'منطقة مصراتة', 'مصراتة', 290.0, 300, 78.0, 75.0, 'good', 1420.0, 7.1, 920.0, '2022-09-18', 'شركة المياه الجوفية'),
  ('WL-2024-006', 'بئر الخمس', 'Khoms Well', 'artesian', 'inactive', 32.6494, 14.2619, ST_SetSRID(ST_MakePoint(14.2619, 32.6494), 4326), 'منطقة الخمس', 'الخمس', 410.0, 350, 95.0, 0.0, 'poor', 3200.0, 8.1, 2100.0, '2019-11-30', 'مؤسسة الآبار الوطنية'),
  ('WL-2024-007', 'بئر العجيلات', 'Ajaylat Well', 'drilled', 'active', 32.7731, 11.9856, ST_SetSRID(ST_MakePoint(11.9856, 32.7731), 4326), 'منطقة العجيلات', 'العجيلات', 140.0, 200, 35.0, 110.0, 'excellent', 850.0, 7.4, 580.0, '2023-06-22', 'شركة الحفر الليبية'),
  ('WL-2024-008', 'بئر غريان', 'Gharyan Well', 'semi_artesian', 'drilling', 32.1741, 13.0197, ST_SetSRID(ST_MakePoint(13.0197, 32.1741), 4326), 'منطقة غريان', 'غريان', 0.0, 250, 0.0, 0.0, 'acceptable', 0.0, 0.0, 0.0, NULL, 'شركة المياه الجوفية'),
  ('WL-2024-009', 'بئر الرجبان', 'Rajban Well', 'drilled', 'active', 31.5467, 11.9812, ST_SetSRID(ST_MakePoint(11.9812, 31.5467), 4326), 'منطقة نالوت', 'نالوت', 520.0, 200, 185.0, 35.0, 'good', 1680.0, 7.6, 1120.0, '2021-02-14', 'مؤسسة الآبار الوطنية'),
  ('WL-2024-010', 'بئر ترهونة', 'Tarhuna Well', 'drilled', 'active', 32.4347, 13.6356, ST_SetSRID(ST_MakePoint(13.6356, 32.4347), 4326), 'منطقة ترهونة', 'ترهونة', 195.0, 250, 62.0, 88.0, 'good', 1320.0, 7.2, 870.0, '2022-12-01', 'شركة الحفر الليبية')
ON CONFLICT (well_code) DO NOTHING;

-- Insert sample maintenance records
INSERT INTO maintenance_records (well_id, maintenance_type, description_ar, start_date, end_date, status, cost)
SELECT w.id, 'صيانة دورية', 'صيانة دورية للمضخات والمعدات', '2024-01-15', '2024-01-20', 'completed', 15000.00
FROM wells w WHERE w.well_code = 'WL-2024-001'
ON CONFLICT DO NOTHING;

-- Insert sample workflow
INSERT INTO workflows (title_ar, title_en, workflow_type, entity_type, current_status, priority, description_ar)
SELECT 'طلب صيانة بئر الجفارة-1', 'Jefara Well-1 Maintenance Request', 'maintenance_request', 'maintenance', 'under_review', 'high', 'يحتاج البئر إلى صيانة عاجلة للمضخة الرئيسية'
WHERE NOT EXISTS (SELECT 1 FROM workflows LIMIT 1);
