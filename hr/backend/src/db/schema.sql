-- HR Management System Database Schema

CREATE TABLE IF NOT EXISTS hr_users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'admin',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS employees (
  id SERIAL PRIMARY KEY,
  job_id VARCHAR(50) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  national_id VARCHAR(100),
  leave_balance DECIMAL(5,1) DEFAULT 30,
  qualification VARCHAR(255),
  job_title VARCHAR(255),
  department VARCHAR(255),
  section VARCHAR(255),
  direct_manager VARCHAR(255),
  hire_date DATE,
  grade VARCHAR(50),
  work_location VARCHAR(255),
  contract_type VARCHAR(100) DEFAULT 'تعيين رسمي',
  emp_status VARCHAR(100) DEFAULT 'مستمر',
  due_date DATE,
  current_salary DECIMAL(12,2),
  admin_notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS leaves (
  id SERIAL PRIMARY KEY,
  employee_id INTEGER REFERENCES employees(id) ON DELETE CASCADE,
  job_id VARCHAR(50),
  leave_type VARCHAR(100) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  days_count INTEGER NOT NULL,
  reason TEXT,
  status VARCHAR(50) DEFAULT 'معلق',
  decision_note TEXT,
  decided_by VARCHAR(255),
  decided_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS attendance (
  id SERIAL PRIMARY KEY,
  employee_id INTEGER REFERENCES employees(id) ON DELETE CASCADE,
  job_id VARCHAR(50),
  att_date DATE NOT NULL,
  check_in TIME,
  check_out TIME,
  status VARCHAR(50) DEFAULT 'حضر',
  total_hours DECIMAL(5,2),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(job_id, att_date)
);

CREATE TABLE IF NOT EXISTS exit_permissions (
  id SERIAL PRIMARY KEY,
  employee_id INTEGER REFERENCES employees(id) ON DELETE CASCADE,
  job_id VARCHAR(50),
  perm_date DATE NOT NULL,
  perm_type VARCHAR(100) DEFAULT 'شخصي',
  check_out TIME,
  check_in TIME,
  duration_minutes INTEGER,
  notes TEXT,
  recorded_by VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS documents (
  id SERIAL PRIMARY KEY,
  employee_id INTEGER REFERENCES employees(id) ON DELETE CASCADE,
  job_id VARCHAR(50),
  employee_name VARCHAR(255),
  department VARCHAR(255),
  doc_type VARCHAR(255) NOT NULL,
  doc_date DATE,
  exp_date DATE,
  file_name VARCHAR(500),
  file_path VARCHAR(500),
  file_size BIGINT,
  file_mime VARCHAR(255),
  is_secret BOOLEAN DEFAULT FALSE,
  notes TEXT,
  uploaded_by VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_employees_job_id ON employees(job_id);
CREATE INDEX IF NOT EXISTS idx_employees_department ON employees(department);
CREATE INDEX IF NOT EXISTS idx_leaves_employee_id ON leaves(employee_id);
CREATE INDEX IF NOT EXISTS idx_leaves_status ON leaves(status);
CREATE INDEX IF NOT EXISTS idx_attendance_job_id ON attendance(job_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(att_date);
CREATE INDEX IF NOT EXISTS idx_documents_job_id ON documents(job_id);
CREATE INDEX IF NOT EXISTS idx_exit_permissions_job_id ON exit_permissions(job_id);
