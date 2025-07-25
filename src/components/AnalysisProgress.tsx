import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { Loader2 } from '@phosphor-icons/react';

interface AnalysisProgressProps {
  progress: number;
  status: string;
}

export function AnalysisProgress({ progress, status }: AnalysisProgressProps) {
  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Loader2 className="animate-spin text-primary" size={24} />
          <div>
            <h3 className="font-semibold">Analyzing Repository</h3>
            <p className="text-sm text-muted-foreground">{status}</p>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="w-full" />
        </div>
      </div>
    </Card>
  );
}