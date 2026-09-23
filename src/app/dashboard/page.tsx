import { getDashboardStats, getTaskStatusDistribution, getWorkloadDistribution, getCompletionTrend } from '@/actions/analytics';
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
  Sparkles,
  MapPin,
  Clock,
  Activity,
  Layers,
} from 'lucide-react';
import { getDemoDashboardStats, getDemoStatusData, getDemoWorkloadData, getDemoOnTimeClosureRate } from '@/lib/demo-analytics';
import { getDemoStore, getDemoActor } from '@/lib/demo-store';

export default async function DashboardPage() {
  // Live numbers computed from the demo store (real rule-based data).
  // Overridden by Supabase results only when a database is configured.
  const stats = getDemoDashboardStats();
  const actor = await getDemoActor();
  const isStaff = actor.role === 'admin' || actor.role === 'supervisor';
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

  // Live task feed from the demo store (real data, newest first).
  // Employees see only their own tasks, matching the role-based access model.
  const allTasks = getDemoStore().tasks;
  const visibleTasks = isStaff ? allTasks : allTasks.filter((t) => t.assigned_employee_id === 'emp-7');
  const liveTasks = [...visibleTasks]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

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
    <div className="space-y-8 max-w-7xl mx-auto pb-10">
      
      {/* 1. Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-border/50">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse mr-1.5" />
              Live Operations Active
            </span>
            <span className="text-xs text-muted-foreground">• Frontline Coordination Network</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Operations Command Center
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Real-time frontline task orchestration, AI matching, and human-verified governance
          </p>
        </div>

        {/* Quick Launch Buttons */}
        <div className="flex items-center gap-3">
          {isStaff && (<Link href="/human-review">
            <Button variant="outline" size="sm" className="border-indigo-500/30 hover:bg-indigo-500/10 text-foreground">
              <ShieldCheck className="w-4 h-4 mr-1.5 text-indigo-500" />
              Human Review Queue
              <span className="ml-1.5 px-1.5 py-0.2 bg-indigo-500/20 text-indigo-400 text-[10px] font-bold rounded-full">
                2 Pending
              </span>
            </Button>
          </Link>)}

          {isStaff && (<Link href="/tasks/new">
            <Button size="sm" className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-md shadow-indigo-500/20 font-medium">
              <Plus className="w-4 h-4 mr-1.5" />
              Create New Task
            </Button>
          </Link>)}
        </div>
      </div>

      {/* 2. Core Workflow Hub (The Main Work of the Platform) */}
      <div>
        <div className="flex items-center justify-between mb-3.5">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Operational Workflow Hub
          </h2>
          <span className="text-xs text-muted-foreground font-medium">Core Platform Modules</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1: Create Task (staff only) */}
          {isStaff && (<Link href="/tasks/new" className="group block">
            <Card className="p-5 h-full border-border/60 hover:border-indigo-500/50 bg-card/60 backdrop-blur-sm hover:shadow-lg hover:shadow-indigo-500/5 transition-all duration-200">
              <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-500 w-fit mb-3.5 group-hover:scale-105 transition-transform">
                <Plus className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-foreground group-hover:text-indigo-500 transition-colors flex items-center justify-between">
                Task Creation & AI Match
                <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-indigo-500" />
              </h3>
              <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">
                Dispatch work orders with automated recommendation based on skills & availability.
              </p>
              <div className="mt-3.5 pt-3 border-t border-border/40 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 flex items-center">
                Launch Task Creator →
              </div>
            </Card>
          </Link>)}

          {/* Card 2: Live Tasks */}
          <Link href="/tasks" className="group block">
            <Card className="p-5 h-full border-border/60 hover:border-purple-500/50 bg-card/60 backdrop-blur-sm hover:shadow-lg hover:shadow-purple-500/5 transition-all duration-200">
              <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-500 w-fit mb-3.5 group-hover:scale-105 transition-transform">
                <ClipboardList className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-foreground group-hover:text-purple-500 transition-colors flex items-center justify-between">
                Live Operations Board
                <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-purple-500" />
              </h3>
              <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">
                Monitor live work across 5 zones: assigned, accepted, in progress, and verified.
              </p>
              <div className="mt-3.5 pt-3 border-t border-border/40 text-[11px] font-semibold text-purple-600 dark:text-purple-400 flex items-center">
                View Task Pipeline →
              </div>
            </Card>
          </Link>

          {/* Card 3: Human Review (staff only) */}
          {isStaff && (<Link href="/human-review" className="group block">
            <Card className="p-5 h-full border-border/60 hover:border-amber-500/50 bg-card/60 backdrop-blur-sm hover:shadow-lg hover:shadow-amber-500/5 transition-all duration-200">
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500 w-fit mb-3.5 group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-foreground group-hover:text-amber-500 transition-colors flex items-center justify-between">
                Decision Governance Queue
                <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-amber-500" />
              </h3>
              <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">
                Supervisory approval on AI recommendations before tasks are allocated.
              </p>
              <div className="mt-3.5 pt-3 border-t border-border/40 text-[11px] font-semibold text-amber-600 dark:text-amber-400 flex items-center">
                Review Recommendations →
              </div>
            </Card>
          </Link>)}

          {/* Card 4: Workforce (staff only) */}
          {isStaff && (<Link href="/employees" className="group block">
            <Card className="p-5 h-full border-border/60 hover:border-emerald-500/50 bg-card/60 backdrop-blur-sm hover:shadow-lg hover:shadow-emerald-500/5 transition-all duration-200">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500 w-fit mb-3.5 group-hover:scale-105 transition-transform">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-foreground group-hover:text-emerald-500 transition-colors flex items-center justify-between">
                Workforce Directory
                <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-emerald-500" />
              </h3>
              <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">
                {stats.totalEmployees} verified personnel across Housekeeping, Security, Maintenance & Technical.
              </p>
              <div className="mt-3.5 pt-3 border-t border-border/40 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center">
                Explore Personnel →
              </div>
            </Card>
          </Link>)}

        </div>
      </div>

      {isStaff ? (
      <>
      {/* 3. Minimal, High-Impact KPI Row (4 Clean Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1 */}
        <Card className="p-5 border-border/60 bg-card/60 backdrop-blur-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Active Workforce</span>
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-500">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-foreground">{stats.activeEmployees}</span>
            <span className="text-sm text-muted-foreground font-medium">/ {stats.totalEmployees} on duty</span>
          </div>
          <div className="mt-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            {Math.round((stats.activeEmployees / Math.max(1, stats.totalEmployees)) * 100)}% Operational Deployment Rate
          </div>
        </Card>

        {/* Metric 2 */}
        <Card className="p-5 border-border/60 bg-card/60 backdrop-blur-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Active Work Orders</span>
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-500">
              <ClipboardList className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-foreground">{stats.inProgressTasks + stats.pendingTasks}</span>
            <span className="text-sm text-muted-foreground font-medium">operations in motion</span>
          </div>
          <div className="mt-2 text-xs text-indigo-600 dark:text-indigo-400 font-medium flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
            {stats.inProgressTasks} executing • {stats.pendingTasks} queued
          </div>
        </Card>

        {/* Metric 3 */}
        <Card className="p-5 border-border/60 bg-card/60 backdrop-blur-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Completion Rate</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-foreground">{getDemoOnTimeClosureRate()}%</span>
            <span className="text-sm text-muted-foreground font-medium">on-time closure</span>
          </div>
          <div className="mt-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            {stats.completedTasks} tasks closed successfully
          </div>
        </Card>

        {/* Metric 4 */}
        <Card className="p-5 border-border/60 bg-card/60 backdrop-blur-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Governance Oversight</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-foreground">100%</span>
            <span className="text-sm text-muted-foreground font-medium">human-verified</span>
          </div>
          <div className="mt-2 text-xs text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Zero autonomous unverified dispatch
          </div>
        </Card>

      </div>

      {/* 4. Visual Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TaskStatusChart data={statusData} />
        <WorkloadChart data={workloadData} />
      </div>
      </>
      ) : (
      <>
      {/* Employee personal summary — scoped to own tasks only */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5 border-border/60 bg-card/60 backdrop-blur-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">My Open Tasks</span>
          <div className="mt-3 text-3xl font-extrabold text-foreground">{myOpen}</div>
          <div className="mt-2 text-xs text-indigo-600 dark:text-indigo-400 font-medium">{myOverdue} overdue</div>
        </Card>
        <Card className="p-5 border-border/60 bg-card/60 backdrop-blur-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">My Completed</span>
          <div className="mt-3 text-3xl font-extrabold text-foreground">{myCompleted}</div>
          <div className="mt-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium">completed, verified & closed</div>
        </Card>
        <Card className="p-5 border-border/60 bg-card/60 backdrop-blur-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Next Due</span>
          <div className="mt-3 text-base font-bold text-foreground">
            {myNextDue
              ? `${myNextDue.task_id} · ${new Date(myNextDue.due_date!).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`
              : 'Nothing pending'}
          </div>
          <div className="mt-2 text-xs text-muted-foreground font-medium">{myNextDue ? myNextDue.title : 'All caught up'}</div>
        </Card>
      </div>
      <TaskStatusChart data={myStatusData} />
      </>
      )}

      {/* 5. Live Operations Stream (What is Going on Currently) */}
      <Card className="p-6 border-border/60 bg-card/60 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-semibold text-foreground">
              Live Field Activity Feed
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Current operational state across active facility zones
            </p>
          </div>
          <Link href="/tasks">
            <Button variant="ghost" size="sm" className="text-xs font-medium text-indigo-500 hover:text-indigo-600">
              View All Tasks ({visibleTasks.length}) →
            </Button>
          </Link>
        </div>

        <div className="divide-y divide-border/40">
          {liveTasks.map((t, idx) => (
            <div key={t.id || idx} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-muted/30 px-3 rounded-lg transition-colors">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-500 mt-0.5">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-muted-foreground">{t.task_id}</span>
                    <span className="text-sm font-semibold text-foreground">{t.title}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      {t.location || 'Facility Zone'}
                    </span>
                    <span>•</span>
                    <span className="capitalize">{t.category}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-center">
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider capitalize"
                  style={{
                    backgroundColor: t.status === 'in_progress' ? '#f59e0b15' : t.status === 'completed' ? '#10b98115' : '#6366f115',
                    color: t.status === 'in_progress' ? '#f59e0b' : t.status === 'completed' ? '#10b981' : '#6366f1',
                    border: `1px solid ${t.status === 'in_progress' ? '#f59e0b30' : t.status === 'completed' ? '#10b98130' : '#6366f130'}`
                  }}
                >
                  {t.status.replace(/_/g, ' ')}
                </span>
                <Link href={`/tasks/${t.id}`}>
                  <Button variant="ghost" size="sm" className="h-8 text-xs">
                    Inspect
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
