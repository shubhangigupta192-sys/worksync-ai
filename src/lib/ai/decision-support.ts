import { Employee, Task } from '@/lib/types';

export interface DecisionRecommendation {
  type: 'workload_rebalance' | 'schedule_optimization' | 'task_assignment';
  title: string;
  issue: string;
  recommendation: string;
  confidence: number;
  factors: Record<string, any>;
  affectedEmployeeIds: string[];
  affectedTaskIds: string[];
}

/**
 * Generates all actionable decision recommendations based on workforce data.
 */
export function generateDecisionRecommendations(employees: Employee[], tasks: Task[]): DecisionRecommendation[] {
  return [
    ...detectWorkloadRebalanceNeeds(employees, tasks),
    ...detectScheduleOptimizations(tasks),
    ...detectStaffingIssues(employees, tasks),
  ];
}

/**
 * Detects workload imbalances and suggests rebalancing recommendations.
 */
export function detectWorkloadRebalanceNeeds(employees: Employee[], tasks: Task[]): DecisionRecommendation[] {
  const recommendations: DecisionRecommendation[] = [];
  
  const activeTasks = tasks.filter((t) => ['assigned', 'accepted', 'in_progress'].includes(t.status));
  const workloadMap = new Map<string, number>();
  
  employees.forEach((emp) => workloadMap.set(emp.id, 0));
  activeTasks.forEach((t) => {
    if (t.assigned_employee_id) {
      workloadMap.set(t.assigned_employee_id, (workloadMap.get(t.assigned_employee_id) || 0) + 1);
    }
  });

  let totalTasks = 0;
  workloadMap.forEach((count) => (totalTasks += count));
  const avgWorkload = totalTasks / (employees.length || 1);

  const overloaded = employees.filter((e) => (workloadMap.get(e.id) || 0) > avgWorkload + 2);
  const underutilized = employees.filter((e) => (workloadMap.get(e.id) || 0) < avgWorkload - 1 && e.availability === 'available');

  if (overloaded.length > 0 && underutilized.length > 0) {
    overloaded.forEach((overEmp) => {
      const underEmp = underutilized[0]; // simplistic matching for prototype
      const overEmpTasks = activeTasks.filter((t) => t.assigned_employee_id === overEmp.id && t.priority === 'low');
      
      if (overEmpTasks.length > 0) {
        recommendations.push({
          type: 'workload_rebalance',
          title: 'Rebalance Low-Priority Tasks',
          issue: `Employee ${overEmp.employee_id} is significantly overloaded.`,
          recommendation: `Consider reallocating two low-priority tasks from ${overEmp.employee_id} to available ${underEmp.employee_id}.`,
          confidence: 0.85,
          factors: { overWorkload: workloadMap.get(overEmp.id), underWorkload: workloadMap.get(underEmp.id) },
          affectedEmployeeIds: [overEmp.id, underEmp.id],
          affectedTaskIds: overEmpTasks.slice(0, 2).map((t) => t.id),
        });
      }
    });
  }

  return recommendations;
}

/**
 * Detects scheduling issues (like clustered delays) and suggests optimizations.
 */
export function detectScheduleOptimizations(tasks: Task[]): DecisionRecommendation[] {
  const recommendations: DecisionRecommendation[] = [];
  const now = new Date();
  
  const delayedTasks = tasks.filter(
    (t) => t.due_date && new Date(t.due_date) < now && !['completed', 'verified', 'closed'].includes(t.status)
  );

  const clusterMap: Record<string, Task[]> = {};
  delayedTasks.forEach((t) => {
    const key = `${t.category}-${t.location || 'unknown'}`;
    if (!clusterMap[key]) clusterMap[key] = [];
    clusterMap[key].push(t);
  });

  Object.entries(clusterMap).forEach(([key, clusteredTasks]) => {
    if (clusteredTasks.length >= 3) {
      const [category, location] = key.split('-');
      recommendations.push({
        type: 'schedule_optimization',
        title: `Optimize ${category} Schedule in ${location}`,
        issue: `Multiple ${category} tasks are delayed in ${location}.`,
        recommendation: `Consider grouping ${category} tasks in ${location} and deploying a dedicated team to clear the backlog.`,
        confidence: 0.9,
        factors: { delayCount: clusteredTasks.length, category, location },
        affectedEmployeeIds: [],
        affectedTaskIds: clusteredTasks.map((t) => t.id),
      });
    }
  });

  return recommendations;
}

/**
 * Detects staffing issues based on department workload vs available staff.
 */
export function detectStaffingIssues(employees: Employee[], tasks: Task[]): DecisionRecommendation[] {
  const recommendations: DecisionRecommendation[] = [];
  
  const deptStaffMap = new Map<string, number>();
  const deptAvailableMap = new Map<string, number>();
  
  employees.forEach((emp) => {
    const deptId = emp.department_id;
    deptStaffMap.set(deptId, (deptStaffMap.get(deptId) || 0) + 1);
    if (emp.availability === 'available') {
      deptAvailableMap.set(deptId, (deptAvailableMap.get(deptId) || 0) + 1);
    }
  });

  // Check for departments with high unavailability
  deptStaffMap.forEach((totalStaff, deptId) => {
    const available = deptAvailableMap.get(deptId) || 0;
    if (totalStaff > 0 && available / totalStaff <= 0.25) {
      const affectedEmps = employees.filter((e) => e.department_id === deptId).map((e) => e.id);
      
      recommendations.push({
        type: 'schedule_optimization',
        title: 'Critical Department Staffing',
        issue: `Department ${deptId} has critically low availability (${available} of ${totalStaff} available).`,
        recommendation: `Consider cross-training employees or temporarily reassigning staff from other departments to assist Department ${deptId}.`,
        confidence: 0.95,
        factors: { totalStaff, availableStaff: available },
        affectedEmployeeIds: affectedEmps,
        affectedTaskIds: [],
      });
    }
  });

  return recommendations;
}
