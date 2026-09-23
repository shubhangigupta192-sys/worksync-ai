import { Employee, Task, TaskRecommendationResult } from '@/lib/types';

const WEIGHTS = {
  availability: 0.25,
  workload: 0.25,
  skill: 0.25,
  location: 0.15,
  priorityCapacity: 0.10,
};

const CATEGORY_SKILLS: Record<string, string[]> = {
  'maintenance': ['plumbing', 'electrical', 'carpentry', 'hvac', 'maintenance', 'repair'],
  'cleaning': ['cleaning', 'floor_care', 'sanitization', 'waste_management', 'floor care', 'waste management'],
  'security': ['surveillance', 'patrol', 'cctv_monitoring', 'access_control', 'security', 'cctv', 'night watch'],
  'housekeeping': ['room_preparation', 'linen_management', 'housekeeping', 'inventory', 'room prep', 'linen'],
  'technical': ['it_support', 'networking', 'hardware', 'software', 'technical', 'it support'],
  'technical support': ['it_support', 'networking', 'hardware', 'software', 'technical', 'it support'],
};

function normalizeSkill(s: string) {
  return s.toLowerCase().replace(/[\s_\-]+/g, '');
}

/**
 * Generates task recommendations by scoring active and available employees.
 * Heavily factors in workload to maintain equal, balanced task assignment across the workforce.
 */
export function generateTaskRecommendations(
  task: { category: string; location?: string; priority: string },
  employees: Employee[],
  existingTasks: Task[]
): TaskRecommendationResult[] {
  const eligibleEmployees = employees.filter(
    (emp) => emp.status === 'active' && emp.availability !== 'on_leave'
  );

  const results: TaskRecommendationResult[] = eligibleEmployees.map((employee) => {
    const availability = calculateAvailabilityScore(employee);
    const workload = calculateWorkloadScore(employee.id, existingTasks);
    const skillMatch = calculateSkillScore(employee, task.category);
    const locationMatch = calculateLocationScore(employee, task.location);
    const priorityCapacity = calculatePriorityCapacityScore(employee.id, existingTasks);

    const score =
      WEIGHTS.availability * availability.score +
      WEIGHTS.workload * workload.score +
      WEIGHTS.skill * skillMatch.score +
      WEIGHTS.location * locationMatch.score +
      WEIGHTS.priorityCapacity * priorityCapacity.score;

    const explanation = `Recommended: ${employee.name} (${employee.role}). ${skillMatch.detail}, balanced team allocation with ${workload.detail.toLowerCase()}, stationed at ${employee.location || (employee as any).current_location || 'site'}, and ${priorityCapacity.detail.toLowerCase()}.`;

    return {
      employee,
      score,
      factors: {
        availability,
        workload,
        skillMatch,
        locationMatch,
        priorityCapacity,
      },
      explanation,
    };
  });

  return results.sort((a, b) => b.score - a.score).slice(0, 5);
}

/**
 * Calculates the availability score for an employee.
 */
export function calculateAvailabilityScore(employee: Employee): { score: number; detail: string } {
  switch (employee.availability) {
    case 'available':
      return { score: 1.0, detail: 'Employee is available' };
    case 'busy':
      return { score: 0.4, detail: 'Employee has active assignments' };
    case 'on_leave':
    default:
      return { score: 0.0, detail: 'Employee is on leave or unavailable' };
  }
}

/**
 * Calculates the workload score based on the number of active tasks.
 * Rewards employees with lower active workloads to enforce equal task management.
 */
export function calculateWorkloadScore(employeeId: string, allTasks: Task[]): { score: number; detail: string } {
  const activeTasks = allTasks.filter(
    (t) =>
      t.assigned_employee_id === employeeId &&
      ['assigned', 'accepted', 'in_progress'].includes(t.status)
  ).length;

  const maxTaskThreshold = 6;
  const score = Math.max(0, 1 - activeTasks / maxTaskThreshold);

  return {
    score,
    detail: activeTasks === 0 ? 'Optimal capacity (0 active tasks)' : `Balanced capacity (${activeTasks} active tasks)`,
  };
}

/**
 * Calculates the skill match score based on the task category.
 */
export function calculateSkillScore(employee: Employee, taskCategory: string): { score: number; detail: string } {
  const catKey = (taskCategory || '').toLowerCase().trim();
  const requiredSkills = CATEGORY_SKILLS[catKey] || [];
  if (requiredSkills.length === 0) {
    return { score: 0.6, detail: 'General departmental competency' };
  }

  const normalizedRequired = requiredSkills.map(normalizeSkill);
  const matched = (employee.skills || []).filter((s) => {
    const norm = normalizeSkill(s);
    return normalizedRequired.some(req => norm.includes(req) || req.includes(norm));
  });

  const score = matched.length > 0 ? Math.min(1.0, 0.4 + (matched.length / Math.min(requiredSkills.length, 3)) * 0.6) : 0.2;

  return {
    score,
    detail: matched.length > 0 ? `Matched skills: ${matched.join(', ')}` : 'Department transferable skills',
  };
}

/**
 * Calculates the location match score.
 */
export function calculateLocationScore(employee: Employee, taskLocation?: string): { score: number; detail: string } {
  const loc = employee.location || (employee as any).current_location;
  if (!taskLocation) {
    return { score: 0.7, detail: 'Standard facility location' };
  }
  if (loc && loc.toLowerCase().trim() === taskLocation.toLowerCase().trim()) {
    return { score: 1.0, detail: `Proximity match (${loc})` };
  }
  return { score: 0.3, detail: `Stationed at ${loc || 'site'}` };
}

/**
 * Calculates the priority capacity score based on existing high/urgent tasks.
 */
export function calculatePriorityCapacityScore(employeeId: string, allTasks: Task[]): { score: number; detail: string } {
  const highPriorityTasks = allTasks.filter(
    (t) =>
      t.assigned_employee_id === employeeId &&
      ['assigned', 'accepted', 'in_progress'].includes(t.status) &&
      ['high', 'urgent'].includes(t.priority)
  ).length;

  let score = 0.1;
  if (highPriorityTasks === 0) score = 1.0;
  else if (highPriorityTasks === 1) score = 0.7;
  else if (highPriorityTasks === 2) score = 0.4;

  return {
    score,
    detail: highPriorityTasks === 0 ? 'no urgent pending tasks' : `${highPriorityTasks} urgent pending tasks`,
  };
}
