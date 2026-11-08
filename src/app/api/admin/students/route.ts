// src/app/api/admin/students/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import {
  listStudents,
  createStudent,
  ensureStudentEnrollment,
} from "@/lib/supabase/admin";
import { studentSchema } from "@/lib/validations/student.schema";
import {
  getTierLimits,
  isStudentCapReached,
  isAccountWritable,
} from "@/lib/subscriptions/tier-limits";
import { ZodError } from "zod";

// ============================================================================
// generateAdmissionNumber
// ============================================================================

function schoolAbbreviation(name: string): string {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .map((word) => word.charAt(0).toUpperCase())
      .join("")
      .slice(0, 4) || "SCH"
  );
}

async function generateAdmissionNumber(
  supabase: any,
  schoolId: string,
  enrollmentYear: number,
  classId: string | null
): Promise<string> {
  const { data: school, error: schoolError } = await supabase
    .from("schools")
    .select("name")
    .eq("id", schoolId)
    .single();

  if (schoolError || !school?.name) {
    console.error(
      "Failed to fetch school for admission number:",
      schoolError
    );
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    return `SCH/${enrollmentYear}/XX${random}`;
  }

  const schoolCode = schoolAbbreviation(school.name);

  if (!classId) {
    const { count, error: countError } = await supabase
      .from("students")
      .select("id", { count: "exact", head: true })
      .eq("school_id", schoolId)
      .eq("enrollment_year", enrollmentYear)
      .is("class_id", null)
      .eq("is_deleted", false);

    if (countError) throw countError;

    const serial = String((count || 0) + 1).padStart(3, "0");
    return `${schoolCode}/${enrollmentYear}/UN${serial}`;
  }

  const { data: cls, error: classError } = await supabase
    .from("classes")
    .select("code_prefix")
    .eq("id", classId)
    .eq("school_id", schoolId)
    .maybeSingle();

  if (classError) throw classError;

  const prefix = (cls?.code_prefix as string) || "UN";

  const { count, error: countError } = await supabase
    .from("students")
    .select("id", { count: "exact", head: true })
    .eq("school_id", schoolId)
    .eq("class_id", classId)
    .eq("enrollment_year", enrollmentYear)
    .eq("is_deleted", false);

  if (countError) throw countError;

  const serial = String((count || 0) + 1).padStart(3, "0");
  return `${schoolCode}/${enrollmentYear}/${prefix}${serial}`;
}

