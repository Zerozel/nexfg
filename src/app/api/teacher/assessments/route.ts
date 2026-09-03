import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';
import { checkTeacherAssignment } from '@/lib/teacher/permissions';

interface TermRecord {
  id: string;
  name?: string;
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

    const searchParams = new URL(request.url).searchParams;
    const classId = searchParams.get('classId');
    const subjectId = searchParams.get('subjectId');
    const termId = searchParams.get('termId');

    if (!classId || !subjectId) {
      return NextResponse.json(
        { error: 'classId and subjectId are required' },
        { status: 400 }
      );
    }

    // Check teacher assignment
    const { authorized, error: permissionError } = await checkTeacherAssignment(
      teacherId,
      classId,
      subjectId
    );

    if (!authorized) {
      return NextResponse.json(
        { error: permissionError || 'Unauthorized' },
        { status: 403 }
      );
    }

    // Get current term if not provided
    let targetTermId = termId;
    if (!targetTermId) {
      const { data: currentTerm } = await supabase
        .from('terms')
        .select('id, name')
        .eq('is_current', true)
        .is('is_deleted', false)
        .maybeSingle() as { data: TermRecord | null };

      if (!currentTerm) {
        return NextResponse.json(
          { error: 'No current term found' },
          { status: 404 }
        );
      }
      targetTermId = currentTerm.id;
    }

    // Get assessments for this class, subject, and term
    const { data: assessments, error: assessmentsError } = await supabase
      .from('assessments')
      .select('*')
      .eq('class_id', classId)
      .eq('subject_id', subjectId)
      .eq('term_id', targetTermId)
      .is('is_deleted', false)
      .order('created_at', { ascending: true }) as { data: any[] | null; error: Error | null };

    if (assessmentsError) {
      console.error('Assessments error:', assessmentsError);
      return NextResponse.json({ error: assessmentsError.message }, { status: 500 });
    }

    // Get students enrolled in this class
    const { data: enrollments, error: enrollError } = await supabase
      .from('enrollments')
      .select(`
        student_id,
        students!inner (
          id,
          full_name,
          admission_number
        )
      `)
      .eq('class_id', classId)
      .eq('term_id', targetTermId)
      .eq('is_current', true)
      .is('students.is_deleted', false)
      .order('students(full_name)', { ascending: true });

    if (enrollError) {
      console.error('Enrollments error:', enrollError);
      return NextResponse.json({ error: enrollError.message }, { status: 500 });
    }

    const assessmentRows = assessments || [];
    const studentIds = (enrollments || []).map((e: any) => e.student_id);

    // Get existing scores
    let scores: any[] = [];
    if (studentIds.length > 0 && assessmentRows.length > 0) {
      const assessmentIds = assessmentRows.map((a: any) => a.id);
      const { data: existingScores, error: scoreError } = await supabase
        .from('scores')
        .select('*')
        .in('student_id', studentIds)
        .in('assessment_id', assessmentIds);

      if (!scoreError && existingScores) {
        scores = existingScores;
      }
    }

    // Build score map
    const scoreMap: Record<string, Record<string, number | null>> = {};
    for (const score of scores) {
      if (!scoreMap[score.student_id]) {
        scoreMap[score.student_id] = {};
      }
      scoreMap[score.student_id][score.assessment_id] = score.score;
    }

    // Build student response
    const students = (enrollments || []).map((e: any) => ({
      id: e.students.id,
      full_name: e.students.full_name,
      admission_number: e.students.admission_number || '',
      scores: scoreMap[e.student_id] || {},
    }));

    // Get term name
    const { data: term } = await supabase
      .from('terms')
      .select('id, name')
      .eq('id', targetTermId)
      .single();

    return NextResponse.json({
      success: true,
      data: {
        assessments: assessmentRows,
        students: students,
        term: term || { id: targetTermId, name: 'Current Term' },
      },
    });
  } catch (error: any) {
    console.error('GET /api/teacher/assessments error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}