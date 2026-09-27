import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

interface SchoolRow {
  subscription_tier: string | null;
  promotion_threshold: number | null;
}

interface TermRow {
  id: string;
  name: string;
  academic_year_id: string;
}

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

    // Gate to paid tiers.
    const schoolResult = (await supabase
      .from("schools")
      .select("subscription_tier, promotion_threshold")
      .eq("id", schoolId)
      .maybeSingle()) as unknown as { data: SchoolRow | null; error: unknown };

    if (schoolResult.error) throw schoolResult.error;
    const school = schoolResult.data;

    const tier = (school?.subscription_tier as string) || "free";
    const isPaidTier = ["starter", "growth", "premium"].includes(tier);

    if (!isPaidTier) {
      return NextResponse.json({
        success: true,
        data: {
          locked: true,
          reason: "Advanced analytics is available on paid plans.",
          tier,
        },
      });
    }

    const passMark = Number(school?.promotion_threshold ?? 40);

    // Resolve the current term.
    const termResult = (await supabase
      .from("terms")
      .select("id, name, academic_year_id")
      .eq("school_id", schoolId)
      .eq("is_current", true)
      .is("is_deleted", false)
      .maybeSingle()) as unknown as { data: TermRow | null; error: unknown };

    if (termResult.error) throw termResult.error;
    const currentTerm = termResult.data;

    if (!currentTerm) {
      return NextResponse.json({
        success: true,
        data: {
          locked: false,
          term: null,
          subject_performance: [],
          class_performance: [],
          at_risk_students: [],
          pass_mark: passMark,
          reason:
            "No current term set. Analytics will appear once a term is active.",
        },
      });
    }

    // Pull all compiled results for this term.
    const rowsResult = (await supabase
      .from("compiled_results")
      .select(
        `
        student_id,
        class_id,
        subject_id,
        score,
        subjects:subject_id(name),
        classes:class_id(name),
        students:student_id(full_name, admission_number)
      `
      )
      .eq("school_id", schoolId)
      .eq("term_id", currentTerm.id)) as unknown as {
      data: any[] | null;
      error: unknown;
    };

    if (rowsResult.error) throw rowsResult.error;
    const allRows = rowsResult.data || [];

    // ---- Subject performance ----
    const subjectMap = new Map<
      string,
      { name: string; sum: number; count: number; below: number }
    >();

    for (const r of allRows) {
      const subj = Array.isArray(r.subjects) ? r.subjects[0] : r.subjects;
      if (!subj) continue;
      const key = r.subject_id as string;
      const score = Number(r.score) || 0;

      const cur = subjectMap.get(key) || {
        name: subj.name || "Subject",
        sum: 0,
        count: 0,
        below: 0,
      };
      cur.sum += score;
      cur.count += 1;
      if (score < passMark) cur.below += 1;
      subjectMap.set(key, cur);
    }

    const subject_performance = Array.from(subjectMap.values())
      .map((s) => ({
        name: s.name,
        average: s.count > 0 ? Math.round((s.sum / s.count) * 10) / 10 : 0,
        below_pass: s.below,
        total_students: s.count,
      }))
      .sort((a, b) => b.below_pass - a.below_pass);

    // ---- Class performance ----
    const classMap = new Map<
      string,
      { name: string; sum: number; count: number }
    >();

    for (const r of allRows) {
      const cls = Array.isArray(r.classes) ? r.classes[0] : r.classes;
      if (!cls) continue;
      const key = r.class_id as string;
      const score = Number(r.score) || 0;

      const cur = classMap.get(key) || {
        name: cls.name || "Class",
        sum: 0,
        count: 0,
      };
      cur.sum += score;
      cur.count += 1;
      classMap.set(key, cur);
    }

    const class_performance = Array.from(classMap.values())
      .map((c) => ({
        name: c.name,
        average: c.count > 0 ? Math.round((c.sum / c.count) * 10) / 10 : 0,
        total_scores: c.count,
      }))
      .sort((a, b) => a.average - b.average);

    // ---- At-risk students ----
    const studentMap = new Map<
      string,
      {
        full_name: string;
        admission_number: string | null;
        failing_subjects: string[];
        total_score: number;
        count: number;
      }
    >();

    for (const r of allRows) {
      const score = Number(r.score) || 0;
      if (score >= passMark) continue;

      const stu = Array.isArray(r.students) ? r.students[0] : r.students;
      const subj = Array.isArray(r.subjects) ? r.subjects[0] : r.subjects;
      if (!stu || !subj) continue;

      const key = r.student_id as string;
      const cur = studentMap.get(key) || {
        full_name: stu.full_name || "Student",
        admission_number: stu.admission_number || null,
        failing_subjects: [] as string[],
        total_score: 0,
        count: 0,
      };
      cur.failing_subjects.push((subj.name as string) || "Subject");
      cur.total_score += score;
      cur.count += 1;
      studentMap.set(key, cur);
    }

    const at_risk_students = Array.from(studentMap.entries())
      .filter(([, v]) => v.failing_subjects.length >= 2)
      .map(([id, v]) => ({
        student_id: id,
        full_name: v.full_name,
        admission_number: v.admission_number,
        failing_count: v.failing_subjects.length,
        failing_subjects: v.failing_subjects.slice(0, 5),
        average_of_failing:
          v.count > 0
            ? Math.round((v.total_score / v.count) * 10) / 10
            : 0,
      }))
      .sort((a, b) => b.failing_count - a.failing_count)
      .slice(0, 20);

    return NextResponse.json({
      success: true,
      data: {
        locked: false,
        term: { id: currentTerm.id, name: currentTerm.name },
        pass_mark: passMark,
        subject_performance: subject_performance.slice(0, 10),
        class_performance: class_performance.slice(0, 10),
        at_risk_students,
      },
    });
  } catch (error) {
    console.error("Error in admin analytics API:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