// ============================================================================
// GET
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabase();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const schoolId = user.app_metadata?.school_id;
    if (!schoolId) {
      return NextResponse.json(
        { error: "No school associated" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const grouped = searchParams.get("grouped") === "1";

    if (grouped) {
      const { data: classes, error: classesError } = (await supabase
        .from("classes")
        .select("id, name, base_name, display_order")
        .eq("school_id", schoolId)
        .is("is_deleted", false)
        .order("display_order", { ascending: true, nullsFirst: false })
        .order("name", { ascending: true })) as unknown as {
        data: any[] | null;
        error: unknown;
      };

      if (classesError) throw classesError;

      const { data: students, error: studentsError } = (await supabase
        .from("students")
        .select("*")
        .eq("school_id", schoolId)
        .eq("is_deleted", false)
        .order("full_name", { ascending: true })) as unknown as {
        data: any[] | null;
        error: unknown;
      };

      if (studentsError) throw studentsError;

      const bucket = new Map<string, any[]>();
      const unassigned: any[] = [];

      for (const s of students || []) {
        if (!s.class_id) {
          unassigned.push(s);
          continue;
        }
        if (!bucket.has(s.class_id)) bucket.set(s.class_id, []);
        bucket.get(s.class_id)!.push(s);
      }

      const groups: any[] = [];

      for (const c of classes || []) {
        const list = bucket.get(c.id) || [];
        groups.push({
          class_id: c.id,
          class_name: c.name,
          base_name: c.base_name || null,
          display_order: c.display_order ?? null,
          students: list,
        });
      }

      if (unassigned.length > 0) {
        groups.push({
          class_id: null,
          class_name: "Unassigned",
          base_name: null,
          display_order: 999999,
          students: unassigned,
        });
      }

      return NextResponse.json({
        success: true,
        groups,
        total: (students || []).length,
      });
    }

    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "10");
    const search = searchParams.get("search") || "";

    const result = await listStudents(supabase, { page, pageSize, search });
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("GET /api/admin/students error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ============================================================================
// POST — gated by subscription tier + account status
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabase();
    const body = await request.json();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const schoolId = user.app_metadata?.school_id;
    if (!schoolId) {
      return NextResponse.json(
        { error: "No school associated" },
        { status: 403 }
      );
    }

    // ── Subscription gate (status + cap) ──
    const { data: schoolSubRaw, error: subError } = await supabase
      .from("schools")
      .select("subscription_tier, subscription_status")
      .eq("id", schoolId)
      .maybeSingle();

    const schoolSub = schoolSubRaw as {
      subscription_tier: "free" | "trial" | "starter" | "growth" | "premium";
      subscription_status: "trial" | "active" | "expired" | "inactive";
    } | null;

    if (subError) {
      console.error("Subscription lookup error:", subError);
      return NextResponse.json(
        { error: "Unable to verify subscription" },
        { status: 500 }
      );
    }

    if (!schoolSub) {
      return NextResponse.json(
        { error: "School not found" },
        { status: 404 }
      );
    }

    if (!isAccountWritable(schoolSub.subscription_status)) {
      return NextResponse.json(
        {
          error:
            "Your subscription is inactive. Renew your plan to add students.",
          code: "SUBSCRIPTION_INACTIVE",
          status: schoolSub.subscription_status,
        },
        { status: 403 }
      );
    }

    const { count: activeCount, error: countError } = await supabase
      .from("students")
      .select("id", { count: "exact", head: true })
      .eq("school_id", schoolId)
      .eq("is_deleted", false);

    if (countError) {
      console.error("Student count error:", countError);
      return NextResponse.json(
        { error: "Unable to verify student count" },
        { status: 500 }
      );
    }

    const currentCount = activeCount ?? 0;

    if (isStudentCapReached(schoolSub.subscription_tier, currentCount)) {
      const limits = getTierLimits(schoolSub.subscription_tier);
      return NextResponse.json(
        {
          error: `Your ${schoolSub.subscription_tier} plan allows up to ${limits.studentCap} students. Upgrade to add more.`,
          code: "STUDENT_CAP_REACHED",
          tier: schoolSub.subscription_tier,
          cap: limits.studentCap,
          current: currentCount,
        },
        { status: 403 }
      );
    }

    // ── Existing creation flow ──
    const validatedData = studentSchema.parse(body);

    const sanitized = Object.fromEntries(
      Object.entries(validatedData).map(([key, value]) => [
        key,
        value === "" || value === null || value === undefined ? null : value,
      ])
    );

    let enrollmentYear = sanitized.enrollment_year;
    if (typeof enrollmentYear === "string") {
      enrollmentYear = parseInt(enrollmentYear, 10);
    }
    if (!enrollmentYear || isNaN(enrollmentYear)) {
      enrollmentYear = new Date().getFullYear();
    }

    const admissionNumber = await generateAdmissionNumber(
      supabase,
      schoolId,
      enrollmentYear,
      (sanitized.class_id as string) || null
    );

    sanitized.admission_number = admissionNumber;
    sanitized.school_id = schoolId;
    sanitized.enrollment_year = enrollmentYear;

    const student = await createStudent(supabase, sanitized as any);

    if (student.class_id) {
      try {
        await ensureStudentEnrollment(supabase, student.id, student.class_id);
      } catch (enrollError) {
        console.error(
          `Failed to create enrollment for student ${student.id}:`,
          enrollError
        );
      }
    }

    return NextResponse.json(
      { data: student, message: "Student created successfully" },
      { status: 201 }
    );
  } catch (error: any) {
    if (error instanceof ZodError) {
      console.error(
        "Zod validation errors:",
        JSON.stringify(error.errors, null, 2)
      );
      const firstError = error.errors[0];
      return NextResponse.json(
        {
          error: firstError.message,
          details: error.errors,
        },
        { status: 400 }
      );
    }
    console.error("POST /api/admin/students error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
