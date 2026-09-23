import { Employee, Task, AIRecommendation, AIInsight, AuditLog, Department, Profile, HumanDecision } from './types';

// Extended Employee type for demo with extra fields
export interface EmployeeWithHistory extends Employee {
  performance_score: number; // 1-5
  tasks_completed_total: number;
  tasks_completed_this_month: number;
  average_completion_time_hours: number;
  attendance_rate: number; // percentage
  leave_history: LeaveRecord[];
  monthly_task_history: MonthlyTaskData[];
}

export interface LeaveRecord {
  id: string;
  type: 'casual' | 'sick' | 'earned' | 'unpaid' | 'emergency';
  start_date: string;
  end_date: string;
  days: number;
  status: 'approved' | 'pending' | 'rejected';
  reason: string;
}

export interface MonthlyTaskData {
  month: string;
  assigned: number;
  completed: number;
  delayed: number;
  avg_completion_hours: number;
}

export interface EmployeeAnalytics {
  employee: EmployeeWithHistory;
  tasksByStatus: { status: string; count: number }[];
  tasksByPriority: { priority: string; count: number }[];
  monthlyPerformance: MonthlyTaskData[];
  leaveHistory: LeaveRecord[];
  leaveSummary: {
    total_casual: number;
    total_sick: number;
    total_earned: number;
    total_unpaid: number;
    total_emergency: number;
    total_days: number;
    remaining_casual: number;
    remaining_sick: number;
    remaining_earned: number;
  };
  recentTasks: Task[];
  performanceTrend: { month: string; score: number }[];
  comparisonToAvg: {
    tasksVsAvg: number; // percentage above/below
    completionTimeVsAvg: number;
    attendanceVsAvg: number;
  };
}

const indianNames = [
  "Rahul Sharma", "Priya Patel", "Amit Singh", "Sneha Gupta", "Vikram Reddy",
  "Neha Joshi", "Rajesh Kumar", "Anjali Desai", "Suresh Nair", "Kavita Iyer",
  "Ravi Verma", "Pooja Rao", "Deepak Mehta", "Kirti Agarwal", "Karthik Menon",
  "Ritu Bhatia", "Manoj Tiwari", "Sunita Chauhan", "Gaurav Malhotra", "Shilpa Reddy",
  "Vijay Pillai", "Aarti Kapoor", "Arun Pandey", "Swati Mishra", "Naveen Kulkarni",
  "Divya Bhatt", "Prakash Das", "Meera Krishnan", "Sanjay Ghosh", "Preeti Jain"
];

const locations = ['Block A', 'Block B', 'Block C', 'Main Building', 'Annex', 'Cafeteria'];
const phonePrefixes = ['+91 98765', '+91 91234', '+91 94567', '+91 99887'];

// Deterministic seeded PRNG (mulberry32) so demo data is identical on server and client.
// Prevents React hydration mismatches and keeps the conference demo consistent across reloads.
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(20260923);

function randInt(min: number, max: number): number {
  return Math.floor(rand() * (max - min + 1)) + min;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(rand() * arr.length)];
}

function generatePhone() {
  return `${pick(phonePrefixes)} ${randInt(10000, 99999)}`;
}

function generateEmail(name: string) {
  return `${name.split(' ').join('.').toLowerCase()}@company.com`;
}

function generateMonthlyTasks(): MonthlyTaskData[] {
  const months = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'];
  return months.map(month => {
    const assigned = randInt(15, 44);
    const completed = assigned - randInt(0, 4);
    const delayed = randInt(0, 2);
    return {
      month,
      assigned,
      completed,
      delayed,
      avg_completion_hours: Number((rand() * 4 + 1).toFixed(1))
    };
  });
}

function generateLeaveHistory(): LeaveRecord[] {
  const types = ['casual', 'sick', 'earned', 'unpaid', 'emergency'] as const;
  const statuses = ['approved', 'pending', 'rejected'] as const;
  
  const records: LeaveRecord[] = [];
  const numRecords = randInt(2, 5);
  
  for (let i = 0; i < numRecords; i++) {
    records.push({
      id: `leave-${randInt(100000, 999999)}`,
      type: pick([...types]),
      start_date: `2026-0${randInt(1, 8)}-10`,
      end_date: `2026-0${randInt(1, 8)}-12`,
      days: randInt(1, 3),
      status: pick([...statuses]),
      reason: 'Personal reasons'
    });
  }
  return records;
}

