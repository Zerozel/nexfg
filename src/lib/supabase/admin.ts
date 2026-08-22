// src/lib/supabase/admin.ts
import { createServerSupabase } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import type {
  Student,
  Teacher,
  TeacherWithCredentials,
  AcademicYear,
  Class,
  Subject,

  ClassSubjectAssignment,
  Assessment,
  Enrollment,
  TeacherAssignment,
  BulkEnrollmentResult,
  UnenrolledStudent,
} from '@/types/admin';

// Resolved client type (createServerSupabase is async)
type SupabaseClient = any;

function generateSecurePassword(): string {
  const uppercase = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lowercase = 'abcdefghjkmnpqrstuvwxyz';
  const numbers = '23456789';
  const symbols = '!@#$%&*';
  
  const all = uppercase + lowercase + numbers + symbols;
  
  let password = '';
  // Ensure at least one of each
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];
  
  // Fill remaining 8 characters
  for (let i = 0; i < 8; i++) {
    password += all[Math.floor(Math.random() * all.length)];
  }
  
  // Shuffle
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

// ============ STUDENTS ============

export async function listStudents(
  supabase: SupabaseClient,
  params: { page?: number; pageSize?: number; search?: string }
) {
  const { page = 1, pageSize = 10, search = '' } = params;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from('students')
    .select('*, classes(name)', { count: 'exact' })
    .is('is_deleted', false)
    .order('full_name', { ascending: true })
    .range(from, to);

  if (search) {
    query = query.or(
      `full_name.ilike.%${search}%,guardian_name.ilike.%${search}%,guardian_phone.ilike.%${search}%`
    );
  }

  const { data, error, count } = await query;

  if (error) throw error;

  const students = data.map((s: any) => ({
    ...s,
    class_name: s.classes?.name || null,
  }));

  return {
    data: students as Student[],
    total: count || 0,
    page,
    pageSize,
    totalPages: Math.ceil((count || 0) / pageSize),
  };
}

export async function createStudent(
  supabase: SupabaseClient,
  data: Omit<Student, 'id' | 'school_id' | 'is_deleted' | 'deleted_at' | 'created_at' | 'updated_at' | 'class_name'>
) {
  const { data: student, error } = await supabase
    .from('students')
    .insert(data)
    .select('*, classes(name)')
    .single();

  if (error) throw error;

  return {
    ...student,
    class_name: student.classes?.name || null,
  } as Student;
}

export async function getStudent(
  supabase: SupabaseClient,
  id: string
) {
  const { data, error } = await supabase
    .from('students')
    .select('*, classes(name)')
    .eq('id', id)
    .is('is_deleted', false)
    .single();

  if (error) throw error;

  return {
    ...data,
    class_name: data.classes?.name || null,
  } as Student;
}

export async function updateStudent(
  supabase: SupabaseClient,
  id: string,
  data: Partial<Student>
) {
  const { data: student, error } = await supabase
    .from('students')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', id)
    .is('is_deleted', false)
    .select('*, classes(name)')
    .single();

  if (error) throw error;

  return {
    ...student,
    class_name: student.classes?.name || null,
  } as Student;
}

