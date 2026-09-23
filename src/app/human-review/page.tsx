import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ReviewActionPanel } from '@/components/ai/review-action-panel';
import { InsightActionPanel } from '@/components/ai/insight-action-panel';
import { getDemoStore, getDemoActor } from '@/lib/demo-store';
import { ShieldCheck, Brain, Lightbulb } from 'lucide-react';

export default async function HumanReviewPage() {
  const store = getDemoStore();
  const actor = await getDemoActor();

  const canReview = actor.role === 'admin' || actor.role === 'supervisor';
  const pendingRecs = store.recommendations.filter((r) => r.status === 'pending');
  const activeInsights = store.insights.filter((i) => i.status === 'active');
  const recentDecisions = store.decisions.slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-lg">
        <p className="text-amber-800 font-medium flex items-center gap-2">
          <ShieldCheck className="w-5 h-5" />
          Human-in-the-Loop Governance: AI recommends — humans approve, modify, or reject. Every decision is logged.
        </p>
      </div>

      {!canReview && (
        <Card className="p-4">
          <p className="text-sm text-gray-600">
            You are logged in as a frontline employee demo user. The review queue is for supervisors and HR.
            Sign out and use the Supervisor or Admin demo login to review recommendations.
          </p>
        </Card>
      )}

      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-semibold text-gray-900">Pending Recommendations</h2>
          <Badge variant="secondary">{pendingRecs.length}</Badge>
        </div>

        {pendingRecs.length === 0 ? (
          <Card className="p-6 text-center text-gray-500">
            No items pending human review. Create a task with an AI recommendation to populate the queue.
          </Card>
        ) : (
          <div className="grid gap-4">
            {pendingRecs.map((rec) => (
              <ReviewActionPanel
                key={rec.id}
                recommendation={{
                  id: rec.id,
                  title: rec.title,
                  description: rec.description || '',
                  recommendation: rec.recommendation,
                  confidence: rec.confidence,
                  factors: rec.factors,
                  employeeName: (rec.factors as any)?.skillMatch?.detail || '',
                }}
                employeeName={store.tasks.find((t) => t.id === rec.related_task_id)?.title || ''}
                canReview={canReview}
              />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-amber-500" />
          <h2 className="text-xl font-semibold text-gray-900">AI Workforce Insights</h2>
          <Badge variant="secondary">{activeInsights.length}</Badge>
        </div>

        {activeInsights.length === 0 ? (
          <Card className="p-6 text-center text-gray-500">All insights have been reviewed.</Card>
        ) : (
          <div className="grid gap-3">
            {activeInsights.map((insight) => (
              <InsightActionPanel
                key={insight.id}
                insight={{
                  id: insight.id,
                  title: insight.title,
                  description: insight.description,
                  severity: insight.severity,
                  category: insight.category,
                }}
                canReview={canReview}
              />
            ))}
          </div>
        )}
      </section>

      {recentDecisions.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-gray-900">Recent Human Decisions</h2>
          <Card>
            <CardContent className="divide-y">
              {recentDecisions.map((d) => (
                <div key={d.id} className="py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                  <div>
                    <span className="text-sm font-medium capitalize">{d.decision}</span>
                    <span className="text-sm text-gray-500"> — {d.decision_reason}</span>
                  </div>
                  <span className="text-xs text-gray-400">{new Date(d.created_at).toLocaleString()}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>
      )}
    </div>
  );
}