export const demoEmployees: EmployeeWithHistory[] = indianNames.map((name, index) => {
  let departmentId = '';
  let role = '';
  let skills: string[] = [];

  if (index < 6) {
    departmentId = 'dept-housekeeping';
    role = 'Housekeeper';
    skills = ['Room Prep', 'Linen Management', 'Inventory'];
  } else if (index < 12) {
    departmentId = 'dept-security';
    role = 'Security Guard';
    skills = ['CCTV', 'Patrol', 'Access Control', 'Night Watch'];
  } else if (index < 18) {
    departmentId = 'dept-maintenance';
    role = 'Technician';
    skills = ['Plumbing', 'Electrical', 'HVAC', 'Carpentry'];
  } else if (index < 24) {
    departmentId = 'dept-cleaning';
    role = 'Cleaner';
    skills = ['Floor Care', 'Sanitization', 'Waste Management'];
  } else {
    departmentId = 'dept-tech-support';
    role = 'IT Support Specialist';
    skills = ['IT Support', 'Networking', 'Hardware', 'Software'];
  }

  const performance = Number((3.2 + rand() * 1.6).toFixed(1));

  const loc = pick(locations);

  return {
    id: `emp-${index + 1}`,
    employee_id: `EMP-${101 + index}`,
    name: name,
    email: generateEmail(name),
    phone: generatePhone(),
    department_id: departmentId,
    role,
    status: rand() > 0.1 ? 'active' : 'inactive',
    availability: rand() > 0.8 ? (rand() > 0.5 ? 'on_leave' : 'busy') : 'available',
    current_location: loc,
    location: loc,
    skills,
    performance_score: performance,
    tasks_completed_total: randInt(100, 599),
    tasks_completed_this_month: randInt(5, 44),
    average_completion_time_hours: Number((rand() * 3 + 1).toFixed(1)),
    attendance_rate: randInt(90, 99), // 90-100%
    leave_history: generateLeaveHistory(),
    monthly_task_history: generateMonthlyTasks(),
    created_at: `202${randInt(0, 3)}-01-01T00:00:00Z`,
    updated_at: '2026-09-01T00:00:00Z',
    shift_start: '09:00:00',
    shift_end: '18:00:00',
  };
});

// Tasks — statuses follow the six-state frontline workflow defined in types.ts
const statuses = ['assigned', 'accepted', 'in_progress', 'completed', 'verified', 'closed'];
const priorities = ['low', 'medium', 'high', 'urgent'];

// Fixed reference date so demo tasks are deterministic across server/client and reloads.
const DEMO_REFERENCE_DATE = new Date('2026-09-23T09:00:00Z').getTime();

export const demoTasks: Task[] = Array.from({ length: 45 }).map((_, i) => ({
  id: `task-${i + 1}`,
  task_id: `T-${1001 + i}`,
  title: `Task ${i + 1}`,
  description: `Detailed description for task ${i + 1}`,
  status: pick([...statuses]) as any,
  priority: pick([...priorities]) as any,
  category: 'general',
  location: pick(locations),
  assigned_employee_id: pick(demoEmployees).id,
  created_by: 'system',
  created_at: new Date(DEMO_REFERENCE_DATE - rand() * 1000000000).toISOString(),
  updated_at: new Date(DEMO_REFERENCE_DATE).toISOString(),
  due_date: new Date(DEMO_REFERENCE_DATE + rand() * 1000000000).toISOString(),
}));

export const demoRecommendations: AIRecommendation[] = [];
export const demoInsights: AIInsight[] = [];
export const demoAuditLogs: AuditLog[] = [];
export const demoDecisions: HumanDecision[] = [];

