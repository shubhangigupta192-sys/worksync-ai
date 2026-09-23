'use server';

import { revalidatePath } from 'next/cache';
import { getDemoStore, getDemoActor, addAuditEntry } from '@/lib/demo-store';
import { generateTaskRecommendations } from '@/lib/ai/task-recommender';

// Demo-mode actions for the AI recommendation flow and the Human-in-the-Loop
// review queue. Mirrors src/actions/human-review.ts but on the in-memory store.

export async function demoGetEmployeeOptions() {
  const store = getDemoStore();
  const { getDemoEmployees, getDemoDepartments } = await import('@/lib/demo-data');
  const depts = getDemoDepartments();
  const deptMap = Object.fromEntries(depts.map(d => [d.id, d.name]));

  const employees = getDemoEmployees();
  return {
    data: employees.map((e) => {
      const activeTasks = store.tasks.filter(
        (t) => t.assigned_employee_id === e.id && ['assigned', 'accepted', 'in_progress'].includes(t.status)
      ).length;
      return {
        id: e.id,
        name: e.name,
        role: e.role,
        department: deptMap[e.department_id] || e.department_id,
        activeTasks,
        availability: e.availability,
        skills: e.skills,
        location: e.location || (e as any).current_location,
        label: `${e.name} (${e.role}) — ${activeTasks} active ${activeTasks === 1 ? 'task' : 'tasks'}`,
      };
    }),
  };
}

export async function demoGetRecommendationsForTask(input: {
  title: string;
  category: string;
  location?: string;
  priority: string;
}) {
  const store = getDemoStore();
  const { getDemoEmployees } = await import('@/lib/demo-data');
  const results = generateTaskRecommendations(
    { category: (input.category || '').toLowerCase(), location: input.location, priority: input.priority },
    getDemoEmployees(),
    store.tasks
  );
  return {
    data: results.map((r) => {
      const activeTasks = store.tasks.filter(
        (t) => t.assigned_employee_id === r.employee.id && ['assigned', 'accepted', 'in_progress'].includes(t.status)
      ).length;
      return {
        employeeId: r.employee.id,
        employeeName: r.employee.name,
        employeeRole: r.employee.role,
        activeTasks,
        score: r.score,
        explanation: r.explanation,
        factors: r.factors,
      };
    }),
  };
}

export async function demoRecordPendingRecommendation(input: {
  taskId: string;
  employeeId: string;
  employeeName: string;
  score: number;
  explanation: string;
  factors: Record<string, any>;
}) {
  const store = getDemoStore();
  const actor = await getDemoActor();
  const now = new Date().toISOString();
  const task = store.tasks.find((t) => t.id === input.taskId);
  if (!task) return { error: 'Task not found' };

  const rec = {
    id: `rec-live-${Date.now()}`,
    type: 'task_assignment' as const,
    title: `Assign "${task.title}" to ${input.employeeName}`,
    description: input.explanation,
    recommendation: `Assign this task to ${input.employeeName}.`,
    factors: input.factors,
    confidence: Number(input.score.toFixed(2)),
    related_task_id: task.id,
    recommended_employee_id: input.employeeId,
    status: 'pending' as const,
    generated_at: now,
    created_at: now,
  };
  store.recommendations.unshift(rec);

  addAuditEntry(store, {
    action: 'GENERATE',
    entityType: 'RECOMMENDATION',
    entityId: rec.id,
    description: `AI recommended ${input.employeeName} for "${task.title}" (score ${(input.score * 100).toFixed(0)}%)`,
    actor,
    metadata: { score: input.score },
  });

  revalidatePath('/human-review');
  return { data: rec };
}

