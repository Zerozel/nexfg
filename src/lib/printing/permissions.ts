import { createServerSupabase } from "@/lib/supabase/server";
import type { PrintPermissions } from "@/types/printing";

/**
 * Checks if the current user has permission to print report cards
 * for a given school and class
 */

export async function checkPrintPermissions(
  schoolId: string,
  classId?: string
): Promise<PrintPermissions> {
  const supabase = await createServerSupabase();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      canPrint: false,
      reason: "Authentication required",
      allowedClasses: [],
      role: "anonymous",
    };
  }

  const role = user.app_metadata?.role || "teacher";
  const userSchoolId = user.app_metadata?.school_id;

  // Super admin can print anything
  if (role === "super_admin") {
    return {
      canPrint: true,
      allowedClasses: [],
      role: "super_admin",
    };
  }

  // Must belong to the school
  if (userSchoolId !== schoolId) {
    return {
      canPrint: false,
      reason: "You do not have access to this school",
      allowedClasses: [],
      role,
    };
  }

  // Admin and principal can print all classes in their school
  if (role === "admin" || role === "principal") {
    // Fetch all class IDs for the school
    const { data: classes } = await supabase
      .from("classes")
      .select("id")
      .eq("school_id", schoolId);

    return {
      canPrint: true,
      allowedClasses: classes?.map((c: { id: string }) => c.id) || [],
      role,
    };
  }

  // Teacher can only print their assigned classes
  if (role === "teacher") {
    // Get teacher's assigned classes
    const { data: assignedClasses } = await supabase
      .from("class_teachers")
      .select("class_id")
      .eq("teacher_id", user.id);

    // Also check classes table for teacher_id
    const { data: ownedClasses } = await supabase
      .from("classes")
      .select("id")
      .eq("teacher_id", user.id)
      .eq("school_id", schoolId);

    const allowedClassIds = [
      ...(assignedClasses?.map((c: { class_id: string }) => c.class_id) || []),
      ...(ownedClasses?.map((c: { id: string }) => c.id) || []),
    ];

    // Remove duplicates using Array.from for compatibility
    const uniqueAllowedClasses = Array.from(new Set(allowedClassIds));

    // If a specific class is requested, check if teacher has access
    if (classId && !uniqueAllowedClasses.includes(classId)) {
      return {
        canPrint: false,
        reason: "You are not assigned to this class",
        allowedClasses: uniqueAllowedClasses,
        role: "teacher",
      };
    }

    return {
      canPrint: true,
      allowedClasses: uniqueAllowedClasses,
      role: "teacher",
    };
  }

  return {
    canPrint: false,
    reason: "Insufficient permissions",
    allowedClasses: [],
    role,
  };
}

/**
 * Get all classes the current user can access for printing
 */
export async function getUserAllowedClasses(
  schoolId: string
): Promise<string[]> {
  const permissions = await checkPrintPermissions(schoolId);
  return permissions.allowedClasses;
}

/**
 * Check if user can access a specific student
 */
export async function canAccessStudent(
  studentId: string,
  classId: string,
  schoolId: string
): Promise<boolean> {
  const permissions = await checkPrintPermissions(schoolId, classId);
  return permissions.canPrint;
}
