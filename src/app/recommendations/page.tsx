import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getDemoStore } from '@/lib/demo-store';
import { generateDecisionRecommendations } from '@/lib/ai/decision-support';
import { getDemoEmployees } from '@/lib/demo-data';
import { Brain, ShieldCheck, Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const TYPE_LABELS: Record<string, string> = {
  workload_rebalance: 'Workload Rebalance',
  schedule_optimization: 'Schedule Optimization',
  task_assignment: 'Task Assignment',
};

export default function RecommendationsPage() {
  const store = getDemoStore();
  const decisionRecs = generateDecisionRecommendations(getDemoEmployees() as any, store.tasks);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/60">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-500/20">
              <Brain className="w-3.5 h-3.5 mr-1" />
              Intelligence Engine Active
            </span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            AI Task Matching & Decision Support
          </h1>
          <p className="text-sm font-medium text-muted-foreground mt-1">
            Algorithmic workforce optimization recommendations based on availability, workload, and skills.
          </p>
        </div>

        <Link href="/human-review">
          <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold shadow-md shadow-indigo-500/20 px-4 py-2">
            <ShieldCheck className="w-4 h-4 mr-1.5" />
            Open Review Queue →
          </Button>
        </Link>
      </div>

      {decisionRecs.length === 0 ? (
        <Card className="p-8 text-center text-muted-foreground font-medium border-dashed">
          Workforce distribution is currently balanced. No critical bottlenecks or scheduling gaps detected.
        </Card>
      ) : (
        <div className="grid gap-4">
          {decisionRecs.map((rec, i) => (
            <Card key={i} className="border border-border/80 bg-card shadow-sm hover:shadow-md transition-all">
              <CardHeader className="pb-3 border-b border-border/40">
                <div className="flex flex-wrap justify-between items-start gap-2">
                  <div>
                    <CardTitle className="text-base font-extrabold text-foreground flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-indigo-500" /> {rec.title}
                    </CardTitle>
                    <CardDescription className="text-xs font-semibold text-muted-foreground mt-1">
                      {TYPE_LABELS[rec.type] || rec.type}
                    </CardDescription>
                  </div>
                  <Badge className="bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30 font-bold text-xs">
                    {Math.round(rec.confidence * 100)}% Match Confidence
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="pt-4 space-y-3">
                <div className="p-3 rounded-lg bg-muted/40 border border-border/60">
                  <p className="text-sm font-semibold text-foreground">
                    <span className="font-extrabold text-indigo-600 dark:text-indigo-400">Diagnosis: </span>
                    {rec.issue}
                  </p>
                  <p className="text-sm font-medium text-foreground/90 mt-1">
                    <span className="font-extrabold text-emerald-600 dark:text-emerald-400">Recommended Action: </span>
                    {rec.recommendation}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 text-xs text-muted-foreground">
                  <span className="font-medium">
                    Involves {rec.affectedEmployeeIds.length} staff member(s) and {rec.affectedTaskIds.length} task(s).
                  </span>
                  <Link href="/human-review" className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1">
                    Review & Authorize in Queue <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
