import Link from 'next/link';
import { TaskTable } from '@/components/tasks/task-table';
import { getDemoStore } from '@/lib/demo-store';
import { cookies } from 'next/headers';
import { Plus, ClipboardList } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const dynamic = 'force-dynamic';

export default async function TasksPage() {
  const store = getDemoStore();
  const role = ((await cookies()).get('demo-role')?.value || 'admin') as any;

  // Frontline employees only see tasks assigned to them (demo employee = Rajesh Kumar).
  const tasks =
    role === 'employee' ? store.tasks.filter((t) => t.assigned_employee_id === 'emp-7') : store.tasks;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-border/60">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-500/20">
              <ClipboardList className="w-3.5 h-3.5 mr-1" />
              Live Work Orders ({tasks.length})
            </span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            Task Operations & Dispatch
          </h1>
          <p className="text-sm font-medium text-muted-foreground mt-1">
            End-to-End Coordination: Assigned → Accepted → In Progress → Completed → Verified → Closed
          </p>
        </div>
        {role !== 'employee' && (
          <Link href="/tasks/new">
            <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold shadow-md shadow-indigo-500/20 px-4 py-2">
              <Plus className="w-4 h-4 mr-1.5" />
              Create Task
            </Button>
          </Link>
        )}
      </div>

      <TaskTable tasks={tasks} userRole={role} />
    </div>
  );
}
