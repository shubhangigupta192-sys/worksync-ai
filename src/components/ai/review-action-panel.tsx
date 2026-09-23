'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DecisionActionButtons } from '@/components/ai/decision-action-buttons';
import { Loader2, UserCog, Brain, CheckCircle2, User, Sparkles, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  availability: { label: 'Availability on Duty', weight: 25 },
  workload: { label: 'Workload Headroom', weight: 25 },
  skillMatch: { label: 'Skills & Qualification Match', weight: 25 },
  locationMatch: { label: 'Facility Zone Proximity', weight: 15 },
  priorityCapacity: { label: 'Priority Handling Capacity', weight: 10 },
};

export function ReviewActionPanel({ recommendation, employeeName, canReview }: RecommendationCardProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState<string | null>(null);

  if (!canReview) {
    return (
      <Card className="border-l-4 border-l-border bg-card">
        <CardContent className="p-4">
          <p className="text-sm font-bold text-foreground">{recommendation.title}</p>
          <p className="text-xs text-muted-foreground mt-1">Awaiting supervisor governance review.</p>
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
          setError('Please select a replacement staff member to modify this allocation.');
          return;
        }
        res = await actions.demoModifyRecommendation(recommendation.id, newEmployeeId, newEmployeeName!, reason);
      }
      if (res?.error) {
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
      <Card className="border-l-4 border-l-emerald-500 bg-emerald-500/10 border-border">
        <CardContent className="p-5 flex items-center gap-3">
          {busy ? <Loader2 className="w-5 h-5 animate-spin text-emerald-500" /> : <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
          <div>
            <p className="text-sm font-bold text-foreground">
              Decision Recorded: <span className="capitalize text-emerald-600 dark:text-emerald-400 font-extrabold">{done}</span>
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Task assignment updated and permanently logged to audit compliance trail.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const confidencePct = Math.round(recommendation.confidence * 100);

  return (
    <Card className="border border-border/80 bg-card shadow-sm hover:shadow-md transition-all overflow-hidden">
      {/* Top Banner */}
      <div className="bg-muted/40 px-5 py-3.5 border-b border-border flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
            <Brain className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              AI Task Assignment Recommendation
            </span>
            <h3 className="text-base font-extrabold text-foreground tracking-tight">
              {recommendation.title}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge
            className={cn(
              "font-bold text-xs px-2.5 py-0.5 border shadow-sm",
              confidencePct >= 80 
                ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
                : confidencePct >= 60 
                ? "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/30"
                : "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30"
            )}
          >
            <Sparkles className="w-3 h-3 mr-1" />
            {confidencePct}% Match Score
          </Badge>
        </div>
      </div>

      <CardContent className="p-5 space-y-4">
        {/* Clear Summary Box */}
        <div className="p-3.5 rounded-xl bg-muted/30 border border-border/60">
          <p className="text-sm font-semibold text-foreground leading-relaxed">
            {recommendation.description}
          </p>
          {employeeName && (
            <p className="text-xs font-medium text-muted-foreground mt-1">
              Target Operation: <span className="font-bold text-foreground">{employeeName}</span>
            </p>
          )}
        </div>

        {/* Explainability Panel */}
        <div className="rounded-xl border border-border bg-card p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-border/60">
            <span className="text-xs font-extrabold uppercase tracking-wider text-foreground flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              Algorithm Breakdown (Why this candidate?)
            </span>
            <span className="text-[11px] font-semibold text-muted-foreground">
              Weighted Criteria
            </span>
          </div>

          <div className="space-y-2.5">
            {Object.entries(recommendation.factors || {}).map(([key, f]: [string, any]) => {
              const meta = FACTOR_LABELS[key];
              if (!meta || !f) return null;
              const factorScorePct = Math.round((f.score || 0) * 100);

              return (
                <div key={key} className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-foreground">
                      {meta.label} <span className="text-muted-foreground font-normal">({meta.weight}%)</span>
                    </span>
                    <span className="font-semibold text-muted-foreground text-[11px] truncate max-w-[240px]" title={f.detail}>
                      {f.detail}
                    </span>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-500",
                        factorScorePct >= 70 ? "bg-emerald-500" : factorScorePct >= 40 ? "bg-indigo-500" : "bg-amber-500"
                      )}
                      style={{ width: `${factorScorePct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Reassignment / Modify Section */}
        <div className="rounded-xl border border-border/80 bg-muted/20 p-4">
          <ModifyPicker
            selectId={`modify-select-${recommendation.id}`}
            onModify={(id, name, reason) => act('modify', reason, id, name)}
            disabled={busy}
          />
        </div>

        {/* Decision Action Buttons */}
        <div className="pt-2">
          <DecisionActionButtons
            disabled={busy || pending}
            onApprove={(reason) => act('approve', reason || 'Approved without modifications.')}
            onModify={(reason) => {
              const select = document.getElementById(`modify-select-${recommendation.id}`) as HTMLSelectElement | null;
              if (!select || !select.value) {
                setError('Please select a replacement staff member from the dropdown above to apply modification.');
                return;
              }
              act('modify', reason, select.value, select.options[select.selectedIndex]?.text || '');
            }}
            onReject={(reason) => act('reject', reason || 'Rejected by supervisor.')}
          />
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ModifyPicker({
  selectId,
  onModify,
  disabled,
}: {
  selectId: string;
  onModify: (id: string, name: string, reason: string) => void;
  disabled: boolean;
}) {
  const [employees, setEmployees] = useState<{ id: string; name: string }[] | null>(null);
  const [reason, setReason] = useState('');

  const load = async () => {
    if (employees) return;
    const { demoGetEmployeeOptions } = await import('@/lib/demo-actions-review');
    const res = await demoGetEmployeeOptions();
    setEmployees(res.data || []);
  };

  return (
    <div className="text-xs space-y-2" onFocus={load}>
      <label className="flex items-center gap-1.5 font-bold text-foreground" htmlFor={selectId}>
        <UserCog className="w-4 h-4 text-indigo-500" />
        Override / Select Alternative Staff Member
      </label>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <select
          id={selectId}
          className="flex h-9 w-full rounded-lg border border-border bg-background px-3 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
          defaultValue=""
          onFocus={load}
        >
          <option value="">-- Choose replacement employee --</option>
          {(employees || []).map((e) => (
            <option key={e.id} value={e.id}>
              {e.name}
            </option>
          ))}
        </select>

        <input
          type="text"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Reason for reassignment (e.g. specialized skill needed)..."
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs font-medium text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
        />
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          disabled={disabled}
          onClick={() => {
            const select = document.getElementById(selectId) as HTMLSelectElement | null;
            if (select && select.value && reason.trim()) {
              onModify(select.value, select.options[select.selectedIndex]?.text || '', reason);
            }
          }}
          className="px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-accent font-bold text-foreground text-xs shadow-sm transition-colors disabled:opacity-50"
        >
          Apply Replacement
        </button>
      </div>
    </div>
  );
}
