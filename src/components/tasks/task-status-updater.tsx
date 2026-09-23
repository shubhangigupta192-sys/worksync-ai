'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';

// Role-aware status action buttons for the demo task workflow.
// Employee: accept -> in_progress -> completed. Supervisor/Admin: verify -> close.

const ACTIONS: Record<string, Record<string, { label: string; next: string; note?: boolean }[]>> = {
  employee: {
    assigned: [{ label: 'Accept Task', next: 'accepted' }],
    accepted: [{ label: 'Start Task', next: 'in_progress' }],
    in_progress: [{ label: 'Mark Completed (with notes)', next: 'completed', note: true }],
  },
  supervisor: {
    assigned: [{ label: 'Mark Accepted', next: 'accepted' }],
    accepted: [{ label: 'Start Task', next: 'in_progress' }],
    in_progress: [{ label: 'Mark Completed', next: 'completed', note: true }],
    completed: [{ label: 'Verify Completion', next: 'verified' }],
    verified: [{ label: 'Close Task', next: 'closed' }],
  },
  admin: {
    assigned: [{ label: 'Mark Accepted', next: 'accepted' }],
    accepted: [{ label: 'Start Task', next: 'in_progress' }],
    in_progress: [{ label: 'Mark Completed', next: 'completed', note: true }],
    completed: [{ label: 'Verify Completion', next: 'verified' }],
    verified: [{ label: 'Close Task', next: 'closed' }],
  },
};

const TERMINAL = ['closed'];

export function TaskStatusUpdater({ taskId, status, userRole }: { taskId: string; status: string; userRole: 'admin' | 'supervisor' | 'employee' }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [needNote, setNeedNote] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  const actions = TERMINAL.includes(status) ? [] : (ACTIONS[userRole]?.[status] || []);

  const apply = async (next: string, noteText?: string) => {
    setError('');
    const { demoUpdateTaskStatus, demoVerifyTask } = await import('@/lib/demo-actions-tasks');
    const res = next === 'verified'
      ? await demoVerifyTask(taskId)
      : await demoUpdateTaskStatus(taskId, next, noteText);
    if (res.error) {
      setError(res.error);
      return;
    }
    setNeedNote(null);
    setNote('');
    startTransition(() => router.refresh());
  };

  if (TERMINAL.includes(status)) {
    return <p className="text-sm text-gray-500">This task is closed. No further actions available.</p>;
  }

  if (actions.length === 0) {
    return (
      <p className="text-sm text-gray-500">
        No actions available for the <span className="font-medium capitalize">{userRole}</span> role at this stage. Switch demo role on the login page to progress the workflow.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {needNote === null ? (
        <div className="flex flex-wrap gap-3">
          {actions.map((a) => (
            <Button key={a.next} type="button" onClick={() => (a.note ? setNeedNote(a.next) : apply(a.next))} disabled={pending}>
              {a.label}
            </Button>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add notes (recorded with the status change and in the audit trail)..." className="min-h-[80px]" />
          <div className="flex gap-2 justify-end">
            <Button variant="outline" type="button" onClick={() => setNeedNote(null)} disabled={pending}>Cancel</Button>
            <Button type="button" onClick={() => apply(needNote, note)} disabled={pending || !note.trim()}>
              {pending ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>) : 'Save with Notes'}
            </Button>
          </div>
        </div>
      )}
      {error && <p className="text-sm text-rose-600">{error}</p>}
    </div>
  );
}
