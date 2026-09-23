'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Check, Edit3, X, UserCog } from 'lucide-react';

interface DecisionActionButtonsProps {
  onApprove: (reason?: string) => void;
  onModify: (reason: string) => void;
  onReject: (reason: string) => void;
  disabled?: boolean;
}

type ActionState = 'idle' | 'approving' | 'modifying' | 'rejecting';

export function DecisionActionButtons({ onApprove, onModify, onReject, disabled = false }: DecisionActionButtonsProps) {
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
    
    // Reset state handled by parent usually when status changes, 
    // but we can reset here too just in case
    setActionState('idle');
    setReason('');
  };

  const cancelAction = () => {
    setActionState('idle');
    setReason('');
  };

  if (actionState !== 'idle') {
    return (
      <div className="w-full space-y-3 bg-white p-3 rounded-md border border-slate-200">
        <label className="text-sm font-medium text-slate-700 block">
          {actionState === 'approving' ? 'Optional Notes (Why are you approving?)' : 
           actionState === 'modifying' ? 'Modification Details (Required)' : 
           'Reason for Rejection (Required)'}
        </label>
        <Textarea
          autoFocus
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder={
            actionState === 'approving' ? 'Looks good to me...' : 
            actionState === 'modifying' ? 'I am assigning this to someone else because...' : 
            'This recommendation does not make sense because...'
          }
          className="text-sm min-h-[80px]"
        />
        <div className="flex gap-2 justify-end">
          <Button variant="outline" size="sm" onClick={cancelAction}>
            Cancel
          </Button>
          <Button 
            size="sm" 
            onClick={handleSubmit}
            disabled={disabled || ((actionState === 'modifying' || actionState === 'rejecting') && !reason.trim())}
            className={
              actionState === 'approving' ? 'bg-emerald-600 hover:bg-emerald-700' :
              actionState === 'rejecting' ? 'bg-rose-600 hover:bg-rose-700' :
              'bg-amber-600 hover:bg-amber-700'
            }
          >
            Confirm {actionState === 'approving' ? 'Approval' : actionState === 'modifying' ? 'Modification' : 'Rejection'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full w-full">
      <div className="flex items-center justify-center mb-3">
        <div className="h-px bg-slate-200 flex-1"></div>
        <span className="px-2 text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center">
          <UserCog className="w-3.5 h-3.5 mr-1" />
          Human Decision Required
        </span>
        <div className="h-px bg-slate-200 flex-1"></div>
      </div>
      
      <div className="flex gap-2 w-full">
        <Button 
          variant="outline" 
          className="flex-1 bg-white border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"
          onClick={() => setActionState('approving')}
          disabled={disabled}
        >
          <Check className="w-4 h-4 mr-1.5" />
          Approve
        </Button>
        <Button 
          variant="outline" 
          className="flex-1 bg-white border-amber-200 text-amber-700 hover:bg-amber-50 hover:text-amber-800"
          onClick={() => setActionState('modifying')}
          disabled={disabled}
        >
          <Edit3 className="w-4 h-4 mr-1.5" />
          Modify
        </Button>
        <Button 
          variant="outline" 
          className="flex-1 bg-white border-rose-200 text-rose-700 hover:bg-rose-50 hover:text-rose-800"
          onClick={() => setActionState('rejecting')}
          disabled={disabled}
        >
          <X className="w-4 h-4 mr-1.5" />
          Reject
        </Button>
      </div>
    </div>
  );
}