export async function deleteStudent(
  supabase: SupabaseClient,
  id: string
) {
  const { error } = await supabase
    .from('students')
    .update({
      is_deleted: true,
      deleted_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) throw error;
}

// ============ TEACHERS ============

export async function listTeachers(
  supabase: SupabaseClient,
  params: { page?: number; pageSize?: number; search?: string }
) {
  const { page = 1, pageSize = 10, search = '' } = params;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from('profiles')
    .select('*', { count: 'exact' })
    .in('role', ['teacher', 'admin', 'principal'])
    .is('is_deleted', false)
    .order('full_name', { ascending: true })
    .range(from, to);

  if (search) {
    query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
  }

  const { data, error, count } = await query;

  if (error) throw error;

  return {
    data: data as Teacher[],
    total: count || 0,
    page,
    pageSize,
    totalPages: Math.ceil((count || 0) / pageSize),
  };
}

export async function createTeacher(
  supabase: SupabaseClient,
  data: { full_name: string; email: string; role: 'teacher' | 'admin' | 'principal' }
): Promise<TeacherWithCredentials> {
  const tempPassword = generateSecurePassword();

  // Derive the admin's school_id from the authenticated session. New staff MUST
  // be scoped to the same school for multi-tenant isolation.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const schoolId = user?.app_metadata?.school_id as string | undefined;
  if (!schoolId) {
    throw new Error('Unable to determine school context for the current user');
  }

  // Create auth user via Supabase Admin API
  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );

  // IMPORTANT: role and school_id MUST live in app_metadata — the login forms,
  // middleware, and RLS policies (auth.jwt() -> 'app_metadata') all read from
  // there. Storing them in user_metadata breaks login and row-level security.
  const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email: data.email,
    password: tempPassword,
    email_confirm: true,
    user_metadata: {
      full_name: data.full_name,
    },
    app_metadata: {
      role: data.role,
      school_id: schoolId,
    },
  });

  if (authError) {
    if (authError.message?.includes('already been registered')) {
      throw new Error('Email already in use');
    }
    throw authError;
  }

  // A database trigger creates the base profile row on auth.users insert. Update
  // it with the correct name/role and ensure it is scoped to the admin's school.
  // Use the service client so this write isn't blocked by RLS while the profile
  // is still being provisioned.
  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .update({
      full_name: data.full_name,
      role: data.role,
      school_id: schoolId,
    })
    .eq('id', authUser.user.id)
    .select()
    .single();

  if (profileError) {
    // Roll back the auth user so a failed provisioning doesn't leave an orphaned
    // account that blocks re-creating the teacher with the same email.
    await supabaseAdmin.auth.admin.deleteUser(authUser.user.id);
    throw profileError;
  }

  return {
    ...(profile as Teacher),
    temporary_password: tempPassword,
  };
}


export async function getTeacher(
  supabase: SupabaseClient,
  id: string
) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .is('is_deleted', false)
    .in('role', ['teacher', 'admin', 'principal'])
    .single();

  if (error) throw error;
  return data as Teacher;
}

export async function updateTeacher(
  supabase: SupabaseClient,
  id: string,
  data: Partial<Teacher>
) {
  const { data: teacher, error } = await supabase
    .from('profiles')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', id)
    .is('is_deleted', false)
    .in('role', ['teacher', 'admin', 'principal'])
    .select()
    .single();

  if (error) throw error;
  return teacher as Teacher;
}

export async function deleteTeacher(
  supabase: SupabaseClient,
  id: string
) {
  const { error } = await supabase
    .from('profiles')
    .update({
      is_deleted: true,
      deleted_at: new Date().toISOString(),
    })
    .eq('id', id)
    .in('role', ['teacher', 'admin', 'principal']);

  if (error) throw error;
}

// ============ CLASSES ============

export async function listClasses(
  supabase: SupabaseClient,
  params: { page?: number; pageSize?: number; search?: string }
) {
  const { page = 1, pageSize = 10, search = '' } = params;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from('classes')
    .select('*, profiles!classes_teacher_id_fkey(full_name)', { count: 'exact' })
    .is('is_deleted', false)
    .order('name', { ascending: true })
    .range(from, to);

  if (search) {
    query = query.ilike('name', `%${search}%`);
  }

  const { data, error, count } = await query;

  if (error) throw error;

  const classes = data.map((c: any) => ({
    ...c,
    teacher_name: c.profiles?.full_name || null,
  }));

  return {
    data: classes as Class[],
    total: count || 0,
    page,
    pageSize,
    totalPages: Math.ceil((count || 0) / pageSize),
  };
}

export async function createClass(
  supabase: SupabaseClient,
  data: Omit<Class, 'id' | 'school_id' | 'is_deleted' | 'deleted_at' | 'created_at' | 'updated_at' | 'teacher_name'>
) {
  const { data: classData, error } = await supabase
    .from('classes')
    .insert(data)
    .select('*, profiles!classes_teacher_id_fkey(full_name)')
    .single();

  if (error) throw error;

  return {
    ...classData,
    teacher_name: classData.profiles?.full_name || null,
  } as Class;
}

