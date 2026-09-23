import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function SettingsPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold">Settings</h1>
      
      <Card className="p-6 space-y-4">
        <h2 className="text-lg font-semibold border-b pb-2">Profile Info</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Name</p>
            <p className="font-medium">Demo User</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Role</p>
            <p className="font-medium capitalize">Administrator</p>
          </div>
        </div>
      </Card>

      <Card className="p-6 space-y-4">
        <h2 className="text-lg font-semibold border-b pb-2">Preferences</h2>
        <div>
          <p className="text-sm text-gray-500 mb-2">Theme</p>
          <div className="flex gap-2">
            <Button variant="outline" className="bg-gray-100">Light</Button>
            <Button variant="outline" disabled>Dark</Button>
            <Button variant="outline" disabled>System</Button>
          </div>
        </div>
      </Card>

      <Card className="p-6 space-y-4">
        <h2 className="text-lg font-semibold border-b pb-2">About</h2>
        <p className="text-sm text-gray-600">
          WorkSync AI — AI-Assisted Workforce Coordination Prototype<br/>
          Version 0.1.0-alpha<br/>
          Academic Research Build
        </p>
      </Card>
    </div>
  );
}
