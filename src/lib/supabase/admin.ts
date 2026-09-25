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
    .order('display_order', { ascending: true, nullsFirst: false })
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

// ← CHANGED: supports the arms model with per-arm teachers.
// When arms_count > 1, creates N class rows, each with its own teacher from
// `arm_teachers` (keyed by arm letter "A", "B", ...). When arms_count = 1,
// the single row uses `arm_teachers["A"]` (or `teacher_id` as fallback).
export async function createClass(
  supabase: SupabaseClient,
  schoolId: string,
  data: Omit<
    Class,
    | 'id'
    | 'school_id'
    | 'is_deleted'
    | 'deleted_at'
    | 'created_at'
    | 'updated_at'
    | 'teacher_name'
  > & {
    arms_count?: number;
    base_name?: string;
    display_order?: number;
    arm_teachers?: Record<string, string | null>;
  }
) {
  // 1. Ownership check on academic_year_id
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

  const armsCount =
    data.arms_count && data.arms_count > 0 ? data.arms_count : 1;

  // Base name is what the user typed. Strip any trailing arm letter so we
  // don't produce "JSS 1A A" when arms_count > 1.
  const rawName = (data.name || '').trim();
  const baseName =
    data.base_name?.trim() ||
    (armsCount > 1
      ? rawName.replace(/\s*[A-Z]\s*$/, '').trim() || rawName
      : rawName);

  // Auto-derive display_order from the numeric part of the base name if not
  // supplied (e.g. "JSS 1" → 1, "JSS 2" → 2). Used for sorting.
  const inferredOrder =
    data.display_order ??
    (() => {
      const digits = baseName.replace(/[^0-9]/g, '');
      const n = digits ? parseInt(digits, 10) : NaN;
      return Number.isFinite(n) ? n : null;
    })();

  const armLetters = 'ABCDEFGHIJ'.split('');
  const armTeachers = data.arm_teachers || {};
  const rows: any[] = [];

  if (armsCount === 1) {
    // Single-arm: use arm_teachers["A"] if given, else fall back to teacher_id
    rows.push({
      academic_year_id: data.academic_year_id,
      name: rawName,
      base_name: baseName,
      arms_count: 1,
      display_order: inferredOrder,
      school_id: schoolId,
      teacher_id: armTeachers['A'] ?? data.teacher_id ?? null,
    });
  } else {
    for (let i = 0; i < armsCount; i++) {
      const letter = armLetters[i];
      rows.push({
        academic_year_id: data.academic_year_id,
        name: `${baseName}${letter}`,
        base_name: baseName,
        arms_count: armsCount,
        display_order: inferredOrder,
        school_id: schoolId,
        teacher_id: armTeachers[letter] ?? null,
      });
    }
  }

  const { data: created, error } = await supabase
    .from('classes')
    .insert(rows)
    .select('*, profiles!classes_teacher_id_fkey(full_name)');

  if (error) throw error;

  const first = created[0];
  return {
    ...first,
    teacher_name: first?.profiles?.full_name || null,
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
    .eq('school_id', schoolId) // ← scope to caller's school
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


// ============ STUDENT ENROLLMENT HELPERS ============
//
// These keep the `enrollments` table in sync with `students.class_id`.
// - `students.class_id` is the source of truth for "who is in this class"
//   (used by the compile pipeline and the student list).
// - `enrollments` is the source of truth for "who was in this class in which
//   term" (used by report cards, class sheets, and batch print).
//
// Every code path that creates or moves a student MUST go through these
// helpers, or the two tables drift apart.

/**
 * Resolve the current term for a class's academic year.
 * Returns null if the class or its current term can't be determined.
 */
async function getCurrentTermForClass(
  supabase: SupabaseClient,
  classId: string
): Promise<string | null> {
  const { data: cls, error: clsError } = await supabase
    .from('classes')
    .select('academic_year_id')
    .eq('id', classId)
    .is('is_deleted', false)
    .maybeSingle();

  if (clsError) throw clsError;
  if (!cls?.academic_year_id) return null;

  const { data: term, error: termError } = await supabase
    .from('terms')
    .select('id')
    .eq('academic_year_id', cls.academic_year_id)
    .eq('is_current', true)
    .is('is_deleted', false)
    .maybeSingle();

  if (termError) throw termError;
  return term?.id || null;
}

/**
 * Ensure the student has an active enrollment for the current term of
 * `classId`. Safe to call repeatedly — no-op if an enrollment already exists.
 */
export async function ensureStudentEnrollment(
  supabase: SupabaseClient,
  studentId: string,
  classId: string
): Promise<void> {
  if (!studentId || !classId) return;

  const termId = await getCurrentTermForClass(supabase, classId);
  if (!termId) {
    console.warn(
      `ensureStudentEnrollment: no current term for class ${classId}; skipping`
    );
    return;
  }

  // The unique constraint is (student_id, term_id), so a student can only be
  // enrolled in one class per term. If a row exists for this term already,
  // update its class_id to the new class (this covers the "student was
  // enrolled, then their class changed" case). Otherwise insert.
  const { data: existing, error: existingError } = await supabase
    .from('enrollments')
    .select('id, class_id, is_current')
    .eq('student_id', studentId)
    .eq('term_id', termId)
    .maybeSingle();

  if (existingError) throw existingError;

  if (existing) {
    if (existing.class_id !== classId || !existing.is_current) {
      const { error: updateError } = await supabase
        .from('enrollments')
        .update({
          class_id: classId,
          is_current: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id);
      if (updateError) throw updateError;
    }
    return;
  }

  const { error: insertError } = await supabase
    .from('enrollments')
    .insert({
      student_id: studentId,
      class_id: classId,
      term_id: termId,
      enrollment_date: new Date().toISOString().split('T')[0],
      is_current: true,
    });

  if (insertError) throw insertError;
}

/**
 * Move a student from their current class to a new one for the current term.
 */
export async function moveStudentToClass(
  supabase: SupabaseClient,
  studentId: string,
  newClassId: string
): Promise<void> {
  await ensureStudentEnrollment(supabase, studentId, newClassId);
}




// ============ PROMOTION HELPERS ============

interface NextClassInfo {
  id: string;
  name: string;
  base_name: string | null;
  arms_count: number;
  display_order: number | null;
}

/**
 * Resolve the "next class" for a given class by display_order.
 * Returns null if the class is the last one (e.g. JSS 3) — those students
 * are proposed as "graduated".
 */
async function getNextClassForClass(
  supabase: SupabaseClient,
  schoolId: string,
  fromClass: {
    id: string;
    base_name: string | null;
    display_order: number | null;
  }
): Promise<NextClassInfo | null> {
  if (fromClass.display_order === null) return null;

  const { data, error } = await supabase
    .from('classes')
    .select('id, name, base_name, arms_count, display_order')
    .eq('school_id', schoolId)
    .eq('display_order', fromClass.display_order + 1)
    .is('is_deleted', false)
    .order('name', { ascending: true });

  if (error) throw error;
  if (!data || data.length === 0) return null;

  // Return the first arm of the next class group — used as the fallback
  // target when the source arm has no matching arm letter.
  return data[0] as NextClassInfo;
}

/**
 * Map a source arm name (e.g. "JSS 1A") to the target arm name
 * (e.g. "JSS 2A") using the arm letter. Falls back to the first arm of
 * the target group if no letter match is found.
 */
async function resolveTargetArmForStudent(
  supabase: SupabaseClient,
  schoolId: string,
  fromClassName: string,
  targetGroup: NextClassInfo
): Promise<NextClassInfo> {
  const match = fromClassName.match(/([A-Z])$/);
  const armLetter = match ? match[1] : null;

  if (!armLetter) {
    return targetGroup;
  }

  const { data, error } = await supabase
    .from('classes')
    .select('id, name, base_name, arms_count, display_order')
    .eq('school_id', schoolId)
    .eq('base_name', targetGroup.base_name)
    .ilike('name', `%${armLetter}`)
    .is('is_deleted', false)
    .limit(1)
    .maybeSingle();

  if (error) throw error;

  return (data as NextClassInfo) || targetGroup;
}

interface PreviewStudent {
  student_id: string;
  full_name: string;
  admission_number: string | null;
  average: number;
  recommended_outcome: 'promoted' | 'repeated' | 'graduated';
  recommended_to_class_id: string | null;
  recommended_to_class_name: string | null;
}

interface PreviewClassGroup {
  from_class_id: string;
  from_class_name: string;
  from_class_base_name: string | null;
  target_class_group_name: string | null;
  students: PreviewStudent[];
}

export interface PromotionPreview {
  from_year: { id: string; name: string } | null;
  from_term: { id: string; name: string };
  to_year: { id: string; name: string } | null;
  to_term: { id: string; name: string } | null;
  promotion_threshold: number;
  classes: PreviewClassGroup[];
  all_classes: {
    id: string;
    name: string;
    base_name: string | null;
    display_order: number | null;
  }[];
}

/**
 * Compute a promotion preview: for every student enrolled in the source
 * term, propose an outcome and target class. No writes.
 */
export async function previewPromotions(
  supabase: SupabaseClient,
  schoolId: string,
  params: { from_term_id: string }
): Promise<PromotionPreview> {
  const { from_term_id } = params;

  // 1. Load source term + academic year
  const { data: fromTerm, error: fromTermError } = await supabase
    .from('terms')
    .select('id, name, academic_year_id')
    .eq('id', from_term_id)
    .eq('school_id', schoolId)
    .is('is_deleted', false)
    .maybeSingle();

  if (fromTermError) throw fromTermError;
  if (!fromTerm) throw new Error('Source term not found');

  const { data: fromYear, error: fromYearError } = await supabase
    .from('academic_years')
    .select('id, name')
    .eq('id', fromTerm.academic_year_id)
    .maybeSingle();

  if (fromYearError) throw fromYearError;

  // 2. Load school threshold
  const { data: school, error: schoolError } = await supabase
    .from('schools')
    .select('promotion_threshold')
    .eq('id', schoolId)
    .maybeSingle();

  if (schoolError) throw schoolError;
  const promotionThreshold = Number(school?.promotion_threshold ?? 40);

  // 3. Load all enrollments in this term, joined to student + class
  const { data: enrollments, error: enrollError } = await supabase
    .from('enrollments')
    .select(
      'student_id, class_id, students:student_id(id, full_name, admission_number), classes:class_id(id, name, base_name, display_order, arms_count)'
    )
    .eq('term_id', from_term_id)
    .eq('is_current', true)
    .eq('is_deleted', false);

  if (enrollError) throw enrollError;

  // 4. Load compiled_results averages for the term (keyed by student_id)
  const { data: compiled, error: compiledError } = await supabase
    .from('compiled_results')
    .select('student_id, score')
    .eq('term_id', from_term_id);

  if (compiledError) throw compiledError;

  const avgByStudent = new Map<string, { sum: number; count: number }>();
  for (const row of compiled || []) {
    const s = row.student_id as string;
    const score = Number(row.score) || 0;
    const cur = avgByStudent.get(s) || { sum: 0, count: 0 };
    cur.sum += score;
    cur.count += 1;
    avgByStudent.set(s, cur);
  }

  const averageFor = (studentId: string): number => {
    const agg = avgByStudent.get(studentId);
    if (!agg || agg.count === 0) return 0;
    return Math.round((agg.sum / agg.count) * 100) / 100;
  };

  // 5. Group by source class. For each class, resolve the target group.
  const grouped = new Map<string, PreviewClassGroup>();
  const nextClassCache = new Map<string, NextClassInfo | null>();

  for (const e of enrollments || []) {
    const cls = Array.isArray(e.classes) ? e.classes[0] : e.classes;
    const stu = Array.isArray(e.students) ? e.students[0] : e.students;
    if (!cls || !stu) continue;

    if (!grouped.has(cls.id)) {
      grouped.set(cls.id, {
        from_class_id: cls.id,
        from_class_name: cls.name,
        from_class_base_name: cls.base_name,
        target_class_group_name: null,
        students: [],
      });
    }

    const group = grouped.get(cls.id)!;

    // Resolve target class for this source class
    let target: NextClassInfo | null;
    if (nextClassCache.has(cls.id)) {
      target = nextClassCache.get(cls.id)!;
    } else {
      const groupTarget = await getNextClassForClass(supabase, schoolId, {
        id: cls.id,
        base_name: cls.base_name,
        display_order: cls.display_order,
      });
      target = groupTarget;
      nextClassCache.set(cls.id, groupTarget);

      if (groupTarget) {
        group.target_class_group_name =
          groupTarget.base_name || groupTarget.name;
      }
    }

    const average = averageFor(e.student_id);
    const passes = average >= promotionThreshold;

    let recommendedOutcome: 'promoted' | 'repeated' | 'graduated';
    let recommendedToClassId: string | null = null;
    let recommendedToClassName: string | null = null;

    if (!target) {
      // Last class in the sequence — graduate
      recommendedOutcome = 'graduated';
    } else if (passes) {
      const targetArm = await resolveTargetArmForStudent(
        supabase,
        schoolId,
        cls.name,
        target
      );
      recommendedOutcome = 'promoted';
      recommendedToClassId = targetArm.id;
      recommendedToClassName = targetArm.name;
    } else {
      // Repeat: stay in the same class
      recommendedOutcome = 'repeated';
      recommendedToClassId = cls.id;
      recommendedToClassName = cls.name;
    }

    group.students.push({
      student_id: stu.id,
      full_name: stu.full_name,
      admission_number: stu.admission_number || null,
      average,
      recommended_outcome: recommendedOutcome,
      recommended_to_class_id: recommendedToClassId,
      recommended_to_class_name: recommendedToClassName,
    });
  }

  // 6. Compute suggested target year name
  const currentYearName = fromYear?.name || '';
  const startYear = parseInt(currentYearName.split('/')[0] || '0', 10);
  const suggestedNextName =
    startYear > 0 ? `${startYear + 1}/${startYear + 2}` : '';

  // 7. Load every class in the school for override dropdowns
  const { data: allClassesRaw, error: allClassesError } = await supabase
    .from('classes')
    .select('id, name, base_name, display_order')
    .eq('school_id', schoolId)
    .is('is_deleted', false)
    .order('display_order', { ascending: true, nullsFirst: false })
    .order('name', { ascending: true });

  if (allClassesError) throw allClassesError;

  return {
    from_year: fromYear,
    from_term: { id: fromTerm.id, name: fromTerm.name },
    to_year: suggestedNextName ? { id: '', name: suggestedNextName } : null,
    to_term: null,
    promotion_threshold: promotionThreshold,
    classes: Array.from(grouped.values()),
    all_classes: (allClassesRaw || []).map((c: any) => ({
      id: c.id,
      name: c.name,
      base_name: c.base_name,
      display_order: c.display_order,
    })),
  };
}

interface ConfirmRow {
  student_id: string;
  outcome:
    | 'promoted'
    | 'repeated'
    | 'withdrawn'
    | 'transferred'
    | 'graduated';
  to_class_id: string | null;
  average: number;
}

export interface ConfirmResult {
  promoted: number;
  repeated: number;
  withdrawn: number;
  transferred: number;
  graduated: number;
  next_year_id: string;
  next_year_name: string;
  next_term_id: string;
  next_term_name: string;
}

/**
 * Write progression records and create the next year's enrollments.
 * Creates the next academic year and its three terms if needed.
 * The new year's First Term is NOT marked current — the old Third Term
 * stays active until the admin explicitly switches.
 */
export async function confirmPromotions(
  supabase: SupabaseClient,
  schoolId: string,
  decidedByUserId: string,
  payload: {
    from_term_id: string;
    students: ConfirmRow[];
  }
): Promise<ConfirmResult> {
  const { from_term_id, students } = payload;

  // 1. Load source term + year
  const { data: fromTerm, error: fromTermError } = await supabase
    .from('terms')
    .select('id, name, academic_year_id')
    .eq('id', from_term_id)
    .eq('school_id', schoolId)
    .maybeSingle();

  if (fromTermError) throw fromTermError;
  if (!fromTerm) throw new Error('Source term not found');

  const { data: fromYear, error: fromYearError } = await supabase
    .from('academic_years')
    .select('id, name')
    .eq('id', fromTerm.academic_year_id)
    .maybeSingle();

  if (fromYearError) throw fromYearError;
  if (!fromYear) throw new Error('Source academic year not found');

  // 2. Derive next year name
  const startYear = parseInt(fromYear.name.split('/')[0] || '0', 10);
  if (!startYear) throw new Error('Cannot parse current academic year name');
  const nextYearName = `${startYear + 1}/${startYear + 2}`;

  // 3. Find or create the next academic year
  let nextYearId: string;
  const { data: existingNext } = await supabase
    .from('academic_years')
    .select('id')
    .eq('school_id', schoolId)
    .eq('name', nextYearName)
    .is('is_deleted', false)
    .maybeSingle();

  if (existingNext) {
    nextYearId = existingNext.id;
  } else {
    const created = await createAcademicYear(supabase, schoolId, {
      name: nextYearName,
      is_current: false, // old Third Term stays active
    });
    nextYearId = created.id;
  }

  // 4. Ensure terms exist for the next year
  await ensureTermsForAcademicYear(supabase, nextYearId, schoolId);

  // 5. Find the First Term of the next year
  const { data: nextFirstTerm, error: nextFirstTermError } = await supabase
    .from('terms')
    .select('id, name')
    .eq('academic_year_id', nextYearId)
    .eq('school_id', schoolId)
    .eq('order', 1)
    .is('is_deleted', false)
    .maybeSingle();

  if (nextFirstTermError) throw nextFirstTermError;
  if (!nextFirstTerm)
    throw new Error('Could not find First Term of next year');

  // 6. Load source enrollments so we can record from_class_id
  const { data: sourceEnrollments, error: sourceError } = await supabase
    .from('enrollments')
    .select('student_id, class_id')
    .eq('term_id', from_term_id)
    .in(
      'student_id',
      students.map((s) => s.student_id)
    );

  if (sourceError) throw sourceError;

  const classByStudent = new Map<string, string>();
  for (const e of sourceEnrollments || []) {
    classByStudent.set(e.student_id, e.class_id);
  }

  // 7. Build progressions + next-year enrollments
  const counts = {
    promoted: 0,
    repeated: 0,
    withdrawn: 0,
    transferred: 0,
    graduated: 0,
  };

  const progressions: any[] = [];
  const newEnrollments: any[] = [];

  for (const s of students) {
    counts[s.outcome]++;

    const fromClassId = classByStudent.get(s.student_id);
    if (!fromClassId) continue; // defensive: skip students with no source enrollment

    // For "repeated" with no target class set, default to source class
    let toClassId = s.to_class_id;
    if (s.outcome === 'repeated' && !toClassId) {
      toClassId = fromClassId;
    }

    progressions.push({
      school_id: schoolId,
      student_id: s.student_id,
      outcome: s.outcome,
      from_academic_year_id: fromYear.id,
      from_term_id: fromTerm.id,
      from_class_id: fromClassId,
      to_academic_year_id:
        s.outcome === 'promoted' || s.outcome === 'repeated'
          ? nextYearId
          : null,
      to_term_id:
        s.outcome === 'promoted' || s.outcome === 'repeated'
          ? nextFirstTerm.id
          : null,
      to_class_id: toClassId,
      average: s.average,
      decided_by: decidedByUserId,
    });

    if (
      (s.outcome === 'promoted' || s.outcome === 'repeated') &&
      toClassId
    ) {
      newEnrollments.push({
        student_id: s.student_id,
        class_id: toClassId,
        term_id: nextFirstTerm.id,
        enrollment_date: new Date().toISOString().split('T')[0],
        is_current: true,
      });
    }
  }

  if (progressions.length > 0) {
    const { error: progError } = await supabase
      .from('student_progression')
      .insert(progressions);
    if (progError) throw progError;
  }

  if (newEnrollments.length > 0) {
    const { error: enrollError } = await supabase
      .from('enrollments')
      .insert(newEnrollments);
    if (enrollError) throw enrollError;
  }

  return {
    ...counts,
    next_year_id: nextYearId,
    next_year_name: nextYearName,
    next_term_id: nextFirstTerm.id,
    next_term_name: nextFirstTerm.name,
  };
}
