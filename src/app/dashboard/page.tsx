import { getDashboardStats, getTaskStatusDistribution, getWorkloadDistribution, getCompletionTrend } from '@/actions/analytics';
import { createClient } from '@/lib/supabase/server';
import { DashboardStats } from '@/lib/types';
import { TASK_STATUS_COLORS } from '@/lib/constants';
import { StatCard } from '@/components/dashboard/stat-card';
import { TaskStatusChart } from '@/components/dashboard/task-status-chart';
import { WorkloadChart } from '@/components/dashboard/workload-chart';
import { CompletionTrendChart } from '@/components/dashboard/completion-trend-chart';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  Users,
  UserCheck,
  ClipboardList,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Activity,
  AlertCircle,
  Brain,
  Plus,
  Eye,
  ShieldCheck,
} from 'lucide-react';

const demoStats: DashboardStats = {
  totalEmployees: 20,
  activeEmployees: 17,
  pendingTasks: 8,
  inProgressTasks: 5,
  completedTasks: 12,
  delayedTasks: 3,
  workforceUtilization: 76,
  openIssues: 4,
};

const demoStatusData = [
  { status: 'Assigned', count: 5, fill: TASK_STATUS_COLORS.assigned },
  { status: 'Accepted', count: 3, fill: TASK_STATUS_COLORS.accepted },
  { status: 'In Progress', count: 5, fill: TASK_STATUS_COLORS.in_progress },
  { status: 'Completed', count: 8, fill: TASK_STATUS_COLORS.completed },
  { status: 'Verified', count: 4, fill: TASK_STATUS_COLORS.verified },
  { status: 'Closed', count: 3, fill: TASK_STATUS_COLORS.closed },
];

const demoWorkloadData = [
  { name: 'Rahul S.', tasks: 6, department: 'Maintenance' },
  { name: 'Priya S.', tasks: 4, department: 'Housekeeping' },
  { name: 'Amit K.', tasks: 3, department: 'Security' },
  { name: 'Neha G.', tasks: 5, department: 'Cleaning' },
  { name: 'Vikram P.', tasks: 2, department: 'Technical' },
  { name: 'Sanjay M.', tasks: 4, department: 'Maintenance' },
  { name: 'Anita D.', tasks: 1, department: 'Housekeeping' },
];

function getDemoTrendData() {
  const trend = [];
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    trend.push({
      date: date.toISOString().split('T')[0],
      completed: Math.floor(Math.random() * 3) + 1,
      assigned: Math.floor(Math.random() * 4) + 1,
    });
  }
  return trend;
}

export default async function DashboardPage() {
  let stats: any = demoStats;
  let statusData = demoStatusData;
  let workloadData = demoWorkloadData;
  let trendData = getDemoTrendData();

  try {
    const [statsRes, statusRes, workloadRes, trendRes] = await Promise.all([
      getDashboardStats(),
      getTaskStatusDistribution(),
      getWorkloadDistribution(),
      getCompletionTrend(),
    ]);
    if (statsRes?.data) stats = statsRes.data;
    if (statusRes?.data) statusData = Array.isArray(statusRes.data) ? (statusRes.data as any) : demoStatusData;
    if (workloadRes?.data) workloadData = Array.isArray(workloadRes.data) ? (workloadRes.data as any) : demoWorkloadData;
    if (trendRes?.data) trendData = Array.isArray(trendRes.data) ? trendRes.data : getDemoTrendData();
  } catch {
    // Use demo data
  }

  const statCards = [
    { title: 'Total Employees', value: stats.totalEmployees, icon: Users, description: 'Registered workforce' },
    { title: 'Active Employees', value: stats.activeEmployees, icon: UserCheck, description: 'Currently active' },
    { title: 'Pending Tasks', value: stats.pendingTasks, icon: ClipboardList, description: 'Awaiting action' },
    { title: 'In Progress', value: stats.inProgressTasks, icon: Clock, description: 'Currently being worked on' },
    { title: 'Completed Tasks', value: stats.completedTasks, icon: CheckCircle2, description: 'Successfully completed' },
    { title: 'Delayed Tasks', value: stats.delayedTasks, icon: AlertTriangle, description: 'Past due date', changeType: 'negative' as const },
    { title: 'Utilization', value: `${stats.workforceUtilization}%`, icon: Activity, description: 'Workforce utilization rate' },
    { title: 'Open Issues', value: stats.openIssues, icon: AlertCircle, description: 'AI-flagged concerns' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">AI-Enabled Workforce Management Overview</p>
        </div>
        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
          <Brain className="w-3 h-3 mr-1" />
          AI-Assisted Prototype
        </Badge>
      </div>

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <StatCard
            key={card.title}
            title={card.title}
            value={card.value}
            icon={card.icon}
            description={card.description}
          />
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TaskStatusChart data={statusData} />
        <WorkloadChart data={workloadData} />
      </div>

      {/* Completion Trend */}
      <CompletionTrendChart data={trendData} />

      {/* Quick Actions & AI Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            <Link href="/tasks/new">
              <Button className="w-full" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Create Task
              </Button>
            </Link>
            <Link href="/employees">
              <Button variant="outline" className="w-full" size="sm">
                <Eye className="w-4 h-4 mr-2" />
                View Employees
              </Button>
            </Link>
            <Link href="/recommendations">
              <Button variant="outline" className="w-full" size="sm">
                <Brain className="w-4 h-4 mr-2" />
                AI Recommendations
              </Button>
            </Link>
            <Link href="/human-review">
              <Button variant="outline" className="w-full" size="sm">
                <ShieldCheck className="w-4 h-4 mr-2" />
                Review Queue
              </Button>
            </Link>
          </div>
        </Card>

        {/* AI Summary */}
        <Card className="p-6 border-purple-100 bg-purple-50/30">
          <div className="flex items-center gap-2 mb-3">
            <Brain className="w-5 h-5 text-purple-600" />
            <h2 className="text-lg font-semibold">AI Summary</h2>
            <Badge variant="outline" className="text-xs bg-white">Prototype</Badge>
          </div>
          <div className="space-y-3 text-sm text-gray-700">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
              <p>{stats.delayedTasks} tasks are past their due date and require attention.</p>
            </div>
            <div className="flex items-start gap-2">
              <Activity className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <p>Workforce utilization is at {stats.workforceUtilization}%. {stats.workforceUtilization < 70 ? 'Consider optimizing task distribution.' : 'Operating within expected range.'}</p>
            </div>
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
              <p>{stats.openIssues} AI-generated insights require human review.</p>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-4 italic">AI-generated workforce insight — Rule-based analysis</p>
        </Card>
      </div>
    </div>
  );
}
