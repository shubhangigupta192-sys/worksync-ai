'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const STATUS_COLOR_MAP: Record<string, string> = {
  assigned: '#6366f1',     // Indigo
  accepted: '#8b5cf6',     // Purple
  in_progress: '#f59e0b',  // Amber
  completed: '#10b981',    // Emerald
  verified: '#06b6d4',     // Cyan
  closed: '#64748b',       // Slate
};

interface TaskStatusChartProps {
  data: { status: string; count: number; fill?: string }[];
}

export function TaskStatusChart({ data }: TaskStatusChartProps) {
  // Filter out zero counts
  const chartData = (data || []).filter((item) => item.count > 0);

  const getColor = (statusStr: string, index: number) => {
    const key = (statusStr || '').toLowerCase().trim().replace(/\s+/g, '_');
    return STATUS_COLOR_MAP[key] || [
      '#6366f1', '#8b5cf6', '#f59e0b', '#10b981', '#06b6d4', '#ec4899'
    ][index % 6];
  };

  return (
    <Card className="col-span-1 h-full border-border/60 bg-card/60 backdrop-blur-sm shadow-sm hover:shadow-md transition-all">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold text-foreground">
            Task Status Distribution
          </CardTitle>
          <span className="text-xs font-medium text-muted-foreground bg-muted/60 px-2.5 py-1 rounded-full">
            Real-Time Pipeline
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[260px] w-full">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="45%"
                  innerRadius={65}
                  outerRadius={88}
                  paddingAngle={4}
                  dataKey="count"
                  nameKey="status"
                  strokeWidth={2}
                  stroke="var(--card)"
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.fill || getColor(entry.status, index)}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any, name: any) => [
                    `${value} Tasks`,
                    (name as string || '').replace(/_/g, ' ')
                  ]}
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    borderColor: 'var(--border)',
                    borderRadius: '12px',
                    color: 'var(--foreground)',
                    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)',
                    fontSize: '13px'
                  }}
                />
                <Legend
                  formatter={(value: string) => (
                    <span className="capitalize text-xs font-medium text-foreground/80">
                      {value.replace(/_/g, ' ')}
                    </span>
                  )}
                  layout="horizontal"
                  verticalAlign="bottom"
                  align="center"
                  wrapperStyle={{ fontSize: '12px', paddingTop: '16px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
              No task data recorded
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
