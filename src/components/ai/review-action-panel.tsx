'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DecisionActionButtons } from '@/components/ai/decision-action-buttons';
import { Loader2, UserCog, Brain } from 'lucide-react';

interface RecommendationCardProps {
  recommendation: {
    id: string;
    title: string;
    description: string;
    recommendation: string;
    confidence: number;
    factors: Record<string, any>;
    employeeName: string;
  };
  employeeName: string;
  canReview: boolean;
}

const FACTOR_LABELS: Record<string, { label: string; weight: number }> = {
  availability: { label: 'Availability', weight: 25 },
  workload: { label: 'Workload headroom', weight: 25 },
  skillMatch: { label: 'Skill match', weight: 25 },
  locationMatch: { label: 'Location match', weight: 15 },
  priorityCapacity: { label: 'Priority capacity', weight: 10 },
};

export function ReviewActionPanel({ recommendation, employeeName, canReview }: RecommendationCardProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState<string | null>(null);

  if (!canReview) {
    return (
      <Card className="border-l-4 border-l-gray-300">
        <CardContent className="p-4">
          <p className="text-sm font-medium">{recommendation.title}</p>
          <p className="text-xs text-gray-500 mt-1">Awaiting supervisor review.</p>
        </CardContent>
      </Card>
    );
  }

  const act = async (kind: 'approve' | 'modify' | 'reject', reason: string, newEmployeeId?: string, newEmployeeName?: string) => {
    setBusy(true);
    setError('');
    try {
      const actions = await import('@/lib/demo-actions-review');
      let res;
      if (kind === 'approve') res = await actions.demoApproveRecommendation(recommendation.id, reason);
      else if (kind === 'reject') res = await actions.demoRejectRecommendation(recommendation.id, reason);
      else {
        if (!newEmployeeId) {
          setError('Select a replacement employee to modify this recommendation.');
          return;
        }
        res = await actions.demoModifyRecommendation(recommendation.id, newEmployeeId, newEmployeeName!, reason);
      }
      if (res.error) {
        setError(res.error);
        return;
      }
      setDone(kind);
      startTransition(() => router.refresh());
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <Card className="border-l-4 border-l-emerald-400 bg-emerald-50/40">
        <CardContent className="p-4 flex items-center gap-2">
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          <p className="text-sm text-emerald-700">
            Decision recorded: <span className="font-medium capitalize">{done === 'approve' ? 'approved' : done === 'reject' ? 'rejected' : 'modified'}</span> — logged in the audit trail.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-l-4 border-l-purple-500">
      <CardContent className="p-5 space-y-3">
        <div className="flex flex-wrap justify-between items-start gap-2">
          <div>
            <p className="text-sm font-semibold text-gray-900">{recommendation.title}</p>
            <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1"><Brain className="w-3 h-3" /> Rule-based recommendation · task: {employeeName}</p>
          </div>
          <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200 border-0">
            {Math.round(recommendation.confidence * 100)}% score
          </Badge>
        </div>

        <p className="text-sm text-gray-700">{recommendation.description}</p>

        <div className="bg-gray-50 rounded-lg p-3 space-y-1.5">
          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Why this candidate? (Explainability)</p>
          {Object.entries(recommendation.factors || {}).map(([key, f]: [string, any]) => {
            const meta = FACTOR_LABELS[key];
            if (!meta || !f) return null;
            return (
              <div key={key} className="flex items-center gap-2 text-xs">
                <span className="w-44 shrink-0 text-gray-600">{meta.label} <span className="text-gray-400">({meta.weight}%)</span></span>
                <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500 rounded-full" style={{ width: `${Math.round((f.score || 0) * 100)}%` }} />
                </div>
                <span className="w-44 shrink-0 text-right text-gray-500 truncate" title={f.detail}>{f.detail}</span>
              </div>
            );
          })}
        </div>

        <ModifyPicker selectId={`modify-select-${recommendation.id}`} onModify={(id, name, reason) => act('modify', reason, id, name)} disabled={busy} />

        <div className="pt-1">
          <DecisionActionButtons
            disabled={busy || pending}
            onApprove={(reason) => act('approve', reason || '')}
            onModify={(reason) => {
              const select = document.getElementById(`modify-select-${recommendation.id}`) as HTMLSelectElement | null;
              if (!select || !select.value) {
                setError('Choose a replacement employee above to modify.');
                return;
              }
              act('modify', reason, select.value, select.options[select.selectedIndex]?.text || '');
            }}
            onReject={(reason) => act('reject', reason)}
          />
        </div>

        {error && <p className="text-sm text-rose-600">{error}</p>}
      </CardContent>
    </Card>
  );
}

function ModifyPicker({ selectId, onModify, disabled }: { selectId: string; onModify: (id: string, name: string, reason: string) => void; disabled: boolean }) {
  const [employees, setEmployees] = useState<{ id: string; name: string }[] | null>(null);
  const [reason, setReason] = useState('');

  const load = async () => {
    if (employees) return;
    const { demoGetEmployeeOptions } = await import('@/lib/demo-actions-review');
    const res = await demoGetEmployeeOptions();
    setEmployees(res.data || []);
  };

  return (
    <div
      className="text-xs"
      onFocus={load}
    >
      <label className="flex items-center gap-1 text-gray-600 font-medium mb-1" htmlFor="modify-select">
        <UserCog className="w-3 h-3" /> Alternative assignee (for “Modify”)
      </label>
      <div className="flex flex-col sm:flex-row gap-2">
        <select
          id={selectId}
          className="flex h-9 w-full sm:w-64 rounded-md border border-slate-200 bg-white px-2 text-xs"
          defaultValue=""
          onFocus={load}
        >
          <option value="">-- Choose employee --</option>
          {(employees || []).map((e) => (
            <option key={e.id} value={e.id}>{e.name}</option>
          ))}
        </select>
      </div>
      <input
        type="text"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="Modification reason (required)"
        className="mt-2 w-full rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs"
      />
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          const select = document.getElementById(selectId) as HTMLSelectElement | null;
          if (select && select.value && reason.trim()) onModify(select.value, select.options[select.selectedIndex]?.text || '', reason);
        }}
        className="mt-2 rounded-md border border-slate-200 px-2 py-1 hover:bg-gray-50 disabled:opacity-50"
      >
        Apply modification
      </button>
    </div>
  );
}
