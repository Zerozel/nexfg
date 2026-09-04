'use client';

import { useState, useEffect } from 'react';
import { useFormClassSubjects } from '@/hooks/useFormClassSubjects';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';

interface SubjectSelectionProps {
  classId: string;
  className: string;
}

export function SubjectSelection({ classId, className }: SubjectSelectionProps) {
  const { activeSubjects, availableSubjects, loading, error } = useFormClassSubjects(classId);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setSelectedIds(activeSubjects.map((s) => s.id));
  }, [activeSubjects]);

  const allSubjects = [...activeSubjects, ...availableSubjects];

  const handleToggle = (subjectId: string, checked: boolean) => {
    if (checked) {
      setSelectedIds([...selectedIds, subjectId]);
    } else {
      setSelectedIds(selectedIds.filter((id) => id !== subjectId));
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/teacher/form-class-subjects', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          class_id: classId,
          subject_ids: selectedIds,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to save');
      }

      toast({
        title: 'Success',
        description: `Subjects updated: ${selectedIds.length} active`,
      });
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 border rounded-lg bg-red-50">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{className}</h2>
        <p className="text-muted-foreground">
          Select the subjects that will be offered in this class for all three terms.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Subjects</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            {allSubjects.map((subject) => {
              const isActive = selectedIds.includes(subject.id);
              return (
                <div key={subject.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                  <Checkbox
                    id={subject.id}
                    checked={isActive}
                    onCheckedChange={(checked) => handleToggle(subject.id, checked === true)}
                  />
                  <Label htmlFor={subject.id} className="flex-1 cursor-pointer">
                    <span className="font-medium">{subject.name}</span>
                    <span className="text-sm text-muted-foreground ml-2">
                      {subject.code}
                    </span>
                    {isActive && (
                      <span className="text-xs text-green-600 ml-2">Active</span>
                    )}
                  </Label>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-4 border-t">
            <span className="text-sm text-muted-foreground">
              {selectedIds.length} of {allSubjects.length} subjects selected
            </span>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}