export async function getClass(
  supabase: SupabaseClient,
  id: string
) {
  const { data, error } = await supabase
    .from('classes')
    .select('*, profiles!classes_teacher_id_fkey(full_name)')
    .eq('id', id)
    .is('is_deleted', false)
    .single();

  if (error) throw error;

  return {
    ...data,
    teacher_name: data.profiles?.full_name || null,
  } as Class;
}

export async function updateClass(
  supabase: SupabaseClient,
  id: string,
  data: Partial<Class>
) {
  const { data: classData, error } = await supabase
    .from('classes')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', id)
    .is('is_deleted', false)
    .select('*, profiles!classes_teacher_id_fkey(full_name)')
    .single();

  if (error) throw error;

  return {
    ...classData,
    teacher_name: classData.profiles?.full_name || null,
  } as Class;
}

export async function deleteClass(
  supabase: SupabaseClient,
  id: string
) {
  const { error } = await supabase
    .from('classes')
    .update({
      is_deleted: true,
      deleted_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) throw error;
}

// ============ ACADEMIC YEARS ============

// Nigerian academic sessions run ~September -> July and are labelled by the two
// calendar years they span, e.g. a session starting Sept 2024 is "2024/2025".
// Before September we are still in the previous session.
export function generateSessionName(reference: Date = new Date()): string {
  const year = reference.getFullYear();
  const month = reference.getMonth(); // 0 = January
  const startYear = month >= 8 ? year : year - 1; // 8 = September
  return `${startYear}/${startYear + 1}`;
}

export async function listAcademicYears(
  supabase: SupabaseClient
): Promise<AcademicYear[]> {
  const { data, error } = await supabase
    .from('academic_years')
    .select('*')
    .is('is_deleted', false)
    .order('name', { ascending: false });

  if (error) throw error;
  return (data || []) as AcademicYear[];
}

export async function createAcademicYear(
  supabase: SupabaseClient,
  data: { name: string; start_date?: string | null; end_date?: string | null; is_current?: boolean }
): Promise<AcademicYear> {
  // If this session is being marked current, clear the flag on any existing
  // current session first so the "one current session" invariant holds.
  if (data.is_current) {
    await clearCurrentAcademicYear(supabase);
  }

  const { data: academicYear, error } = await supabase
    .from('academic_years')
    .insert({
      name: data.name,
      start_date: data.start_date ?? null,
      end_date: data.end_date ?? null,
      is_current: data.is_current ?? false,
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      throw new Error('An academic year with this name already exists');
    }
    throw error;
  }
  return academicYear as AcademicYear;
}

export async function getAcademicYear(
  supabase: SupabaseClient,
  id: string
): Promise<AcademicYear> {
  const { data, error } = await supabase
    .from('academic_years')
    .select('*')
    .eq('id', id)
    .is('is_deleted', false)
    .single();

  if (error) throw error;
  return data as AcademicYear;
}

export async function updateAcademicYear(
  supabase: SupabaseClient,
  id: string,
  data: Partial<Pick<AcademicYear, 'name' | 'start_date' | 'end_date' | 'is_current'>>
): Promise<AcademicYear> {
  // Promote this session to current: demote whichever one currently holds it.
  if (data.is_current) {
    await clearCurrentAcademicYear(supabase, id);
  }

  const { data: academicYear, error } = await supabase
    .from('academic_years')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', id)
    .is('is_deleted', false)
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      throw new Error('An academic year with this name already exists');
    }
    throw error;
  }
  return academicYear as AcademicYear;
}

export async function deleteAcademicYear(
  supabase: SupabaseClient,
  id: string
) {
  const { error } = await supabase
    .from('academic_years')
    .update({
      is_deleted: true,
      deleted_at: new Date().toISOString(),
      is_current: false,
    })
    .eq('id', id);

  if (error) throw error;
}

