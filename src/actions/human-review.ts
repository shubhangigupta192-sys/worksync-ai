'use server';

import { createClient } from '@/lib/supabase/server';
import { logAudit } from './audit';
import { getCurrentUser } from './auth';

export async function getPendingReviews() {
  try {
    const supabase = await createClient();
    if (!supabase) return { error: 'Database not configured' };
    
    const { data: recommendations, error: recError } = await supabase
      .from('recommendations')
      .select('*, task:tasks(*), employee:employees(*)')
      .eq('status', 'pending');
      
    const { data: insights, error: insError } = await supabase
      .from('ai_insights')
      .select('*')
      .eq('status', 'active')
      .eq('acknowledged', false);
      
    if (recError || insError) return { error: 'Failed to fetch reviews' };
    
    return { data: { recommendations: recommendations || [], insights: insights || [] } };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function approveRecommendation(id: string, reason?: string) {
  try {
    const supabase = await createClient();
    if (!supabase) return { error: 'Database not configured' };
    const user = await getCurrentUser();
    
    const { data, error } = await supabase
      .from('recommendations')
      .update({ status: 'approved' })
      .eq('id', id)
      .select()
      .single();

    if (error) return { error: error.message };

    await supabase.from('human_decisions').insert({
      entity_type: 'recommendation',
      entity_id: id,
      decision: 'approved',
      reason: reason || 'Approved by user',
      user_id: user?.id
    });

    await logAudit('APPROVE', 'RECOMMENDATION', id, 'Approved AI recommendation', { reason });
    return { data };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function rejectRecommendation(id: string, reason: string) {
  try {
    const supabase = await createClient();
    if (!supabase) return { error: 'Database not configured' };
    const user = await getCurrentUser();
    
    const { data, error } = await supabase
      .from('recommendations')
      .update({ status: 'rejected' })
      .eq('id', id)
      .select()
      .single();

    if (error) return { error: error.message };

    await supabase.from('human_decisions').insert({
      entity_type: 'recommendation',
      entity_id: id,
      decision: 'rejected',
      reason,
      user_id: user?.id
    });

    await logAudit('REJECT', 'RECOMMENDATION', id, 'Rejected AI recommendation', { reason });
    return { data };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function modifyRecommendation(id: string, modifications: string, reason?: string) {
  try {
    const supabase = await createClient();
    if (!supabase) return { error: 'Database not configured' };
    const user = await getCurrentUser();
    
    const { data, error } = await supabase
      .from('recommendations')
      .update({ status: 'modified' })
      .eq('id', id)
      .select()
      .single();

    if (error) return { error: error.message };

    await supabase.from('human_decisions').insert({
      entity_type: 'recommendation',
      entity_id: id,
      decision: 'modified',
      reason: reason || 'Modified by user',
      modifications,
      user_id: user?.id
    });

    await logAudit('MODIFY', 'RECOMMENDATION', id, 'Modified AI recommendation', { reason, modifications });
    return { data };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function acknowledgeInsight(id: string) {
  try {
    const supabase = await createClient();
    if (!supabase) return { error: 'Database not configured' };
    const user = await getCurrentUser();
    
    const { data, error } = await supabase
      .from('ai_insights')
      .update({ acknowledged: true, status: 'acknowledged' })
      .eq('id', id)
      .select()
      .single();

    if (error) return { error: error.message };

    await supabase.from('human_decisions').insert({
      entity_type: 'insight',
      entity_id: id,
      decision: 'acknowledged',
      reason: 'Insight acknowledged',
      user_id: user?.id
    });

    await logAudit('ACKNOWLEDGE', 'INSIGHT', id, 'Acknowledged AI insight');
    return { data };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function getDecisionHistory() {
  try {
    const supabase = await createClient();
    if (!supabase) return { error: 'Database not configured' };
    const { data, error } = await supabase
      .from('human_decisions')
      .select('*, profile:profiles(*)')
      .order('created_at', { ascending: false });

    if (error) return { error: error.message };
    return { data };
  } catch (err: any) {
    return { error: err.message };
  }
}
