'use server';

import { createClient } from '@/lib/supabase/server';
import { Employee, Task, DashboardStats } from '@/lib/types';
import * as analyticsEngine from '@/lib/ai/analytics-engine';

const DEMO_STATS: DashboardStats = {
  totalEmployees: 30,
  activeEmployees: 26,
  pendingTasks: 10,
  inProgressTasks: 8,
  completedTasks: 15,
  delayedTasks: 4,
  workforceUtilization: 78,
  openIssues: 5,
};

export async function getDashboardStats() {
  try {
    const supabase = await createClient();
    if (!supabase) return { data: DEMO_STATS };

    const { data: employees } = await supabase
      .from('employees')
      .select('*, department:departments(*)');
    const { data: tasks } = await supabase.from('tasks').select('*');

    if (!employees || !tasks) return { data: DEMO_STATS };

    const stats = analyticsEngine.calculateDashboardStats(employees, tasks);
    return { data: stats };
  } catch {
    return { data: DEMO_STATS };
  }
}

export async function getTaskStatusDistribution() {
  try {
    const supabase = await createClient();
    if (!supabase) return { data: null };

    const { data: tasks, error } = await supabase.from('tasks').select('status');
    if (error || !tasks) return { data: null };

    const distribution = analyticsEngine.getTaskStatusDistribution(tasks as Task[]);
    return { data: distribution };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function getWorkloadDistribution() {
  try {
    const supabase = await createClient();
    if (!supabase) return { data: null };

    const { data: employees } = await supabase
      .from('employees')
      .select('*, department:departments(*)');
    const { data: tasks } = await supabase.from('tasks').select('*');

    if (!employees || !tasks) return { data: null };

    const workload = analyticsEngine.getWorkloadByEmployee(employees, tasks as Task[]);
    return { data: workload };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function getCompletionTrend() {
  try {
    const supabase = await createClient();
    if (!supabase) return { data: null };

    const { data: tasks } = await supabase.from('tasks').select('*');
    if (!tasks) return { data: null };

    const trend = analyticsEngine.getCompletionTrend(tasks as Task[]);
    return { data: trend };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function getWorkforceInsights() {
  try {
    const supabase = await createClient();
    if (!supabase) return { data: null };

    const { data: insights, error } = await supabase
      .from('ai_insights')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);
    if (error) return { error: error.message };
    return { data: insights };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function regenerateInsights() {
  try {
    const supabase = await createClient();
    if (!supabase) return { error: 'Database not configured' };

    const { data: employees } = await supabase
      .from('employees')
      .select('*, department:departments(*)');
    const { data: tasks } = await supabase.from('tasks').select('*');

    if (!employees || !tasks) return { error: 'No data to analyze' };

    const insights = analyticsEngine.generateWorkforceInsights(
      employees as Employee[],
      tasks as Task[]
    );

    if (insights && insights.length > 0) {
      for (const insight of insights) {
        await supabase.from('ai_insights').insert({
          category: insight.category,
          title: insight.title,
          description: insight.description,
          severity: insight.severity,
          data_factors: insight.dataFactors,
          affected_employees: insight.affectedEmployeeIds,
          affected_tasks: insight.affectedTaskIds,
          status: 'active',
        });
      }
    }

    return { data: { success: true, count: insights.length } };
  } catch (err: any) {
    return { error: err.message };
  }
}
