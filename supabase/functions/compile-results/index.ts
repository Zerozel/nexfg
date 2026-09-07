// supabase/functions/compile-results/index.ts

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import {
  createSupabaseClient,
  getJob,
  updateJobStatus,
  getScores,
  getAssessments,
  getSubjects,
  getStudents,
  getGradingSystem,
  deleteCompiledResults,
  insertCompiledResults,
  hasCompiledResults,
} from './database.ts';
import {
  aggregateScoresByStudentAndSubject,
  calculatePositions,
} from './calculator.ts';
import type { CompilationResponse, CompiledResultRecord } from './types.ts';

const corsHeaders = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ success: false, message: 'Method not allowed' }),
      { status: 405, headers: corsHeaders }
    );
  }

  try {
    // 1. Parse request body
    const body = await req.json();
    const { job_id } = body;

    if (!job_id) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'job_id is required',
        }),
        { status: 400, headers: corsHeaders }
      );
    }

    console.log(`📊 Compilation started for job: ${job_id}`);

    // 2. Create Supabase client
    const supabase = createSupabaseClient();

    // 3. Get job details
    const job = await getJob(supabase, job_id);
    if (!job) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Job not found',
        }),
        { status: 404, headers: corsHeaders }
      );
    }

    console.log(`📊 Job: class=${job.class_id}, term=${job.term_id}`);

    // 4. Update job status to processing
    await updateJobStatus(supabase, job_id, 'processing', 10);

    // 5. Check if results already exist
    const exists = await hasCompiledResults(supabase, job.class_id, job.term_id);
    if (exists) {
      console.log('📊 Deleting existing compiled results...');
      await deleteCompiledResults(supabase, job.class_id, job.term_id);
    }

    await updateJobStatus(supabase, job_id, 'processing', 20);

    // 6. Fetch all required data
    console.log('📊 Fetching scores...');
    const scores = await getScores(supabase, job.class_id, job.term_id);
    console.log(`📊 Found ${scores.length} scores`);

    if (scores.length === 0) {
      await updateJobStatus(
        supabase,
        job_id,
        'failed',
        0,
        'No scores found for this class and term'
      );
      return new Response(
        JSON.stringify({
          success: false,
          message: 'No scores found for this class and term',
        }),
        { status: 400, headers: corsHeaders }
      );
    }

    await updateJobStatus(supabase, job_id, 'processing', 30);

    console.log('📊 Fetching assessments...');
    const assessments = await getAssessments(supabase, job.class_id, job.term_id);
    console.log(`📊 Found ${assessments.length} assessments`);

    if (assessments.length === 0) {
      await updateJobStatus(
        supabase,
        job_id,
        'failed',
        0,
        'No assessments found for this class and term'
      );
      return new Response(
        JSON.stringify({
          success: false,
          message: 'No assessments found for this class and term',
        }),
        { status: 400, headers: corsHeaders }
      );
    }

    await updateJobStatus(supabase, job_id, 'processing', 40);

    console.log('📊 Fetching students...');
    const students = await getStudents(supabase, job.class_id);
    console.log(`📊 Found ${students.length} students`);

    if (students.length === 0) {
      await updateJobStatus(
        supabase,
        job_id,
        'failed',
        0,
        'No students found in this class'
      );
      return new Response(
        JSON.stringify({
          success: false,
          message: 'No students found in this class',
        }),
        { status: 400, headers: corsHeaders }
      );
    }

    await updateJobStatus(supabase, job_id, 'processing', 50);

    console.log('📊 Fetching subjects...');
    const subjects = await getSubjects(supabase, job.school_id);
    console.log(`📊 Found ${subjects.length} subjects`);

    console.log('📊 Fetching grading system...');
    const gradingSystem = await getGradingSystem(supabase, job.school_id);
    console.log(`📊 Found ${gradingSystem.length} grading bands`);

    await updateJobStatus(supabase, job_id, 'processing', 60);

    // 7. Calculate results
    console.log('📊 Calculating averages and grades...');
    const studentResults = aggregateScoresByStudentAndSubject(
      scores,
      assessments,
      subjects,
      gradingSystem
    );

    console.log(`📊 Processed ${studentResults.length} students`);

    await updateJobStatus(supabase, job_id, 'processing', 70);

    // 8. Calculate subject positions
    console.log('📊 Calculating subject positions...');
    const subjectScores: { subject_id: string; student_id: string; score: number }[] = [];

    for (const student of studentResults) {
      for (const subject of student.subjects) {
        subjectScores.push({
          subject_id: subject.subject_id,
          student_id: student.student_id,
          score: subject.score,
        });
      }
    }

    // Group by subject
    const subjectGroups = new Map<string, { student_id: string; score: number }[]>();
    for (const item of subjectScores) {
      if (!subjectGroups.has(item.subject_id)) {
        subjectGroups.set(item.subject_id, []);
      }
      subjectGroups.get(item.subject_id)!.push({
        student_id: item.student_id,
        score: item.score,
      });
    }

    // Calculate positions per subject
    const subjectPositions = new Map<string, Map<string, number>>();
    for (const [subjectId, items] of subjectGroups) {
      subjectPositions.set(subjectId, calculatePositions(items));
    }

    await updateJobStatus(supabase, job_id, 'processing', 80);

    // 9. Calculate overall positions
    console.log('📊 Calculating overall positions...');
    const overallItems = studentResults.map((s) => ({
      student_id: s.student_id,
      score: s.overall_average,
    }));
    const overallPositions = calculatePositions(overallItems);

    await updateJobStatus(supabase, job_id, 'processing', 90);

    // 10. Build compiled_results records
    console.log('📊 Building compiled results...');
    const compiledResults: CompiledResultRecord[] = [];

    for (const student of studentResults) {
      for (const subject of student.subjects) {
        const subjectPositionMap = subjectPositions.get(subject.subject_id);
        const subjectPosition = subjectPositionMap?.get(student.student_id) || 0;

        compiledResults.push({
          school_id: job.school_id,
          student_id: student.student_id,
          class_id: job.class_id,
          term_id: job.term_id,
          subject_id: subject.subject_id,
          score: subject.score,
          grade: subject.grade,
          subject_position: subjectPosition,
          overall_position: overallPositions.get(student.student_id) || 0,
          remarks: subject.remarks,
        });
      }
    }

    console.log(`📊 Created ${compiledResults.length} compiled results`);

    // 11. Insert compiled_results
    await insertCompiledResults(supabase, compiledResults);

    // 12. Update job status to completed
    await updateJobStatus(supabase, job_id, 'completed', 100);

    console.log(`✅ Compilation completed for job: ${job_id}`);

    const response: CompilationResponse = {
      success: true,
      message: 'Compilation completed successfully',
      stats: {
        students_processed: studentResults.length,
        subjects_processed: subjects.length,
        total_records: compiledResults.length,
      },
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: corsHeaders,
    });
  } catch (error) {
    console.error('❌ Compilation error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    // Try to update job status to failed
    try {
      const body = await req.json();
      if (body.job_id) {
        const supabase = createSupabaseClient();
        await updateJobStatus(supabase, body.job_id, 'failed', 0, errorMessage);
      }
    } catch (_) {
      // Ignore job update error
    }

    return new Response(
      JSON.stringify({
        success: false,
        message: errorMessage,
      }),
      { status: 500, headers: corsHeaders }
    );
  }
});
