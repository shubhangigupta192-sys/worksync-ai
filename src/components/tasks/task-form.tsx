'use client';

import React, { useState } from 'react';
import { Employee, TaskRecommendationResult } from '@/lib/types';
import { TASK_CATEGORIES, LOCATIONS } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Brain, Sparkles, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface TaskFormProps {
  employees: Employee[];
  onSubmit: (data: any) => void;
  recommendations?: TaskRecommendationResult[];
}

export function TaskForm({ employees, onSubmit, recommendations }: TaskFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: TASK_CATEGORIES[0],
    location: LOCATIONS[0],
    priority: 'medium',
    due_date: new Date().toISOString().split('T')[0],
    assigned_employee_id: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleApplyRecommendation = (empId: string) => {
    setFormData(prev => ({ ...prev, assigned_employee_id: empId }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="bg-slate-50 border-b border-slate-100">
              <CardTitle className="text-lg">Task Details</CardTitle>
              <CardDescription>Enter the core requirements of the task.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Task Title</Label>
                <Input 
                  id="title" 
                  name="title" 
                  value={formData.title} 
                  onChange={handleChange} 
                  required 
                  placeholder="e.g. Server Maintenance"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  name="description" 
                  value={formData.description} 
                  onChange={handleChange} 
                  required 
                  placeholder="Detailed explanation of what needs to be done..."
                  className="min-h-[100px]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <select 
                    id="category" 
                    name="category" 
                    className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                    value={formData.category}
                    onChange={handleChange}
                  >
                    {TASK_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <select 
                    id="location" 
                    name="location" 
                    className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                    value={formData.location}
                    onChange={handleChange}
                  >
                    {LOCATIONS.map(loc => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <select 
                    id="priority" 
                    name="priority" 
                    className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                    value={formData.priority}
                    onChange={handleChange}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="due_date">Due Date</Label>
                  <Input 
                    id="due_date" 
                    name="due_date" 
                    type="date"
                    value={formData.due_date} 
                    onChange={handleChange} 
                    required 
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-slate-200 shadow-sm overflow-hidden border-primary/20 bg-primary/5">
            <CardHeader className="bg-primary/10 border-b border-primary/10 pb-4">
              <div className="flex items-center space-x-2">
                <Brain className="w-5 h-5 text-primary" />
                <CardTitle className="text-primary text-lg">AI Assignment</CardTitle>
              </div>
              <CardDescription className="text-primary/70">
                Rule-based recommendations based on skills and availability.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="assigned_employee_id" className="text-slate-700">Manual Assignment</Label>
                <select 
                  id="assigned_employee_id" 
                  name="assigned_employee_id" 
                  className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  value={formData.assigned_employee_id}
                  onChange={handleChange}
                >
                  <option value="">-- Unassigned --</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} ({emp.department?.name || 'Unknown'})
                    </option>
                  ))}
                </select>
              </div>

              {recommendations && recommendations.length > 0 && (
                <div className="mt-6 space-y-3">
                  <h4 className="text-sm font-semibold flex items-center text-slate-800">
                    <Sparkles className="w-4 h-4 mr-1 text-amber-500" />
                    Top Recommendations
                  </h4>
                  
                  <div className="space-y-2">
                    {recommendations.slice(0, 3).map((rec, index) => {
                      const emp = rec.employee;
                      if (!emp) return null;
                      
                      const isSelected = formData.assigned_employee_id === emp.id;
                      
                      return (
                        <div 
                          key={emp.id}
                          className={cn(
                            "p-3 rounded-lg border text-sm transition-all cursor-pointer relative overflow-hidden",
                            isSelected 
                              ? "border-primary bg-white shadow-sm ring-1 ring-primary" 
                              : "border-slate-200 bg-white/60 hover:bg-white hover:border-primary/50"
                          )}
                          onClick={() => handleApplyRecommendation(emp.id)}
                        >
                          {isSelected && (
                            <div className="absolute top-2 right-2 text-primary">
                              <CheckCircle2 className="w-4 h-4" />
                            </div>
                          )}
                          
                          <div className="flex justify-between items-start mb-1 pr-6">
                            <span className="font-medium text-slate-900">{emp.name}</span>
                            <Badge variant={index === 0 ? "default" : "secondary"} className={index === 0 ? "bg-emerald-500 hover:bg-emerald-600" : ""}>
                              {Math.round(rec.score * 100)}% Match
                            </Badge>
                          </div>
                          
                          <div className="text-xs text-slate-500 mt-2 space-y-1">
                            {rec.factors.skillMatch && <p>✓ Skills match task category</p>}
                            {rec.factors.availability.score > 0.5 && <p>✓ High availability</p>}
                            {rec.factors.locationMatch && <p>✓ Same location</p>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      <div className="flex justify-end space-x-3 bg-white p-4 rounded-md border border-slate-200 shadow-sm">
        <Button type="button" variant="outline">Cancel</Button>
        <Button type="submit">Create Task</Button>
      </div>
    </form>
  );
}
