import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, MapPin, Calendar, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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

export const dynamic = 'force-dynamic';

export default async function TaskDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const store = getDemoStore();
  const task = store.tasks.find((t) => t.id === id);
  if (!task) notFound();

  const actor = await getDemoActor();
  const { getDemoEmployees, getDemoDepartments } = await import('@/lib/demo-data');
  const employees = getDemoEmployees();
  const departments = getDemoDepartments();
  const deptMap = Object.fromEntries(departments.map(d => [d.id, d.name]));

  const employee = task.assigned_employee_id
    ? employees.find((e) => e.id === task.assigned_employee_id)
    : undefined;
  const pendingRec = store.recommendations.find((r) => r.related_task_id === task.id && r.status === 'pending');
  const decision = store.decisions.find(
    (d) => d.recommendation_id && store.recommendations.find((r) => r.id === d.recommendation_id)?.related_task_id === task.id
  );

  const overdue = task.due_date && !['completed', 'verified', 'closed'].includes(task.status) && isPast(parseISO(task.due_date));

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div className="flex items-center justify-between">
        <Link href="/tasks" className="inline-flex items-center text-sm font-bold text-indigo-600 hover:text-indigo-700">
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Tasks
        </Link>
        <span className="text-xs font-mono font-bold text-muted-foreground uppercase">
          Work Order #{task.task_id || task.id.substring(0, 8)}
        </span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-card p-6 rounded-2xl border border-border shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-500/20">
              {task.category}
            </span>
            <span className="text-xs text-muted-foreground font-semibold">
              Created {format(parseISO(task.created_at), 'MMM d, yyyy')}
            </span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">{task.title}</h1>
        </div>
        <div className="flex items-center gap-2">
          <span className={cn('px-3.5 py-1 rounded-full text-xs font-extrabold capitalize shadow-sm', PRIORITY_STYLES[task.priority] || 'bg-muted text-foreground')}>
            {task.priority} Priority
          </span>
          {overdue && <Badge className="bg-rose-600 text-white font-bold">Overdue</Badge>}
        </div>
      </div>

      {/* Frontline Worker Acceptance & Status Highlight Banner */}
      {employee && (
        <div className={cn(
          'p-4 rounded-xl border-2 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm',
          task.status === 'assigned'
            ? 'bg-amber-50/70 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800'
            : task.status === 'accepted'
            ? 'bg-purple-50/70 dark:bg-purple-950/20 border-purple-300 dark:border-purple-800'
            : task.status === 'in_progress'
            ? 'bg-blue-50/70 dark:bg-blue-950/20 border-blue-300 dark:border-blue-800'
            : task.status === 'completed'
            ? 'bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800'
            : 'bg-muted/50 border-border'
        )}>
          <div>
            <div className="flex items-center gap-2">
              <span className={cn(
                'w-3 h-3 rounded-full',
                task.status === 'assigned' ? 'bg-amber-500 animate-pulse' :
                task.status === 'accepted' ? 'bg-purple-500' :
                task.status === 'in_progress' ? 'bg-blue-500 animate-pulse' :
                task.status === 'completed' ? 'bg-emerald-500' : 'bg-slate-500'
              )} />
              <h3 className="font-extrabold text-foreground text-sm">
                {task.status === 'assigned' && `Assigned to ${employee.name} — Awaiting Worker Acceptance`}
                {task.status === 'accepted' && `Accepted by ${employee.name} — Ready to Start Work`}
                {task.status === 'in_progress' && `Work In Progress by ${employee.name}`}
                {task.status === 'completed' && `Completed by ${employee.name} — Awaiting Supervisor Verification`}
                {task.status === 'verified' && `Quality Verified by Supervisor`}
                {task.status === 'closed' && `Task Closed & Archived`}
              </h3>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {task.status === 'assigned' && 'Frontline worker confirms schedule and safety protocols by clicking "Accept Task" below.'}
              {task.status === 'accepted' && 'Worker has confirmed acceptance and is mobilizing to the site.'}
              {task.status === 'in_progress' && 'Maintenance work is actively being carried out.'}
              {task.status === 'completed' && 'Worker has submitted completion notes. Supervisor verification required to close.'}
              {task.status === 'verified' && 'Verification completed and logged to governance trail.'}
              {task.status === 'closed' && 'Audit record preserved permanently.'}
            </p>
          </div>

          <Link href={`/employees/${employee.id}`}>
            <Button size="sm" variant="outline" className="font-bold text-xs border-indigo-200 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50">
              Inspect {employee.name.split(' ')[0]}'s Profile →
            </Button>
          </Link>
        </div>
      )}

      {/* Six-State Stepper Workflow with Direct Actions */}
      <TaskWorkflow task={task} userRole={actor.role as any} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Scope & Status Updater */}
        <div className="md:col-span-2 space-y-6">
          <Card className="border border-border shadow-sm">
            <CardHeader className="pb-3 border-b border-border/50">
              <CardTitle className="text-base font-extrabold text-foreground">Task Scope & Instructions</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <p className="text-sm font-medium text-foreground whitespace-pre-line leading-relaxed">
                {task.description || 'No detailed instructions provided.'}
              </p>
              {task.completion_notes && (
                <div className="mt-4 p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl">
                  <h4 className="text-xs font-extrabold text-emerald-800 dark:text-emerald-300 mb-1">
                    Frontline Completion Notes
                  </h4>
                  <p className="text-sm text-emerald-900 dark:text-emerald-200 font-medium">{task.completion_notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border border-border shadow-sm">
            <CardHeader className="pb-3 border-b border-border/50">
              <CardTitle className="text-base font-extrabold text-foreground">Workflow Controls</CardTitle>
              <CardDescription className="text-xs font-medium">
                Live role-based transitions with cryptographic audit logging
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <TaskStatusUpdater taskId={task.id} status={task.status} userRole={actor.role as any} />
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Assigned Staff & AI Match Trace */}
        <div className="space-y-6">
          {/* Assigned Frontline Staff Card */}
          <Card className="border-2 border-indigo-500/20 bg-card shadow-sm">
            <CardHeader className="pb-3 border-b border-border/50 bg-muted/30">
              <CardTitle className="text-sm font-extrabold text-foreground flex items-center justify-between">
                <span>Frontline Assignee</span>
                {employee && (
                  <Badge variant="outline" className="text-[10px] font-bold text-emerald-600 border-emerald-300">
                    Active Staff
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              {employee ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white font-extrabold text-lg flex items-center justify-center shrink-0 shadow-md">
                      {employee.name.split(' ').map((n: string) => n[0]).join('')}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-base text-foreground leading-tight">{employee.name}</h4>
                      <p className="text-xs font-semibold text-muted-foreground mt-0.5">
                        {employee.role} • {deptMap[employee.department_id] || employee.department_id}
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-muted/40 rounded-lg border border-border text-xs space-y-1.5">
                    <p className="flex items-center justify-between text-muted-foreground">
                      <span>Station Location:</span>
                      <strong className="text-foreground">{employee.location || (employee as any).current_location || 'Facility'}</strong>
                    </p>
                    <p className="flex items-center justify-between text-muted-foreground">
                      <span>Staff ID:</span>
                      <strong className="text-foreground font-mono">{employee.employee_id}</strong>
                    </p>
                    <p className="flex items-center justify-between text-muted-foreground">
                      <span>Performance:</span>
                      <strong className="text-foreground">⭐ {employee.performance_score.toFixed(1)} / 5.0</strong>
                    </p>
                  </div>

                  <Link href={`/employees/${employee.id}`} className="block w-full">
                    <Button variant="outline" className="w-full text-xs font-extrabold border-indigo-300 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50">
                      View Live Staff Profile & Queue →
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="text-center py-4 text-xs text-muted-foreground">
                  <User className="w-8 h-8 mx-auto text-muted-foreground/50 mb-1" />
                  <p className="font-bold">No Staff Assigned</p>
                  <p className="text-[11px] mt-1">Assign an employee to start the frontline execution workflow.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Operational Details Card */}
          <Card className="border border-border shadow-sm">
            <CardHeader className="pb-3 border-b border-border/50">
              <CardTitle className="text-sm font-extrabold text-foreground">Facility Details</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-2.5 text-xs text-foreground font-medium">
              <p className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-indigo-500 shrink-0" />
                <span>Location: <strong>{task.location || 'Central Facility'}</strong></span>
              </p>
              <p className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-500 shrink-0" />
                <span>Target Due: <strong>{task.due_date ? format(parseISO(task.due_date), 'MMM d, yyyy') : 'No Due Date'}</strong></span>
              </p>
            </CardContent>
          </Card>

          {/* AI Recommendation Context */}
          <Card className="border-indigo-200 dark:border-indigo-900 bg-indigo-50/40 dark:bg-indigo-950/20 shadow-sm">
            <CardHeader className="pb-2 border-b border-indigo-100 dark:border-indigo-900/50">
              <CardTitle className="text-xs font-extrabold text-indigo-950 dark:text-indigo-300">
                Workload & Algorithmic Trace
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-3">
              {pendingRec ? (
                <div className="text-xs text-indigo-900 dark:text-indigo-200 space-y-1">
                  <p className="font-extrabold">{pendingRec.title}</p>
                  <p className="text-[11px] text-muted-foreground">{pendingRec.description}</p>
                  <p className="pt-1 font-bold text-indigo-600 dark:text-indigo-400">
                    Match Confidence: {Math.round(pendingRec.confidence * 100)}%
                  </p>
                </div>
              ) : decision ? (
                <p className="text-xs text-indigo-900 dark:text-indigo-200">
                  Human supervisor decision recorded: <span className="font-bold capitalize">{decision.decision}</span> — “{decision.decision_reason}”.
                </p>
              ) : (
                <p className="text-xs text-indigo-900/80 dark:text-indigo-300">
                  Assigned using smart equal-workload balancing. Audited and recorded in the governance ledger.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
