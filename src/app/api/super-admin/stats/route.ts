import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const [
      { count: totalSchools },
      { count: activeSchools },
      { count: trialSchools },
      { count: inactiveSchools },
      { count: totalStudents },
      { count: totalTeachers },
      { count: totalClasses },
      { count: totalSubjects },
    ] = await Promise.all([
      supabase.from('schools').select('*', { count: 'exact', head: true }).is('is_deleted', false),
      supabase.from('schools').select('*', { count: 'exact', head: true }).eq('subscription_status', 'active').is('is_deleted', false),
      supabase.from('schools').select('*', { count: 'exact', head: true }).eq('subscription_status', 'trial').is('is_deleted', false),
      supabase.from('schools').select('*', { count: 'exact', head: true }).eq('subscription_status', 'inactive').is('is_deleted', false),
      supabase.from('students').select('*', { count: 'exact', head: true }).is('is_deleted', false),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).in('role', ['teacher', 'admin', 'principal']).is('is_deleted', false),
      supabase.from('classes').select('*', { count: 'exact', head: true }).is('is_deleted', false),
      supabase.from('subjects').select('*', { count: 'exact', head: true }).is('is_deleted', false),
    ]);

    return NextResponse.json({
      success: true,
      stats: {
        total_schools: totalSchools || 0,
        active_schools: activeSchools || 0,
        trial_schools: trialSchools || 0,
        inactive_schools: inactiveSchools || 0,
        total_students: totalStudents || 0,
        total_teachers: totalTeachers || 0,
        total_classes: totalClasses || 0,
        total_subjects: totalSubjects || 0,
      },
    });
  } catch (error: any) {
    console.error('GET /api/super-admin/stats error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
