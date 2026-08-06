'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2 } from 'lucide-react';
import { Assessment } from '@/types/admin';

interface AssessmentTableProps {
  assessments: Assessment[];
  onEdit: (assessment: Assessment) => void;
  onDelete: (assessment: Assessment) => void;
}

export function AssessmentTable({
  assessments,
  onEdit,
  onDelete,
}: AssessmentTableProps) {
  const typeColors: Record<string, string> = {
    exam: 'destructive',
    test: 'default',
    quiz: 'secondary',
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Class</TableHead>
            <TableHead>Subject</TableHead>
            <TableHead>Term</TableHead>
            <TableHead className="text-right">Max Score</TableHead>
            <TableHead className="text-right">Weight</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="w-[100px] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {assessments.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                No assessments found
              </TableCell>
            </TableRow>
          ) : (
            assessments.map((assessment) => (
              <TableRow key={assessment.id}>
                <TableCell className="font-medium">{assessment.name}</TableCell>
                <TableCell>
                  <Badge variant={typeColors[assessment.type] as any || 'outline'}>
                    {assessment.type}
                  </Badge>
                </TableCell>
                <TableCell>{assessment.class_name}</TableCell>
                <TableCell>{assessment.subject_name}</TableCell>
                <TableCell>{assessment.term_name}</TableCell>
                <TableCell className="text-right">{assessment.max_score}</TableCell>
                <TableCell className="text-right">
                  {assessment.weight}
                </TableCell>
                <TableCell>{assessment.date || '—'}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(assessment)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(assessment)}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
