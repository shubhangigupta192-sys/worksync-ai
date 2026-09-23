'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Check, Edit3, X, ShieldCheck } from 'lucide-react';

interface DecisionActionButtonsProps {
  onApprove: (reason?: string) => void;
  onModify: (reason: string) => void;
  onReject: (reason: string) => void;
  disabled?: boolean;
}

type ActionState = 'idle' | 'approving' | 'modifying' | 'rejecting';

export function DecisionActionButtons({
  onApprove,
  onModify,
  onReject,
  disabled = false,
}: DecisionActionButtonsProps) {
  const [actionState, setActionState] = useState<ActionState>('idle');
  const [reason, setReason] = useState('');

  const handleSubmit = () => {
    if (actionState === 'modifying' && reason.trim()) {
      onModify(reason);
    } else if (actionState === 'rejecting' && reason.trim()) {
      onReject(reason);
    } else if (actionState === 'approving') {
      onApprove(reason);
    }

    setActionState('idle');
    setReason('');
  };

  const cancelAction = () => {
    setActionState('idle');
    setReason('');
  };

  if (actionState !== 'idle') {
    return (
      <div className="w-full space-y-3 bg-muted/40 p-4 rounded-xl border border-border shadow-sm">
        <label className="text-sm font-bold text-foreground block">
          {actionState === 'approving'
            ? 'Supervisory Approval Notes (Optional)'
            : actionState === 'modifying'
            ? 'Justification for Reassignment (Required)'
            : 'Reason for Rejection (Required)'}
        </label>
        <Textarea
          autoFocus
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder={
            actionState === 'approving'
              ? 'e.g., Staff qualification confirmed, workload is clear this shift...'
              : actionState === 'modifying'
              ? 'e.g., Reassigning to specialized maintenance personnel for heavy equipment...'
              : 'e.g., Worker is scheduled for priority inspection in another zone...'
          }
          className="text-sm min-h-[85px] bg-background border-border text-foreground font-medium placeholder:text-muted-foreground focus:ring-2 focus:ring-primary"
        />
        <div className="flex gap-2.5 justify-end">
          <Button variant="outline" size="sm" onClick={cancelAction} className="font-semibold">
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={disabled || ((actionState === 'modifying' || actionState === 'rejecting') && !reason.trim())}
            className={
              actionState === 'approving'
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white font-bold'
                : actionState === 'rejecting'
                ? 'bg-rose-600 hover:bg-rose-500 text-white font-bold'
                : 'bg-amber-600 hover:bg-amber-500 text-white font-bold'
            }
          >
            Confirm {actionState === 'approving' ? 'Approval' : actionState === 'modifying' ? 'Modification' : 'Rejection'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-3">
      <div className="flex items-center justify-center">
        <div className="h-px bg-border flex-1" />
        <span className="px-3 text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
          Supervisor Decision Authority Required
        </span>
        <div className="h-px bg-border flex-1" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 w-full">
        <Button
          variant="outline"
          className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 font-bold text-xs h-10 transition-colors"
          onClick={() => setActionState('approving')}
          disabled={disabled}
        >
          <Check className="w-4 h-4 mr-1.5 text-emerald-600 dark:text-emerald-400" />
          Approve Match
        </Button>

        <Button
          variant="outline"
          className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30 font-bold text-xs h-10 transition-colors"
          onClick={() => setActionState('modifying')}
          disabled={disabled}
        >
          <Edit3 className="w-4 h-4 mr-1.5 text-amber-600 dark:text-amber-400" />
          Modify Assignee
        </Button>

        <Button
          variant="outline"
          className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-500/30 font-bold text-xs h-10 transition-colors"
          onClick={() => setActionState('rejecting')}
          disabled={disabled}
        >
          <X className="w-4 h-4 mr-1.5 text-rose-600 dark:text-rose-400" />
          Reject Recommendation
        </Button>
      </div>
    </div>
  );
}
