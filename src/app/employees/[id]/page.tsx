import Link from 'next/link';
import { getDemoEmployees, getEmployeeAnalytics } from '@/lib/demo-data';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EmployeePerformanceChart } from '@/components/charts/employee-performance-chart';
import { Mail, Phone, MapPin, Calendar, Clock, CheckCircle, AlertTriangle, Star, ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

export const dynamic = 'force-dynamic';

export function generateStaticParams() {
  const employees = getDemoEmployees();
  return employees.map((employee) => ({
    id: employee.id,
  }));
}

export default async function EmployeeAnalyticsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const analytics = getEmployeeAnalytics(id);

  if (!analytics) {
    notFound();
  }

  const { employee, monthlyPerformance, leaveHistory, leaveSummary, recentTasks, comparisonToAvg } = analytics;

  const initials = employee.name.split(' ').map((n: string) => n[0]).join('').toUpperCase();
  
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Profile Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
            <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center text-primary text-3xl font-bold shrink-0">
              {initials}
            </div>
            
            <div className="flex-1 space-y-2">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-bold">{employee.name}</h1>
                <Badge variant={employee.status === 'active' ? 'default' : 'secondary'}>
                  {employee.status}
                </Badge>
                <Badge variant={employee.availability === 'available' ? 'outline' : employee.availability === 'busy' ? 'destructive' : 'secondary'}>
                  {employee.availability.replace('_', ' ')}
                </Badge>
              </div>
              
              <div className="flex flex-wrap items-center gap-4 text-muted-foreground text-sm">
                <div className="flex items-center gap-1">
                  <span className="font-medium text-foreground">{employee.id}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="font-medium">{employee.role}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{employee.location}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Mail className="h-4 w-4" />
                  <span>{employee.email}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Phone className="h-4 w-4" />
                  <span>{employee.phone}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-end gap-2 text-right">
              <div className="flex items-center gap-1 text-yellow-500">
                <Star className="h-6 w-6 fill-current" />
                <span className="text-2xl font-bold text-foreground">{employee.performance_score.toFixed(1)}</span>
                <span className="text-muted-foreground">/ 5</span>
              </div>
              <div className="text-sm text-muted-foreground">
                Joined {format(new Date(employee.created_at), 'MMM yyyy')}
              </div>
              <div className="flex flex-wrap gap-1 mt-2 justify-end">
                {employee.skills.map(skill => (
                  <Badge key={skill} variant="outline" className="text-xs">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Tasks Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{employee.tasks_completed_total}</div>
            <p className="text-xs text-muted-foreground">
              {employee.tasks_completed_this_month} this month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Avg Completion Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{employee.average_completion_time_hours}h</div>
            <p className={cn(
              "text-xs",
              comparisonToAvg.completionTimeVsAvg < 0 ? "text-green-500" : "text-red-500"
            )}>
              {Math.abs(comparisonToAvg.completionTimeVsAvg)}h {comparisonToAvg.completionTimeVsAvg < 0 ? 'faster' : 'slower'} than avg
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{employee.attendance_rate}%</div>
            <p className={cn(
              "text-xs",
              comparisonToAvg.attendanceVsAvg >= 0 ? "text-green-500" : "text-red-500"
            )}>
              {Math.abs(comparisonToAvg.attendanceVsAvg)}% {comparisonToAvg.attendanceVsAvg >= 0 ? 'above' : 'below'} avg
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Tasks vs Average</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {comparisonToAvg.tasksVsAvg > 0 ? '+' : ''}{comparisonToAvg.tasksVsAvg}%
            </div>
            <p className="text-xs text-muted-foreground">
              Compared to department
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="performance">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="tasks">Recent Tasks</TabsTrigger>
              <TabsTrigger value="leave">Leave History</TabsTrigger>
            </TabsList>
            
            <TabsContent value="performance" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Performance</CardTitle>
                  <CardDescription>Task completion history over the last 6 months</CardDescription>
                </CardHeader>
                <CardContent>
                  <EmployeePerformanceChart data={monthlyPerformance} />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="tasks" className="space-y-4">
              <Card className="border border-border shadow-sm">
                <CardHeader className="pb-3 border-b border-border/50">
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="text-lg font-bold text-foreground">Assigned Tasks Queue</CardTitle>
                      <CardDescription className="text-xs font-medium">Real-time status of work orders assigned to this employee</CardDescription>
                    </div>
                    <Badge variant="outline" className="font-bold text-xs">
                      {recentTasks.length} {recentTasks.length === 1 ? 'Task' : 'Tasks'} Logged
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  {recentTasks.length === 0 ? (
                    <div className="text-center py-8 text-sm text-muted-foreground font-medium">
                      No tasks currently assigned to this worker.
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="font-extrabold text-foreground text-xs uppercase">Task</TableHead>
                          <TableHead className="font-extrabold text-foreground text-xs uppercase">Workflow State</TableHead>
                          <TableHead className="font-extrabold text-foreground text-xs uppercase">Priority</TableHead>
                          <TableHead className="font-extrabold text-foreground text-xs uppercase">Assigned Date</TableHead>
                          <TableHead className="font-extrabold text-foreground text-xs uppercase text-right">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {recentTasks.map((task) => (
                          <TableRow key={task.id} className="hover:bg-muted/40 transition-colors">
                            <TableCell className="font-bold text-foreground text-sm">
                              <Link href={`/tasks/${task.id}`} className="hover:text-indigo-600 transition-colors">
                                {task.title}
                              </Link>
                              <div className="text-[11px] font-semibold text-muted-foreground mt-0.5">
                                {task.task_id} • {task.category}
                              </div>
                            </TableCell>
                            <TableCell>
                              {task.status === 'assigned' && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-300 dark:border-blue-800">
                                  Assigned (Awaiting Accept)
                                </span>
                              )}
                              {task.status === 'accepted' && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-300 dark:border-purple-800">
                                  Accepted by Worker
                                </span>
                              )}
                              {task.status === 'in_progress' && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                                  In Progress
                                </span>
                              )}
                              {task.status === 'completed' && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                                  Completed
                                </span>
                              )}
                              {task.status === 'verified' && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-800">
                                  Verified
                                </span>
                              )}
                              {task.status === 'closed' && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border border-slate-300">
                                  Closed
                                </span>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className={cn(
                                'font-bold text-xs capitalize',
                                task.priority === 'urgent' ? 'text-red-600 border-red-400 bg-red-50' :
                                task.priority === 'high' ? 'text-orange-600 border-orange-400 bg-orange-50' :
                                task.priority === 'medium' ? 'text-amber-600 border-amber-400 bg-amber-50' : 'text-emerald-600 border-emerald-400 bg-emerald-50'
                              )}>
                                {task.priority}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground text-xs font-semibold">
                              {task.created_at ? format(new Date(task.created_at), 'MMM dd, yyyy') : 'Recent'}
                            </TableCell>
                            <TableCell className="text-right">
                              <Link href={`/tasks/${task.id}`}>
                                <Button variant="ghost" size="sm" className="h-8 px-2.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50">
                                  Inspect →
                                </Button>
                              </Link>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="leave" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Leave Records</CardTitle>
                  <CardDescription>Recent leave requests and approvals</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Days</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {leaveHistory.map((leave) => (
                        <TableRow key={leave.id}>
                          <TableCell className="capitalize">{leave.type}</TableCell>
                          <TableCell className="text-sm">
                            {format(new Date(leave.start_date), 'MMM dd')} - {format(new Date(leave.end_date), 'MMM dd, yyyy')}
                          </TableCell>
                          <TableCell>{leave.days}</TableCell>
                          <TableCell>
                            <Badge variant={
                              leave.status === 'approved' ? 'default' :
                              leave.status === 'rejected' ? 'destructive' : 'outline'
                            }>
                              {leave.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Leave Balances</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Casual Leave</span>
                <span className="font-medium">{leaveSummary.remaining_casual} / 12</span>
              </div>
              <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-blue-500 h-full" 
                  style={{ width: `${(leaveSummary.remaining_casual / 12) * 100}%` }}
                />
              </div>
              
              <div className="flex justify-between items-center pt-2">
                <span className="text-sm">Sick Leave</span>
                <span className="font-medium">{leaveSummary.remaining_sick} / 7</span>
              </div>
              <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-red-400 h-full" 
                  style={{ width: `${(leaveSummary.remaining_sick / 7) * 100}%` }}
                />
              </div>
              
              <div className="flex justify-between items-center pt-2">
                <span className="text-sm">Earned Leave</span>
                <span className="font-medium">{leaveSummary.remaining_earned} / 15</span>
              </div>
              <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-green-500 h-full" 
                  style={{ width: `${(leaveSummary.remaining_earned / 15) * 100}%` }}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
