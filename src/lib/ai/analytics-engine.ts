import { Employee, Task, DashboardStats } from '@/lib/types';

export interface AIInsightData {
  category: 'workload' | 'delay' | 'availability' | 'performance' | 'pattern';
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'critical';
  dataFactors: Record<string, any>;
  affectedEmployeeIds: string[];
  affectedTaskIds: string[];
}

/**
 * Generates comprehensive workforce insights.
 */
export function generateWorkforceInsights(employees: Employee[], tasks: Task[]): AIInsightData[] {
  return [
    ...analyzeWorkloadDistribution(employees, tasks),
    ...analyzeDelayedTasks(tasks),
    ...analyzeAvailability(employees),
    ...analyzeCompletionTrends(tasks),
    ...analyzeWorkloadImbalance(employees, tasks),
  ];
}

/**
 * Analyzes workload distribution among employees.
 */
export function analyzeWorkloadDistribution(employees: Employee[], tasks: Task[]): AIInsightData[] {
  const activeTasksPerEmp = employees.map((emp) => {
    const activeTasks = tasks.filter(
      (t) => t.assigned_employee_id === emp.id && ['assigned', 'accepted', 'in_progress'].includes(t.status)
    ).length;
    return { emp, activeTasks };
  });

  const totalActiveTasks = activeTasksPerEmp.reduce((sum, item) => sum + item.activeTasks, 0);
  const mean = totalActiveTasks / (employees.length || 1);
  const variance = activeTasksPerEmp.reduce((sum, item) => sum + Math.pow(item.activeTasks - mean, 2), 0) / (employees.length || 1);
  const stdDev = Math.sqrt(variance);

  const insights: AIInsightData[] = [];

  activeTasksPerEmp.forEach(({ emp, activeTasks }) => {
    if (activeTasks > mean + stdDev && stdDev > 0) {
      const percentageAbove = Math.round(((activeTasks - mean) / mean) * 100);
      insights.push({
        category: 'workload',
        title: 'High Workload Detected',
        description: `Employee ${emp.employee_id} has a workload ${percentageAbove}% above the average workload for the current period.`,
        severity: 'warning',
        dataFactors: { activeTasks, mean, stdDev },
        affectedEmployeeIds: [emp.id],
        affectedTaskIds: [],
      });
    } else if (activeTasks < mean - stdDev && stdDev > 0) {
      insights.push({
        category: 'workload',
        title: 'Underutilized Employee',
        description: `Employee ${emp.employee_id} has significantly fewer tasks than average.`,
        severity: 'info',
        dataFactors: { activeTasks, mean, stdDev },
        affectedEmployeeIds: [emp.id],
        affectedTaskIds: [],
      });
    }
  });

  return insights;
}

/**
 * Analyzes delayed tasks.
 */
export function analyzeDelayedTasks(tasks: Task[]): AIInsightData[] {
  const now = new Date();
  const delayedTasks = tasks.filter(
    (t) => t.due_date && new Date(t.due_date) < now && !['completed', 'verified', 'closed'].includes(t.status)
  );

  const categoryLocationGroups: Record<string, { total: number; delayed: number; taskIds: string[] }> = {};
  
  tasks.forEach((t) => {
    const key = `${t.category}-${t.location || 'unknown'}`;
    if (!categoryLocationGroups[key]) {
      categoryLocationGroups[key] = { total: 0, delayed: 0, taskIds: [] };
    }
    categoryLocationGroups[key].total++;
  });

  delayedTasks.forEach((t) => {
    const key = `${t.category}-${t.location || 'unknown'}`;
    categoryLocationGroups[key].delayed++;
    categoryLocationGroups[key].taskIds.push(t.id);
  });

  const insights: AIInsightData[] = [];
  const averageDelayRate = delayedTasks.length / (tasks.length || 1);

  Object.entries(categoryLocationGroups).forEach(([key, stats]) => {
    const delayRate = stats.delayed / stats.total;
    if (delayRate > averageDelayRate + 0.1 && stats.total > 2) {
      const [category, location] = key.split('-');
      insights.push({
        category: 'delay',
        title: 'High Task Delay Rate',
        description: `${category} tasks in ${location} show a higher delay rate (${Math.round(delayRate * 100)}%) than other locations (${Math.round(averageDelayRate * 100)}% average).`,
        severity: 'warning',
        dataFactors: { delayRate, averageDelayRate },
        affectedEmployeeIds: [],
        affectedTaskIds: stats.taskIds,
      });
    }
  });

  return insights;
}

