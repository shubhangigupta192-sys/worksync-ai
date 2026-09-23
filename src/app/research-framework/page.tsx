import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Users,
  ClipboardList,
  Shield,
  Brain,
  Lightbulb,
  UserCheck,
  Briefcase,
  ScrollText,
  ArrowDown,
  CheckCircle,
  GraduationCap,
  BookOpen,
} from 'lucide-react';

const frameworkSteps = [
  {
    icon: Users,
    title: 'Frontline Workforce',
    description: 'Operational employees (cleaning, housekeeping, security, maintenance, technicians) who execute daily tasks.',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    prototype: 'Employee management module with skills, availability, and location tracking.',
  },
  {
    icon: ClipboardList,
    title: 'Task Coordination',
    description: 'Structured task assignment, tracking, and lifecycle management from creation to verification.',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    prototype: 'Task management with full workflow: Assigned → Accepted → In Progress → Completed → Verified → Closed.',
  },
  {
    icon: Shield,
    title: 'Secure Data Layer',
    description: 'Role-based access control, row-level security, and data minimization principles protect workforce data.',
    color: 'bg-slate-100 text-slate-800 border-slate-300',
    prototype: 'Supabase RLS policies, role-based UI access, authentication, and audit logging.',
  },
  {
    icon: Brain,
    title: 'AI Analytics',
    description: 'Statistical analysis of workforce data to identify patterns, workload imbalances, delays, and operational insights.',
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    prototype: 'Rule-based analytics engine analyzing workload distribution, delay patterns, and availability.',
  },
  {
    icon: Lightbulb,
    title: 'AI Decision Support',
    description: 'AI-generated recommendations for task allocation, workload rebalancing, and operational optimization.',
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    prototype: 'Weighted scoring algorithm for task recommendations with transparent factor explanation.',
  },
  {
    icon: UserCheck,
    title: 'Human Review',
    description: 'Every AI recommendation requires explicit human approval. Supervisors and HR retain final decision authority.',
    color: 'bg-amber-100 text-amber-800 border-amber-200',
    prototype: 'Human review queue with Approve / Modify / Reject workflow and decision recording.',
  },
  {
    icon: Briefcase,
    title: 'HR Action',
    description: 'Approved decisions are implemented by authorized personnel. AI never executes autonomous HR actions.',
    color: 'bg-green-100 text-green-800 border-green-200',
    prototype: 'Action execution with supervisor confirmation and status tracking.',
  },
  {
    icon: ScrollText,
    title: 'Audit Trail',
    description: 'Complete record of all system events, decisions, and actions for accountability and governance.',
    color: 'bg-slate-100 text-slate-800 border-slate-300',
    prototype: 'Comprehensive audit log with timestamps, users, actions, and metadata.',
  },
];

