'use client';

import React, { useState } from 'react';
import { Task, UserRole } from '@/lib/types';
import { TASK_STATUS_COLORS } from '@/lib/constants';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Eye, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, isPast, parseISO } from 'date-fns';

interface TaskTableProps {
  tasks: Task[];
  userRole: UserRole;
  onView?: (taskId: string) => void;
}

export function TaskTable({ tasks, userRole, onView }: TaskTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          task.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high': return <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-200 border-0">High</Badge>;
      case 'medium': return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200 border-0">Medium</Badge>;
      case 'low': return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-0">Low</Badge>;
      default: return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    const color = TASK_STATUS_COLORS[status] || '#CBD5E1';
    
    return (
      <div className="flex items-center space-x-1.5">
        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
        <span className="capitalize text-sm text-slate-700 font-medium">{status.replace('_', ' ')}</span>
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-md border border-slate-200 shadow-sm">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
          <Input
            type="text"
            placeholder="Search tasks..."
            className="pl-9 bg-slate-50 border-slate-200"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <select
            className="flex h-10 w-full sm:w-48 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="unassigned">Unassigned</option>
            <option value="assigned">Assigned</option>
            <option value="accepted">Accepted</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="verified">Verified</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-md border border-slate-200 shadow-sm overflow-hidden hidden md:block">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="font-semibold text-slate-700">ID</TableHead>
              <TableHead className="font-semibold text-slate-700">Title & Category</TableHead>
              <TableHead className="font-semibold text-slate-700">Priority</TableHead>
              <TableHead className="font-semibold text-slate-700">Assigned To</TableHead>
              <TableHead className="font-semibold text-slate-700">Due Date</TableHead>
              <TableHead className="font-semibold text-slate-700">Status</TableHead>
              <TableHead className="font-semibold text-slate-700 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTasks.length > 0 ? (
              filteredTasks.map((task) => {
                const overdue = isOverdue(task.due_date, task.status);
                
                return (
                  <TableRow key={task.id} className="hover:bg-slate-50/50 transition-colors">
                    <TableCell className="font-medium text-slate-500 text-xs">{task.id.substring(0, 8)}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium text-slate-900">{task.title}</span>
                        <span className="text-xs text-slate-500">{task.category} • {task.location}</span>
                      </div>
                    </TableCell>
                    <TableCell>{getPriorityBadge(task.priority)}</TableCell>
                    <TableCell>
                      {task.assigned_employee_id ? (
                        <span className="text-sm font-medium text-slate-700">Emp #{task.assigned_employee_id.substring(0,4)}</span>
                      ) : (
                        <span className="text-sm text-slate-400 italic">Unassigned</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className={cn("text-sm flex items-center", overdue ? "text-rose-600 font-semibold" : "text-slate-600")}>
                        {overdue && <AlertCircle className="w-3 h-3 mr-1" />}
                        {task.due_date ? format(new Date(task.due_date), 'MMM dd, yyyy') : 'N/A'}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(task.status)}</TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0 text-slate-500 hover:text-primary"
                        onClick={() => onView && onView(task.id)}
                      >
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">View</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-slate-500">
                  No tasks found matching your search criteria.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile view omitted for brevity but would mirror employee table pattern */}
      <div className="md:hidden space-y-3">
         <div className="bg-white p-8 rounded-lg border border-slate-200 text-center text-slate-500">
           Please view on a larger screen to see the full table, or use the card view.
         </div>
      </div>
    </div>
  );
}