/**
 * Analyzes employee availability by department.
 */
export function analyzeAvailability(employees: Employee[]): AIInsightData[] {
  const deptStats: Record<string, { total: number; available: number; empIds: string[] }> = {};

  employees.forEach((emp) => {
    const deptId = emp.department_id;
    if (!deptStats[deptId]) {
      deptStats[deptId] = { total: 0, available: 0, empIds: [] };
    }
    deptStats[deptId].total++;
    deptStats[deptId].empIds.push(emp.id);
    if (emp.availability === 'available') {
      deptStats[deptId].available++;
    }
  });

  const insights: AIInsightData[] = [];
  Object.entries(deptStats).forEach(([deptId, stats]) => {
    const availableRatio = stats.available / stats.total;
    if (availableRatio < 0.5) {
      insights.push({
        category: 'availability',
        title: 'Low Department Availability',
        description: `Department ${deptId} has less than 50% availability (${Math.round(availableRatio * 100)}%).`,
        severity: 'critical',
        dataFactors: { availableRatio },
        affectedEmployeeIds: stats.empIds,
        affectedTaskIds: [],
      });
    }
  });

  return insights;
}

/**
 * Analyzes task completion trends.
 */
export function analyzeCompletionTrends(tasks: Task[]): AIInsightData[] {
  const completedTasks = tasks.filter((t) => t.status === 'completed' && t.created_at);
  const categoryTimes: Record<string, number[]> = {};

  completedTasks.forEach((t) => {
    const createdDate = new Date(t.created_at);
    // Rough estimate using now for completed time if not available in schema, usually we'd have a completed_at
    const completedDate = new Date(); // Mocked completed time
    const timeToComplete = completedDate.getTime() - createdDate.getTime();
    
    if (!categoryTimes[t.category]) categoryTimes[t.category] = [];
    categoryTimes[t.category].push(timeToComplete);
  });

  const insights: AIInsightData[] = [];
  Object.entries(categoryTimes).forEach(([category, times]) => {
    const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
    // Just a placeholder threshold logic
    if (avgTime > 7 * 24 * 60 * 60 * 1000) { // 7 days
      insights.push({
        category: 'pattern',
        title: 'Long Completion Times',
        description: `Category ${category} consistently shows longer completion times (average ${Math.round(avgTime / (1000 * 60 * 60 * 24))} days).`,
        severity: 'info',
        dataFactors: { avgTime },
        affectedEmployeeIds: [],
        affectedTaskIds: [],
      });
    }
  });

  return insights;
}

/**
 * Analyzes overall workload imbalance across the workforce.
 */
export function analyzeWorkloadImbalance(employees: Employee[], tasks: Task[]): AIInsightData[] {
  const activeTasksPerEmp = employees.map((emp) => {
    return tasks.filter(
      (t) => t.assigned_employee_id === emp.id && ['assigned', 'accepted', 'in_progress'].includes(t.status)
    ).length;
  });

  const mean = activeTasksPerEmp.reduce((a, b) => a + b, 0) / (employees.length || 1);
  const variance = activeTasksPerEmp.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / (employees.length || 1);
  const stdDev = Math.sqrt(variance);
  const cv = stdDev / (mean || 1); // Coefficient of variation

  const insights: AIInsightData[] = [];
  if (cv > 0.5) {
    insights.push({
      category: 'workload',
      title: 'Critical Workload Imbalance',
      description: 'The workforce shows a severe workload imbalance (CV > 0.5). Rebalancing is urgently required.',
      severity: 'critical',
      dataFactors: { cv, mean, stdDev },
      affectedEmployeeIds: [],
      affectedTaskIds: [],
    });
  } else if (cv > 0.3) {
    insights.push({
      category: 'workload',
      title: 'Moderate Workload Imbalance',
      description: 'The workforce shows a moderate workload imbalance (CV > 0.3). Consider reallocating tasks.',
      severity: 'warning',
      dataFactors: { cv, mean, stdDev },
      affectedEmployeeIds: [],
      affectedTaskIds: [],
    });
  }

  return insights;
}

