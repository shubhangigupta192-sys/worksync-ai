'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { TASK_STATUS_COLORS } from '@/lib/constants';

interface TaskStatusChartProps {
  data: { status: string; count: number }[];
}

export function TaskStatusChart({ data }: TaskStatusChartProps) {
  // Filter out zero counts
  const chartData = data.filter(item => item.count > 0);
  
  return (
    <Card className="col-span-1 h-full">
      <CardHeader>
        <CardTitle className="text-lg font-medium text-slate-800">Task Status Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[250px] w-full">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="count"
                  nameKey="status"
                  label={({ name, percent }) => `${name.replace('_', ' ')} (${(percent * 100).toFixed(0)}%)`}
                  labelLine={false}
                >
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={TASK_STATUS_COLORS[entry.status] || '#CBD5E1'} 
                    />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number, name: string) => [value, name.replace('_', ' ')]}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0' }}
                />
                <Legend 
                  formatter={(value: string) => <span className="capitalize">{value.replace('_', ' ')}</span>}
                  layout="horizontal" 
                  verticalAlign="bottom" 
                  align="center"
                  wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-slate-400 text-sm">
              No task data available
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
