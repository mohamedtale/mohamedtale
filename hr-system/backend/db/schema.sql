-- HR System Database Schema
-- نظام إدارة الموارد البشرية

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- الأقسام والمكاتب
CREATE TABLE departments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('office', 'dept', 'section')),
    parent_id INTEGER REFERENCES departments(id) ON DELETE SET NULL,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_departments_parent ON departments(parent_id);
CREATE INDEX idx_departments_sort ON departments(sort_order);

-- الموظفون
CREATE TABLE employees (
    id SERIAL PRIMARY KEY,
    emp_number VARCHAR(50) UNIQUE NOT NULL,
    national_id VARCHAR(20),
    full_name VARCHAR(255) NOT NULL,
    gender VARCHAR(10) CHECK (gender IN ('male', 'female')),
    birth_date DATE,
    education_level VARCHAR(100),
    job_title VARCHAR(255),
    department_id INTEGER REFERENCES departments(id) ON DELETE SET NULL,
    contract_type VARCHAR(50) CHECK (contract_type IN ('تعيين', 'عقد دائم', 'عقد مؤقت')),
    start_date DATE,
    grade_level INTEGER CHECK (grade_level BETWEEN 1 AND 14),
    grade_allowance_count INTEGER DEFAULT 0 CHECK (grade_allowance_count BETWEEN 0 AND 5),
    allowance_due_date DATE,
    settlement_date DATE,
    settlement_type VARCHAR(100),
    work_start_time TIME,
    work_end_time TIME,
    no_fingerprint BOOLEAN DEFAULT FALSE,
    leave_balance NUMERIC(5,1) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'leave', 'suspended')),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_employees_dept ON employees(department_id);
CREATE INDEX idx_employees_status ON employees(status);
CREATE INDEX idx_employees_emp_number ON employees(emp_number);
CREATE INDEX idx_employees_national_id ON employees(national_id);
CREATE INDEX idx_employees_allowance_due ON employees(allowance_due_date);

-- الإجازات
CREATE TABLE leaves (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    leave_type VARCHAR(20) NOT NULL CHECK (leave_type IN ('annual', 'emergency', 'sick', 'hajj', 'maternity', 'study')),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    days_count INTEGER NOT NULL,
    reason TEXT,
    residence_during_leave VARCHAR(255),
    balance_before NUMERIC(5,1),
    balance_after NUMERIC(5,1),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    medical_report_path VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_leaves_employee ON leaves(employee_id);
CREATE INDEX idx_leaves_status ON leaves(status);
CREATE INDEX idx_leaves_dates ON leaves(start_date, end_date);
CREATE INDEX idx_leaves_type ON leaves(leave_type);

-- إذونات الخروج
CREATE TABLE exit_permissions (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    permission_date DATE NOT NULL,
    reason TEXT,
    exit_time TIME,
    return_time TIME,
    duration_minutes INTEGER,
    monthly_count INTEGER DEFAULT 1,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_permissions_employee ON exit_permissions(employee_id);
CREATE INDEX idx_permissions_date ON exit_permissions(permission_date);
CREATE INDEX idx_permissions_status ON exit_permissions(status);

-- الحضور والغياب
CREATE TABLE attendance (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    attendance_date DATE NOT NULL,
    entry_time TIME,
    exit_time TIME,
    status VARCHAR(20) DEFAULT 'present' CHECK (status IN ('present', 'absent', 'late', 'leave', 'permission')),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_attendance_employee ON attendance(employee_id);
CREATE INDEX idx_attendance_date ON attendance(attendance_date);
CREATE INDEX idx_attendance_status ON attendance(status);
CREATE UNIQUE INDEX idx_attendance_employee_date ON attendance(employee_id, attendance_date);

-- العلاوات
CREATE TABLE allowances (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    allowance_date DATE NOT NULL,
    grade_before INTEGER,
    allowance_before INTEGER,
    grade_after INTEGER,
    allowance_after INTEGER,
    promotion_eligible BOOLEAN DEFAULT FALSE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved')),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_allowances_employee ON allowances(employee_id);
CREATE INDEX idx_allowances_date ON allowances(allowance_date);
CREATE INDEX idx_allowances_status ON allowances(status);

-- كشوف العلاوات الشهرية
CREATE TABLE monthly_allowance_rosters (
    id SERIAL PRIMARY KEY,
    month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
    year INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'approved')),
    approved_by VARCHAR(255),
    approved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(month, year)
);

CREATE INDEX idx_rosters_month_year ON monthly_allowance_rosters(month, year);

-- بنود كشوف العلاوات
CREATE TABLE monthly_allowance_roster_items (
    id SERIAL PRIMARY KEY,
    roster_id INTEGER NOT NULL REFERENCES monthly_allowance_rosters(id) ON DELETE CASCADE,
    employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    grade_before INTEGER,
    allowance_before INTEGER,
    grade_after INTEGER,
    allowance_after INTEGER,
    promotion_eligible BOOLEAN DEFAULT FALSE,
    notes TEXT
);

CREATE INDEX idx_roster_items_roster ON monthly_allowance_roster_items(roster_id);
CREATE INDEX idx_roster_items_employee ON monthly_allowance_roster_items(employee_id);

-- الوثائق
CREATE TABLE documents (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    doc_type VARCHAR(100),
    doc_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INTEGER,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_documents_employee ON documents(employee_id);
CREATE INDEX idx_documents_type ON documents(doc_type);

-- الإعدادات
CREATE TABLE settings (
    id SERIAL PRIMARY KEY,
    key VARCHAR(100) UNIQUE NOT NULL,
    value TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- القرارات
CREATE TABLE decisions (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    decision_type VARCHAR(100),
    decision_number VARCHAR(100),
    decision_date DATE,
    description TEXT,
    file_path VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_decisions_employee ON decisions(employee_id);
CREATE INDEX idx_decisions_date ON decisions(decision_date);
CREATE INDEX idx_decisions_type ON decisions(decision_type);

-- دالة تحديث updated_at تلقائياً
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON employees
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leaves_updated_at BEFORE UPDATE ON leaves
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_exit_permissions_updated_at BEFORE UPDATE ON exit_permissions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_allowances_updated_at BEFORE UPDATE ON allowances
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- جدول سجل العمليات (Audit Log)
CREATE TABLE IF NOT EXISTS audit_logs (
    id          BIGSERIAL PRIMARY KEY,
    user_id     INTEGER REFERENCES users(id) ON DELETE SET NULL,
    username    VARCHAR(60),
    action      VARCHAR(50) NOT NULL,   -- CREATE / UPDATE / DELETE / LOGIN / LOGOUT / LOGIN_FAIL
    entity      VARCHAR(60),            -- employees / leaves / permissions ...
    entity_id   INTEGER,
    description TEXT,
    ip_address  VARCHAR(45),
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user    ON audit_logs (user_id);

-- جدول المستخدمين
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(60) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    role VARCHAR(20) NOT NULL DEFAULT 'staff' CHECK (role IN ('admin', 'manager', 'staff')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- مستخدم افتراضي: admin / admin123
INSERT INTO users (username, password_hash, full_name, role) VALUES
    ('admin', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'مدير النظام', 'admin')
ON CONFLICT (username) DO NOTHING;

-- إعدادات افتراضية
INSERT INTO settings (key, value) VALUES
    ('organization_name', 'الجهة الحكومية'),
    ('work_start_time', '08:00'),
    ('work_end_time', '14:00'),
    ('annual_leave_days', '30'),
    ('emergency_leave_max_days', '12'),
    ('no_fingerprint_employees', '[]');
