// src/lib/supabase/admin.ts
import { createServerSupabase } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import type {
  Student,
  Teacher,
  TeacherWithCredentials,
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

  const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email: data.email,
    password: tempPassword,
    email_confirm: true,
    user_metadata: {
      full_name: data.full_name,
      role: data.role,
    },
  });

  if (authError) {
    if (authError.message?.includes('already been registered')) {
      throw new Error('Email already in use');
    }
    throw authError;
  }

  // Profile is created by database trigger, update it
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .update({
      full_name: data.full_name,
      role: data.role,
    })
    .eq('id', authUser.user.id)
    .select()
    .single();

  if (profileError) throw profileError;

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
  const { data: enrollment, error } = await supabase
    .from('enrollments')
    .insert({
      student_id: data.student_id,
      class_id: data.class_id,
      term_id: data.term_id,
      enrollment_date: new Date().toISOString().split('T')[0],
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
