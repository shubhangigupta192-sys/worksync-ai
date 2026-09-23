import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getDemoStore } from '@/lib/demo-store';
import { ShieldCheck, ScrollText } from 'lucide-react';
import { format, parseISO } from 'date-fns';

const ACTION_STYLES: Record<string, string> = {
  CREATE: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/30',
  APPROVE: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
  MODIFY: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30',
  REJECT: 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30',
  STATUS_CHANGE: 'bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/30',
  VERIFY: 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border-cyan-500/30',
  GENERATE: 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/30',
  RESOLVE: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
  ACKNOWLEDGE: 'bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/30',
};

export default function AuditLogsPage() {
  const store = getDemoStore();

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="pb-4 border-b border-border/60">
        <div className="flex items-center gap-2 mb-1">
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
            <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-600" />
            Immutable Audit Trail
          </span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
          System Audit & Governance Trail
        </h1>
        <p className="text-sm font-medium text-muted-foreground mt-1">
          Complete, tamper-evident log of all operational events, task state transitions, and supervisor AI decisions.
        </p>
      </div>

      <Card className="overflow-hidden border border-border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3.5 text-left text-xs font-extrabold text-foreground uppercase tracking-wider">Timestamp</th>
                <th className="px-4 py-3.5 text-left text-xs font-extrabold text-foreground uppercase tracking-wider">Action</th>
                <th className="px-4 py-3.5 text-left text-xs font-extrabold text-foreground uppercase tracking-wider">Entity Type</th>
                <th className="px-4 py-3.5 text-left text-xs font-extrabold text-foreground uppercase tracking-wider">Actor / Role</th>
                <th className="px-4 py-3.5 text-left text-xs font-extrabold text-foreground uppercase tracking-wider">Event Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 bg-card">
              {store.auditLogs.map((log) => {
                const style = ACTION_STYLES[log.action] || 'bg-muted text-foreground border-border';
                let timeStr = log.created_at;
                try {
                  timeStr = format(parseISO(log.created_at), 'MMM dd, HH:mm:ss');
                } catch {
                  // Fallback to raw string
                }

                return (
                  <TableRow key={log.id} log={log} style={style} timeStr={timeStr} />
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function TableRow({ log, style, timeStr }: { log: any; style: string; timeStr: string }) {
  return (
    <tr className="hover:bg-muted/40 transition-colors">
      <td className="px-4 py-3 text-xs font-mono font-bold text-muted-foreground whitespace-nowrap">
        {timeStr}
      </td>
      <td className="px-4 py-3 whitespace-nowrap">
        <Badge className={`font-bold text-xs border ${style}`}>
          {log.action}
        </Badge>
      </td>
      <td className="px-4 py-3 text-xs font-bold text-foreground whitespace-nowrap">
        {log.entity_type} {log.entity_id ? `(#${log.entity_id.substring(0, 6)})` : ''}
      </td>
      <td className="px-4 py-3 text-xs font-medium text-foreground whitespace-nowrap">
        {log.metadata?.actor?.name || log.user_id || 'System'}
        {log.metadata?.actor?.role ? (
          <span className="ml-1 text-muted-foreground capitalize">({log.metadata.actor.role})</span>
        ) : null}
      </td>
      <td className="px-4 py-3 text-xs font-semibold text-foreground">
        {log.description}
      </td>
    </tr>
  );
}
