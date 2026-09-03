import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';
import { checkTeacherAssignment } from '@/lib/teacher/permissions';

interface ValidScore {
  student_id: string;
  assessment_id: string;
  score: number | null;
}

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { class_id, subject_id, term_id, scores } = body;

    if (!class_id || !subject_id || !scores || !Array.isArray(scores)) {
      return NextResponse.json(
        { error: 'class_id, subject_id, and scores array are required' },
        { status: 400 }
      );
    }

    // Check teacher assignment
    const { authorized, error: permissionError } = await checkTeacherAssignment(
      teacherId,
      class_id,
      subject_id
    );

    if (!authorized) {
      return NextResponse.json(
        { error: permissionError || 'Unauthorized' },
        { status: 403 }
      );
    }

    // Validate each score
    const validScores: ValidScore[] = [];
    const errors = [];

    for (let i = 0; i < scores.length; i++) {
      const score = scores[i];
      if (!score.student_id || !score.assessment_id) {
        errors.push({
          index: i,
          student_id: score.student_id,
          assessment_id: score.assessment_id,
          reason: 'Missing student_id or assessment_id',
        });
        continue;
      }

      if (score.score !== null && (isNaN(score.score) || score.score < 0)) {
        errors.push({
          index: i,
          student_id: score.student_id,
          assessment_id: score.assessment_id,
          reason: 'Invalid score value',
        });
        continue;
      }

      validScores.push({
        student_id: score.student_id,
        assessment_id: score.assessment_id,
        score: score.score,
      });
    }

    // Insert valid scores
    let inserted = 0;
    let updated = 0;

    for (const score of validScores) {
      const { error: upsertError } = await supabase
        .from('scores')
        .upsert({
          school_id: schoolId,
          student_id: score.student_id,
          assessment_id: score.assessment_id,
          score: score.score,
        } as never, {
          onConflict: 'school_id, student_id, assessment_id',
        });

      if (upsertError) {
        errors.push({
          student_id: score.student_id,
          assessment_id: score.assessment_id,
          reason: upsertError.message,
        });
      } else {
        inserted++;
      }
    }

    return NextResponse.json({
      success: true,
      inserted,
      updated: validScores.length - inserted,
      failed: errors.length,
      errors,
    });
  } catch (error: any) {
    console.error('POST /api/teacher/scores error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}