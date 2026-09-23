'use client';

import React, { useState } from 'react';
import { Task, UserRole } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Check, Clock, PlayCircle, ClipboardCheck, CheckCircle2, ShieldCheck, FileArchive } from 'lucide-react';
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
  // onStatusChange is optional so server components can render this stepper
  // for display-only purposes; interactive updates use TaskStatusUpdater.
  const [note, setNote] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<string | null>(null);

  const currentStepIndex = WORKFLOW_STEPS.findIndex(s => s.id === task.status);
  
  // Adjusted for prototype: if status is unassigned, current step is -1
  const activeIndex = currentStepIndex >= 0 ? currentStepIndex : -1;

  const handleAction = (status: string, requireNote: boolean = false) => {
    if (requireNote) {
      setPendingStatus(status);
      setIsAddingNote(true);
    } else {
      onStatusChange?.(task.id, status);
    }
  };

  const submitNote = () => {
    if (pendingStatus) {
      onStatusChange?.(task.id, pendingStatus, note);
      setIsAddingNote(false);
      setPendingStatus(null);
      setNote('');
    }
  };

  // Determine allowed actions based on role and current status
  const getAllowedActions = () => {
    const isEmployee = userRole === 'employee';
    const isManager = userRole === 'supervisor' || userRole === 'admin';

    switch (task.status) {
      case 'assigned':
        return isEmployee || isManager ? (
          <Button onClick={() => handleAction('accepted')} className="w-full sm:w-auto">Accept Task</Button>
        ) : null;
      
      case 'accepted':
        return isEmployee || isManager ? (
          <Button onClick={() => handleAction('in_progress')} className="w-full sm:w-auto bg-amber-600 hover:bg-amber-700">Start Work</Button>
        ) : null;
        
      case 'in_progress':
        return isEmployee || isManager ? (
          <Button onClick={() => handleAction('completed', true)} className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700">
            <CheckCircle2 className="w-4 h-4 mr-2" /> Complete Task
          </Button>
        ) : null;
        
      case 'completed':
        return isManager ? (
          <div className="flex gap-2 w-full sm:w-auto">
            <Button onClick={() => handleAction('verified', true)} className="bg-indigo-600 hover:bg-indigo-700">
              Verify Quality
            </Button>
            <Button onClick={() => handleAction('in_progress', true)} variant="outline" className="text-rose-600 border-rose-200 hover:bg-rose-50">
              Reject (Needs Rework)
            </Button>
          </div>
        ) : (
          <div className="text-sm text-slate-500 italic">Waiting for supervisor verification</div>
        );
        
      case 'verified':
        return isManager ? (
          <Button onClick={() => handleAction('closed')} variant="secondary">Close Task</Button>
        ) : null;
        
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
              <Button onClick={submitNote}>Submit & Update Status</Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center sm:justify-start">
            {getAllowedActions()}
          </div>
        )}
      </div>
    </div>
  );
}
