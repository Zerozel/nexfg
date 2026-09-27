'use client';

import { useState } from 'react';
import { ChevronRight, Users, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Student } from '@/types/admin';

interface StudentGroupListProps {
  groups: {
    class_id: string | null;
    class_name: string;
    base_name: string | null;
    display_order: number | null;
    students: Student[];
  }[];
  onEdit: (student: Student) => void;
  onDelete: (student: Student) => void;
}

export function StudentGroupList({
  groups,
  onEdit,
  onDelete,
}: StudentGroupListProps) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const toggle = (key: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  if (groups.length === 0) {
    return (
      <div className="rounded-lg border bg-white p-12 text-center">
        <Users className="h-10 w-10 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500">No students yet.</p>
        <p className="text-sm text-gray-400">
          Click "Add Student" to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-white divide-y">
      {groups.map((group) => {
        const key = group.class_id || 'unassigned';
        const isOpen = expanded.has(key);
        const count = group.students.length;

        return (
          <div key={key}>
            {/* Group header — clickable */}
            <button
              onClick={() => toggle(key)}
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <ChevronRight
                  className={`h-4 w-4 text-gray-400 transition-transform flex-shrink-0 ${
                    isOpen ? 'rotate-90' : ''
                  }`}
                />
                <span className="font-medium text-sm truncate">
                  {group.class_name}
                </span>
                <Badge variant="outline" className="text-xs flex-shrink-0">
                  {count} {count === 1 ? 'student' : 'students'}
                </Badge>
              </div>
            </button>

            {/* Expanded student list */}
            {isOpen && (
              <div className="border-t bg-gray-50/50">
                {count === 0 ? (
                  <div className="px-12 py-4 text-sm text-gray-400 italic">
                    No students in this class yet.
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {group.students.map((student) => (
                      <div
                        key={student.id}
                        className="flex items-center justify-between px-4 py-2.5 pl-12 hover:bg-white"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-3">
                            <span className="font-medium text-sm truncate">
                              {student.full_name}
                            </span>
                            {student.admission_number && (
                              <span className="text-xs text-gray-400 font-mono flex-shrink-0">
                                {student.admission_number}
                              </span>
                            )}
                          </div>
                          {(student.guardian_name || student.guardian_phone) && (
                            <p className="text-xs text-gray-500 mt-0.5 truncate">
                              {student.guardian_name}
                              {student.guardian_name &&
                                student.guardian_phone &&
                                ' · '}
                              {student.guardian_phone}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-1 flex-shrink-0">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onEdit(student)}
                            className="h-8 w-8"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onDelete(student)}
                            className="h-8 w-8 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
