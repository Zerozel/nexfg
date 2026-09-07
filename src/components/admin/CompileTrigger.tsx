'use client';

import { useState } from 'react';
import { useCompileJob } from '@/hooks/useCompileJob';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

interface CompileTriggerProps {
  classes: { id: string; name: string }[];
  terms: { id: string; name: string }[];
  onComplete?: () => void;
}

export function CompileTrigger({ classes, terms, onComplete }: CompileTriggerProps) {
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('');
  const { job, isLoading, error, triggerCompilation, reset } = useCompileJob();
  const { toast } = useToast();

  const handleCompile = async () => {
    if (!selectedClass || !selectedTerm) {
      toast({
        title: 'Error',
        description: 'Please select a class and term.',
        variant: 'destructive',
      });
      return;
    }

    await triggerCompilation(selectedClass, selectedTerm);
  };

  const handleReset = () => {
    reset();
    setSelectedClass('');
    setSelectedTerm('');
  };

  const getStatusIcon = () => {
    if (isLoading || job?.status === 'processing') {
      return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />;
    }
    if (job?.status === 'completed') {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    }
    if (job?.status === 'failed') {
      return <XCircle className="h-5 w-5 text-red-500" />;
    }
    return null;
  };

  const getStatusText = () => {
    if (isLoading || job?.status === 'processing') {
      return 'Compiling...';
    }
    if (job?.status === 'completed') {
      return 'Compilation Complete';
    }
    if (job?.status === 'failed') {
      return 'Compilation Failed';
    }
    return 'Ready to compile';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Compile Results</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Class and Term Selectors */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="class-select">Class</Label>
            <Select value={selectedClass} onValueChange={setSelectedClass} disabled={isLoading}>
              <SelectTrigger id="class-select">
                <SelectValue placeholder="Select a class" />
              </SelectTrigger>
              <SelectContent>
                {classes.map((cls) => (
                  <SelectItem key={cls.id} value={cls.id}>
                    {cls.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="term-select">Term</Label>
            <Select value={selectedTerm} onValueChange={setSelectedTerm} disabled={isLoading}>
              <SelectTrigger id="term-select">
                <SelectValue placeholder="Select a term" />
              </SelectTrigger>
              <SelectContent>
                {terms.map((term) => (
                  <SelectItem key={term.id} value={term.id}>
                    {term.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Compile Button */}
        <Button
          onClick={handleCompile}
          disabled={isLoading || !selectedClass || !selectedTerm}
          className="w-full"
        >
          {isLoading ? 'Compiling...' : 'Compile Results'}
        </Button>

        {/* Status Display */}
        {(job || error) && (
          <div className="border rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getStatusIcon()}
                <span className="font-medium">{getStatusText()}</span>
              </div>
              {job?.status === 'completed' && onComplete && (
                <Button variant="outline" size="sm" onClick={onComplete}>
                  View Report Cards
                </Button>
              )}
              {(job?.status === 'completed' || job?.status === 'failed') && (
                <Button variant="ghost" size="sm" onClick={handleReset}>
                  Reset
                </Button>
              )}
            </div>

            {job && job.status !== 'idle' && (
              <Progress value={job.progress || 0} className="h-2" />
            )}

            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}

            {job?.error_message && (
              <p className="text-sm text-red-500">{job.error_message}</p>
            )}

            {job?.status === 'completed' && (
              <p className="text-sm text-green-600">
                ✅ Report cards are now ready for this class and term.
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
