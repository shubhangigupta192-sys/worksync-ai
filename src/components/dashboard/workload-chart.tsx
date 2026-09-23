'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface WorkloadChartProps {
  data: { name: string; tasks: number; department?: string }[];
}

export function WorkloadChart({ data }: WorkloadChartProps) {
  return (
    <Card className="col-span-1 h-full border-border/60 bg-card/60 backdrop-blur-sm shadow-sm hover:shadow-md transition-all">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold text-foreground">
            Active Workload by Frontline Member
          </CardTitle>
          <span className="text-xs font-medium text-muted-foreground bg-muted/60 px-2.5 py-1 rounded-full">
            Live Distribution
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[260px] w-full">
          {data && data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                layout="vertical"
                margin={{ top: 8, right: 30, left: 10, bottom: 8 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} vertical={true} stroke="currentColor" className="text-border/40" />
                <XAxis
                  type="number"
                  tick={{ fontSize: 11, fill: 'currentColor' }}
                  className="text-muted-foreground"
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  dataKey="name"
                  type="category"
                  tick={{ fontSize: 12, fill: 'currentColor' }}
                  className="text-foreground font-medium"
                  width={90}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  cursor={{ fill: 'currentColor', opacity: 0.05 }}
                  formatter={(value: any) => [`${value} Active Tasks`, 'Workload']}
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    borderColor: 'var(--border)',
                    borderRadius: '12px',
                    color: 'var(--foreground)',
                    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)',
                    fontSize: '13px'
                  }}
                />
                <Bar
                  dataKey="tasks"
                  fill="#6366f1"
                  radius={[0, 6, 6, 0]}
                  barSize={18}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
              No workload data available
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