export async function demoApproveRecommendation(id: string, reason?: string) {
  const store = getDemoStore();
  const actor = await getDemoActor();
  if (actor.role !== 'admin') return { error: 'Forbidden: only HR Admin can approve recommendations' };
  const rec = store.recommendations.find((r) => r.id === id);
  if (!rec) return { error: 'Recommendation not found' };

  rec.status = 'approved';

  // Apply the approved assignment to the related task.
  const task = store.tasks.find((t) => t.id === rec.related_task_id);
  if (task) {
    task.assigned_employee_id = rec.recommended_employee_id;
    task.status = 'assigned';
    task.updated_at = new Date().toISOString();
  }

  store.decisions.unshift({
    id: `decision-${Date.now()}`,
    recommendation_id: rec.id,
    decision: 'approved',
    decision_by: actor.id,
    decision_reason: reason || 'Approved by reviewer',
    created_at: new Date().toISOString(),
  });

  addAuditEntry(store, {
    action: 'APPROVE',
    entityType: 'RECOMMENDATION',
    entityId: rec.id,
    description: `${actor.name} approved: ${rec.title}`,
    actor,
    metadata: { reason: reason || 'Approved by reviewer' },
  });

  revalidatePath('/human-review');
  revalidatePath('/audit-logs');
  return { data: rec };
}

export async function demoModifyRecommendation(id: string, newEmployeeId: string, newEmployeeName: string, reason: string) {
  const store = getDemoStore();
  const actor = await getDemoActor();
  if (actor.role !== 'admin') return { error: 'Forbidden: only HR Admin can modify recommendations' };
  const rec = store.recommendations.find((r) => r.id === id);
  if (!rec) return { error: 'Recommendation not found' };

  rec.status = 'modified';

  const task = store.tasks.find((t) => t.id === rec.related_task_id);
  if (task) {
    task.assigned_employee_id = newEmployeeId;
    task.status = 'assigned';
    task.updated_at = new Date().toISOString();
  }

  store.decisions.unshift({
    id: `decision-${Date.now()}`,
    recommendation_id: rec.id,
    decision: 'modified',
    decision_by: actor.id,
    decision_reason: reason,
    modifications: `Assignment changed to ${newEmployeeName}`,
    created_at: new Date().toISOString(),
  });

  addAuditEntry(store, {
    action: 'MODIFY',
    entityType: 'RECOMMENDATION',
    entityId: rec.id,
    description: `${actor.name} modified assignment to ${newEmployeeName}: ${rec.title}`,
    actor,
    metadata: { reason, new_employee: newEmployeeName },
  });

  revalidatePath('/human-review');
  revalidatePath('/audit-logs');
  return { data: rec };
}

export async function demoRejectRecommendation(id: string, reason: string) {
  const store = getDemoStore();
  const actor = await getDemoActor();
  if (actor.role !== 'admin') return { error: 'Forbidden: only HR Admin can reject recommendations' };
  const rec = store.recommendations.find((r) => r.id === id);
  if (!rec) return { error: 'Recommendation not found' };

  rec.status = 'rejected';

  store.decisions.unshift({
    id: `decision-${Date.now()}`,
    recommendation_id: rec.id,
    decision: 'rejected',
    decision_by: actor.id,
    decision_reason: reason,
    created_at: new Date().toISOString(),
  });

  addAuditEntry(store, {
    action: 'REJECT',
    entityType: 'RECOMMENDATION',
    entityId: rec.id,
    description: `${actor.name} rejected: ${rec.title}`,
    actor,
    metadata: { reason },
  });

  revalidatePath('/human-review');
  revalidatePath('/audit-logs');
  return { data: rec };
}

export async function demoAcknowledgeInsight(id: string, action: 'resolved' | 'acknowledged', reason?: string) {
  const store = getDemoStore();
  const actor = await getDemoActor();
  if (actor.role !== 'admin') return { error: 'Forbidden: only HR Admin can resolve insights' };
  const insight = store.insights.find((i) => i.id === id);
  if (!insight) return { error: 'Insight not found' };

  insight.status = action;

  store.decisions.unshift({
    id: `decision-${Date.now()}`,
    insight_id: insight.id,
    decision: action === 'resolved' ? 'approved' : 'modified',
    decision_by: actor.id,
    decision_reason: reason || `${action} by reviewer`,
    created_at: new Date().toISOString(),
  });

  addAuditEntry(store, {
    action: action === 'resolved' ? 'RESOLVE' : 'ACKNOWLEDGE',
    entityType: 'INSIGHT',
    entityId: insight.id,
    description: `${actor.name} ${action}d insight: ${insight.title}`,
    actor,
    metadata: { reason },
  });

  revalidatePath('/human-review');
  revalidatePath('/audit-logs');
  return { data: insight };
}
