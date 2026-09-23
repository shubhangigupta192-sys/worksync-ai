'use server';

import { createClient } from '@/lib/supabase/server';
import { logAudit } from './audit';
import { getCurrentUser, getUserRole } from './auth';

export async function getTasks(filters?: {status?: string, priority?: string, category?: string, assignedTo?: string, createdBy?: string}) {
  try {
    const supabase = await createClient();
    if (!supabase) return { error: 'Database not configured' };
    let query = supabase
      .from('tasks')
      .select('*, employee:employees(*), creator:profiles!created_by(*)');

    if (filters?.status) query = query.eq('status', filters.status);
    if (filters?.priority) query = query.eq('priority', filters.priority);
    if (filters?.category) query = query.eq('category', filters.category);
    if (filters?.assignedTo) query = query.eq('assigned_to', filters.assignedTo);
    if (filters?.createdBy) query = query.eq('created_by', filters.createdBy);

    const { data, error } = await query;
    if (error) return { error: error.message };
    return { data };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function getTask(id: string) {
  try {
    const supabase = await createClient();
    if (!supabase) return { error: 'Database not configured' };
    const { data, error } = await supabase
      .from('tasks')
      .select('*, employee:employees(*), creator:profiles!created_by(*), task_updates(*)')
      .eq('id', id)
      .single();

    if (error) return { error: error.message };
    return { data };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function createTask(taskData: any) {
  try {
    const supabase = await createClient();
    if (!supabase) return { error: 'Database not configured' };
    const user = await getCurrentUser();
    
    const dataToInsert = {
      ...taskData,
      created_by: user?.id,
    };

    const { data, error } = await supabase
      .from('tasks')
      .insert(dataToInsert)
      .select()
      .single();

    if (error) return { error: error.message };
    
    await logAudit('CREATE', 'TASK', data.id, `Created task: ${data.title}`, dataToInsert);
    return { data };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function updateTaskStatus(taskId: string, newStatus: string, notes?: string) {
  try {
    const supabase = await createClient();
    if (!supabase) return { error: 'Database not configured' };
    const user = await getCurrentUser();
    const role = await getUserRole();
    
    const { data: currentTask } = await supabase.from('tasks').select('*').eq('id', taskId).single();
    if (!currentTask) return { error: 'Task not found' };

    const allowedEmployeeTransitions = {
      'assigned': ['accepted'],
      'accepted': ['in_progress'],
      'in_progress': ['completed'],
    };

    if (role === 'employee') {
      const allowedNext = allowedEmployeeTransitions[currentTask.status as keyof typeof allowedEmployeeTransitions] || [];
      if (!allowedNext.includes(newStatus)) {
        return { error: 'Invalid status transition for employee role' };
      }
    }

    const { data, error } = await supabase
      .from('tasks')
      .update({ status: newStatus })
      .eq('id', taskId)
      .select()
      .single();

    if (error) return { error: error.message };

    await supabase.from('task_updates').insert({
      task_id: taskId,
      user_id: user?.id,
      status: newStatus,
      notes: notes || `Status changed to ${newStatus}`
    });

    await logAudit('STATUS_CHANGE', 'TASK', taskId, `Task status changed to ${newStatus}`, { previous: currentTask.status, new: newStatus, notes });

    return { data };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function assignTask(taskId: string, employeeId: string) {
  try {
    const supabase = await createClient();
    if (!supabase) return { error: 'Database not configured' };
    const { data, error } = await supabase
      .from('tasks')
      .update({ assigned_to: employeeId, status: 'assigned' })
      .eq('id', taskId)
      .select()
      .single();

    if (error) return { error: error.message };
    await logAudit('ASSIGN', 'TASK', taskId, `Assigned task to employee ${employeeId}`, { employee_id: employeeId });
    return { data };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function verifyTask(taskId: string) {
  try {
    const supabase = await createClient();
    if (!supabase) return { error: 'Database not configured' };
    const user = await getCurrentUser();
    
    const { data, error } = await supabase
      .from('tasks')
      .update({ 
        status: 'verified',
        verified_by: user?.id,
        verified_at: new Date().toISOString()
      })
      .eq('id', taskId)
      .select()
      .single();

    if (error) return { error: error.message };
    await logAudit('VERIFY', 'TASK', taskId, 'Task verified');
    return { data };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function getMyTasks(employeeId: string) {
  return getTasks({ assignedTo: employeeId });
}

export async function completeTask(taskId: string, notes: string, evidenceUrl?: string) {
  try {
    const supabase = await createClient();
    if (!supabase) return { error: 'Database not configured' };
    const user = await getCurrentUser();
    
    const { data, error } = await supabase
      .from('tasks')
      .update({ 
        status: 'completed',
        completion_notes: notes,
        evidence_url: evidenceUrl,
        completed_at: new Date().toISOString()
      })
      .eq('id', taskId)
      .select()
      .single();

    if (error) return { error: error.message };
    
    await supabase.from('task_updates').insert({
      task_id: taskId,
      user_id: user?.id,
      status: 'completed',
      notes: notes
    });

    await logAudit('COMPLETE', 'TASK', taskId, 'Task completed', { notes });
    return { data };
  } catch (err: any) {
    return { error: err.message };
  }
}
