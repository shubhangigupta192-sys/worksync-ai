import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getDemoStore } from '@/lib/demo-store';
import { ShieldCheck } from 'lucide-react';
import { format, parseISO } from 'date-fns';

const ACTION_STYLES: Record<string, string> = {
  CREATE: 'bg-indigo-100 text-indigo-800',
  APPROVE: 'bg-emerald-100 text-emerald-800',
  MODIFY: 'bg-amber-100 text-amber-800',
  REJECT: 'bg-rose-100 text-rose-800',
  STATUS_CHANGE: 'bg-sky-100 text-sky-800',
  VERIFY: 'bg-cyan-100 text-cyan-800',
  GENERATE: 'bg-purple-100 text-purple-800',
  RESOLVE: 'bg-emerald-100 text-emerald-800',
  ACKNOWLEDGE: 'bg-sky-100 text-sky-800',
};

export default function AuditLogsPage() {
  const store = getDemoStore();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-emerald-600" /> Audit Trail
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          Complete record of system actions for accountability and governance. Actions you take in this
          demo session appear here in real time.
        </p>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Entity</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Details</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {store.auditLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                    No actions recorded yet. Create a task or review a recommendation and it will appear here.
                  </td>
                </tr>
              ) : (
                store.auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50/60">
                    <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-500">
                      {format(parseISO(log.created_at), 'MMM d, HH:mm:ss')}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${ACTION_STYLES[log.action] || 'bg-gray-100 text-gray-700'}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-500">
                      {log.entity_type}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-700">
                      {(log.metadata as any)?.actor_name || log.user_id}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600">{log.description}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <p className="text-xs text-gray-400">
        Prototype note: in demo mode the audit trail is stored in server memory for the current session.
        With Supabase configured, entries are persisted to the audit_logs table with row-level security.
      </p>
    </div>
  );
}
