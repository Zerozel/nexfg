// src/components/admin/students/StudentGroupList.tsx
'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, Pencil, Trash2, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface GroupedStudent {
  id: string;
  full_name: string;
  admission_number: string | null;
  class_id?: string | null;
  class_name?: string | null;
}

interface StudentGroup {
  class_id: string | null;
  class_name: string;
  students: GroupedStudent[];
}

interface StudentGroupListProps {
  groups: StudentGroup[];
  onEdit: (student: GroupedStudent) => void;
  onDelete: (student: GroupedStudent) => void;
}

export function StudentGroupList({
  groups,
  onEdit,
  onDelete,
}: StudentGroupListProps) {
  // Tracks which class cards are collapsed. Default: expanded.
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  const toggle = (key: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  // Filter out empty groups (nothing to show)
  const visibleGroups = groups.filter((g) => (g.students || []).length > 0);

  if (visibleGroups.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg bg-white">
        <Users className="h-8 w-8 mx-auto mb-3 text-gray-300" />
        <p className="text-gray-500">No students found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {visibleGroups.map((group) => {
        const key = group.class_id || `unassigned-${group.class_name}`;
        const isCollapsed = collapsed.has(key);
        const studentCount = group.students.length;

        return (
          <Card key={key} className="overflow-hidden">
            <CardHeader
              className="cursor-pointer select-none py-3 px-4 hover:bg-gray-50 transition-colors"
              onClick={() => toggle(key)}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  {isCollapsed ? (
                    <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  )}
                  <CardTitle className="text-base truncate">
                    {group.class_name || 'Unassigned'}
                  </CardTitle>
                  <Badge variant="secondary" className="flex-shrink-0">
                    {studentCount}
                  </Badge>
                </div>
              </div>
            </CardHeader>

            {!isCollapsed && (
              <CardContent className="p-0 border-t">
                <ul className="divide-y">
                  {group.students.map((student, idx) => (
                    <li
                      key={student.id}
                      className={`flex items-center justify-between gap-2 px-4 py-2.5 ${
                        idx % 2 === 1 ? 'bg-gray-50/50' : ''
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-sm truncate">
                          {student.full_name}
                        </div>
                        {student.admission_number && (
                          <div className="text-xs text-gray-500 truncate">
                            {student.admission_number}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEdit(student);
                          }}
                          aria-label="Edit student"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-500 hover:text-red-700"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(student);
                          }}
                          aria-label="Delete student"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
}
