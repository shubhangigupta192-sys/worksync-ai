'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Brain,
  Sparkles,
  Loader2,
  ShieldCheck,
  UserCheck,
  Scale,
  Briefcase,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import { TASK_CATEGORIES, LOCATIONS } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface RecommendationPreview {
  employeeId: string;
  employeeName: string;
  employeeRole: string;
  activeTasks: number;
  score: number;
  explanation: string;
  factors: {
    availability: { score: number; detail: string };
    workload: { score: number; detail: string };
    skillMatch: { score: number; detail: string };
    locationMatch: { score: number; detail: string };
    priorityCapacity: { score: number; detail: string };
  };
}

interface EmployeeOption {
  id: string;
  name: string;
  role: string;
  department: string;
  activeTasks: number;
  availability: string;
  skills: string[];
  location?: string;
  label: string;
}

const FACTOR_WEIGHTS: Record<string, number> = {
  availability: 25,
  workload: 25,
  skillMatch: 25,
  locationMatch: 15,
  priorityCapacity: 10,
};

const FACTOR_LABELS: Record<string, string> = {
  availability: 'Availability',
  workload: 'Equal Workload Balance',
  skillMatch: 'Skill Alignment',
  locationMatch: 'Location Proximity',
  priorityCapacity: 'Priority Capacity',
};