/**
 * Calculates high-level dashboard statistics.
 */
export function calculateDashboardStats(employees: Employee[], tasks: Task[]): DashboardStats {
  const totalEmployees = employees.length;
  const activeEmployees = employees.filter((e) => e.status === 'active').length;
  
  const pendingTasks = tasks.filter((t) => t.status === 'assigned' || t.status === 'accepted').length;
  const inProgressTasks = tasks.filter((t) => t.status === 'in_progress').length;
  const completedTasks = tasks.filter((t) => t.status === 'completed' || t.status === 'verified').length;
  
  const now = new Date();
  const delayedTasks = tasks.filter((t) => t.due_date && new Date(t.due_date) < now && !['completed', 'verified', 'closed'].includes(t.status)).length;

  const empsWithTasks = new Set(
    tasks.filter((t) => ['assigned', 'accepted', 'in_progress'].includes(t.status) && t.assigned_employee_id)
      .map((t) => t.assigned_employee_id)
  ).size;
  
  const workforceUtilization = activeEmployees > 0 ? (empsWithTasks / activeEmployees) * 100 : 0;

  const insights = generateWorkforceInsights(employees, tasks);
  const openIssues = insights.filter((i) => i.severity === 'critical' || i.severity === 'warning').length;

  return {
    totalEmployees,
    activeEmployees,
    pendingTasks,
    inProgressTasks,
    completedTasks,
    delayedTasks,
    workforceUtilization,
    openIssues
  };
}

/**
 * Gets the task status distribution.
 */
export function getTaskStatusDistribution(tasks: Task[]): { status: string; count: number }[] {
  const counts: Record<string, number> = {};
  tasks.forEach((t) => {
    counts[t.status] = (counts[t.status] || 0) + 1;
  });
  return Object.entries(counts).map(([status, count]) => ({ status, count }));
}

/**
 * Gets workload count grouped by employee.
 */
export function getWorkloadByEmployee(employees: Employee[], tasks: Task[]): { name: string; tasks: number; department?: string }[] {
  return employees.map((emp) => {
    const empTasks = tasks.filter(
      (t) => t.assigned_employee_id === emp.id && ['assigned', 'accepted', 'in_progress'].includes(t.status)
    ).length;
    return { name: emp.name, tasks: empTasks, department: emp.department?.name };
  });
}

/**
 * Gets completion trend for the last 30 days.
 */
export function getCompletionTrend(tasks: Task[]): { date: string; completed: number; assigned: number }[] {
  const trends: Record<string, { completed: number; assigned: number }> = {};
  const now = new Date();
  
  for (let i = 0; i < 30; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    trends[dateStr] = { completed: 0, assigned: 0 };
  }

  tasks.forEach((t) => {
    if (t.created_at) {
      const dateStr = t.created_at.split('T')[0];
      if (trends[dateStr]) {
        trends[dateStr].assigned++;
      }
    }
    // Approximating completion date since it's missing from schema
    if (t.status === 'completed' && t.created_at) {
      const dateStr = t.created_at.split('T')[0]; // fallback
      if (trends[dateStr]) {
        trends[dateStr].completed++;
      }
    }
  });

  return Object.entries(trends)
    .map(([date, counts]) => ({ date, ...counts }))
    .sort((a, b) => a.date.localeCompare(b.date));
}
