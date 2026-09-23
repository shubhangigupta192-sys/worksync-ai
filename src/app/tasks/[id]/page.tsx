import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, MapPin, Calendar, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TaskWorkflow } from '@/components/tasks/task-workflow';
import { TaskStatusUpdater } from '@/components/tasks/task-status-updater';
import { getDemoStore, getDemoActor } from '@/lib/demo-store';
import { format, isPast, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';

const PRIORITY_STYLES: Record<string, string> = {
  low: 'bg-emerald-100 text-emerald-700',
  medium: 'bg-amber-100 text-amber-700',
  high: 'bg-rose-100 text-rose-700',
  urgent: 'bg-rose-600 text-white',
};

export default async function TaskDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const store = getDemoStore();
  const task = store.tasks.find((t) => t.id === id);
  if (!task) notFound();

  const actor = await getDemoActor();
  const { getDemoEmployees } = await import('@/lib/demo-data');
  const employee = task.assigned_employee_id
    ? getDemoEmployees().find((e) => e.id === task.assigned_employee_id)
    : undefined;
  const pendingRec = store.recommendations.find((r) => r.related_task_id === task.id && r.status === 'pending');
  const decision = store.decisions.find(
    (d) => d.recommendation_id && store.recommendations.find((r) => r.id === d.recommendation_id)?.related_task_id === task.id
  );

  const overdue = task.due_date && !['completed', 'verified', 'closed'].includes(task.status) && isPast(parseISO(task.due_date));

  return (
    <div className="space-y-6 max-w-4xl">
      <Link href="/tasks" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900">
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Tasks
      </Link>

      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{task.title}</h1>
          <p className="text-sm text-gray-500 mt-1">{task.task_id} · {task.category}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={cn('px-3 py-1 rounded-full text-xs font-medium capitalize', PRIORITY_STYLES[task.priority] || 'bg-gray-100 text-gray-700')}>
            {task.priority}
          </span>
          {overdue && <Badge className="bg-rose-600 hover:bg-rose-700">Overdue</Badge>}
        </div>
      </div>

      <TaskWorkflow task={task} userRole={actor.role as any} onStatusChange={() => {}} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-700 whitespace-pre-line">{task.description || 'No description provided.'}</p>
              {task.completion_notes && (
                <div className="mt-4 p-3 bg-emerald-50 border border-emerald-100 rounded-lg">
                  <h4 className="text-xs font-semibold text-emerald-800 mb-1">Completion notes</h4>
                  <p className="text-sm text-emerald-700">{task.completion_notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Update Status</CardTitle>
              <CardDescription>Role-based transitions — every change is recorded in the audit trail</CardDescription>
            </CardHeader>
            <CardContent>
              <TaskStatusUpdater taskId={task.id} status={task.status} userRole={actor.role as any} />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-gray-600">
              <p className="flex items-center gap-2"><MapPin className="w-4 h-4 text-gray-400" /> {task.location || 'No location'}</p>
              <p className="flex items-center gap-2"><Calendar className="w-4 h-4 text-gray-400" /> Due {task.due_date ? format(parseISO(task.due_date), 'MMM d, yyyy') : '—'}</p>
              <p className="flex items-center gap-2">
                <User className="w-4 h-4 text-gray-400" />
                {employee ? `${employee.name} (${employee.role})` : 'Unassigned'}
              </p>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-purple-50/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-purple-900">AI Recommendation (Human-in-the-Loop)</CardTitle>
            </CardHeader>
            <CardContent>
              {pendingRec ? (
                <div className="text-xs text-purple-800 space-y-1">
                  <p className="font-medium">{pendingRec.title}</p>
                  <p>{pendingRec.description}</p>
                  <p className="pt-1 font-medium">Awaiting supervisor review in the Human Review queue.</p>
                </div>
              ) : decision ? (
                <p className="text-xs text-purple-800">
                  A human decision was recorded for this task: <span className="font-medium capitalize">{decision.decision}</span> — “{decision.decision_reason}”.
                </p>
              ) : (
                <p className="text-xs text-purple-700">
                  No AI recommendation recorded for this task. Supervisors can assign manually from the task creation flow.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