export default function NewTaskPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [loadingRecs, setLoadingRecs] = useState(false);
  const [error, setError] = useState('');
  const [recommendations, setRecommendations] = useState<RecommendationPreview[]>([]);
  const [allEmployees, setAllEmployees] = useState<EmployeeOption[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<{ id: string; name: string; role?: string } | null>(null);
  const [assignmentMode, setAssignmentMode] = useState<'auto' | 'manual'>('auto');

  const [form, setForm] = useState({
    title: 'Preventative HVAC & Ventilation Inspection',
    description: 'Perform regular scheduled inspection of air filtration systems, compressor pressure, and ducting in the facility.',
    category: TASK_CATEGORIES[0] || 'Maintenance',
    location: LOCATIONS[0] || 'Block A',
    priority: 'medium',
    due_date: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
  });

  // Load all employees with their current active workloads
  useEffect(() => {
    async function loadEmployees() {
      try {
        const { demoGetEmployeeOptions } = await import('@/lib/demo-actions-review');
        const res = await demoGetEmployeeOptions();
        if (res.data) {
          setAllEmployees(res.data);
        }
      } catch (err) {
        console.error('Failed to load employee options:', err);
      }
    }
    loadEmployees();
  }, []);

  // Compute recommendations automatically when category, location, or priority change
  const computeRecommendations = useCallback(async () => {
    setLoadingRecs(true);
    try {
      const { demoGetRecommendationsForTask } = await import('@/lib/demo-actions-review');
      const res = await demoGetRecommendationsForTask({
        title: form.title || 'New Task',
        category: form.category,
        location: form.location,
        priority: form.priority,
      });

      if (res.data && res.data.length > 0) {
        setRecommendations(res.data);
        // Automatically pre-select top match if in auto mode
        if (assignmentMode === 'auto') {
          const top = res.data[0];
          setSelectedEmployee({
            id: top.employeeId,
            name: top.employeeName,
            role: top.employeeRole,
          });
        }
      }
    } catch (err) {
      console.error('Failed to compute recommendations:', err);
    } finally {
      setLoadingRecs(false);
    }
  }, [form.category, form.location, form.priority, form.title, assignmentMode]);

  useEffect(() => {
    computeRecommendations();
  }, [computeRecommendations]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleManualEmployeeSelect = (employeeId: string) => {
    const emp = allEmployees.find((e) => e.id === employeeId);
    if (emp) {
      setSelectedEmployee({
        id: emp.id,
        name: emp.name,
        role: emp.role,
      });
    } else {
      setSelectedEmployee(null);
    }
  };

  const handleCreate = async () => {
    if (!form.title.trim() || !form.description.trim()) {
      setError('Task title and description are required.');
      return;
    }
    if (!selectedEmployee) {
      setError('Please select an employee to assign this task to, or use auto-assign.');
      return;
    }

    setError('');
    setSubmitting(true);
    try {
      const { demoCreateTask } = await import('@/lib/demo-actions-tasks');
      const res = await demoCreateTask({
        title: form.title,
        description: form.description,
        category: form.category,
        location: form.location,
        priority: form.priority,
        due_date: new Date(form.due_date).toISOString(),
        assigned_employee_id: selectedEmployee.id,
      });

      const task = res.data;
      if (!task) {
        setError(res.error || 'Failed to create task.');
        return;
      }

      // Record recommendation for audit trail
      const rec = recommendations.find((r) => r.employeeId === selectedEmployee.id);
      if (rec) {
        const { demoRecordPendingRecommendation } = await import('@/lib/demo-actions-review');
        await demoRecordPendingRecommendation({
          taskId: task.id,
          employeeId: rec.employeeId,
          employeeName: rec.employeeName,
          score: rec.score,
          explanation: rec.explanation,
          factors: rec.factors as Record<string, any>,
        });
      }

      // Redirect directly to the created task
      router.push(`/tasks/${task.id}`);
    } catch (e: any) {
      setError(e.message || 'Failed to create task.');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedRec = recommendations.find((r) => r.employeeId === selectedEmployee?.id);

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div className="border-b border-border pb-4">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
          Create & Assign Task
        </h1>
        <p className="text-sm font-medium text-muted-foreground mt-1">
          WorkSync AI automatically evaluates all 30 personnel, enforcing equal workload distribution and skill fit.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left Column: Task Form (3 cols) */}
        <div className="lg:col-span-3 space-y-6">
          <Card className="border border-border shadow-sm">
            <CardHeader className="pb-3 border-b border-border/50">
              <CardTitle className="text-lg font-bold text-foreground">Task Specifications</CardTitle>
              <CardDescription className="text-xs font-medium">Define scope, category, and requirements</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div className="space-y-1.5">
                <Label htmlFor="title" className="text-xs font-bold text-foreground">
                  Task Title *
                </Label>
                <Input
                  id="title"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="e.g. Electrical panel maintenance in Block B"
                  className="font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="description" className="text-xs font-bold text-foreground">
                  Detailed Description *
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Specific tasks, checklist items, safety gear required..."
                  className="min-h-[100px] text-sm font-normal"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="category" className="text-xs font-bold text-foreground">
                    Category (Skills Domain)
                  </Label>
                  <select
                    id="category"
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary shadow-sm"
                  >
                    {TASK_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="location" className="text-xs font-bold text-foreground">
                    Work Location
                  </Label>
                  <select
                    id="location"
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary shadow-sm"
                  >
                    {LOCATIONS.map((l) => (
                      <option key={l} value={l}>
                        {l}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="priority" className="text-xs font-bold text-foreground">
                    Priority Level
                  </Label>
                  <select
                    id="priority"
                    name="priority"
                    value={form.priority}
                    onChange={handleChange}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary shadow-sm"
                  >
                    <option value="low">Low (Standard Maintenance)</option>
                    <option value="medium">Medium (Regular Operations)</option>
                    <option value="high">High (Urgent Attention)</option>
                    <option value="urgent">Urgent (Emergency Response)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="due_date" className="text-xs font-bold text-foreground">
                    Target Completion Date
                  </Label>
                  <Input
                    id="due_date"
                    name="due_date"
                    type="date"
                    value={form.due_date}
                    onChange={handleChange}
                    className="font-medium"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: AI Auto-Assignment & Workload Balance (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-2 border-indigo-500/30 bg-card shadow-md">
            <CardHeader className="pb-3 border-b border-border/50 bg-indigo-50/50 dark:bg-indigo-950/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 rounded-lg bg-indigo-600 text-white">
                    <Scale className="w-4 h-4" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-extrabold text-foreground">
                      Smart Balanced Assignment
                    </CardTitle>
                    <CardDescription className="text-xs font-medium text-muted-foreground">
                      Equal workload distribution engine
                    </CardDescription>
                  </div>
                </div>
                {loadingRecs && <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />}
              </div>
            </CardHeader>

            <CardContent className="space-y-4 pt-4">
              {/* Assignment Mode Toggle */}
              <div className="flex items-center gap-2 p-1 bg-muted rounded-lg text-xs font-bold">
                <button
                  type="button"
                  onClick={() => {
                    setAssignmentMode('auto');
                    if (recommendations[0]) {
                      setSelectedEmployee({
                        id: recommendations[0].employeeId,
                        name: recommendations[0].employeeName,
                        role: recommendations[0].employeeRole,
                      });
                    }
                  }}
                  className={cn(
                    'flex-1 py-1.5 px-3 rounded-md transition-all flex items-center justify-center gap-1.5',
                    assignmentMode === 'auto'
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  Auto-Fit Match
                </button>
                <button
                  type="button"
                  onClick={() => setAssignmentMode('manual')}
                  className={cn(
                    'flex-1 py-1.5 px-3 rounded-md transition-all flex items-center justify-center gap-1.5',
                    assignmentMode === 'manual'
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
                  Manual Selection
                </button>
              </div>

              {/* Mode 1: Auto-Fit Selected Card */}
              {assignmentMode === 'auto' ? (
                <div className="space-y-3">
                  {recommendations.length > 0 && selectedRec ? (
                    <div className="p-4 rounded-xl border-2 border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/20 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <Badge className="bg-emerald-600 text-white font-bold mb-1.5 text-[11px]">
                            ✓ Best Equal Balance Fit
                          </Badge>
                          <h4 className="text-base font-extrabold text-foreground">
                            {selectedRec.employeeName}
                          </h4>
                          <p className="text-xs font-semibold text-muted-foreground">
                            {selectedRec.employeeRole} • {form.category}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-xl font-extrabold text-indigo-600 dark:text-indigo-400">
                            {Math.round(selectedRec.score * 100)}%
                          </span>
                          <p className="text-[10px] font-bold text-muted-foreground">Match Score</p>
                        </div>
                      </div>

                      {/* Workload equality indicator */}
                      <div className="p-2.5 rounded-lg bg-background border border-border space-y-1">
                        <div className="flex justify-between items-center text-xs font-bold">
                          <span className="flex items-center gap-1.5 text-foreground">
                            <Briefcase className="w-3.5 h-3.5 text-indigo-600" />
                            Active Tasks:
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                            {selectedRec.activeTasks} active tasks (Low Workload)
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground">
                          Assigning to {selectedRec.employeeName} prevents team burnout and maintains equal duty distribution across staff.
                        </p>
                      </div>

                      {/* Score Factors Breakdown */}
                      <div className="space-y-1.5 pt-1">
                        <p className="text-xs font-bold text-foreground">Algorithmic Match Factors:</p>
                        {Object.entries(selectedRec.factors).map(([key, f]: [string, any]) => (
                          <div key={key} className="space-y-0.5">
                            <div className="flex justify-between text-[11px]">
                              <span className="font-semibold text-muted-foreground">
                                {FACTOR_LABELS[key] || key} ({FACTOR_WEIGHTS[key]}%)
                              </span>
                              <span className="font-bold text-foreground">
                                {Math.round(f.score * 100)}%
                              </span>
                            </div>
                            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full bg-indigo-600 transition-all duration-300"
                                style={{ width: `${Math.round(f.score * 100)}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="pt-2 border-t border-border/60">
                        <p className="text-xs text-muted-foreground italic">
                          "{selectedRec.explanation}"
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="p-6 text-center text-muted-foreground text-sm">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-600" />
                      Evaluating 30 personnel for equal distribution...
                    </div>
                  )}

                  {/* Alternative Top Candidates */}
                  {recommendations.length > 1 && (
                    <div className="space-y-2 pt-2">
                      <p className="text-xs font-bold text-foreground uppercase tracking-wider">
                        Other Top Balanced Candidates:
                      </p>
                      <div className="space-y-1.5">
                        {recommendations.slice(1, 3).map((rec) => (
                          <button
                            key={rec.employeeId}
                            type="button"
                            onClick={() =>
                              setSelectedEmployee({
                                id: rec.employeeId,
                                name: rec.employeeName,
                                role: rec.employeeRole,
                              })
                            }
                            className={cn(
                              'w-full p-2.5 rounded-lg border text-left flex items-center justify-between text-xs transition-all',
                              selectedEmployee?.id === rec.employeeId
                                ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30'
                                : 'border-border bg-card hover:bg-muted/50'
                            )}
                          >
                            <div>
                              <p className="font-bold text-foreground">{rec.employeeName}</p>
                              <p className="text-[11px] text-muted-foreground">
                                {rec.employeeRole} • {rec.activeTasks} active tasks
                              </p>
                            </div>
                            <Badge variant="outline" className="font-bold">
                              {Math.round(rec.score * 100)}% match
                            </Badge>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Mode 2: Manual Selection with full employee matrix */
                <div className="space-y-3">
                  <Label htmlFor="manual-emp" className="text-xs font-bold text-foreground">
                    Select From All 30 Employees:
                  </Label>
                  <select
                    id="manual-emp"
                    value={selectedEmployee?.id || ''}
                    onChange={(e) => handleManualEmployeeSelect(e.target.value)}
                    className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary shadow-sm"
                  >
                    <option value="">-- Choose Employee --</option>
                    {allEmployees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.label} ({emp.department})
                      </option>
                    ))}
                  </select>

                  {selectedEmployee && (
                    <div className="p-3 bg-muted/40 rounded-lg border border-border text-xs space-y-1">
                      <p className="font-bold text-foreground">
                        Selected: {selectedEmployee.name} ({selectedEmployee.role})
                      </p>
                      <p className="text-muted-foreground">
                        Task will be directly dispatched and placed in this worker's queue for acceptance.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-300 dark:border-rose-800 rounded-lg flex items-center gap-2 text-sm text-rose-700 dark:text-rose-300 font-bold">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Action Footer */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-border">
        <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>
            Assigned to <strong className="text-foreground">{selectedEmployee ? selectedEmployee.name : 'Selected Staff'}</strong>. Frontline worker will receive and accept this task.
          </span>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button
            variant="outline"
            type="button"
            onClick={() => router.back()}
            disabled={submitting}
            className="w-full sm:w-auto font-bold"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleCreate}
            disabled={submitting || !selectedEmployee}
            className="w-full sm:w-auto font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-md shadow-indigo-500/20 px-6 py-2"
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Assigning Task...
              </>
            ) : (
              <>
                Create & Assign Task
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