// Demote the current session (optionally excluding one id we're about to set).
async function clearCurrentAcademicYear(
  supabase: SupabaseClient,
  exceptId?: string
) {
  let query = supabase
    .from('academic_years')
    .update({ is_current: false, updated_at: new Date().toISOString() })
    .eq('is_current', true)
    .is('is_deleted', false);

  if (exceptId) {
    query = query.neq('id', exceptId);
  }

  const { error } = await query;
  if (error) throw error;
}

// Guarantees a school has a "current" academic session, creating the computed
// one (e.g. "2024/2025") on first use. Called during onboarding and as a safe
// fallback when loading the class form. Returns the current session.
export async function ensureCurrentAcademicYear(
  supabase: SupabaseClient
): Promise<AcademicYear> {
  const { data: existing, error: existingError } = await supabase
    .from('academic_years')
    .select('*')
    .eq('is_current', true)
    .is('is_deleted', false)
    .maybeSingle();

  if (existingError) throw existingError;
  if (existing) return existing as AcademicYear;

  const name = generateSessionName();

  // Another session with this name may already exist but not be flagged current
  // (e.g. created then unset). Re-use it instead of violating the unique name.
  const { data: sameName } = await supabase
    .from('academic_years')
    .select('*')
    .eq('name', name)
    .is('is_deleted', false)
    .maybeSingle();

  if (sameName) {
    return updateAcademicYear(supabase, sameName.id, { is_current: true });
  }

  return createAcademicYear(supabase, { name, is_current: true });
}

// ============ SUBJECTS ============


export async function listSubjects(
  supabase: SupabaseClient,
  params: { page?: number; pageSize?: number; search?: string }
) {
  const { page = 1, pageSize = 10, search = '' } = params;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from('subjects')
    .select('*', { count: 'exact' })
    .is('is_deleted', false)
    .order('name', { ascending: true })
    .range(from, to);

  if (search) {
    query = query.or(`name.ilike.%${search}%,code.ilike.%${search}%`);
  }

  const { data, error, count } = await query;

  if (error) throw error;

  return {
    data: data as Subject[],
    total: count || 0,
    page,
    pageSize,
    totalPages: Math.ceil((count || 0) / pageSize),
  };
}

export async function createSubject(
  supabase: SupabaseClient,
  data: Omit<Subject, 'id' | 'school_id' | 'is_deleted' | 'deleted_at' | 'created_at' | 'updated_at'>
) {
  const { data: subject, error } = await supabase
    .from('subjects')
    .insert(data)
    .select()
    .single();

  if (error) throw error;
  return subject as Subject;
}

export async function getSubject(
  supabase: SupabaseClient,
  id: string
) {
  const { data, error } = await supabase
    .from('subjects')
    .select('*')
    .eq('id', id)
    .is('is_deleted', false)
    .single();

  if (error) throw error;
  return data as Subject;
}

export async function updateSubject(
  supabase: SupabaseClient,
  id: string,
  data: Partial<Subject>
) {
  const { data: subject, error } = await supabase
    .from('subjects')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', id)
    .is('is_deleted', false)
    .select()
    .single();

  if (error) throw error;
  return subject as Subject;
}

