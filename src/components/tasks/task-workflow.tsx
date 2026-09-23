'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Task, UserRole } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Check, Clock, PlayCircle, ClipboardCheck, CheckCircle2, ShieldCheck, FileArchive, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TaskWorkflowProps {
  task: Task;
  userRole: UserRole;
  onStatusChange?: (taskId: string, newStatus: string, note?: string) => void;
}

const WORKFLOW_STEPS = [
  { id: 'assigned', label: 'Assigned', icon: Clock },
  { id: 'accepted', label: 'Accepted', icon: Check },
  { id: 'in_progress', label: 'In Progress', icon: PlayCircle },
  { id: 'completed', label: 'Completed', icon: ClipboardCheck },
  { id: 'verified', label: 'Verified', icon: ShieldCheck },
  { id: 'closed', label: 'Closed', icon: FileArchive },
];

export function TaskWorkflow({ task, userRole, onStatusChange }: TaskWorkflowProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [note, setNote] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<string | null>(null);
  const [actionError, setActionError] = useState('');

  const currentStepIndex = WORKFLOW_STEPS.findIndex(s => s.id === task.status);
  const activeIndex = currentStepIndex >= 0 ? currentStepIndex : -1;

  const handleAction = async (status: string, requireNote: boolean = false) => {
    setActionError('');
    if (requireNote) {
      setPendingStatus(status);
      setIsAddingNote(true);
      return;
    }

    if (onStatusChange) {
      onStatusChange(task.id, status);
      return;
    }

    startTransition(async () => {
      try {
        const { demoUpdateTaskStatus, demoVerifyTask } = await import('@/lib/demo-actions-tasks');
        const res = status === 'verified'
          ? await demoVerifyTask(task.id)
          : await demoUpdateTaskStatus(task.id, status);
        if (res.error) {
          setActionError(res.error);
        } else {
          router.refresh();
        }
      } catch (err: any) {
        setActionError(err.message || 'Failed to update status');
      }
    });
  };

  const submitNote = async () => {
    if (!pendingStatus) return;
    setActionError('');

    if (onStatusChange) {
      onStatusChange(task.id, pendingStatus, note);
      setIsAddingNote(false);
      setPendingStatus(null);
      setNote('');
      return;
    }

    startTransition(async () => {
      try {
        const { demoUpdateTaskStatus } = await import('@/lib/demo-actions-tasks');
        const res = await demoUpdateTaskStatus(task.id, pendingStatus, note);
        if (res.error) {
          setActionError(res.error);
        } else {
          setIsAddingNote(false);
          setPendingStatus(null);
          setNote('');
          router.refresh();
        }
      } catch (err: any) {
        setActionError(err.message || 'Failed to update status');
      }
    });
  };

  // Determine allowed actions based on role and current status
  const getAllowedActions = () => {
    switch (task.status) {
      case 'assigned':
        return (
          <Button
            onClick={() => handleAction('accepted')}
            disabled={isPending}
            className="w-full sm:w-auto bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold shadow-md shadow-emerald-500/20 px-5 py-2.5"
          >
            {isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <CheckCircle2 className="w-4 h-4 mr-2" />
            )}
            👷 Frontline Worker: Accept Task
          </Button>
        );

      case 'accepted':
        return (
          <Button
            onClick={() => handleAction('in_progress')}
            disabled={isPending}
            className="w-full sm:w-auto bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-extrabold shadow-md shadow-amber-500/20 px-5 py-2.5"
          >
            {isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <PlayCircle className="w-4 h-4 mr-2" />
            )}
            ▶ Start Work (Move to In Progress)
          </Button>
        );

      case 'in_progress':
        return (
          <Button
            onClick={() => handleAction('completed', true)}
            disabled={isPending}
            className="w-full sm:w-auto bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-extrabold shadow-md shadow-emerald-500/20 px-5 py-2.5"
          >
            {isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <ClipboardCheck className="w-4 h-4 mr-2" />
            )}
            ✔ Complete Task & Submit Notes
          </Button>
        );

      case 'completed':
        return (
          <div className="flex flex-wrap gap-3 items-center w-full sm:w-auto">
            <Button
              onClick={() => handleAction('verified')}
              disabled={isPending}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-extrabold shadow-md shadow-indigo-500/20 px-5 py-2.5"
            >
              {isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <ShieldCheck className="w-4 h-4 mr-2" />
              )}
              🛡️ Supervisor: Verify Quality
            </Button>
            <Button
              onClick={() => handleAction('in_progress', true)}
              disabled={isPending}
              variant="outline"
              className="text-rose-600 border-rose-300 hover:bg-rose-50 font-bold"
            >
              Request Rework
            </Button>
          </div>
        );

      case 'verified':
        return (
          <Button
            onClick={() => handleAction('closed')}
            disabled={isPending}
            className="bg-slate-800 hover:bg-slate-700 text-white font-extrabold px-5 py-2.5"
          >
            {isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <FileArchive className="w-4 h-4 mr-2" />
            )}
            📁 Archive & Close Task
          </Button>
        );

      case 'closed':
        return (
          <div className="flex items-center gap-2 text-sm font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-3.5 py-1.5 rounded-full border border-emerald-300">
            <Check className="w-4 h-4" />
            Task Lifecycle Complete & Verified
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
      <h3 className="text-lg font-medium text-slate-900 mb-6">Task Workflow</h3>
      
      {/* Stepper */}
      <div className="relative mb-10">
        <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 -translate-y-1/2 rounded-full" />
        <div 
          className="absolute top-1/2 left-0 h-1 bg-primary -translate-y-1/2 rounded-full transition-all duration-500" 
          style={{ width: `${Math.max(0, activeIndex) * (100 / (WORKFLOW_STEPS.length - 1))}%` }}
        />
        
        <div className="relative flex justify-between">
          {WORKFLOW_STEPS.map((step, index) => {
            const isCompleted = index < activeIndex;
            const isCurrent = index === activeIndex;
            const StepIcon = step.icon;
            
            return (
              <div key={step.id} className="flex flex-col items-center group">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors relative z-10 bg-white",
                  isCompleted ? "border-primary bg-primary text-white" : 
                  isCurrent ? "border-primary text-primary" : 
                  "border-slate-200 text-slate-400"
                )}>
                  {isCompleted ? <Check className="w-5 h-5" /> : <StepIcon className="w-5 h-5" />}
                </div>
                <span className={cn(
                  "text-xs font-medium mt-2 absolute top-12 whitespace-nowrap",
                  isCompleted || isCurrent ? "text-slate-900" : "text-slate-400"
                )}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Area */}
      <div className="mt-8 pt-6 border-t border-slate-100">
        {isAddingNote ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Add Completion Notes <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <Textarea 
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Briefly describe the work done or any issues encountered..."
                className="w-full h-24"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAddingNote(false)}>Cancel</Button>
              <Button onClick={submitNote} disabled={isPending}>
                {isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Submit & Update Status
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2 w-full">
            <div className="flex items-center justify-center sm:justify-start">
              {getAllowedActions()}
            </div>
            {actionError && (
              <p className="text-xs font-bold text-rose-600 dark:text-rose-400 mt-2">
                ⚠️ {actionError}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
