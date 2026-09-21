'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface WorkloadChartProps {
  data: { name: string; tasks: number; department?: string }[];
}

export function WorkloadChart({ data }: WorkloadChartProps) {
  return (
    <Card className="col-span-1 h-full">
      <CardHeader>
        <CardTitle className="text-lg font-medium text-slate-800">Workload by Employee</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[250px] w-full">
          {data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#E2E8F0" />
                <XAxis type="number" tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  tick={{ fontSize: 12, fill: '#334155' }} 
                  width={100} 
                  axisLine={false} 
                  tickLine={false}
                />
                <Tooltip
                  cursor={{ fill: '#F1F5F9' }}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0' }}
                />
                <Bar 
                  dataKey="tasks" 
                  fill="#3B82F6" 
                  radius={[0, 4, 4, 0]}
                  barSize={20}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-slate-400 text-sm">
              No workload data available
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
