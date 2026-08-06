'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Upload, X, Search } from 'lucide-react';
import { UnenrolledStudent } from '@/types/admin';
import { Input } from '@/components/ui/input';

interface EnrollmentFormProps {
  classes: { id: string; name: string }[];
  terms: { id: string; name: string }[];
  unenrolledStudents: UnenrolledStudent[];
  selectedClassId: string;
  selectedTermId: string;
  onClassChange: (classId: string) => void;
  onTermChange: (termId: string) => void;
  onEnrollMulti: (studentIds: string[]) => Promise<void>;
  onEnrollCsv: (admissionNumbers: string[]) => Promise<void>;
  isLoading?: boolean;
}

export function EnrollmentForm({
  classes,
  terms,
  unenrolledStudents,
  selectedClassId,
  selectedTermId,
  onClassChange,
  onTermChange,
  onEnrollMulti,
  onEnrollCsv,
  isLoading = false,
}: EnrollmentFormProps) {
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [csvAdmissionNumbers, setCsvAdmissionNumbers] = useState<string[]>([]);
  const [csvPreview, setCsvPreview] = useState<string[]>([]);
  const [studentSearch, setStudentSearch] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredStudents = unenrolledStudents.filter(
    (s) =>
      s.full_name.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.admission_number.toLowerCase().includes(studentSearch.toLowerCase())
  );

  const toggleStudent = (studentId: string) => {
    setSelectedStudents((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleCsvUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.length > 0);

      // Skip header if present
      const dataLines = lines[0]?.toLowerCase().includes('admission')
        ? lines.slice(1)
        : lines;

      setCsvAdmissionNumbers(dataLines);
      setCsvPreview(dataLines.slice(0, 5));
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Class *</Label>
          <Select value={selectedClassId} onValueChange={onClassChange}>
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
          <Label>Term *</Label>
          <Select value={selectedTermId} onValueChange={onTermChange}>
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

      <Tabs defaultValue="multi-select">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="multi-select">Multi-Select</TabsTrigger>
          <TabsTrigger value="csv">CSV Upload</TabsTrigger>
        </TabsList>

        <TabsContent value="multi-select" className="space-y-4 pt-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search students..."
              value={studentSearch}
              onChange={(e) => setStudentSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="border rounded-md max-h-60 overflow-y-auto">
            {filteredStudents.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">
                No unenrolled students available
              </p>
            ) : (
              filteredStudents.map((student) => (
                <div
                  key={student.id}
                  className={`flex items-center justify-between p-3 cursor-pointer hover:bg-muted/50 border-b last:border-b-0 ${
                    selectedStudents.includes(student.id) ? 'bg-muted' : ''
                  }`}
                  onClick={() => toggleStudent(student.id)}
                >
                  <div>
                    <p className="font-medium">{student.full_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {student.admission_number}
                    </p>
                  </div>
                  {selectedStudents.includes(student.id) && (
                    <Badge variant="default">Selected</Badge>
                  )}
                </div>
              ))
            )}
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {selectedStudents.length} student(s) selected
            </p>
            <Button
              onClick={() => onEnrollMulti(selectedStudents)}
              disabled={selectedStudents.length === 0 || isLoading}
            >
              Enroll {selectedStudents.length} Student(s)
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="csv" className="space-y-4 pt-4">
          <div className="border-2 border-dashed rounded-lg p-8 text-center">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleCsvUpload}
              className="hidden"
            />
            <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground mb-2">
              Upload a CSV file with admission numbers
            </p>
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
            >
              Select CSV File
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              CSV format: admission_number (one per line, first row as header optional)
            </p>
          </div>

          {csvPreview.length > 0 && (
            <div className="space-y-2">
              <Label>
                Preview ({csvAdmissionNumbers.length} admission numbers)
              </Label>
              <div className="border rounded-md p-3 max-h-40 overflow-y-auto">
                {csvPreview.map((num, i) => (
                  <p key={i} className="text-sm font-mono">
                    {num}
                  </p>
                ))}
                {csvAdmissionNumbers.length > 5 && (
                  <p className="text-sm text-muted-foreground">
                    ...and {csvAdmissionNumbers.length - 5} more
                  </p>
                )}
              </div>
            </div>
          )}

          <Button
            onClick={() => onEnrollCsv(csvAdmissionNumbers)}
            disabled={csvAdmissionNumbers.length === 0 || isLoading}
            className="w-full"
          >
            Enroll {csvAdmissionNumbers.length} Student(s) via CSV
          </Button>
        </TabsContent>
      </Tabs>
    </div>
  );
}
