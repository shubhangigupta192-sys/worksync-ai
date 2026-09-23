import { getDashboardStats, getTaskStatusDistribution, getWorkloadDistribution } from '@/actions/analytics';
import { TaskStatusChart } from '@/components/dashboard/task-status-chart';
import { WorkloadChart } from '@/components/dashboard/workload-chart';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  Users,
  ClipboardList,
  CheckCircle2,
  ShieldCheck,
  Plus,
  ArrowRight,
  MapPin,
  Activity,
} from 'lucide-react';
import { getDemoDashboardStats, getDemoStatusData, getDemoWorkloadData, getDemoOnTimeClosureRate } from '@/lib/demo-analytics';
import { getDemoStore, getDemoActor } from '@/lib/demo-store';

export default async function DashboardPage() {
  // Live numbers computed from the demo store (real rule-based data).
  // Overridden by Supabase results only when a database is configured.
  const stats = getDemoDashboardStats();
  const actor = await getDemoActor();
  const isStaff = actor.role === 'admin' || actor.role === 'supervisor';
  const isAdmin = actor.role === 'admin';
  let statusData = getDemoStatusData();
  let workloadData = getDemoWorkloadData();

  try {
    const [statsRes, statusRes, workloadRes] = await Promise.all([
      getDashboardStats(),
      getTaskStatusDistribution(),
      getWorkloadDistribution(),
    ]);
    if (statsRes?.data) Object.assign(stats, statsRes.data);
    if (statusRes?.data && Array.isArray(statusRes.data)) statusData = statusRes.data;
    if (workloadRes?.data && Array.isArray(workloadRes.data)) workloadData = (workloadRes.data as any[]).slice(0, 6);
  } catch {
    // Demo mode: keep store-derived data
  }

  // Real pending-review count from the demo store (no invented numbers).
  const pendingReviews = getDemoStore().recommendations.filter((r) => r.status === 'pending').length;

  // Live task feed from the demo store (real data, newest first).
  // Employees see only their own tasks, matching the role-based access model.
  const allTasks = getDemoStore().tasks;
  const visibleTasks = isStaff ? allTasks : allTasks.filter((t) => t.assigned_employee_id === 'emp-7');
  const liveTasks = [...visibleTasks]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 4);

  // Personal metrics for frontline employees (scoped to their own tasks)
  const isActive = (t: (typeof visibleTasks)[number]) => ['assigned', 'accepted', 'in_progress'].includes(t.status);
  const myOpen = visibleTasks.filter(isActive).length;
  const myCompleted = visibleTasks.filter((t) => ['completed', 'verified', 'closed'].includes(t.status)).length;
  const myOverdue = visibleTasks.filter((t) => t.due_date && isActive(t) && new Date(t.due_date).getTime() < Date.now()).length;
  const myNextDue = visibleTasks
    .filter((t) => t.due_date && isActive(t))
    .sort((a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime())[0];
  const myStatusData = (['assigned', 'accepted', 'in_progress', 'completed', 'verified', 'closed'] as const)
    .map((s) => ({ status: s, count: visibleTasks.filter((t) => t.status === s).length }))
    .filter((d) => d.count > 0);

  return (
    <div className="space-y-6 md:space-y-8 max-w-7xl mx-auto pb-10">
      {/* 1. Header — greeting + single primary action */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between pb-1">
        <div className="min-w-0">
          <div className="hidden sm:flex items-center gap-2 mb-1">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse mr-1.5" />
              Live Operations Active
            </span>
            <span className="text-xs text-muted-foreground">• Frontline Coordination Network</span>
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-foreground truncate">
            {isStaff ? 'Operations Command Center' : 'My Dashboard'}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {isStaff
              ? 'AI-matched task orchestration with human-verified governance'
              : `Hello ${actor.role === 'employee' ? 'Rajesh' : ''} — here are your tasks for today`}
          </p>
        </div>

        {/* Single primary action (admin only) */}
        {isAdmin && (
          <Link href="/tasks/new" className="shrink-0">
            <Button size="sm" className="w-full md:w-auto bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-md shadow-indigo-500/20 font-medium">
              <Plus className="w-4 h-4 mr-1.5" />
              Create New Task
            </Button>
          </Link>
        )}
      </div>

      {isStaff ? (
        <>
          {/* 2. KPI row — compact, 2-up on phones */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            <Card className="p-4 border-border/60 bg-card/60 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Workforce</span>
                <Users className="w-4 h-4 text-indigo-500" />
              </div>
              <div className="mt-2.5 flex items-baseline gap-1.5">
                <span className="text-2xl md:text-3xl font-extrabold text-foreground">{stats.activeEmployees}</span>
                <span className="text-xs md:text-sm text-muted-foreground font-medium">/ {stats.totalEmployees}</span>
              </div>
              <div className="mt-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                on duty now
              </div>
            </Card>

            <Card className="p-4 border-border/60 bg-card/60 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Active Orders</span>
                <ClipboardList className="w-4 h-4 text-purple-500" />
              </div>
              <div className="mt-2.5 flex items-baseline gap-1.5">
                <span className="text-2xl md:text-3xl font-extrabold text-foreground">{stats.inProgressTasks + stats.pendingTasks}</span>
                <span className="text-xs md:text-sm text-muted-foreground font-medium">in motion</span>
              </div>
              <div className="mt-1.5 text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">
                {stats.inProgressTasks} executing • {stats.pendingTasks} queued
              </div>
            </Card>

            <Card className="p-4 border-border/60 bg-card/60 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">On-Time</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="mt-2.5 flex items-baseline gap-1.5">
                <span className="text-2xl md:text-3xl font-extrabold text-foreground">{getDemoOnTimeClosureRate()}%</span>
                <span className="text-xs md:text-sm text-muted-foreground font-medium">closure</span>
              </div>
              <div className="mt-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                {stats.completedTasks} tasks closed
              </div>
            </Card>

            {isAdmin ? (
              <Link href="/human-review" className="group">
                <Card className="p-4 h-full border-border/60 bg-card/60 backdrop-blur-sm hover:border-amber-500/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Reviews</span>
                    <ShieldCheck className="w-4 h-4 text-amber-500" />
                  </div>
                  <div className="mt-2.5 flex items-baseline gap-1.5">
                    <span className="text-2xl md:text-3xl font-extrabold text-foreground">{pendingReviews}</span>
                    <span className="text-xs md:text-sm text-muted-foreground font-medium">pending</span>
                  </div>
                  <div className="mt-1.5 text-[11px] text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1">
                    Review queue <ArrowRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </div>
                </Card>
              </Link>
            ) : (
              <Card className="p-4 border-border/60 bg-card/60 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Governance</span>
                  <ShieldCheck className="w-4 h-4 text-amber-500" />
                </div>
                <div className="mt-2.5 flex items-baseline gap-1.5">
                  <span className="text-2xl md:text-3xl font-extrabold text-foreground">100%</span>
                  <span className="text-xs md:text-sm text-muted-foreground font-medium">verified</span>
                </div>
                <div className="mt-1.5 text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                  human-in-the-loop
                </div>
              </Card>
            )}
          </div>

          {/* 3. Visual analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            <TaskStatusChart data={statusData} />
            <WorkloadChart data={workloadData} />
          </div>
        </>
      ) : (
        <>
          {/* Employee personal summary — scoped to own tasks only */}
          <div className="grid grid-cols-3 gap-3 md:gap-4">
            <Card className="p-4 border-border/60 bg-card/60 backdrop-blur-sm">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Open</span>
              <div className="mt-2 text-2xl md:text-3xl font-extrabold text-foreground">{myOpen}</div>
              <div className="mt-1 text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">{myOverdue} overdue</div>
            </Card>
            <Card className="p-4 border-border/60 bg-card/60 backdrop-blur-sm">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Completed</span>
              <div className="mt-2 text-2xl md:text-3xl font-extrabold text-foreground">{myCompleted}</div>
              <div className="mt-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">all-time</div>
            </Card>
            <Card className="p-4 border-border/60 bg-card/60 backdrop-blur-sm">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Next Due</span>
              <div className="mt-2 text-sm md:text-base font-bold text-foreground leading-snug">
                {myNextDue
                  ? new Date(myNextDue.due_date!).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
                  : '—'}
              </div>
              <div className="mt-1 text-[11px] text-muted-foreground font-medium truncate">
                {myNextDue ? myNextDue.title : 'All caught up'}
              </div>
            </Card>
          </div>
          <TaskStatusChart data={myStatusData} />
        </>
      )}

      {/* 4. Live operations feed */}
      <Card className="p-4 md:p-6 border-border/60 bg-card/60 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-2 md:mb-4 gap-2">
          <div className="min-w-0">
            <h3 className="text-sm md:text-base font-semibold text-foreground">
              {isStaff ? 'Live Field Activity' : 'My Recent Tasks'}
            </h3>
            <p className="text-[11px] md:text-xs text-muted-foreground mt-0.5 truncate">
              {isStaff ? 'Current operational state across facility zones' : 'Your latest assignments and their status'}
            </p>
          </div>
          <Link href="/tasks" className="shrink-0">
            <Button variant="ghost" size="sm" className="text-xs font-medium text-indigo-500 hover:text-indigo-600">
              View all ({visibleTasks.length})
            </Button>
          </Link>
        </div>

        <div className="divide-y divide-border/40">
          {liveTasks.map((t, idx) => (
            <div key={t.id || idx} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 hover:bg-muted/30 px-2 -mx-2 rounded-lg transition-colors">
              <div className="flex items-start gap-3 min-w-0">
                <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-500 shrink-0">
                  <Activity className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-muted-foreground">{t.task_id}</span>
                    <span className="text-sm font-semibold text-foreground truncate">{t.title}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      {t.location || 'Facility Zone'}
                    </span>
                    <span>•</span>
                    <span className="capitalize">{t.category}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                <Badge
                  variant="outline"
                  className="text-[10px] font-semibold px-2 py-0.5 uppercase tracking-wider capitalize"
                  style={{
                    backgroundColor: t.status === 'in_progress' ? '#f59e0b15' : t.status === 'completed' ? '#10b98115' : '#6366f115',
                    color: t.status === 'in_progress' ? '#f59e0b' : t.status === 'completed' ? '#10b981' : '#6366f1',
                    borderColor: t.status === 'in_progress' ? '#f59e0b30' : t.status === 'completed' ? '#10b98130' : '#6366f130',
                  }}
                >
                  {t.status.replace(/_/g, ' ')}
                </Badge>
                <Link href={`/tasks/${t.id}`}>
                  <Button variant="ghost" size="sm" className="h-8 text-xs">
                    Open
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </Card>

    </div>
  );
}
