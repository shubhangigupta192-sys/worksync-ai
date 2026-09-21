'use server';

import { createClient } from '@/lib/supabase/server';
import { logAudit } from './audit';
import { generateTaskRecommendations } from '@/lib/ai/task-recommender';

export async function getRecommendations(filters?: {status?: string, type?: string}) {
  try {
    const supabase = await createClient();
    let query = supabase
      .from('recommendations')
      .select('*, task:tasks(*), employee:employees(*)');

    if (filters?.status) query = query.eq('status', filters.status);
    if (filters?.type) query = query.eq('type', filters.type);

    const { data, error } = await query;
    if (error) return { error: error.message };
    return { data };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function getRecommendation(id: string) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('recommendations')
      .select('*, task:tasks(*), employee:employees(*)')
      .eq('id', id)
      .single();

    if (error) return { error: error.message };
    return { data };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function createRecommendation(data: any) {
  try {
    const supabase = await createClient();
    const { data: rec, error } = await supabase
      .from('recommendations')
      .insert(data)
      .select()
      .single();

    if (error) return { error: error.message };
    await logAudit('CREATE', 'RECOMMENDATION', rec.id, 'Generated recommendation', data);
    return { data: rec };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function generateTaskRecommendation(taskData: {category: string, location?: string, priority: string, id: string}) {
  try {
    const supabase = await createClient();
    const { data: employees } = await supabase.from('employees').select('*').eq('status', 'active');
    const { data: activeTasks } = await supabase.from('tasks').select('*').in('status', ['assigned', 'accepted', 'in_progress']);

    if (!employees) return { error: 'No employees found' };

    const result = await generateTaskRecommendations(taskData, employees, activeTasks || []);
    
    if (result && result.recommendations) {
      for (const rec of result.recommendations) {
        await createRecommendation({
          task_id: taskData.id,
          employee_id: rec.employeeId,
          type: 'assignment',
          confidence_score: rec.confidenceScore,
          reasoning: rec.reasoning,
          status: 'pending'
        });
      }
    }
    
    return { data: result };
  } catch (err: any) {
    return { error: err.message };
  }
}