export default function ResearchFrameworkPage() {
  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <GraduationCap className="w-7 h-7 text-purple-600" />
            Research Framework
          </h1>
          <p className="text-sm text-gray-500 mt-1">Conceptual framework proposed in the research paper</p>
        </div>
        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
          Academic Prototype
        </Badge>
      </div>

      {/* Research Paper Title */}
      <Card className="p-6 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <div className="flex items-start gap-3">
          <BookOpen className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
          <div>
            <h2 className="font-semibold text-lg text-gray-900 mb-2">Research Paper</h2>
            <p className="text-gray-700 font-medium italic">
              &ldquo;Artificial Intelligence Applications in Human Resource Practices: An Integrated Framework
              for Frontline Workforce Coordination, HR Analytics and Human-in-the-Loop Governance&rdquo;
            </p>
          </div>
        </div>
      </Card>

      {/* Research Gap */}
      <Card className="p-6 border-red-200 bg-red-50/50">
        <h2 className="font-semibold text-lg text-red-900 mb-3 flex items-center gap-2">
          <AlertIcon className="w-5 h-5" />
          Research Gap Addressed
        </h2>
        <blockquote className="border-l-4 border-red-400 pl-4 text-red-800 font-medium">
          &ldquo;Limited integration of frontline workforce task coordination with AI-enabled HR analytics
          and decision support under secure Human-in-the-Loop governance.&rdquo;
        </blockquote>
      </Card>

      {/* Framework Visualization */}
      <Card className="p-8">
        <h2 className="font-semibold text-xl text-center mb-8">Integrated Framework Architecture</h2>

        <div className="flex flex-col items-center space-y-2">
          {frameworkSteps.map((step, index) => (
            <div key={step.title} className="w-full max-w-2xl">
              <div className={`flex items-center gap-4 p-4 rounded-lg border ${step.color}`}>
                <div className="flex-shrink-0">
                  <step.icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono bg-white/50 px-2 py-0.5 rounded">
                      Layer {index + 1}
                    </span>
                    <h3 className="font-semibold">{step.title}</h3>
                  </div>
                  <p className="text-sm mt-1 opacity-80">{step.description}</p>
                </div>
              </div>
              {index < frameworkSteps.length - 1 && (
                <div className="flex justify-center py-1">
                  <ArrowDown className="w-5 h-5 text-gray-400" />
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* How Prototype Maps to Framework */}
      <Card className="p-6">
        <h2 className="font-semibold text-xl mb-6">How This Prototype Demonstrates the Framework</h2>
        <div className="space-y-4">
          {frameworkSteps.map((step, index) => (
            <div key={step.title} className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                <span className="text-sm font-bold text-purple-700">{index + 1}</span>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{step.title}</h3>
                <div className="flex items-start gap-2 mt-1">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-600">{step.prototype}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Key Principles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5">
          <h3 className="font-semibold text-sm uppercase tracking-wider text-gray-500 mb-2">AI Transparency</h3>
          <p className="text-sm text-gray-700">
            All AI features use transparent, rule-based algorithms. Every recommendation includes
            a clear explanation of factors considered and data used.
          </p>
        </Card>
        <Card className="p-5">
          <h3 className="font-semibold text-sm uppercase tracking-wider text-gray-500 mb-2">Human Governance</h3>
          <p className="text-sm text-gray-700">
            AI provides decision support only. All significant actions require human review and
            approval. AI never makes autonomous HR decisions.
          </p>
        </Card>
        <Card className="p-5">
          <h3 className="font-semibold text-sm uppercase tracking-wider text-gray-500 mb-2">Accountability</h3>
          <p className="text-sm text-gray-700">
            Every action, decision, and AI recommendation is recorded in the audit trail.
            Complete traceability from recommendation to final decision.
          </p>
        </Card>
      </div>

      {/* Academic Boundaries */}
      <Card className="p-6 bg-amber-50 border-amber-200">
        <h2 className="font-semibold text-amber-900 mb-3">Academic Boundaries & Disclaimers</h2>
        <div className="space-y-2 text-sm text-amber-800">
          <p>This prototype is a <strong>proof-of-concept</strong> demonstrating the conceptual framework proposed in the research paper. It should be understood within the following boundaries:</p>
          <ul className="list-disc list-inside space-y-1 mt-2">
            <li>AI features use rule-based algorithms, not trained machine learning models</li>
            <li>This system does not claim to replace HR professionals</li>
            <li>AI does not independently evaluate employee worth or performance</li>
            <li>No claim of guaranteed unbiased decisions</li>
            <li>Scientific validation requires separate experimental evaluation</li>
            <li>Production deployment requires further development, testing, and compliance validation</li>
          </ul>
        </div>
      </Card>

      {/* Footer */}
      <p className="text-xs text-gray-400 text-center italic pb-4">
        This is an academic research prototype. The conceptual framework demonstrated here is proposed for
        further research, development, and empirical validation.
      </p>
    </div>
  );
}

function AlertIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
    </svg>
  );
}
