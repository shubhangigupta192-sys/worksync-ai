'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Eye, Loader2 } from 'lucide-react';

interface InsightCardProps {
  insight: {
    id: string;
    title: string;
    description: string;
    severity: string;
    category: string;
  };
  canReview: boolean;
}

const SEVERITY_STYLES: Record<string, { border: string; badge: string }> = {
  info: { border: 'border-l-sky-400', badge: 'bg-sky-100 text-sky-800 hover:bg-sky-200' },
  warning: { border: 'border-l-amber-400', badge: 'bg-amber-100 text-amber-800 hover:bg-amber-200' },
  critical: { border: 'border-l-rose-500', badge: 'bg-rose-100 text-rose-800 hover:bg-rose-200' },
};

export function InsightActionPanel({ insight, canReview }: InsightCardProps) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [pending, startTransition] = useTransition();

  if (!canReview) {
    return (
      <div className={`border-l-4 ${SEVERITY_STYLES[insight.severity]?.border || 'border-l-gray-300'} bg-white rounded-r-lg p-3`}>
        <p className="text-sm font-medium">{insight.title}</p>
        <p className="text-xs text-gray-500">{insight.description}</p>
      </div>
    );
  }

  const act = async (action: 'resolved' | 'acknowledged') => {
    setBusy(true);
    try {
      const { demoAcknowledgeInsight } = await import('@/lib/demo-actions-review');
      const res = await demoAcknowledgeInsight(insight.id, action, `${action} from review queue`);
      if (!res.error) startTransition(() => router.refresh());
    } finally {
      setBusy(false);
    }
  };

  const style = SEVERITY_STYLES[insight.severity] || SEVERITY_STYLES.info;

  return (
    <div className={`border-l-4 ${style.border} bg-white rounded-r-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-l-4 border-gray-100 shadow-sm`}>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <Badge variant="secondary" className={`${style.badge} border-0 capitalize`}>{insight.severity}</Badge>
          <span className="text-xs text-gray-400 capitalize">{insight.category}</span>
        </div>
        <p className="text-sm font-medium text-gray-900">{insight.title}</p>
        <p className="text-xs text-gray-500 mt-0.5">{insight.description}</p>
      </div>
      <div className="flex gap-2 shrink-0">
        <Button size="sm" variant="outline" type="button" disabled={busy || pending} onClick={() => act('acknowledged')}>
          {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Eye className="w-3.5 h-3.5 mr-1" />} Acknowledge
        </Button>
        <Button size="sm" type="button" disabled={busy || pending} onClick={() => act('resolved')}>
          <Check className="w-3.5 h-3.5 mr-1" /> Resolve
        </Button>
      </div>
    </div>
  );
}
