'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { MonthlyTaskData } from '@/lib/demo-data';

interface EmployeePerformanceChartProps {
  data: MonthlyTaskData[];
}

export function EmployeePerformanceChart({ data }: EmployeePerformanceChartProps) {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="assigned" fill="#3b82f6" name="Assigned" />
          <Bar dataKey="completed" fill="#22c55e" name="Completed" />
          <Bar dataKey="delayed" fill="#ef4444" name="Delayed" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
