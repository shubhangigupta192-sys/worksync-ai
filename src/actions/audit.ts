'use server';

import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from './auth';

export async function logAudit(
  action: string,
  entityType: string,
  entityId: string,
  description: string,
  metadata?: Record<string, any>
) {
  try {
    const supabase = await createClient();
    if (!supabase) return; // Skip audit in demo mode

    const currentUser = await getCurrentUser();
    const userId = currentUser?.id;

    const { error } = await supabase.from('audit_logs').insert({
      action,
      entity_type: entityType,
      entity_id: entityId,
      description,
      metadata: metadata || null,
      user_id: userId || null,
    });

    if (error) {
      console.error('Audit log error:', error);
    }
  } catch (err) {
    console.error('Failed to log audit:', err);
  }
}

export async function getAuditLogs(filters?: {
  action?: string;
  entityType?: string;
  userId?: string;
  dateFrom?: string;
  dateTo?: string;
}) {
  try {
    const supabase = await createClient();
    if (!supabase) return { data: [] };

    let query = supabase
      .from('audit_logs')
      .select('*, profile:profiles(*)')
      .order('created_at', { ascending: false });

    if (filters?.action) query = query.eq('action', filters.action);
    if (filters?.entityType) query = query.eq('entity_type', filters.entityType);
    if (filters?.userId) query = query.eq('user_id', filters.userId);
    if (filters?.dateFrom) query = query.gte('created_at', filters.dateFrom);
    if (filters?.dateTo) query = query.lte('created_at', filters.dateTo);

    const { data, error } = await query;
    if (error) return { error: error.message };
    return { data };
  } catch (err: any) {
    return { error: err.message };
  }
}
