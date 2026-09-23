'use client';

import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BrainCircuit, Check, ShieldAlert, Sparkles, UserPlus } from 'lucide-react';
import { AIRecommendation } from '@/lib/types';
import { cn } from '@/lib/utils';
import { DecisionActionButtons } from './decision-action-buttons';

interface RecommendationCardProps {
  recommendation: AIRecommendation;
  onAction?: (id: string, action: string, reason?: string) => void;
}

export function RecommendationCard({ recommendation, onAction }: RecommendationCardProps) {
  const getIcon = () => {
    switch (recommendation.type) {
      case 'task_assignment': return <UserPlus className="w-5 h-5" />;
      case 'workload_rebalance': return <Sparkles className="w-5 h-5" />;
      case 'schedule_optimization': return <ShieldAlert className="w-5 h-5" />;
      default: return <BrainCircuit className="w-5 h-5" />;
    }
  };

  const getStatusColor = () => {
    switch (recommendation.status) {
      case 'approved': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'rejected': return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'modified': return 'bg-amber-100 text-amber-800 border-amber-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <Card className="border-indigo-100 shadow-sm relative overflow-hidden">
      <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500" />
      
      <CardHeader className="pb-3 flex flex-row items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-indigo-100 flex items-center">
              {getIcon()}
              <span className="ml-1.5 capitalize">{recommendation.type}</span>
            </Badge>
            <Badge variant="outline" className={cn("capitalize", getStatusColor())}>
              {recommendation.status}
            </Badge>
          </div>
          <h3 className="font-semibold text-lg text-slate-900 mt-2">{recommendation.title}</h3>
        </div>
        
        <div className="text-right flex flex-col items-end">
          <span className="text-xs text-slate-500 font-medium mb-1">Confidence</span>
          <div className="flex items-center space-x-2">
            <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className={cn(
                  "h-full rounded-full", 
                  recommendation.confidence > 0.8 ? "bg-emerald-500" : "bg-amber-500"
                )} 
                style={{ width: `${recommendation.confidence * 100}%` }}
              />
            </div>
            <span className="text-sm font-bold text-slate-700">
              {Math.round(recommendation.confidence * 100)}%
            </span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pb-4 space-y-4">
        <div className="bg-slate-50 p-3 rounded-md text-sm text-slate-700 border border-slate-100">
          {recommendation.recommendation}
        </div>
        
        <div>
          <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Key Factors</h4>
          <ul className="space-y-1">
            {Object.entries(recommendation.factors).slice(0, 3).map(([key, value]) => (
              <li key={key} className="flex items-center text-sm text-slate-600">
                <Check className="w-4 h-4 mr-2 text-emerald-500 shrink-0" />
                <span className="capitalize">{key.replace(/_/g, ' ')}</span>
                {typeof value === 'number' && (
                  <span className="ml-auto font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded">
                    {value.toFixed(2)}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
        
        <div className="text-[10px] text-slate-400 italic flex items-center">
          <BrainCircuit className="w-3 h-3 mr-1" />
          AI-Assisted Recommendation (Prototype)
        </div>
      </CardContent>

      {recommendation.status === 'pending' && onAction && (
        <CardFooter className="pt-0 pb-4 bg-slate-50/50 rounded-b-lg border-t border-slate-100 mt-2 px-4 py-3">
          <DecisionActionButtons 
            onApprove={(reason) => onAction(recommendation.id, 'approve', reason)}
            onModify={(reason) => onAction(recommendation.id, 'modify', reason)}
            onReject={(reason) => onAction(recommendation.id, 'reject', reason)}
          />
        </CardFooter>
      )}
    </Card>
  );
}
