import { Card } from '@/components/ui/card';
import { ShieldCheck } from 'lucide-react';
import { getDemoActor } from '@/lib/demo-store';

// Governance policy: task creation & AI-assisted assignment is reserved for
// HR Admin. Supervisors and frontline employees are blocked at the route level
// (and demoCreateTask enforces the same rule server-side).
export default async function NewTaskLayout({ children }: { children: React.ReactNode }) {
  const actor = await getDemoActor();

  if (actor.role === 'admin') {
    return <>{children}</>;
  }

  return (
    <div className="max-w-3xl mx-auto py-10">
      <Card className="p-8 border-amber-500/30 bg-amber-500/5 text-center space-y-3">
        <ShieldCheck className="w-10 h-10 text-amber-500 mx-auto" />
        <h2 className="text-lg font-bold text-foreground">Restricted Access</h2>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Task creation and AI-assisted assignment are reserved for HR Administration under the
          Human-in-the-Loop governance policy. Supervisors execute and verify field work; HR Admin
          allocates tasks.
        </p>
      </Card>
    </div>
  );
}
