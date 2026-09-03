import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

interface AssignmentRecord {
  class_id: string;
  subjects: { id: string; name: string; code: string | null } | null;
  classes: { id: string; name: string; academic_year_id: string };
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabase();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const teacherId = user.id;
    const schoolId = user.app_metadata?.school_id;

    if (!schoolId) {
      return NextResponse.json({ error: 'No school associated' }, { status: 403 });
    }

    // Fetch all class-subject assignments for this teacher
    const { data: assignments, error: assignmentsError } = await supabase
      .from('class_subjects')
      .select(`
        class_id,
        subject_id,
        subjects!inner (
          id,
          name,
          code
        ),
        classes!inner (
          id,
          name,
          academic_year_id
        )
      `)
      .eq('teacher_id', teacherId) as { data: AssignmentRecord[] | null; error: Error | null };

    if (assignmentsError) {
      console.error('Assignments error:', assignmentsError);
      return NextResponse.json({ error: assignmentsError.message }, { status: 500 });
    }

    // Group by class
    const classMap: Record<string, any> = {};

    for (const assignment of assignments || []) {
      const classId = assignment.class_id;
      const classData = assignment.classes;

      if (!classMap[classId]) {
        classMap[classId] = {
          id: classData.id,
          name: classData.name,
          academic_year_id: classData.academic_year_id,
          subjects: [],
        };
      }

      if (assignment.subjects) {
        classMap[classId].subjects.push({
          id: assignment.subjects.id,
          name: assignment.subjects.name,
          code: assignment.subjects.code || '',
        });
      }
    }

    // Get assessment counts for each subject
    const classes = Object.values(classMap);
    for (const cls of classes) {
      for (const subject of cls.subjects) {
        const { count, error: countError } = await supabase
          .from('assessments')
          .select('*', { count: 'exact', head: true })
          .eq('class_id', cls.id)
          .eq('subject_id', subject.id)
          .is('is_deleted', false);

        if (!countError) {
          subject.assessments_count = count || 0;
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: classes,
    });
  } catch (error: any) {
    console.error('GET /api/teacher/classes error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}