export async function deleteSubject(
  supabase: SupabaseClient,
  id: string
) {
  const { error } = await supabase
    .from('subjects')
    .update({
      is_deleted: true,
      deleted_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) throw error;
}

// ============ CLASS-SUBJECT ASSIGNMENT ============

export async function assignClassSubject(
  supabase: SupabaseClient,
  data: { class_id: string; subject_id: string; teacher_id: string }
): Promise<ClassSubjectAssignment> {
  const { data: assignment, error } = await supabase
    .from('class_subjects')
    .upsert(data, { onConflict: 'class_id,subject_id' })
    .select()
    .single();

  if (error) throw error;
  return assignment as ClassSubjectAssignment;
}


// Add these functions to existing src/lib/supabase/admin.ts

// ============ ASSESSMENTS ============

export async function listAssessments(
  supabase: SupabaseClient,
  params: {
    page?: number;
    pageSize?: number;
    search?: string;
    classId?: string;
    subjectId?: string;
    termId?: string;
    type?: string;
  }
) {
  const { page = 1, pageSize = 10, search = '', classId, subjectId, termId, type } = params;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from('assessments')
    .select(
      `
      *,
      classes!inner(name),
      subjects!inner(name),
      terms!inner(name)
    `,
      { count: 'exact' }
    )
    .is('is_deleted', false)
    .order('created_at', { ascending: false })
    .range(from, to);

  if (search) {
    query = query.ilike('name', `%${search}%`);
  }
  if (classId) {
    query = query.eq('class_id', classId);
  }
  if (subjectId) {
    query = query.eq('subject_id', subjectId);
  }
  if (termId) {
    query = query.eq('term_id', termId);
  }
  if (type) {
    query = query.eq('type', type);
  }

  const { data, error, count } = await query;

  if (error) throw error;

  const assessments = (data || []).map((a: any) => ({
    ...a,
    class_name: a.classes?.name || null,
    subject_name: a.subjects?.name || null,
    term_name: a.terms?.name || null,
  }));

  return {
    data: assessments as Assessment[],
    total: count || 0,
    page,
    pageSize,
    totalPages: Math.ceil((count || 0) / pageSize),
  };
}

export async function createAssessment(
  supabase: SupabaseClient,
  data: Omit<Assessment, 'id' | 'school_id' | 'is_deleted' | 'deleted_at' | 'created_at' | 'updated_at' | 'class_name' | 'subject_name' | 'term_name'>
) {
  const { data: assessment, error } = await supabase
    .from('assessments')
    .insert(data)
    .select('*, classes(name), subjects(name), terms(name)')
    .single();

  if (error) throw error;

  return {
    ...assessment,
    class_name: assessment.classes?.name || null,
    subject_name: assessment.subjects?.name || null,
    term_name: assessment.terms?.name || null,
  } as Assessment;
}

export async function getAssessment(
  supabase: SupabaseClient,
  id: string
) {
  const { data, error } = await supabase
    .from('assessments')
    .select('*, classes(name), subjects(name), terms(name)')
    .eq('id', id)
    .is('is_deleted', false)
    .single();

  if (error) throw error;

  return {
    ...data,
    class_name: data.classes?.name || null,
    subject_name: data.subjects?.name || null,
    term_name: data.terms?.name || null,
  } as Assessment;
}

export async function updateAssessment(
  supabase: SupabaseClient,
  id: string,
  data: Partial<Assessment>
) {
  const { data: assessment, error } = await supabase
    .from('assessments')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', id)
    .is('is_deleted', false)
    .select('*, classes(name), subjects(name), terms(name)')
    .single();

  if (error) throw error;

  return {
    ...assessment,
    class_name: assessment.classes?.name || null,
    subject_name: assessment.subjects?.name || null,
    term_name: assessment.terms?.name || null,
  } as Assessment;
}

export async function deleteAssessment(
  supabase: SupabaseClient,
  id: string
) {
  const { error } = await supabase
    .from('assessments')
    .update({
      is_deleted: true,
      deleted_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) throw error;
}

// ============ ENROLLMENTS ============

export async function listEnrollments(
  supabase: SupabaseClient,
  params: {
    classId: string;
    termId: string;
    page?: number;
    pageSize?: number;
  }
) {
  const { classId, termId, page = 1, pageSize = 10 } = params;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await supabase
    .from('enrollments')
    .select(
      `
      student_id,
      class_id,
      term_id,
      enrollment_date,
      is_current,
      students!inner(full_name, admission_number)
    `,
      { count: 'exact' }
    )
    .eq('class_id', classId)
    .eq('term_id', termId)
    .eq('is_current', true)
    .is('students.is_deleted', false)
    .order('enrollment_date', { ascending: false })
    .range(from, to);

  if (error) throw error;

  const enrollments = (data || []).map((e: any) => ({
    student_id: e.student_id,
    student_name: e.students?.full_name || 'Unknown',
    admission_number: e.students?.admission_number || 'N/A',
    class_id: e.class_id,
    term_id: e.term_id,
    enrollment_date: e.enrollment_date,
    is_current: e.is_current,
  }));

  return {
    data: enrollments as Enrollment[],
    total: count || 0,
    page,
    pageSize,
    totalPages: Math.ceil((count || 0) / pageSize),
  };
}

export async function enrollStudent(
  supabase: SupabaseClient,
  data: { student_id: string; class_id: string; term_id: string }
) {
  // An enrollment row may already exist for this (student, class, term) — either
  // active (a genuine duplicate) or inactive (a student who was unenrolled, which
  // only flips is_current=false). Reactivate inactive rows so re-enrolling works
  // despite the unique constraint, but still reject genuine active duplicates.
  const { data: existing, error: existingError } = await supabase
    .from('enrollments')
    .select('is_current')
    .eq('student_id', data.student_id)
    .eq('class_id', data.class_id)
    .eq('term_id', data.term_id)
    .maybeSingle();

  if (existingError) throw existingError;

  if (existing?.is_current) {
    throw new Error('Student is already enrolled in this class for this term');
  }

  const enrollmentDate = new Date().toISOString().split('T')[0];

  const { data: enrollment, error } = existing
    ? await supabase
        .from('enrollments')
        .update({ is_current: true, enrollment_date: enrollmentDate })
        .eq('student_id', data.student_id)
        .eq('class_id', data.class_id)
        .eq('term_id', data.term_id)
        .select('*, students(full_name, admission_number)')
        .single()
    : await supabase
        .from('enrollments')
        .insert({
          student_id: data.student_id,
          class_id: data.class_id,
          term_id: data.term_id,
          enrollment_date: enrollmentDate,
          is_current: true,
        })
        .select('*, students(full_name, admission_number)')
        .single();

  if (error) {
    if (error.code === '23505') {
      throw new Error('Student is already enrolled in this class for this term');
    }
    throw error;
  }

  return {
    student_id: enrollment.student_id,
    student_name: enrollment.students?.full_name || 'Unknown',
    admission_number: enrollment.students?.admission_number || 'N/A',
    class_id: enrollment.class_id,
    term_id: enrollment.term_id,
    enrollment_date: enrollment.enrollment_date,
    is_current: enrollment.is_current,
  } as Enrollment;
}

export async function bulkEnrollStudents(
  supabase: SupabaseClient,
  data: { student_ids: string[]; class_id: string; term_id: string }
): Promise<BulkEnrollmentResult> {
  const result: BulkEnrollmentResult = {
    enrolled: 0,
    failed: 0,
    errors: [],
  };

  for (const studentId of data.student_ids) {
    try {
      await enrollStudent(supabase, {
        student_id: studentId,
        class_id: data.class_id,
        term_id: data.term_id,
      });
      result.enrolled++;
    } catch (error: any) {
      result.failed++;
      result.errors.push({
        student_id: studentId,
        reason: error.message || 'Unknown error',
      });
    }
  }

  return result;
}

export async function bulkEnrollByAdmissionNumbers(
  supabase: SupabaseClient,
  data: { admission_numbers: string[]; class_id: string; term_id: string }
): Promise<BulkEnrollmentResult> {
  const result: BulkEnrollmentResult = {
    enrolled: 0,
    failed: 0,
    errors: [],
  };

  for (const admissionNumber of data.admission_numbers) {
    try {
      // Find student by admission number
      const { data: student, error: studentError } = await supabase
        .from('students')
        .select('id')
        .eq('admission_number', admissionNumber.trim())
        .is('is_deleted', false)
        .single();

      if (studentError || !student) {
        result.failed++;
        result.errors.push({
          admission_number: admissionNumber,
          reason: `Student with admission number "${admissionNumber}" not found`,
        });
        continue;
      }

      await enrollStudent(supabase, {
        student_id: student.id,
        class_id: data.class_id,
        term_id: data.term_id,
      });
      result.enrolled++;
    } catch (error: any) {
      result.failed++;
      result.errors.push({
        admission_number: admissionNumber,
        reason: error.message || 'Unknown error',
      });
    }
  }

  return result;
}

export async function unenrollStudent(
  supabase: SupabaseClient,
  studentId: string,
  classId: string,
  termId: string
) {
  const { error } = await supabase
    .from('enrollments')
    .update({ is_current: false })
    .eq('student_id', studentId)
    .eq('class_id', classId)
    .eq('term_id', termId);

  if (error) throw error;
}

export async function getUnenrolledStudents(
  supabase: SupabaseClient,
  classId: string,
  termId: string
): Promise<UnenrolledStudent[]> {
  // Get all enrolled student IDs for this class/term
  const { data: enrolled } = await supabase
    .from('enrollments')
    .select('student_id')
    .eq('class_id', classId)
    .eq('term_id', termId)
    .eq('is_current', true);

  const enrolledIds = (enrolled || []).map((e: any) => e.student_id);

  let query = supabase
    .from('students')
    .select('id, full_name, admission_number')
    .is('is_deleted', false)
    .order('full_name');

  if (enrolledIds.length > 0) {
    query = query.not('id', 'in', `(${enrolledIds.join(',')})`);
  }

  const { data, error } = await query;

  if (error) throw error;

  return (data || []) as UnenrolledStudent[];
}

// ============ TEACHER ASSIGNMENTS ============

export async function listTeacherAssignments(
  supabase: SupabaseClient,
  classId: string
): Promise<TeacherAssignment[]> {
  const { data, error } = await supabase
    .from('class_subjects')
    .select(
      `
      id,
      class_id,
      subject_id,
      teacher_id,
      subjects!inner(name),
      profiles!inner(full_name)
    `
    )
    .eq('class_id', classId);

  if (error) throw error;

  return (data || []).map((a: any) => ({
    id: a.id,
    class_id: a.class_id,
    subject_id: a.subject_id,
    teacher_id: a.teacher_id,
    subject_name: a.subjects?.name || 'Unknown',
    teacher_name: a.profiles?.full_name || 'Unknown',
  }));
}

export async function assignTeacherToSubject(
  supabase: SupabaseClient,
  data: { class_id: string; subject_id: string; teacher_id: string }
): Promise<TeacherAssignment> {
  const { data: assignment, error } = await supabase
    .from('class_subjects')
    .upsert(
      {
        class_id: data.class_id,
        subject_id: data.subject_id,
        teacher_id: data.teacher_id,
      },
      { onConflict: 'class_id,subject_id' }
    )
    .select(
      `
      id,
      class_id,
      subject_id,
      teacher_id,
      subjects(name),
      profiles(full_name),
      classes(name)
    `
    )
    .single();

  if (error) {
    if (error.code === '23505') {
      throw new Error('This subject is already assigned to this class');
    }
    throw error;
  }

  return {
    id: assignment.id,
    class_id: assignment.class_id,
    subject_id: assignment.subject_id,
    teacher_id: assignment.teacher_id,
    subject_name: assignment.subjects?.name || 'Unknown',
    teacher_name: assignment.profiles?.full_name || 'Unknown',
    class_name: assignment.classes?.name || 'Unknown',
  };
}

export async function removeTeacherAssignment(
  supabase: SupabaseClient,
  id: string
) {
  const { error } = await supabase
    .from('class_subjects')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function getUnassignedSubjectsForClass(
  supabase: SupabaseClient,
  classId: string
) {
  // Get assigned subject IDs
  const { data: assigned } = await supabase
    .from('class_subjects')
    .select('subject_id')
    .eq('class_id', classId);

  const assignedIds = (assigned || []).map((a: any) => a.subject_id);

  let query = supabase
    .from('subjects')
    .select('id, name, code')
    .is('is_deleted', false)
    .order('name');

  if (assignedIds.length > 0) {
    query = query.not('id', 'in', `(${assignedIds.join(',')})`);
  }

  const { data, error } = await query;
  if (error) throw error;

  return data || [];
}
