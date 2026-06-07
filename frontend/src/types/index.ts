export type Role = 'system_admin' | 'department_manager' | 'section_head' | 'employee';

export interface User {
  id: string;
  username: string;
  email: string;
  full_name_ar: string;
  full_name_en?: string;
  role: Role;
  section?: string;
  is_active: boolean;
  last_login?: string;
  created_at: string;
}

export type WellStatus = 'active' | 'inactive' | 'under_maintenance' | 'drilling' | 'suspended' | 'abandoned';
export type WellType = 'artesian' | 'semi_artesian' | 'drilled' | 'dug' | 'spring';
export type WaterQuality = 'excellent' | 'good' | 'acceptable' | 'poor';

export interface Well {
  id: string;
  well_code: string;
  name_ar: string;
  name_en?: string;
  well_type: WellType;
  status: WellStatus;
  latitude?: number;
  longitude?: number;
  region?: string;
  municipality?: string;
  depth_meters?: number;
  diameter_mm?: number;
  water_level_meters?: number;
  discharge_rate_m3h?: number;
  water_quality?: WaterQuality;
  ec_microsiemens?: number;
  ph_value?: number;
  tds_mg_l?: number;
  drilling_date?: string;
  last_maintenance_date?: string;
  next_maintenance_date?: string;
  contractor_name?: string;
  contract_number?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export type ReportType = 'weekly' | 'monthly' | 'annual' | 'technical' | 'maintenance';
export type ReportStatus = 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected';

export interface Report {
  id: string;
  report_type: ReportType;
  title_ar: string;
  title_en?: string;
  report_date: string;
  period_start?: string;
  period_end?: string;
  section?: string;
  well_id?: string;
  well_name?: string;
  content?: Record<string, unknown>;
  summary_ar?: string;
  summary_en?: string;
  status: ReportStatus;
  created_by?: string;
  created_by_name?: string;
  approved_by?: string;
  created_at: string;
  updated_at: string;
}

export type WorkflowStatus = 'submitted' | 'under_review' | 'approved' | 'rejected' | 'returned';
export type WorkflowPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface WorkflowStep {
  id: string;
  workflow_id: string;
  step_number: number;
  action: string;
  actor_id?: string;
  actor_name?: string;
  comment?: string;
  created_at: string;
}

export interface Workflow {
  id: string;
  title_ar: string;
  title_en?: string;
  workflow_type: string;
  entity_type?: string;
  entity_id?: string;
  current_status: WorkflowStatus;
  priority: WorkflowPriority;
  submitted_by?: string;
  submitted_by_name?: string;
  assigned_to?: string;
  assigned_to_name?: string;
  description_ar?: string;
  description_en?: string;
  due_date?: string;
  steps?: WorkflowStep[];
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  user_id?: string;
  username?: string;
  full_name_ar?: string;
  action: string;
  entity_type?: string;
  entity_id?: string;
  old_values?: Record<string, unknown>;
  new_values?: Record<string, unknown>;
  ip_address?: string;
  created_at: string;
}

export interface MaintenanceRecord {
  id: string;
  well_id: string;
  maintenance_type: string;
  description_ar?: string;
  start_date: string;
  end_date?: string;
  cost?: number;
  contractor_name?: string;
  technician_name?: string;
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled';
  notes?: string;
  created_at: string;
}

export interface DashboardStats {
  total: string;
  active: string;
  inactive: string;
  under_maintenance: string;
  drilling: string;
  suspended: string;
  avg_depth: string;
  avg_discharge: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message_ar?: string;
}
