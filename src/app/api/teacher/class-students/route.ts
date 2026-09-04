// src/app/api/teacher/class-students/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabase();
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get school_id from app_metadata
    const schoolId = user.app_metadata?.school_id as string | undefined;
    if (!schoolId) {
      return NextResponse.json(
        { error: 'School not found for user' },
        { status: 403 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const classId = searchParams.get('classId');
    const termId = searchParams.get('termId');

    if (!classId) {
      return NextResponse.json(
        { error: 'classId is required' },
        { status: 400 }
      );
    }

    // If termId not provided, get current term
    let targetTermId = termId;
    if (!targetTermId) {
      const { data: currentTerm, error: termError } = await supabase
        .from('terms')
        .select('id')
        .eq('is_current', true)
        .is('is_deleted', false)
        .maybeSingle();

      if (termError) {
        console.error('Error fetching current term:', termError);
        return NextResponse.json(
          { error: 'Failed to fetch current term' },
          { status: 500 }
        );
      }

      const resolvedCurrentTerm = currentTerm as { id: string } | null;

      if (!resolvedCurrentTerm) {
        return NextResponse.json(
          { 
            success: true, 
            data: { 
              students: [], 
              term: null 
            } 
          },
          { status: 200 }
        );
      }

      targetTermId = resolvedCurrentTerm.id;
    }

    if (!targetTermId) {
      return NextResponse.json(
        { error: 'Term not found' },
        { status: 404 }
      );
    }

    // Fetch students enrolled in this class for the term
    // Using a simpler query approach to avoid type issues
    const { data: enrollments, error: enrollError } = await supabase
      .from('enrollments')
      .select(`
        student_id,
        class_id,
        term_id,
        enrollment_date,
        is_current,
        students (
          id,
          full_name,
          admission_number,
          school_id,
          is_deleted
        )
      `)
      .eq('class_id', classId)
      .eq('term_id', targetTermId)
      .eq('is_current', true)
      .is('students.is_deleted', false);

    if (enrollError) {
      console.error('Error fetching enrollments:', enrollError);
      return NextResponse.json(
        { error: 'Failed to fetch students' },
        { status: 500 }
      );
    }

    // Map to clean student objects
    const students = (enrollments || []) as any[];
    const mappedStudents = students
      .filter((enrollment: any) => enrollment.students != null)
      .map((enrollment: any) => ({
        id: enrollment.students.id,
        full_name: enrollment.students.full_name,
        admission_number: enrollment.students.admission_number,
      }));

    // Get term details
    const { data: term, error: termDetailsError } = await supabase
      .from('terms')
      .select('id, name, academic_year_id')
      .eq('id', targetTermId)
      .is('is_deleted', false)
      .maybeSingle();

    if (termDetailsError) {
      console.error('Error fetching term details:', termDetailsError);
      // Continue without term details - not critical
    }

    return NextResponse.json({
      success: true,
      data: {
        students: mappedStudents,
        term: term || null,
      },
    });

  } catch (error: any) {
    console.error('GET /api/teacher/class-students error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}