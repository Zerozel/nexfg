"use client";

import { useAuth } from "@/hooks/useAuth";
import { useTeacherClasses } from "@/hooks/useClasses";
import { SubjectSelection } from "@/components/teacher/SubjectSelection";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";

export default function TeacherSubjectsPage() {
  const { user } = useAuth();
  const { data: classes, loading } = useTeacherClasses();
  const [selectedClassId, setSelectedClassId] = useState("");

  const selectedClass = classes.find((c) => c.id === selectedClassId);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (classes.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">You are not a Form Teacher for any class.</p>
        <p className="text-sm text-gray-400">Contact your admin to assign you as a Form Teacher.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Manage Class Subjects</h2>
        <p className="text-muted-foreground">
          Select which subjects are offered in each class for all three terms.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Select a Class</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedClassId} onValueChange={setSelectedClassId}>
            <SelectTrigger className="w-[300px]">
              <SelectValue placeholder="Choose a class..." />
            </SelectTrigger>
            <SelectContent>
              {classes.map((cls) => (
                <SelectItem key={cls.id} value={cls.id}>
                  {cls.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedClassId && (
        <SubjectSelection
          key={selectedClassId}
          classId={selectedClassId}
          className={selectedClass?.name || "Class"}
        />
      )}
    </div>
  );
}