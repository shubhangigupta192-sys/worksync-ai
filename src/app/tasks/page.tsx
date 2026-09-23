import Link from 'next/link';
import { TaskTable } from '@/components/tasks/task-table';
import { getDemoStore } from '@/lib/demo-store';
import { cookies } from 'next/headers';

export default async function TasksPage() {
  const store = getDemoStore();
  const role = ((await cookies()).get('demo-role')?.value || 'admin') as any;

  // Frontline employees only see tasks assigned to them (demo employee = Rajesh Kumar).
  const tasks =
    role === 'employee' ? store.tasks.filter((t) => t.assigned_employee_id === 'emp-7') : store.tasks;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Task Management</h1>
          <p className="text-sm text-gray-500 mt-1">
            Frontline task workflow: assigned → accepted → in progress → completed → verified → closed
          </p>
        </div>
        {role !== 'employee' && (
          <Link
            href="/tasks/new"
            className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/80 transition-colors"
          >
            + Create Task
          </Link>
        )}
      </div>

      <TaskTable tasks={tasks} userRole={role} />
    </div>
  );
}