export const demoDepartments: Department[] = [
  { id: 'dept-housekeeping', name: 'Housekeeping', description: '', created_at: '' },
  { id: 'dept-security', name: 'Security', description: '', created_at: '' },
  { id: 'dept-maintenance', name: 'Maintenance', description: '', created_at: '' },
  { id: 'dept-cleaning', name: 'Cleaning', description: '', created_at: '' },
  { id: 'dept-tech-support', name: 'Technical Support', description: '', created_at: '' },
];

export function getDemoEmployees(): EmployeeWithHistory[] {
  return demoEmployees;
}

export function getDemoTasks(): Task[] {
  return demoTasks;
}

export function getDemoRecommendations(): AIRecommendation[] {
  return demoRecommendations;
}

export function getDemoInsights(): AIInsight[] {
  return demoInsights;
}

export function getDemoAuditLogs(): AuditLog[] {
  return demoAuditLogs;
}

export function getDemoDecisions(): HumanDecision[] {
  return demoDecisions;
}

export function getDemoDepartments(): Department[] {
  return demoDepartments;
}

export function getDemoProfiles(): Profile[] {
  return [];
}

export function getEmployeeAnalytics(employeeId: string): EmployeeAnalytics | null {
  const employee = demoEmployees.find(e => e.id === employeeId);
  if (!employee) return null;

  // Read from dynamic live store if available so new/updated tasks show immediately
  const g = globalThis as any;
  const allTasks: Task[] = (g.__worksyncDemoStore && g.__worksyncDemoStore.tasks)
    ? g.__worksyncDemoStore.tasks
    : demoTasks;

  const employeeTasks = allTasks.filter(t => t.assigned_employee_id === employeeId);
  
  const workflowStatuses = ['assigned', 'accepted', 'in_progress', 'completed', 'verified', 'closed'];
  const tasksByStatus = workflowStatuses.map(status => ({
    status,
    count: employeeTasks.filter(t => t.status === status).length
  }));

  const tasksByPriority = priorities.map(priority => ({
    priority,
    count: employeeTasks.filter(t => (t.priority || '').toLowerCase() === priority).length
  }));

  const leaveSummary = {
    total_casual: employee.leave_history.filter(l => l.type === 'casual' && l.status === 'approved').reduce((acc, curr) => acc + curr.days, 0),
    total_sick: employee.leave_history.filter(l => l.type === 'sick' && l.status === 'approved').reduce((acc, curr) => acc + curr.days, 0),
    total_earned: employee.leave_history.filter(l => l.type === 'earned' && l.status === 'approved').reduce((acc, curr) => acc + curr.days, 0),
    total_unpaid: employee.leave_history.filter(l => l.type === 'unpaid' && l.status === 'approved').reduce((acc, curr) => acc + curr.days, 0),
    total_emergency: employee.leave_history.filter(l => l.type === 'emergency' && l.status === 'approved').reduce((acc, curr) => acc + curr.days, 0),
    total_days: employee.leave_history.filter(l => l.status === 'approved').reduce((acc, curr) => acc + curr.days, 0),
    remaining_casual: Math.max(12 - employee.leave_history.filter(l => l.type === 'casual' && l.status === 'approved').reduce((acc, curr) => acc + curr.days, 0), 0),
    remaining_sick: Math.max(7 - employee.leave_history.filter(l => l.type === 'sick' && l.status === 'approved').reduce((acc, curr) => acc + curr.days, 0), 0),
    remaining_earned: Math.max(15 - employee.leave_history.filter(l => l.type === 'earned' && l.status === 'approved').reduce((acc, curr) => acc + curr.days, 0), 0),
  };

  const performanceTrend = employee.monthly_task_history.map(m => ({
    month: m.month,
    score: (m.completed / m.assigned) * 5
  }));

  return {
    employee,
    tasksByStatus,
    tasksByPriority,
    monthlyPerformance: employee.monthly_task_history,
    leaveHistory: employee.leave_history,
    leaveSummary,
    recentTasks: employeeTasks.slice(0, 20),
    performanceTrend,
    comparisonToAvg: {
      tasksVsAvg: randInt(-10, 9),
      completionTimeVsAvg: Number((rand() * 2 - 1).toFixed(1)),
      attendanceVsAvg: randInt(-2, 2)
    }
  };
}
