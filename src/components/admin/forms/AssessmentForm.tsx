'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface AssessmentFormProps {
  data: {
    name?: string;
    type?: 'exam' | 'test' | 'quiz';
    term_id?: string;
    class_id?: string;
    subject_id?: string;
    max_score?: number;
    weight?: number;
    date?: string;
  };
  onChange: (field: string, value: any) => void;
  terms?: { id: string; name: string }[];
  classes?: { id: string; name: string }[];
  subjects?: { id: string; name: string }[];
}

export function AssessmentForm({
  data,
  onChange,
  terms = [],
  classes = [],
  subjects = [],
}: AssessmentFormProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Assessment Name *</Label>
        <Input
          id="name"
          value={data.name || ''}
          onChange={(e) => onChange('name', e.target.value)}
          placeholder="e.g., First Term Examination"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="type">Type *</Label>
          <Select
            value={data.type || ''}
            onValueChange={(value) => onChange('type', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="exam">Exam</SelectItem>
              <SelectItem value="test">Test</SelectItem>
              <SelectItem value="quiz">Quiz</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="term_id">Term *</Label>
          <Select
            value={data.term_id || ''}
            onValueChange={(value) => onChange('term_id', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select term" />
            </SelectTrigger>
            <SelectContent>
              {terms.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="class_id">Class *</Label>
          <Select
            value={data.class_id || ''}
            onValueChange={(value) => onChange('class_id', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select class" />
            </SelectTrigger>
            <SelectContent>
              {classes.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="subject_id">Subject *</Label>
          <Select
            value={data.subject_id || ''}
            onValueChange={(value) => onChange('subject_id', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select subject" />
            </SelectTrigger>
            <SelectContent>
              {subjects.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="max_score">Max Score *</Label>
          <Input
            id="max_score"
            type="number"
            value={data.max_score ?? 100}
            onChange={(e) => onChange('max_score', parseFloat(e.target.value) || 0)}
            min={1}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="weight">Weight (0-1) *</Label>
          <Input
            id="weight"
            type="number"
            step="0.1"
            value={data.weight ?? 0}
            onChange={(e) => onChange('weight', parseFloat(e.target.value) || 0)}
            min={0}
            max={1}
          />
          <p className="text-xs text-muted-foreground">
            e.g., 0.6 for 60% of term grade
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="date">Date</Label>
        <Input
          id="date"
          type="date"
          value={data.date || ''}
          onChange={(e) => onChange('date', e.target.value)}
        />
      </div>
    </div>
  );
}
