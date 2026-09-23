'use client';

import React, { useState } from 'react';
import { Task, UserRole } from '@/lib/types';
import { TASK_STATUS_COLORS } from '@/lib/constants';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Eye, AlertCircle, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, isPast, parseISO } from 'date-fns';
import Link from 'next/link';
import { getDemoEmployees } from '@/lib/demo-data';

interface TaskTableProps {
  tasks: Task[];
  userRole: UserRole;
  onView?: (taskId: string) => void;
}

export function TaskTable({ tasks, userRole, onView }: TaskTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const allEmployees = React.useMemo(() => getDemoEmployees(), []);
  const employeeMap = React.useMemo(() => {
    return Object.fromEntries(allEmployees.map(e => [e.id, e]));
  }, [allEmployees]);

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (task.location && task.location.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getPriorityBadge = (priority: string = '') => {
    const p = (priority || '').toLowerCase().trim();
    if (p === 'urgent') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-600 text-white shadow-sm">
          Urgent
        </span>
      );
    }
    if (p === 'high') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
          High
        </span>
      );
    }
    if (p === 'medium') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
          Medium
        </span>
      );
    }
    if (p === 'low') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
          Low
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700">
        Standard
      </span>
    );
  };

  const getStatusBadge = (status: string = '') => {
    const color = TASK_STATUS_COLORS[status.toLowerCase()] || '#6366f1';

    return (
      <div className="flex items-center gap-2">
        <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: color }} />
        <span className="capitalize text-sm font-bold text-foreground">
          {status.replace(/_/g, ' ')}
        </span>
      </div>
    );
  };

  const isOverdue = (dueDate: string | undefined, status: string) => {
    if (!dueDate) return false;
    if (status === 'completed' || status === 'verified' || status === 'closed') return false;
    try {
      return isPast(parseISO(dueDate));
    } catch {
      return false;
    }
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card p-4 rounded-xl border border-border shadow-sm">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by title, category, or location..."
            className="pl-9 bg-background border-border text-foreground placeholder:text-muted-foreground font-medium text-sm rounded-lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <select
            className="flex h-10 w-full sm:w-48 rounded-lg border border-border bg-background px-3 py-2 text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Operational Statuses</option>
            <option value="assigned">Assigned</option>
            <option value="accepted">Accepted</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="verified">Verified</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden hidden md:block">
        <Table>
          <TableHeader className="bg-muted/50 border-b border-border">
            <TableRow>
              <TableHead className="font-extrabold text-foreground text-xs uppercase tracking-wider py-3.5">
                Task ID
              </TableHead>
              <TableHead className="font-extrabold text-foreground text-xs uppercase tracking-wider py-3.5">
                Title & Details
              </TableHead>
              <TableHead className="font-extrabold text-foreground text-xs uppercase tracking-wider py-3.5">
                Priority
              </TableHead>
              <TableHead className="font-extrabold text-foreground text-xs uppercase tracking-wider py-3.5">
                Frontline Assignee
              </TableHead>
              <TableHead className="font-extrabold text-foreground text-xs uppercase tracking-wider py-3.5">
                Due Date
              </TableHead>
              <TableHead className="font-extrabold text-foreground text-xs uppercase tracking-wider py-3.5">
                Status
              </TableHead>
              <TableHead className="font-extrabold text-foreground text-xs uppercase tracking-wider text-right py-3.5">
                Action
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-border/60">
            {filteredTasks.length > 0 ? (
              filteredTasks.map((task) => {
                const overdue = isOverdue(task.due_date, task.status);

                return (
                  <TableRow key={task.id} className="hover:bg-muted/40 transition-colors">
                    <TableCell className="font-bold text-foreground text-xs font-mono">
                      {task.task_id || task.id.substring(0, 8)}
                    </TableCell>

                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-bold text-sm text-foreground hover:text-indigo-600 transition-colors">
                          <Link href={`/tasks/${task.id}`}>{task.title}</Link>
                        </span>
                        <span className="text-xs font-medium text-muted-foreground mt-0.5">
                          {task.category} • {task.location || 'Central Facility'}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell>{getPriorityBadge(task.priority)}</TableCell>

                    <TableCell>
                      {task.assigned_employee_id ? (
                        <Link
                          href={`/employees/${task.assigned_employee_id}`}
                          className="flex items-center gap-1.5 font-bold text-sm text-foreground hover:text-indigo-600 transition-colors group"
                        >
                          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                          <span className="truncate max-w-[150px] group-hover:underline">
                            {employeeMap[task.assigned_employee_id]?.name || `Staff #${task.assigned_employee_id.replace('emp-', '')}`}
                          </span>
                        </Link>
                      ) : (
                        <span className="text-xs text-muted-foreground font-semibold italic">
                          Awaiting Match
                        </span>
                      )}
                    </TableCell>

                    <TableCell>
                      <div
                        className={cn(
                          'text-sm font-semibold flex items-center',
                          overdue ? 'text-rose-600 font-bold' : 'text-foreground/90'
                        )}
                      >
                        {overdue && <AlertCircle className="w-3.5 h-3.5 mr-1 text-rose-600" />}
                        {task.due_date ? format(new Date(task.due_date), 'MMM dd, yyyy') : 'No Date'}
                      </div>
                    </TableCell>

                    <TableCell>{getStatusBadge(task.status)}</TableCell>

                    <TableCell className="text-right">
                      <Link href={`/tasks/${task.id}`}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-950/40"
                        >
                          Inspect →
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-28 text-center text-muted-foreground font-medium">
                  No matching tasks found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {filteredTasks.map((task) => (
          <div key={task.id} className="bg-card p-4 rounded-xl border border-border shadow-sm space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-muted-foreground">{task.task_id || task.id}</span>
              {getPriorityBadge(task.priority)}
            </div>
            <div>
              <h4 className="font-bold text-base text-foreground">{task.title}</h4>
              <p className="text-xs text-muted-foreground font-medium">{task.category} • {task.location}</p>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-border">
              {getStatusBadge(task.status)}
              <Link href={`/tasks/${task.id}`}>
                <Button size="sm" variant="outline" className="h-7 text-xs font-bold">
                  View
                </Button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
