import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

interface OnboardingStep {
  done: boolean;
  count: number;
  required?: number;
}

interface ProfileRow {
  has_seen_welcome: boolean;
}

/**
 * Returns the setup progress for the current school. Drives the dashboard
 * checklist. Steps are considered complete when their underlying data exists —
 * not stored flags.
 */
export async function GET(_request: NextRequest) {
  try {
    const supabase = await createServerSupabase();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const role = user.app_metadata?.role;
    const schoolId = user.app_metadata?.school_id;

    if (!["admin", "principal", "super_admin"].includes(role)) {
      return NextResponse.json(
        { success: false, error: "Access denied" },
        { status: 403 }
      );
    }

    if (!schoolId) {
      return NextResponse.json(
        { success: false, error: "No school associated with this user" },
        { status: 403 }
      );
    }

    // Fetch the school's class IDs first — needed for the class_subjects count.
    const { data: classes } = (await supabase
      .from("classes")
      .select("id")
      .eq("school_id", schoolId)
      .eq("is_deleted", false)) as unknown as {
      data: { id: string }[] | null;
    };

    const classIds = (classes || []).map((c) => c.id);

    const [
      subjectsResult,
      classSubjectsResult,
      studentsResult,
      teachersResult,
      assessmentsResult,
    ] = await Promise.all([
      supabase
        .from("subjects")
        .select("id", { count: "exact", head: true })
        .eq("school_id", schoolId)
        .eq("is_deleted", false),
      classIds.length > 0
        ? supabase
            .from("class_subjects")
            .select("id", { count: "exact", head: true })
            .in("class_id", classIds)
        : Promise.resolve({ count: 0 }),
      supabase
        .from("students")
        .select("id", { count: "exact", head: true })
        .eq("school_id", schoolId)
        .eq("is_deleted", false),
      supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("school_id", schoolId)
        .eq("is_deleted", false)
        .in("role", ["teacher", "admin", "principal"]),
      supabase
        .from("assessments")
        .select("id", { count: "exact", head: true })
        .eq("school_id", schoolId)
        .is("is_deleted", false)
        .not("class_id", "is", null)
        .not("term_id", "is", null)
        .not("subject_id", "is", null),
    ]);

    const classesCount = classIds.length;
    const subjectsCount = subjectsResult.count || 0;
    const classSubjectsCount = classSubjectsResult.count || 0;
    const studentsCount = studentsResult.count || 0;
    const teachersCount = teachersResult.count || 0;
    const assessmentsCount = assessmentsResult.count || 0;

    const rawSteps: Record<string, OnboardingStep> = {
      classes: {
        done: classesCount > 0,
        count: classesCount,
      },
      subjects: {
        done: subjectsCount > 0,
        count: subjectsCount,
      },
      class_subjects: {
        done:
          classesCount > 0 &&
          classSubjectsCount >= classesCount,
        count: classSubjectsCount,
        required: classesCount,
      },
      teachers: {
        done: teachersCount > 1, // admin counts as 1
        count: teachersCount,
      },
      students: {
        done: studentsCount > 0,
        count: studentsCount,
      },
      assessments: {
        done: assessmentsCount > 0,
        count: assessmentsCount,
      },
    };

    // A step is only "complete" when it AND all previous steps are done.
    // This prevents a school from creating a student before classes exist
    // and seeing 100%.
    const order = [
      "classes",
      "subjects",
      "class_subjects",
      "teachers",
      "students",
    ];

    let gate = true;
    const steps: Record<string, OnboardingStep> = {};
    for (const key of order) {
      steps[key] = {
        ...rawSteps[key],
        done: rawSteps[key].done && gate,
      };
      if (!steps[key].done) gate = false;
    }

    const totalSteps = order.length;
    const doneSteps = order.filter((k) => steps[k].done).length;
    const percent = Math.round((doneSteps / totalSteps) * 100);
    const complete = doneSteps === totalSteps;

    // has_seen_welcome — cast because the generated Supabase types haven't
    // been regenerated to include the new column yet.
    const { data: profile } = (await supabase
      .from("profiles")
      .select("has_seen_welcome")
      .eq("id", user.id)
      .maybeSingle()) as unknown as { data: ProfileRow | null };

    return NextResponse.json({
      success: true,
      data: {
        steps,
        complete,
        percent,
        done_steps: doneSteps,
        total_steps: totalSteps,
        has_seen_welcome: profile?.has_seen_welcome ?? true,
      },
    });
  } catch (error) {
    console.error("Error in onboarding API:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
