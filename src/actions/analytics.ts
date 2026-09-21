'use server';

import { createClient } from '@/lib/supabase/server';
import * as analyticsEngine from '@/lib/ai/analytics-engine';

export async function getDashboardStats() {
  try {
    const supabase = await createClient();
    const { count: employeeCount } = await supabase.from('employees').select('*', { count: 'exact', head: true });
    const { count: taskCount } = await supabase.from('tasks').select('*', { count: 'exact', head: true });
    const { count: pendingReviews } = await supabase.from('human_decisions').select('*', { count: 'exact', head: true }).eq('status', 'pending');

    return { data: { employees: employeeCount || 0, tasks: taskCount || 0, pendingReviews: pendingReviews || 0 } };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function getTaskStatusDistribution() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from('tasks').select('status');
    if (error) return { error: error.message };
    
    const distribution = data.reduce((acc: any, task: any) => {
      acc[task.status] = (acc[task.status] || 0) + 1;
      return acc;
    }, {});
    
    return { data: distribution };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function getWorkloadDistribution() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from('tasks').select('assigned_to, employee:employees(first_name, last_name)').not('assigned_to', 'is', null).in('status', ['assigned', 'accepted', 'in_progress']);
    if (error) return { error: error.message };
    
    const distribution = data.reduce((acc: any, task: any) => {
      const name = `${task.employee?.first_name} ${task.employee?.last_name}`;
      acc[name] = (acc[name] || 0) + 1;
      return acc;
    }, {});
    
    return { data: distribution };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function getCompletionTrend() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from('tasks').select('completed_at').eq('status', 'completed');
    if (error) return { error: error.message };
    // Basic aggregation by date
    const trend = data.reduce((acc: any, task: any) => {
      if (!task.completed_at) return acc;
      const date = new Date(task.completed_at).toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});
    return { data: trend };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function getWorkforceInsights() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from('ai_insights').select('*').order('created_at', { ascending: false }).limit(10);
    if (error) return { error: error.message };
    return { data };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function regenerateInsights() {
  try {
    const supabase = await createClient();
    const { data: employees } = await supabase.from('employees').select('*, tasks(*)');
    
    if (!employees) return { error: 'No data to analyze' };

    const insights = await analyticsEngine.generateWorkforceInsights(employees);
    
    if (insights && insights.length > 0) {
      for (const insight of insights) {
        await supabase.from('ai_insights').insert({
          type: insight.type,
          title: insight.title,
          description: insight.description,
          severity: insight.severity,
          status: 'active'
        });
      }
    }
    
    return { data: { success: true } };
  } catch (err: any) {
    return { error: err.message };
  }
}
