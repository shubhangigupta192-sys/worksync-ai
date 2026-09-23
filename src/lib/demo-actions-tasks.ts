'use server';

import { Task } from '@/lib/types';
import { getDemoStore, getDemoActor, addAuditEntry } from '@/lib/demo-store';

// Demo-mode task actions — mirror the Supabase-backed actions in
// src/actions/tasks.ts so pages work identically without a database.

export async function demoCreateTask(input: {
  title: string;
  description?: string;
  category: string;
  location?: string;
  priority: string;
  due_date?: string;
  assigned_employee_id?: string;
}): Promise<{ data?: Task; error?: string }> {
  const store = getDemoStore();
  const actor = await getDemoActor();
  const now = new Date().toISOString();
  const nextNum = store.tasks.length + 1;

  const task: Task = {
    id: `task-live-${Date.now()}`,
    task_id: `T-${1100 + nextNum}`,
    title: input.title,
    description: input.description || '',
    category: input.category.toLowerCase(),
    location: input.location,
    priority: input.priority as Task['priority'],
    assigned_employee_id: input.assigned_employee_id,
    created_by: actor.id,
    created_at: now,
    due_date: input.due_date,
    status: input.assigned_employee_id ? 'assigned' : 'assigned',
    updated_at: now,
  };

  store.tasks.unshift(task);
  addAuditEntry(store, {
    action: 'CREATE',
    entityType: 'TASK',
    entityId: task.id,
    description: `Created task: ${task.title}`,
    actor,
    metadata: { priority: task.priority, category: task.category },
  });

  return { data: task };
}

export async function demoUpdateTaskStatus(taskId: string, newStatus: string, notes?: string) {
  const store = getDemoStore();
  const actor = await getDemoActor();

  const task = store.tasks.find((t) => t.id === taskId);
  if (!task) return { error: 'Task not found' };

  const role = actor.role;
  const allowedEmployeeTransitions: Record<string, string[]> = {
    assigned: ['accepted'],
    accepted: ['in_progress'],
    in_progress: ['completed'],
  };
  const allowedSupervisorTransitions: Record<string, string[]> = {
    completed: ['verified'],
    verified: ['closed'],
    assigned: ['accepted'],
  };

  if (role === 'employee') {
    const allowed = allowedEmployeeTransitions[task.status] || [];
    if (!allowed.includes(newStatus)) {
      return { error: `Employees cannot move a task from "${task.status}" to "${newStatus}"` };
    }
  } else if (role === 'supervisor' || role === 'admin') {
    const allowed = [...(allowedSupervisorTransitions[task.status] || []), ...(allowedEmployeeTransitions[task.status] || [])];
    if (!allowed.includes(newStatus)) {
      return { error: `Cannot move a task from "${task.status}" to "${newStatus}"` };
    }
  }

  const previous = task.status;
  task.status = newStatus as Task['status'];
  task.updated_at = new Date().toISOString();
  if (newStatus === 'completed' && notes) task.completion_notes = notes;

  addAuditEntry(store, {
    action: 'STATUS_CHANGE',
    entityType: 'TASK',
    entityId: task.id,
    description: `Task "${task.title}" moved from ${previous} to ${newStatus}`,
    actor,
    metadata: { previous, new: newStatus, notes },
  });

  return { data: task };
}

export async function demoVerifyTask(taskId: string) {
  const store = getDemoStore();
  const actor = await getDemoActor();
  const task = store.tasks.find((t) => t.id === taskId);
  if (!task) return { error: 'Task not found' };

  task.status = 'verified';
  task.verified_by = actor.id;
  task.verified_at = new Date().toISOString();
  task.updated_at = task.verified_at;

  addAuditEntry(store, {
    action: 'VERIFY',
    entityType: 'TASK',
    entityId: task.id,
    description: `Task "${task.title}" verified by ${actor.name}`,
    actor,
  });

  return { data: task };
}
