import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getDemoStore } from '@/lib/demo-store';
import { generateDecisionRecommendations } from '@/lib/ai/decision-support';
import { getDemoEmployees } from '@/lib/demo-data';
import { Brain, ShieldCheck, Sparkles } from 'lucide-react';
import Link from 'next/link';

const TYPE_LABELS: Record<string, string> = {
  workload_rebalance: 'Workload Rebalance',
  schedule_optimization: 'Schedule Optimization',
  task_assignment: 'Task Assignment',
};

export default function RecommendationsPage() {
  const store = getDemoStore();
  const decisionRecs = generateDecisionRecommendations(getDemoEmployees() as any, store.tasks);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Brain className="w-6 h-6 text-primary" /> AI Decision Support
        </h1>
        <p className="text-sm text-purple-600 mt-1 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4" />
          AI-assisted recommendations (rule-based prototype) — human review required before any action
        </p>
      </div>

      {decisionRecs.length === 0 ? (
        <Card className="p-6 text-center text-gray-500">
          No decision recommendations detected in the current workforce data. This is a healthy state — the
          rule-based detectors only fire when workload imbalance, scheduling gaps, or staffing issues are found.
        </Card>
      ) : (
        <div className="grid gap-4">
          {decisionRecs.map((rec, i) => (
            <Card key={i} className="border-l-4 border-l-purple-500">
              <CardHeader className="pb-2">
                <div className="flex flex-wrap justify-between items-start gap-2">
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-500" /> {rec.title}
                    </CardTitle>
                    <CardDescription className="mt-1">{TYPE_LABELS[rec.type] || rec.type}</CardDescription>
                  </div>
                  <Badge variant="secondary" className="bg-purple-100 text-purple-800 hover:bg-purple-200 border-0">
                    {Math.round(rec.confidence * 100)}% confidence
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-gray-700"><span className="font-medium">Issue:</span> {rec.issue}</p>
                <p className="text-sm text-gray-700"><span className="font-medium">Recommendation:</span> {rec.recommendation}</p>
                <p className="text-xs text-gray-500">
                  Based on {rec.affectedEmployeeIds.length} employee(s) and {rec.affectedTaskIds.length} task(s).
                  Review in the <Link href="/human-review" className="text-primary underline">Human Review queue</Link> before acting.
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
