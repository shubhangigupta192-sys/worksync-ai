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
  'cleaning': ['cleaning', 'floor_care', 'sanitization', 'waste_management'],
  'security': ['surveillance', 'patrol', 'cctv_monitoring', 'access_control', 'security'],
  'housekeeping': ['room_preparation', 'linen_management', 'housekeeping', 'inventory'],
  'technical': ['it_support', 'networking', 'hardware', 'software', 'technical'],
};

/**
 * Generates task recommendations by scoring active and available employees.
 */
export function generateTaskRecommendations(
  task: { category: string; location?: string; priority: string },
  employees: Employee[],
  existingTasks: Task[]
): TaskRecommendationResult[] {
  const eligibleEmployees = employees.filter(
    (emp) => emp.status === 'active' && emp.availability === 'available'
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

    const explanation = `Recommended: ${employee.name} (${employee.employee_id}). ${skillMatch.detail}, currently has ${workload.detail.toLowerCase()}, is available at ${employee.location || 'their location'}, and ${priorityCapacity.detail.toLowerCase()}.`;

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

  return results.sort((a, b) => b.score - a.score).slice(0, 3);
}

/**
 * Calculates the availability score for an employee.
 */
export function calculateAvailabilityScore(employee: Employee): { score: number; detail: string } {
  switch (employee.availability) {
    case 'available':
      return { score: 1.0, detail: 'Employee is fully available' };
    case 'busy':
      return { score: 0.3, detail: 'Employee is currently busy' };
    case 'on_leave':
    default:
      return { score: 0.0, detail: 'Employee is on leave or unavailable' };
  }
}

/**
 * Calculates the workload score based on the number of active tasks.
 */
export function calculateWorkloadScore(employeeId: string, allTasks: Task[]): { score: number; detail: string } {
  const activeTasks = allTasks.filter(
    (t) =>
      t.assigned_employee_id === employeeId &&
      ['assigned', 'accepted', 'in_progress'].includes(t.status)
  ).length;

  const maxTaskThreshold = 8;
  const score = Math.max(0, 1 - activeTasks / maxTaskThreshold);

  return {
    score,
    detail: `Currently has ${activeTasks} active tasks`,
  };
}

/**
 * Calculates the skill match score based on the task category.
 */
export function calculateSkillScore(employee: Employee, taskCategory: string): { score: number; detail: string } {
  const requiredSkills = CATEGORY_SKILLS[taskCategory.toLowerCase()] || [];
  if (requiredSkills.length === 0) {
    return { score: 0.5, detail: 'No specific skills required for this category' };
  }

  const matchedSkills = employee.skills.filter((skill) => requiredSkills.includes(skill.toLowerCase()));
  const score = Math.max(0.1, matchedSkills.length / requiredSkills.length); // minimum 0.1 for active employee

  return {
    score,
    detail: `Has relevant skills: ${matchedSkills.length > 0 ? matchedSkills.join(', ') : 'general knowledge'}`,
  };
}

/**
 * Calculates the location match score.
 */
export function calculateLocationScore(employee: Employee, taskLocation?: string): { score: number; detail: string } {
  if (!taskLocation) {
    return { score: 0.5, detail: 'No specific location required' };
  }
  if (employee.location === taskLocation) {
    return { score: 1.0, detail: 'Exact location match' };
  }
  return { score: 0.2, detail: 'Different location' };
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
