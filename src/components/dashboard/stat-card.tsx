import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  description?: string;
}

export function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  change, 
  changeType = 'neutral',
  description 
}: StatCardProps) {
  
  const getChangeIcon = () => {
    switch (changeType) {
      case 'positive': return <ArrowUpRight className="w-3 h-3 mr-1" />;
      case 'negative': return <ArrowDownRight className="w-3 h-3 mr-1" />;
      default: return <Minus className="w-3 h-3 mr-1" />;
    }
  };

  const getChangeColorClass = () => {
    switch (changeType) {
      case 'positive': return 'text-emerald-600 bg-emerald-50';
      case 'negative': return 'text-rose-600 bg-rose-50';
      default: return 'text-slate-600 bg-slate-50';
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-500">{title}</p>
            <div className="flex items-baseline space-x-2">
              <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
            </div>
            
            {(change || description) && (
              <div className="flex items-center mt-2 space-x-2">
                {change && (
                  <span className={cn("inline-flex items-center px-2 py-0.5 rounded text-xs font-medium", getChangeColorClass())}>
                    {getChangeIcon()}
                    {change}
                  </span>
                )}
                {description && (
                  <span className="text-xs text-slate-500">{description}</span>
                )}
              </div>
            )}
          </div>
          <div className="p-3 bg-primary/5 rounded-full">
            <Icon className="w-6 h-6 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
