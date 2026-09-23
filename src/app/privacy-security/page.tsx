import { Card } from '@/components/ui/card';
import { Shield, Lock, Users, Eye, Database, CheckSquare, FileText } from 'lucide-react';

export default function PrivacySecurityPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Privacy & Security</h1>
      
      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
        <p className="text-blue-700 font-medium">
          Prototype-level privacy and access controls are implemented. Formal regulatory compliance (GDPR, DPDP Act, ISO 27001) requires further organizational and legal validation.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-3">
            <Shield className="text-blue-500" />
            <h3 className="font-semibold">Data Minimization</h3>
          </div>
          <p className="text-sm text-gray-600">Only essential worker data required for task allocation is collected and processed.</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-3">
            <Users className="text-blue-500" />
            <h3 className="font-semibold">Role-Based Access</h3>
          </div>
          <p className="text-sm text-gray-600">Strict segregation of duties across Admin, Supervisor, and Employee roles.</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-3">
            <Lock className="text-blue-500" />
            <h3 className="font-semibold">Authentication</h3>
          </div>
          <p className="text-sm text-gray-600">Secure login powered by Supabase Auth with encrypted credentials.</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-3">
            <Database className="text-blue-500" />
            <h3 className="font-semibold">Row-Level Security</h3>
          </div>
          <p className="text-sm text-gray-600">Database policies ensure users only see data they are authorized to access.</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-3">
            <FileText className="text-blue-500" />
            <h3 className="font-semibold">Audit Trail</h3>
          </div>
          <p className="text-sm text-gray-600">Comprehensive logging of all critical actions and AI recommendations.</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-3">
            <Eye className="text-blue-500" />
            <h3 className="font-semibold">Human Oversight</h3>
          </div>
          <p className="text-sm text-gray-600">AI never makes final decisions; all automated recommendations require human approval.</p>
        </Card>
      </div>
    </div>
  );
}
