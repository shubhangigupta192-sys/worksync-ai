import { Task, Employee } from '@/lib/types';
import { getDemoStore } from '@/lib/demo-store';
import { getDemoEmployees } from '@/lib/demo-data';
import { TASK_STATUS_COLORS } from '@/lib/constants';

// Real numbers derived from the demo store (which itself is seeded by the
// rule-based AI engines). No hardcoded stats anywhere — every figure shown on
// the dashboard/analytics pages is computed from actual store data.

export type DemoStatusDatum = { status: string; count: number; fill?: string };
export type DemoWorkloadDatum = { name: string; tasks: number; department: string };

export function getDemoEmployeesSafe(): Employee[] {
  return getDemoEmployees() as Employee[];
}

/** Stat cards for the dashboard, computed from the live demo store. */
export function getDemoDashboardStats() {
  const { tasks } = getDemoStore();
  const employees = getDemoEmployeesSafe();

  const now = Date.now();
  const count = (s: Task['status']) => tasks.filter((t) => t.status === s).length;

  const assigned = count('assigned');
  const accepted = count('accepted');
  const inProgress = count('in_progress');
  const completed = count('completed');
  const verified = count('verified');
  const closed = count('closed');

  const delayed = tasks.filter(
    (t) => t.due_date && new Date(t.due_date).getTime() < now && !['completed', 'verified', 'closed'].includes(t.status)
  ).length;

  const activeEmployees = employees.filter((e) => e.availability === 'available').length;
  const openIssues = getDemoStore().insights.filter((i) => i.status === 'active' && i.severity !== 'info').length;

  // Utilization: share of active (non-closed) tasks currently being worked
  const openTasks = assigned + accepted + inProgress;
  const utilization = employees.length
    ? Math.min(100, Math.round((openTasks / Math.max(1, employees.length)) * 100))
    : 0;

  return {
    totalEmployees: employees.length,
    activeEmployees,
    pendingTasks: assigned,
    inProgressTasks: inProgress,
    completedTasks: completed + verified,
    delayedTasks: delayed,
    workforceUtilization: utilization,
    openIssues,
    acceptedTasks: accepted,
    verifiedTasks: verified,
    closedTasks: closed,
  };
}

/** Pie chart data: task status distribution with real colors. */
export function getDemoStatusData(): DemoStatusDatum[] {
  const { tasks } = getDemoStore();
  const order: Task['status'][] = ['assigned', 'accepted', 'in_progress', 'completed', 'verified', 'closed'];
  return order
    .map((status) => ({
      status,
      count: tasks.filter((t) => t.status === status).length,
      fill: TASK_STATUS_COLORS[status] || '#94a3b8',
    }))
    .filter((d) => d.count > 0);
}

/** Horizontal bar chart data: active tasks per employee (top loaded first). */
export function getDemoWorkloadData(): DemoWorkloadDatum[] {
  const { tasks } = getDemoStore();
  const employees = getDemoEmployeesSafe();
  const active = tasks.filter((t) => !['closed', 'verified'].includes(t.status));

  const byEmployee = new Map<string, number>();
  for (const t of active) {
    if (!t.assigned_employee_id) continue;
    byEmployee.set(t.assigned_employee_id, (byEmployee.get(t.assigned_employee_id) || 0) + 1);
  }

  return employees
    .map((e) => ({
      name: e.name,
      tasks: byEmployee.get(e.id) || 0,
      department: e.department?.name || e.department_id,
    }))
    .sort((a, b) => b.tasks - a.tasks)
    .slice(0, 10);
}

/** Area chart data: tasks created vs completed per day over the last 14 days, from real task timestamps. */
export function getDemoTrendData(days = 14): { date: string; completed: number; assigned: number }[] {
  const { tasks } = getDemoStore();
  const out: { date: string; completed: number; assigned: number }[] = [];

  for (let i = days - 1; i >= 0; i--) {
    const dayStart = new Date();
    dayStart.setHours(0, 0, 0, 0);
    dayStart.setDate(dayStart.getDate() - i);
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);

    const key = dayStart.toISOString().split('T')[0];
    out.push({
      date: key,
      assigned: tasks.filter((t) => {
        const c = new Date(t.created_at).getTime();
        return c >= dayStart.getTime() && c < dayEnd.getTime();
      }).length,
      completed: tasks.filter((t) => {
        if (!['completed', 'verified', 'closed'].includes(t.status)) return false;
        const u = new Date(t.updated_at).getTime();
        return u >= dayStart.getTime() && u < dayEnd.getTime();
      }).length,
    });
  }
  return out;
}
