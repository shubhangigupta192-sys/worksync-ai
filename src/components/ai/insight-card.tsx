'use client';

import React from 'react';
import { AIInsight } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BrainCircuit, AlertTriangle, TrendingDown, TrendingUp, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InsightCardProps {
  insight: AIInsight;
}

export function InsightCard({ insight }: InsightCardProps) {
  const getSeverityStyles = () => {
    switch (insight.severity) {
      case 'critical': return { bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-700', icon: AlertTriangle };
      case 'warning': return { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', icon: TrendingDown };
      case 'info': return { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', icon: Lightbulb };
      default: return { bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-700', icon: BrainCircuit };
    }
  };

  const styles = getSeverityStyles();
  const Icon = styles.icon;

  return (
    <Card className={cn("overflow-hidden border", styles.border)}>
      <CardContent className="p-0">
        <div className={cn("p-4 border-b flex items-center justify-between", styles.bg, styles.border)}>
          <div className="flex items-center space-x-2">
            <Icon className={cn("w-5 h-5", styles.text)} />
            <h3 className={cn("font-semibold", styles.text)}>{insight.title}</h3>
          </div>
          <Badge variant="outline" className={cn("capitalize bg-white", styles.text, styles.border)}>
            {insight.severity}
          </Badge>
        </div>
        
        <div className="p-4 space-y-4">
          <p className="text-sm text-slate-700">{insight.description}</p>
          
          {insight.data_factors && insight.data_factors.length > 0 && (
            <div className="bg-slate-50 p-3 rounded-md border border-slate-100">
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Key Metrics</h4>
              <div className="grid grid-cols-2 gap-2">
                {insight.data_factors.map((factor: any, i: number) => (
                  <div key={i} className="flex flex-col">
                    <span className="text-[10px] text-slate-500">{factor.label}</span>
                    <span className="text-sm font-semibold text-slate-900">{factor.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="flex items-start bg-blue-50/50 p-2 rounded text-xs text-blue-800">
            <BrainCircuit className="w-3.5 h-3.5 mr-1.5 mt-0.5 shrink-0 opacity-70" />
            <p>
              <span className="font-semibold">AI-generated workforce insight</span> based on rule-based analysis of {insight.category} data patterns over the last 30 days.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
