// lib/storage/keys.ts
export const STORAGE_KEYS = {
  USER: "nexaforge_user",
  SCORES: (classId: string) => `nexaforge_scores_${classId}`,
  SYNC_STATUS: "nexaforge_sync_status",
  SELECTED_CLASS: "nexaforge_selected_class",
  SELECTED_ASSESSMENT: "nexaforge_selected_assessment",
  SIDEBAR_COLLAPSED: "nexaforge_sidebar_collapsed",
} as const;
