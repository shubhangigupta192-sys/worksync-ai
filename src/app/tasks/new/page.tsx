'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Brain, Sparkles, CheckCircle2, Loader2, ShieldCheck } from 'lucide-react';
import { TASK_CATEGORIES, LOCATIONS, TASK_STATUS_COLORS } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface RecommendationPreview {
  employeeId: string;
  employeeName: string;
  employeeRole: string;
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

const FACTOR_WEIGHTS: Record<string, number> = {
  availability: 25,
  workload: 25,
  skillMatch: 25,
  locationMatch: 15,
  priorityCapacity: 10,
};

const FACTOR_LABELS: Record<string, string> = {
  availability: 'Availability',
  workload: 'Workload headroom',
  skillMatch: 'Skill match',
  locationMatch: 'Location match',
  priorityCapacity: 'Priority capacity',
};

export default function NewTaskPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [loadingRecs, setLoadingRecs] = useState(false);
  const [error, setError] = useState('');
  const [recommendations, setRecommendations] = useState<RecommendationPreview[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<{ id: string; name: string } | null>(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: TASK_CATEGORIES[0],
    location: LOCATIONS[0],
    priority: 'medium',
    due_date: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const fetchRecommendations = async () => {
    if (!form.title.trim()) {
      setError('Please enter a task title first.');
      return;
    }
    setError('');
    setLoadingRecs(true);
    try {
      const { demoGetRecommendationsForTask } = await import('@/lib/demo-actions-review');
      const res = await demoGetRecommendationsForTask({
        title: form.title,
        category: form.category,
        location: form.location,
        priority: form.priority,
      });
      if (res.data) setRecommendations(res.data);
      else setError('Could not generate recommendations.');
    } finally {
      setLoadingRecs(false);
    }
  };

  const handleCreate = async () => {
    if (!form.title.trim() || !form.description.trim()) {
      setError('Title and description are required.');
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
      });
      const task = res.data;
      if (!task) {
        setError('Failed to create task.');
        return;
      }
      // If a recommendation was selected, record it in the Human Review queue.
      if (selectedEmployee) {
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
      }
      router.push(`/tasks/${task.id}`);
    } catch (e: any) {
      setError(e.message || 'Failed to create task.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Create New Task</h1>
        <p className="text-sm text-gray-500 mt-1">
          The rule-based recommender scores every available employee; a human supervisor reviews the
          suggestion before it is applied.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Task Details</CardTitle>
          <CardDescription>Core requirements of the task</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Task Title *</Label>
            <Input id="title" name="title" value={form.title} onChange={handleChange} placeholder="e.g. HVAC inspection in Main Building" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea id="description" name="description" value={form.description} onChange={handleChange} placeholder="What needs to be done, and any special instructions..." className="min-h-[90px]" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <select id="category" name="category" value={form.category} onChange={handleChange} className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                {TASK_CATEGORIES.map((c) => (<option key={c} value={c}>{c}</option>))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <select id="location" name="location" value={form.location} onChange={handleChange} className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                {LOCATIONS.map((l) => (<option key={l} value={l}>{l}</option>))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <select id="priority" name="priority" value={form.priority} onChange={handleChange} className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="due_date">Due Date</Label>
              <Input id="due_date" name="due_date" type="date" value={form.due_date} onChange={handleChange} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-primary/30 bg-primary/5">
        <CardHeader className="pb-3">
          <div className="flex items-center space-x-2">
            <Brain className="w-5 h-5 text-primary" />
            <CardTitle className="text-primary text-lg">AI-Assisted Assignment</CardTitle>
          </div>
          <CardDescription className="text-primary/80">
            Transparent rule-based scoring — availability 25%, workload 25%, skills 25%, location 15%, priority capacity 10%
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button type="button" onClick={fetchRecommendations} disabled={loadingRecs} className="w-full sm:w-auto">
            {loadingRecs ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Scoring employees...</>) : (<><Sparkles className="mr-2 h-4 w-4" /> Get AI Recommendation</>)}
          </Button>

          {recommendations.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold flex items-center text-slate-800">
                <Sparkles className="w-4 h-4 mr-1 text-amber-500" /> Top 3 Candidates (explainable)
              </h4>
              {recommendations.map((rec, index) => {
                const isSelected = selectedEmployee?.id === rec.employeeId;
                return (
                  <div
                    key={rec.employeeId}
                    onClick={() => setSelectedEmployee({ id: rec.employeeId, name: rec.employeeName })}
                    className={cn(
                      'p-4 rounded-lg border cursor-pointer transition-all',
                      isSelected ? 'border-primary bg-white ring-1 ring-primary shadow-sm' : 'border-slate-200 bg-white/70 hover:border-primary/50'
                    )}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="font-medium text-slate-900">{rec.employeeName}</span>
                        <span className="text-xs text-slate-500 ml-2">({rec.employeeRole})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {index === 0 && <Badge className="bg-emerald-500 hover:bg-emerald-600">Best match</Badge>}
                        <Badge variant={isSelected ? 'default' : 'secondary'}>{Math.round(rec.score * 100)}% match</Badge>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-primary" />}
                      </div>
                    </div>
                    <div className="mt-2 space-y-1.5">
                      {Object.entries(rec.factors).map(([key, f]: [string, any]) => (
                        <div key={key} className="flex items-center gap-2 text-xs">
                          <span className="w-36 shrink-0 text-slate-600">{FACTOR_LABELS[key] || key} <span className="text-slate-400">({FACTOR_WEIGHTS[key]}%)</span></span>
                          <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${Math.round(f.score * 100)}%`, backgroundColor: TASK_STATUS_COLORS.in_progress }} />
                          </div>
                          <span className="w-24 shrink-0 text-right text-slate-500 truncate" title={f.detail}>{f.detail}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
              {selectedEmployee && (
                <p className="text-xs text-primary flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {selectedEmployee.name} will be suggested for human review when you create the task — a supervisor must approve before assignment is final.
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {error && <p className="text-sm text-rose-600">{error}</p>}

      <div className="flex justify-end gap-3">
        <Button variant="outline" type="button" onClick={() => router.back()}>Cancel</Button>
        <Button type="button" onClick={handleCreate} disabled={submitting}>
          {submitting ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...</>) : 'Create Task'}
        </Button>
      </div>
    </div>
  );
}
