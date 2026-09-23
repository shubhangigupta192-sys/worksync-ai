'use client';

import React from 'react';
import { Task } from '@/lib/types';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, AlertCircle, Clock, CheckCircle2 } from 'lucide-react';
import { TASK_STATUS_COLORS } from '@/lib/constants';
import { format, isPast, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';

interface TaskCardProps {
  task: Task;
  onAction?: (taskId: string, action: string) => void;
}

export function TaskCard({ task, onAction }: TaskCardProps) {
  const isOverdue = task.status !== 'completed' && 
                    task.status !== 'verified' && 
                    task.status !== 'closed' && 
                    !!task.due_date && isPast(parseISO(task.due_date));

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high': return <Badge className="bg-rose-100 text-rose-700 border-rose-200 hover:bg-rose-200">High Priority</Badge>;
      case 'medium': return <Badge className="bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-200">Medium Priority</Badge>;
      case 'low': return <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-200">Low Priority</Badge>;
      default: return null;
    }
  };

  const getStatusColor = () => {
    return TASK_STATUS_COLORS[task.status] || '#CBD5E1';
  };

  const renderActionButton = () => {
    if (!onAction) return null;

    switch (task.status) {
      case 'assigned':
        return (
          <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={() => onAction(task.id, 'accept')}>
            Accept Task
          </Button>
        );
      case 'accepted':
        return (
          <Button className="w-full bg-amber-500 hover:bg-amber-600" onClick={() => onAction(task.id, 'start')}>
            Start Work
          </Button>
        );
      case 'in_progress':
        return (
          <Button className="w-full bg-emerald-600 hover:bg-emerald-700" onClick={() => onAction(task.id, 'complete')}>
            <CheckCircle2 className="w-4 h-4 mr-2" /> Mark as Completed
          </Button>
        );
      default:
        return (
          <Button variant="outline" className="w-full" onClick={() => onAction(task.id, 'view')}>
            View Details
          </Button>
        );
    }
  };

  return (
    <Card className={cn(
      "overflow-hidden transition-all hover:shadow-md border-slate-200 relative",
      isOverdue ? "border-rose-300" : ""
    )}>
      {/* Top color bar representing status */}
      <div className="h-1.5 w-full" style={{ backgroundColor: getStatusColor() }} />
      
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-start mb-2">
          <Badge variant="outline" className="capitalize text-xs font-medium text-slate-600 bg-slate-50">
            {task.category}
          </Badge>
          <div className="flex items-center space-x-1.5 bg-slate-50 px-2 py-1 rounded-full border border-slate-100">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: getStatusColor() }} />
            <span className="text-[10px] uppercase font-bold text-slate-600 tracking-wider">
              {task.status.replace('_', ' ')}
            </span>
          </div>
        </div>
        <h3 className="font-semibold text-lg text-slate-900 leading-tight">{task.title}</h3>
      </CardHeader>
      
      <CardContent className="p-4 pt-2 space-y-3">
        <div className="flex flex-wrap gap-2">
          {getPriorityBadge(task.priority)}
        </div>
        
        <div className="space-y-2 mt-4 text-sm text-slate-600">
          <div className="flex items-center">
            <MapPin className="w-4 h-4 mr-2 text-slate-400" />
            <span>{task.location}</span>
          </div>
          <div className={cn("flex items-center", isOverdue ? "text-rose-600 font-medium" : "")}>
            {isOverdue ? (
              <AlertCircle className="w-4 h-4 mr-2" />
            ) : (
              <Calendar className="w-4 h-4 mr-2 text-slate-400" />
            )}
            <span>{task.due_date ? `Due ${format(new Date(task.due_date), 'MMM dd, yyyy')}` : 'No due date'}</span>
            {isOverdue && <span className="ml-2 text-xs bg-rose-100 px-1.5 py-0.5 rounded text-rose-700">Overdue</span>}
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="p-4 bg-slate-50 border-t border-slate-100">
        {renderActionButton()}
      </CardFooter>
    </Card>
  );
}
