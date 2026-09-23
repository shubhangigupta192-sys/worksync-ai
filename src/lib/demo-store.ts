import { Employee, Task, AIRecommendation, AIInsight, HumanDecision, AuditLog } from '@/lib/types';
import { demoTasks, getDemoEmployees } from '@/lib/demo-data';
import { generateTaskRecommendations } from '@/lib/ai/task-recommender';
import { generateWorkforceInsights } from '@/lib/ai/analytics-engine';
import { cookies } from 'next/headers';

// In-memory demo store. Used when Supabase is not configured so the full
// workflow (task creation -> AI recommendation -> human review -> audit trail)
// runs end-to-end with real algorithms on demo data. State lives for the
// lifetime of the server process, which is fine for an academic prototype.

type DemoState = {
  version?: string;
  tasks: Task[];
  recommendations: AIRecommendation[];
  insights: AIInsight[];
  decisions: HumanDecision[];
  auditLogs: AuditLog[];
};

// Bump when seeding logic changes so dev-server hot reloads re-seed the store.
const STORE_VERSION = 'v2';

// Global so hot reloads / multiple module instances share one store
const g = globalThis as any as { __worksyncDemoStore?: DemoState };

function seedStore(): DemoState {
  const now = new Date().toISOString();

  // Tasks from the deterministic demo dataset. The dataset already uses the
  // six-state workflow (assigned/accepted/in_progress/completed/verified/closed).
  const tasks: Task[] = demoTasks.map((t) => ({ ...t }));

  const employees = getDemoEmployees() as Employee[];

  // Seed AI task-assignment recommendations for a few unassigned/early-stage
  // tasks using the REAL rule-based recommender.
  const recommendations: AIRecommendation[] = [];
  const recPool = tasks.filter((t) => ['assigned', 'accepted'].includes(t.status)).slice(0, 6);
  recPool.forEach((task, idx) => {
    const results = generateTaskRecommendations(
      { category: mapCategory(task.category), location: task.location, priority: task.priority },
      employees,
      tasks
    );
    const top = results[0];
    if (!top) return;
    recommendations.push({
      id: `rec-${idx + 1}`,
      type: 'task_assignment',
      title: `Assign "${task.title}" to ${top.employee.name}`,
      description: top.explanation,
      recommendation: `Assign this task to ${top.employee.name} (${top.employee.employee_id}).`,
      factors: {
        availability: top.factors.availability,
        workload: top.factors.workload,
        skillMatch: top.factors.skillMatch,
        locationMatch: top.factors.locationMatch,
        priorityCapacity: top.factors.priorityCapacity,
      },
      confidence: Number(top.score.toFixed(2)),
      related_task_id: task.id,
      recommended_employee_id: top.employee.id,
      status: 'pending',
      generated_at: now,
      created_at: now,
    });
  });

  // Seed AI insights using the REAL analytics engine.
  const insightData = generateWorkforceInsights(employees, tasks);
  const insights: AIInsight[] = insightData.slice(0, 8).map((d, i) => ({
    id: `insight-${i + 1}`,
    category: d.category,
    title: d.title,
    description: d.description,
    severity: d.severity,
    data_factors: d.dataFactors,
    affected_employees: d.affectedEmployeeIds,
    affected_tasks: d.affectedTaskIds,
    status: 'active',
    generated_at: now,
    created_at: now,
  }));

  return { tasks, recommendations, insights, decisions: [], auditLogs: [] };
}

// Map UI categories to the recommender's lowercase category keys.
export function mapCategory(category: string): string {
  return category.toLowerCase();
}

export function getDemoStore(): DemoState {
  if (!g.__worksyncDemoStore || g.__worksyncDemoStore.version !== STORE_VERSION) {
    g.__worksyncDemoStore = { version: STORE_VERSION, ...seedStore() };
  }
  return g.__worksyncDemoStore;
}



/** Demo-mode identity of the logged-in role, from the demo-role cookie. */
export async function getDemoActor(): Promise<{ id: string; name: string; role: string }> {
  const role = (await cookies()).get('demo-role')?.value || 'admin';
  const map: Record<string, { id: string; name: string; role: string }> = {
    admin: { id: 'demo-admin', name: 'HR Admin', role: 'admin' },
    supervisor: { id: 'demo-supervisor', name: 'Site Supervisor', role: 'supervisor' },
    employee: { id: 'demo-employee', name: 'Rajesh Kumar', role: 'employee' },
  };
  return map[role] || map.admin;
}

export function addAuditEntry(
  store: DemoState,
  entry: { action: string; entityType: string; entityId: string; description: string; actor: { id: string; name: string; role: string }; metadata?: Record<string, any> }
) {
  store.auditLogs.unshift({
    id: `audit-${Date.now()}-${store.auditLogs.length + 1}`,
    user_id: entry.actor.id,
    user_role: entry.actor.role,
    action: entry.action,
    entity_type: entry.entityType,
    entity_id: entry.entityId,
    description: entry.description,
    metadata: { ...(entry.metadata || {}), actor_name: entry.actor.name },
    created_at: new Date().toISOString(),
  });
}
