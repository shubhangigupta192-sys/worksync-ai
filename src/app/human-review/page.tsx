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
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="pb-4 border-b border-border/60">
        <div className="flex items-center gap-2 mb-1">
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
            <ShieldCheck className="w-3.5 h-3.5 mr-1" />
            Decision Governance Active
          </span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
          Human-in-the-Loop Review Queue
        </h1>
        <p className="text-sm font-medium text-muted-foreground mt-1">
          Supervisory Governance: AI suggests optimal allocations — verified human supervisors retain final authority.
        </p>
      </div>

      <div className="bg-amber-500/10 border-l-4 border-amber-500 p-4 rounded-r-xl border border-amber-500/20">
        <p className="text-amber-900 dark:text-amber-200 text-sm font-semibold flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
          Responsible AI Principle: All task recommendations require human approval before field dispatch. Every decision and override is cryptographically logged.
        </p>
      </div>

      {!canReview && (
        <Card className="p-4 border-border bg-card">
          <p className="text-sm font-medium text-muted-foreground">
            You are logged in as a frontline staff member. The review queue is reserved for Supervisors and HR Administrators.
          </p>
        </Card>
      )}

      {/* Pending Recommendations */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <h2 className="text-xl font-bold text-foreground">Pending Workforce Recommendations</h2>
          <Badge className="bg-indigo-600 text-white font-bold">{pendingRecs.length}</Badge>
        </div>

        {pendingRecs.length === 0 ? (
          <Card className="p-8 text-center text-muted-foreground font-medium border-dashed">
            All pending recommendations have been reviewed and approved. Create a new task to generate matching recommendations.
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

      {/* Operational Insights */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-amber-500" />
          <h2 className="text-xl font-bold text-foreground">Operational Insights & Pattern Alerts</h2>
          <Badge className="bg-amber-600 text-white font-bold">{activeInsights.length}</Badge>
        </div>

        {activeInsights.length === 0 ? (
          <Card className="p-6 text-center text-muted-foreground font-medium border-dashed">
            No active operational anomalies detected.
          </Card>
        ) : (
          <div className="grid gap-4">
            {activeInsights.map((insight) => (
              <InsightActionPanel key={insight.id} insight={insight} canReview={canReview} />
            ))}
          </div>
        )}
      </section>

      {/* Recent Decisions Audit */}
      {recentDecisions.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-foreground">Recent Governance Decisions</h2>
          <div className="space-y-2">
            {recentDecisions.map((dec) => (
              <Card key={dec.id} className="p-4 border-border bg-card">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-foreground capitalize">{dec.decision}</span>
                      <span className="text-xs text-muted-foreground">by Supervisor #{dec.decision_by.substring(0, 6)}</span>
                    </div>
                    {dec.decision_reason && (
                      <p className="text-xs text-muted-foreground mt-1 font-medium">{dec.decision_reason}</p>
                    )}
                  </div>
                  <span className="text-[11px] font-semibold text-muted-foreground">
                    {new Date(dec.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
