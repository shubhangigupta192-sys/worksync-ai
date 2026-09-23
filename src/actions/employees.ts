'use server';

import { createClient } from '@/lib/supabase/server';
import { logAudit } from './audit';
import type { Employee } from '@/lib/types';

export async function getEmployees(filters?: {department?: string, status?: string, search?: string}) {
  try {
    const supabase = await createClient();
    if (!supabase) return { data: [] };

    let query = supabase
      .from('employees')
      .select('*, department:departments(*)');

    if (filters?.department) query = query.eq('department_id', filters.department);
    if (filters?.status) query = query.eq('status', filters.status);
    if (filters?.search) query = query.or(`name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);

    const { data, error } = await query;
    if (error) return { error: error.message };
    return { data };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function getEmployee(id: string) {
  try {
    const supabase = await createClient();
    if (!supabase) return { data: null };

    const { data, error } = await supabase
      .from('employees')
      .select('*, department:departments(*)')
      .eq('id', id)
      .single();

    if (error) return { error: error.message };
    return { data };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function createEmployee(data: Partial<Employee>) {
  try {
    const supabase = await createClient();
    if (!supabase) return { error: 'Database not configured' };

    const { data: employee, error } = await supabase
      .from('employees')
      .insert(data)
      .select()
      .single();

    if (error) return { error: error.message };
    await logAudit('CREATE', 'EMPLOYEE', employee.id, `Created employee ${employee.name}`, data);
    return { data: employee };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function updateEmployee(id: string, data: Partial<Employee>) {
  try {
    const supabase = await createClient();
    if (!supabase) return { error: 'Database not configured' };

    const { data: employee, error } = await supabase
      .from('employees')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) return { error: error.message };
    await logAudit('UPDATE', 'EMPLOYEE', id, `Updated employee ${id}`, data);
    return { data: employee };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function getEmployeeByUserId(userId: string) {
  try {
    const supabase = await createClient();
    if (!supabase) return { data: null };

    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) return { error: error.message };
    return { data };
  } catch (err: any) {
    return { error: err.message };
  }
}
