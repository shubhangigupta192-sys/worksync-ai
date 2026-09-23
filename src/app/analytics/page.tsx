import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">AI Workforce Analytics</h1>
        <p className="text-sm text-purple-600">AI-generated workforce insights | Powered by rule-based statistical analysis</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">AI Insights</h2>
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg border">
              <p className="font-medium">High Workload Alert</p>
              <p className="text-sm text-gray-600">Technicians in Zone B are currently operating at 95% capacity.</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg border">
              <p className="font-medium">Efficiency Opportunity</p>
              <p className="text-sm text-gray-600">Cross-training 3 general workers in basic electrical could reduce task bottleneck by 15%.</p>
            </div>
          </div>
          <Button className="mt-4 w-full" variant="outline">Regenerate Insights</Button>
        </Card>
        
        <Card className="p-6 h-64 flex flex-col justify-center items-center text-gray-500">
           <p>[Trend Chart Placeholder]</p>
        </Card>
      </div>
    </div>
  );
}
