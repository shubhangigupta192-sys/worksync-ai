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
  description,
}: StatCardProps) {
  return (
    <Card className="group overflow-hidden hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 border-border/60">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
            <h3 className="text-2xl font-bold text-foreground">{value}</h3>

            {(change || description) && (
              <div className="flex items-center gap-2 mt-1">
                {change && (
                  <span
                    className={cn(
                      'inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium',
                      changeType === 'positive' && 'text-emerald-700 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-900/30',
                      changeType === 'negative' && 'text-rose-700 bg-rose-100 dark:text-rose-400 dark:bg-rose-900/30',
                      changeType === 'neutral' && 'text-muted-foreground bg-muted'
                    )}
                  >
                    {changeType === 'positive' && <ArrowUpRight className="w-3 h-3 mr-0.5" />}
                    {changeType === 'negative' && <ArrowDownRight className="w-3 h-3 mr-0.5" />}
                    {changeType === 'neutral' && <Minus className="w-3 h-3 mr-0.5" />}
                    {change}
                  </span>
                )}
                {description && (
                  <span className="text-xs text-muted-foreground">{description}</span>
                )}
              </div>
            )}
          </div>
          <div className="p-2.5 rounded-xl bg-primary/10 group-hover:bg-primary/15 transition-colors">
            <Icon className="w-5 h-5 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
