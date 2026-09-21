// User roles
export type UserRole = 'admin' | 'supervisor' | 'employee';

// Employee availability
export type EmployeeAvailability = 'available' | 'on_leave' | 'busy';

// Employee status
export type EmployeeStatus = 'active' | 'inactive' | 'on_leave';

// Task priority
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

// Task status (workflow order)
export type TaskStatus = 'assigned' | 'accepted' | 'in_progress' | 'completed' | 'verified' | 'closed';

// AI recommendation type
export type RecommendationType = 'task_assignment' | 'workload_rebalance' | 'schedule_optimization';

// AI recommendation status
export type RecommendationStatus = 'pending' | 'approved' | 'modified' | 'rejected';

// AI insight category
export type InsightCategory = 'workload' | 'delay' | 'availability' | 'performance' | 'pattern';

// Insight severity
export type InsightSeverity = 'info' | 'warning' | 'critical';

// Insight status
export type InsightStatus = 'active' | 'acknowledged' | 'resolved';

// Decision type
export type DecisionType = 'approved' | 'modified' | 'rejected';

// Audit action
export type AuditAction = 
  | 'employee_created' | 'employee_updated' | 'employee_viewed'
  | 'task_created' | 'task_assigned' | 'task_accepted' | 'task_started'
  | 'task_completed' | 'task_verified' | 'task_closed'
  | 'recommendation_generated' | 'recommendation_approved' | 'recommendation_rejected' | 'recommendation_modified'
  | 'insight_generated' | 'insight_acknowledged'
  | 'login' | 'logout';

// Database interfaces
export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Department {
  id: string;
  name: string;
  description?: string;
  created_at: string;
}

export interface Employee {
  id: string;
  employee_id: string;
  user_id?: string;
  name: string;
  email?: string;
  phone?: string;
  department_id: string;
  role: string;
  skills: string[];
  location?: string;
  availability: EmployeeAvailability;
  joining_date?: string;
  status: EmployeeStatus;
  supervisor_id?: string;
  created_at: string;
  updated_at: string;
  // Joined fields
  department?: Department;
}

export interface Task {
  id: string;
  task_id: string;
  title: string;
  description?: string;
  category: string;
  location?: string;
  priority: TaskPriority;
  assigned_employee_id?: string;
  created_by: string;
  created_at: string;
  due_date?: string;
  status: TaskStatus;
  completion_notes?: string;
  evidence_url?: string;
  verified_by?: string;
  verified_at?: string;
  updated_at: string;
  // Joined fields
  assigned_employee?: Employee;
  creator?: Profile;
}

export interface TaskUpdate {
  id: string;
  task_id: string;
  previous_status?: string;
  new_status: string;
  updated_by: string;
  notes?: string;
  created_at: string;
  // Joined
  updater?: Profile;
}

export interface AIRecommendation {
  id: string;
  type: RecommendationType;
  title: string;
  description?: string;
  recommendation: string;
  factors: Record<string, any>;
  confidence: number;
  related_task_id?: string;
  recommended_employee_id?: string;
  status: RecommendationStatus;
  generated_at: string;
  created_at: string;
  // Joined
  related_task?: Task;
  recommended_employee?: Employee;
  decision?: HumanDecision;
}

export interface AIInsight {
  id: string;
  category: InsightCategory;
  title: string;
  description: string;
  severity: InsightSeverity;
  data_factors: Record<string, any>;
  affected_employees: string[];
  affected_tasks: string[];
  status: InsightStatus;
  generated_at: string;
  created_at: string;
  // Joined
  decision?: HumanDecision;
}

export interface HumanDecision {
  id: string;
  recommendation_id?: string;
  insight_id?: string;
  decision: DecisionType;
  decision_by: string;
  decision_reason?: string;
  modifications?: string;
  created_at: string;
  // Joined
  decider?: Profile;
}

export interface AuditLog {
  id: string;
  user_id: string;
  user_role?: string;
  action: string;
  entity_type?: string;
  entity_id?: string;
  description?: string;
  metadata: Record<string, any>;
  ip_address?: string;
  created_at: string;
  // Joined
  user?: Profile;
}

// Dashboard stats
export interface DashboardStats {
  totalEmployees: number;
  activeEmployees: number;
  pendingTasks: number;
  inProgressTasks: number;
  completedTasks: number;
  delayedTasks: number;
  workforceUtilization: number;
  openIssues: number;
}

// Task status distribution for charts
export interface TaskStatusCount {
  status: string;
  count: number;
  fill?: string;
}

// Workload data for charts
export interface WorkloadData {
  name: string;
  tasks: number;
  department?: string;
}

// Completion trend
export interface CompletionTrend {
  date: string;
  completed: number;
  assigned: number;
}

// AI task recommendation result
export interface TaskRecommendationResult {
  employee: Employee;
  score: number;
  factors: {
    availability: { score: number; detail: string };
    workload: { score: number; detail: string };
    skillMatch: { score: number; detail: string };
    locationMatch: { score: number; detail: string };
    priorityCapacity: { score: number; detail: string };
  };
  explanation: string;
}
