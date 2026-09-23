import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SearchCode, Check, X, Info } from 'lucide-react';

interface ExplainabilityPanelProps {
  factors: Record<string, any>;
  confidence: number;
}

export function ExplainabilityPanel({ factors, confidence }: ExplainabilityPanelProps) {
  // Format factor keys for display
  const formatKey = (key: string) => {
    return key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const confidencePercentage = Math.round(confidence * 100);

  return (
    <Card className="border-slate-200 shadow-sm bg-slate-50">
      <CardHeader className="pb-3 border-b border-slate-200 bg-white">
        <div className="flex items-center space-x-2">
          <SearchCode className="w-5 h-5 text-indigo-500" />
          <CardTitle className="text-base text-slate-800">Transparent Rule-Based Analysis</CardTitle>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 space-y-4">
        <div className="flex items-start text-xs text-slate-600 bg-blue-50 p-2.5 rounded-md border border-blue-100">
          <Info className="w-4 h-4 mr-2 text-blue-500 shrink-0 mt-0.5" />
          <p>
            <strong>How this works:</strong> This recommendation is generated using a deterministic rule-based scoring algorithm, not a black-box machine learning model. It evaluates strict predefined criteria to ensure fairness and auditability.
          </p>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-slate-700 mb-3">Scoring Breakdown</h4>
          <div className="space-y-2.5">
            {Object.entries(factors).map(([key, value]) => {
              // Determine if it's a boolean or numeric factor
              const isBoolean = typeof value === 'boolean';
              const isPositive = isBoolean ? value : (typeof value === 'number' && value > 0.5);
              
              return (
                <div key={key} className="flex items-center justify-between bg-white p-2 rounded border border-slate-100">
                  <div className="flex items-center">
                    {isPositive ? (
                      <Check className="w-4 h-4 mr-2 text-emerald-500" />
                    ) : (
                      <X className="w-4 h-4 mr-2 text-rose-500" />
                    )}
                    <span className="text-sm text-slate-700">{formatKey(key)}</span>
                  </div>
                  <div className="font-mono text-xs font-medium">
                    {isBoolean ? (
                      <span className={value ? "text-emerald-600" : "text-rose-600"}>
                        {value ? 'PASS' : 'FAIL'}
                      </span>
                    ) : (
                      <span className="text-slate-600">
                        Score: {Number(value).toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="pt-3 border-t border-slate-200">
          <div className="flex justify-between items-end mb-2">
            <h4 className="text-sm font-semibold text-slate-700">Final Confidence Score</h4>
            <span className="text-lg font-bold text-slate-900">{confidencePercentage}%</span>
          </div>
          <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
            <div className="h-full bg-slate-900 transition-all" style={{ width: `${confidencePercentage}%` }} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
