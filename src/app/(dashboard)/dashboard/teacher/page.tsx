// src/app/(dashboard)/dashboard/teacher/page.tsx
"use client";
 
import { useTeacherClasses } from "@/hooks/useClasses";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, ArrowRight, Eye } from "lucide-react";

export default function TeacherDashboardPage() {
  const { data: classes, loading } = useTeacherClasses();
  const router = useRouter();

  // Get the current user's ID to check if they are a Form Teacher
  // This will be used to show the read-only view for Form Teachers

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">My Classes</h2>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 rounded-lg" />
          ))}
        </div>
      ) : classes.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <p className="text-gray-500">No classes assigned yet.</p>
            <p className="text-sm text-gray-400">
              Contact your admin to get assigned to classes.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {classes.map((cls) => (
            <Card
              key={cls.id}
              className="hover:shadow-md transition-shadow cursor-pointer border-green-100 hover:border-green-300"
              onClick={() =>
                router.push(`/dashboard/teacher/class/${cls.id}`)
              }
            >
              <CardHeader>
                <CardTitle className="text-lg">{cls.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">
                  {cls.teacher_id ? "Form Teacher" : "Subject Teacher"}
                </p>
                <Button
                  variant="link"
                  className="mt-2 p-0 h-auto text-green-600"
                >
                  Enter Scores <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}