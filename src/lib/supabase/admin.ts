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

// ============================================================================
// MULTI-TENANT SCOPING NOTES
// ----------------------------------------------------------------------------
// Every function in this file that reads or writes tenant-scoped tables MUST
// be scoped to the caller's school_id. The RLS policies protect against
// cross-tenant reads/writes when the query goes through an RLS-enforced
// client, but when a route uses the service-role key (which bypasses RLS),
// scoping becomes the application's responsibility.
//
// The academic-year, class, and assessment-provisioning functions below have
// been hardened. The remaining functions in this file (students, teachers,
// subjects, enrollments, etc.) still rely on RLS and will be hardened in a
// follow-up pass.
// ============================================================================

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
    .select('*, classes!class_id(name)', { count: 'exact' })
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
    .select('*, classes!class_id(name)')
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
    .select('*, classes!class_id(name)')
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
    .select('*, classes!class_id(name)')
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

// ← CHANGED: added `schoolId` param. Before inserting the new class, verify the
// academic_year_id actually belongs to the caller's school. Without this check,
// a client can create a class that points at another tenant's academic year
// (this is exactly how Rock Foundation's classes became contaminated).
export async function createClass(
  supabase: SupabaseClient,
  schoolId: string,
  data: Omit<Class, 'id' | 'school_id' | 'is_deleted' | 'deleted_at' | 'created_at' | 'updated_at' | 'teacher_name'>
) {
  // ← ADDED: ownership check on academic_year_id
  const { data: academicYear, error: ayError } = await supabase
    .from('academic_years')
    .select('id')
    .eq('id', data.academic_year_id)
    .eq('school_id', schoolId)
    .is('is_deleted', false)
    .maybeSingle();

  if (ayError) throw ayError;
  if (!academicYear) {
    throw new Error('Academic year does not belong to this school');
  }

  // ← CHANGED: force school_id from the caller's session. Never trust the
  // client to supply the correct school_id.
  const { data: classData, error } = await supabase
    .from('classes')
    .insert({ ...data, school_id: schoolId })
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

// ← CHANGED: added `schoolId` param. If the payload includes a new
// academic_year_id, verify it belongs to the caller's school. Also scope the
// update to the caller's school so one tenant cannot modify another's class.
export async function updateClass(
  supabase: SupabaseClient,
  schoolId: string,
  id: string,
  data: Partial<Class>
) {
  // ← ADDED: if academic_year_id is being changed, validate ownership
  if (data.academic_year_id) {
    const { data: academicYear, error: ayError } = await supabase
      .from('academic_years')
      .select('id')
      .eq('id', data.academic_year_id)
      .eq('school_id', schoolId)
      .is('is_deleted', false)
      .maybeSingle();

    if (ayError) throw ayError;
    if (!academicYear) {
      throw new Error('Academic year does not belong to this school');
    }
  }

  const { data: classData, error } = await supabase
    .from('classes')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('school_id', schoolId)          // ← ADDED: scope to caller's school
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

// ← CHANGED: scoped to schoolId. Previously returned every school's academic
// years, which is how the ClassForm dropdown ended up offering another
// tenant's session.
export async function listAcademicYears(
  supabase: SupabaseClient,
  schoolId: string
): Promise<AcademicYear[]> {
  const { data, error } = await supabase
    .from('academic_years')
    .select('*')
    .eq('school_id', schoolId)          // ← ADDED
    .is('is_deleted', false)
    .order('name', { ascending: false });

  if (error) throw error;
  return (data || []) as AcademicYear[];
}

// ← CHANGED: now takes schoolId and writes it explicitly into the row.
// academic_years.school_id is NOT NULL with no default, so this insert would
// have failed without it. Also scopes clearCurrentAcademicYear to the caller.
export async function createAcademicYear(
  supabase: SupabaseClient,
  schoolId: string,
  data: { name: string; start_date?: string | null; end_date?: string | null; is_current?: boolean }
): Promise<AcademicYear> {
  // If this session is being marked current, clear the flag on any existing
  // current session *for this school only* so the "one current session per
  // school" invariant holds.
  if (data.is_current) {
    await clearCurrentAcademicYear(supabase, schoolId);
  }

  const { data: academicYear, error } = await supabase
    .from('academic_years')
    .insert({
      school_id: schoolId,             // ← ADDED
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

// ← CHANGED: scoped to schoolId so a caller cannot read another school's year
// by guessing an id.
export async function getAcademicYear(
  supabase: SupabaseClient,
  schoolId: string,
  id: string
): Promise<AcademicYear> {
  const { data, error } = await supabase
    .from('academic_years')
    .select('*')
    .eq('id', id)
    .eq('school_id', schoolId)          // ← ADDED
    .is('is_deleted', false)
    .single();

  if (error) throw error;
  return data as AcademicYear;
}

// ← CHANGED: takes schoolId, scopes the update, and passes schoolId to
// clearCurrentAcademicYear so only this school's current flag is demoted.
export async function updateAcademicYear(
  supabase: SupabaseClient,
  schoolId: string,
  id: string,
  data: Partial<Pick<AcademicYear, 'name' | 'start_date' | 'end_date' | 'is_current'>>
): Promise<AcademicYear> {
  // Promote this session to current: demote whichever one currently holds it
  // for this school.
  if (data.is_current) {
    await clearCurrentAcademicYear(supabase, schoolId, id);
  }

  const { data: academicYear, error } = await supabase
    .from('academic_years')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('school_id', schoolId)          // ← ADDED
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

// ← CHANGED: scoped to schoolId so a caller cannot delete another school's year.
export async function deleteAcademicYear(
  supabase: SupabaseClient,
  schoolId: string,
  id: string
) {
  const { error } = await supabase
    .from('academic_years')
    .update({
      is_deleted: true,
      deleted_at: new Date().toISOString(),
      is_current: false,
    })
    .eq('id', id)
    .eq('school_id', schoolId)          // ← ADDED
    ;

  if (error) throw error;
}

// ← CHANGED: now takes schoolId so demotion only affects the caller's school.
// Previously this touched every school's is_current flag in the database.
async function clearCurrentAcademicYear(
  supabase: SupabaseClient,
  schoolId: string,
  exceptId?: string
) {
  let query = supabase
    .from('academic_years')
    .update({ is_current: false, updated_at: new Date().toISOString() })
    .eq('school_id', schoolId)          // ← ADDED
    .eq('is_current', true)
    .is('is_deleted', false);

  if (exceptId) {
    query = query.neq('id', exceptId);
  }

  const { error } = await query;
  if (error) throw error;
}

// ← CHANGED: now takes schoolId and every query inside is scoped to it. This
// was the root cause of the cross-tenant contamination: the old version ran
// `.eq('is_current', true)` with no school filter, so every school saw the
// same "first" academic year (Green Wood's).
export async function ensureCurrentAcademicYear(
  supabase: SupabaseClient,
  schoolId: string
): Promise<AcademicYear> {
  // ✅ Step 1: Clean up any duplicate current years *for this school only*
  const { data: duplicates, error: dupError } = await supabase
    .from('academic_years')
    .select('id, school_id')
    .eq('school_id', schoolId)          // ← ADDED
    .eq('is_current', true)
    .is('is_deleted', false);

  if (!dupError && duplicates && duplicates.length > 1) {
    console.log(`Found ${duplicates.length} duplicate current academic years. Cleaning up...`);
    
    // Keep the first one, mark others as not current
    const keepId = duplicates[0].id;
    const idsToUpdate = duplicates.slice(1).map((d: any) => d.id);
    
    const { error: updateError } = await supabase
      .from('academic_years')
      .update({ is_current: false, updated_at: new Date().toISOString() })
      .in('id', idsToUpdate);
    
    if (updateError) {
      console.error('Failed to clean up duplicate academic years:', updateError);
    } else {
      console.log(`Cleaned up ${idsToUpdate.length} duplicate academic years`);
    }
  }

  // ✅ Step 2: Get the current academic year *for this school*
  const { data: existing, error: existingError } = await supabase
    .from('academic_years')
    .select('*')
    .eq('school_id', schoolId)          // ← ADDED
    .eq('is_current', true)
    .is('is_deleted', false)
    .maybeSingle();

  if (existingError) throw existingError;
  if (existing) {
    // Ensure terms exist for this academic year
    await ensureTermsForAcademicYear(supabase, existing.id, existing.school_id);
    return existing as AcademicYear;
  }

  // ✅ Step 3: No current year exists for this school, create one
  const name = generateSessionName();

  // Another session with this name may already exist for this school but not
  // be flagged current
  const { data: sameName } = await supabase
    .from('academic_years')
    .select('*')
    .eq('school_id', schoolId)          // ← ADDED
    .eq('name', name)
    .is('is_deleted', false)
    .maybeSingle();

  let academicYear: AcademicYear;

  if (sameName) {
    academicYear = await updateAcademicYear(supabase, schoolId, sameName.id, { is_current: true });
  } else {
    academicYear = await createAcademicYear(supabase, schoolId, { name, is_current: true });
  }

  // Ensure terms exist for this academic year
  await ensureTermsForAcademicYear(supabase, academicYear.id, academicYear.school_id);

  return academicYear;
}


// ============ TERMS ============

// ← CHANGED: signature unchanged, but the body now verifies the academic year
// belongs to `schoolId` before inserting terms. This prevents terms from being
// created under an academic year that belongs to another tenant.
export async function ensureTermsForAcademicYear(
  supabase: SupabaseClient,
  academicYearId: string,
  schoolId: string
): Promise<void> {
  // ← ADDED: verify the academic year belongs to this school
  const { data: academicYear, error: ayError } = await supabase
    .from('academic_years')
    .select('id')
    .eq('id', academicYearId)
    .eq('school_id', schoolId)
    .is('is_deleted', false)
    .maybeSingle();

  if (ayError) throw ayError;
  if (!academicYear) {
    throw new Error('Academic year does not belong to this school');
  }

  // Check if terms already exist for this academic year
  const { data: existingTerms, error: checkError } = await supabase
    .from('terms')
    .select('id')
    .eq('academic_year_id', academicYearId)
    .is('is_deleted', false);

  if (checkError) throw checkError;

  // If terms already exist, skip
  if (existingTerms && existingTerms.length > 0) {
    return;
  }

  // Define the 3 default terms
  const terms = [
    { name: 'First Term', order: 1 },
    { name: 'Second Term', order: 2 },
    { name: 'Third Term', order: 3 },
  ];

  // Insert the 3 terms
  const { error: insertError } = await supabase.from('terms').insert(
    terms.map((term) => ({
      school_id: schoolId,
      academic_year_id: academicYearId,
      name: term.name,
      order: term.order,
      is_current: term.order === 1, // First term is current by default
    }))
  );

  if (insertError) throw insertError;
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

// ← CHANGED: no longer auto-creates school-wide template assessments.
// Assessments are now created per-class when a subject is assigned to a class
// (see ensureClassSubjectAssessments). This removes the orphan-template rows
// that caused the compile pipeline to find zero scores.
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

// ← REMOVED: createAssessmentsForSubject
// The old function created school-wide template assessments with class_id=null
// and term_id=null. That's the design flaw that broke the compile pipeline.
// Assessments are now provisioned per (class, term, subject) by
// ensureClassSubjectAssessments below, called from assignClassSubject and
// assignTeacherToSubject.

// ============================================================================
// ← NEW: ensureClassSubjectAssessments
// ----------------------------------------------------------------------------
// Called whenever a subject is attached to a class. Creates the 4 standard
// assessments (CA1, CA2, CA3, Exam) × every term in the class's academic year
// × this subject, all stamped with class_id + term_id + subject_id so the
// compile pipeline can find them.
//
// Idempotent: if an assessment already exists for
// (class_id, term_id, subject_id, name), it is skipped.
// ============================================================================
async function ensureClassSubjectAssessments(
  supabase: SupabaseClient,
  schoolId: string,
  classId: string,
  subjectId: string
): Promise<void> {
  // 1. Resolve the class's academic year
  const { data: cls, error: clsError } = await supabase
    .from('classes')
    .select('id, academic_year_id')
    .eq('id', classId)
    .eq('school_id', schoolId)
    .is('is_deleted', false)
    .maybeSingle();

  if (clsError) throw clsError;
  if (!cls) {
    throw new Error('Class does not belong to this school');
  }

  // 2. Fetch all terms for that academic year
  const { data: terms, error: termsError } = await supabase
    .from('terms')
    .select('id, name, "order"')
    .eq('academic_year_id', cls.academic_year_id)
    .eq('school_id', schoolId)
    .is('is_deleted', false)
    .order('order', { ascending: true });

  if (termsError) throw termsError;
  if (!terms || terms.length === 0) {
    throw new Error('No terms found for this academic year');
  }

  // 3. Which assessments already exist for this class + subject?
  const { data: existing, error: existingError } = await supabase
    .from('assessments')
    .select('id, term_id, name')
    .eq('school_id', schoolId)
    .eq('class_id', classId)
    .eq('subject_id', subjectId)
    .is('is_deleted', false);

  if (existingError) throw existingError;

  const existingKeys = new Set(
    (existing || []).map((a: any) => `${a.term_id}:${a.name}`)
  );

  // 4. Define the 4 assessment templates
  const templateTypes = [
    { name: 'CA1', type: 'test', max_score: 10, weight: 0.1 },
    { name: 'CA2', type: 'test', max_score: 10, weight: 0.1 },
    { name: 'CA3', type: 'test', max_score: 10, weight: 0.1 },
    { name: 'Exam', type: 'exam', max_score: 70, weight: 0.7 },
  ];

  // 5. Build the cartesian product: term × template
  const toInsert: any[] = [];
  for (const term of terms) {
    for (const template of templateTypes) {
      const key = `${term.id}:${template.name}`;
      if (existingKeys.has(key)) continue;
      toInsert.push({
        school_id: schoolId,
        class_id: classId,
        term_id: term.id,
        subject_id: subjectId,
        name: template.name,
        type: template.type,
        max_score: template.max_score,
        weight: template.weight,
        is_auto_created: true,
      });
    }
  }

  if (toInsert.length === 0) {
    return; // already fully provisioned
  }

  const { error: insertError } = await supabase
    .from('assessments')
    .insert(toInsert);

  if (insertError) {
    console.error('Failed to create class-scoped assessments:', insertError);
    throw insertError;
  }
}

// ============ CLASS-SUBJECT ASSIGNMENT ============

// ← CHANGED: now takes schoolId, forces school_id on the class_subjects row,
// and calls ensureClassSubjectAssessments so the compile pipeline has
// class-scoped assessments to find. Without this, scores were written against
// school-wide templates and compile always reported "No scores found".
export async function assignClassSubject(
  supabase: SupabaseClient,
  schoolId: string,
  data: { class_id: string; subject_id: string; teacher_id: string }
): Promise<ClassSubjectAssignment> {
  // 1. Verify the class belongs to this school (defense in depth)
  const { data: cls, error: clsError } = await supabase
    .from('classes')
    .select('id')
    .eq('id', data.class_id)
    .eq('school_id', schoolId)
    .is('is_deleted', false)
    .maybeSingle();

  if (clsError) throw clsError;
  if (!cls) throw new Error('Class does not belong to this school');

  // 2. Verify the subject belongs to this school
  const { data: subj, error: subjError } = await supabase
    .from('subjects')
    .select('id')
    .eq('id', data.subject_id)
    .eq('school_id', schoolId)
    .is('is_deleted', false)
    .maybeSingle();

  if (subjError) throw subjError;
  if (!subj) throw new Error('Subject does not belong to this school');

  // 3. Upsert the class_subjects row (existing behavior)
  const { data: assignment, error } = await supabase
    .from('class_subjects')
    .upsert(data, { onConflict: 'class_id,subject_id' })
    .select()
    .single();

  if (error) throw error;

  // 4. Provision class+term-scoped assessments for this subject
  await ensureClassSubjectAssessments(
    supabase,
    schoolId,
    data.class_id,
    data.subject_id
  );

  return assignment as ClassSubjectAssignment;
}

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
      classes:class_id(name),
      subjects:subject_id(name),
      terms:term_id(name)
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
    .select('*, classes:class_id(name), subjects:subject_id(name), terms:term_id(name)')
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
    .select('*, classes:class_id(name), subjects:subject_id(name), terms:term_id(name)')
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
    .select('*, classes:class_id(name), subjects:subject_id(name), terms:term_id(name)')
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

// ← CHANGED: takes schoolId and calls ensureClassSubjectAssessments so the
// same provisioning happens regardless of which admin route assigns a
// subject. Previously this path created assignments without assessments.
export async function assignTeacherToSubject(
  supabase: SupabaseClient,
  schoolId: string,
  data: { class_id: string; subject_id: string; teacher_id: string }
): Promise<TeacherAssignment> {
  // Verify the class belongs to this school
  const { data: cls, error: clsError } = await supabase
    .from('classes')
    .select('id')
    .eq('id', data.class_id)
    .eq('school_id', schoolId)
    .is('is_deleted', false)
    .maybeSingle();

  if (clsError) throw clsError;
  if (!cls) throw new Error('Class does not belong to this school');

  // Verify the subject belongs to this school
  const { data: subj, error: subjError } = await supabase
    .from('subjects')
    .select('id')
    .eq('id', data.subject_id)
    .eq('school_id', schoolId)
    .is('is_deleted', false)
    .maybeSingle();

  if (subjError) throw subjError;
  if (!subj) throw new Error('Subject does not belong to this school');

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

  // Provision class+term-scoped assessments
  await ensureClassSubjectAssessments(
    supabase,
    schoolId,
    data.class_id,
    data.subject_id
  );

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

// ============ ASSESSMENT TEMPLATES ============

// ← DEPRECATED (kept for compatibility): this function created school-wide
// template assessments with class_id=null and term_id=null. That design caused
// the compile pipeline to always find zero assessments. New code should rely
// on ensureClassSubjectAssessments (private helper) via assignClassSubject /
// assignTeacherToSubject. This function remains callable but is no longer
// invoked from anywhere in the codebase.
export async function ensureAssessmentTemplates(
  supabase: SupabaseClient,
  schoolId: string
): Promise<void> {
  // Check if templates already exist for any subject
  const { data: existing, error: checkError } = await supabase
    .from('assessments')
    .select('id')
    .eq('school_id', schoolId)
    .eq('is_auto_created', true)
    .limit(1);

  if (checkError) throw checkError;

  if (existing && existing.length > 0) {
    return; // Templates already exist
  }

  // Get all subjects for this school
  const { data: subjects, error: subjectsError } = await supabase
    .from('subjects')
    .select('id, name')
    .eq('school_id', schoolId)
    .is('is_deleted', false);

  if (subjectsError) throw subjectsError;

  if (!subjects || subjects.length === 0) {
    return; // No subjects yet, will be created later
  }

  // Define the 4 assessment types
  const templateTypes = [
    { name: 'CA1', type: 'test', max_score: 10, weight: 0.1 },
    { name: 'CA2', type: 'test', max_score: 10, weight: 0.1 },
    { name: 'CA3', type: 'test', max_score: 10, weight: 0.1 },
    { name: 'Exam', type: 'exam', max_score: 70, weight: 0.7 },
  ];

  // Create assessments for each subject
  const assessments = [];
  for (const subject of subjects) {
    for (const template of templateTypes) {
      assessments.push({
        school_id: schoolId,
        name: `${subject.name} - ${template.name}`,
        type: template.type,
        term_id: null,
        class_id: null,
        subject_id: subject.id,
        max_score: template.max_score,
        weight: template.weight,
        is_auto_created: true,
      });
    }
  }

  if (assessments.length > 0) {
    const { error: insertError } = await supabase
      .from('assessments')
      .insert(assessments);

    if (insertError) {
      console.error('Failed to create assessment templates:', insertError);
      throw insertError;
    }
  }
}
