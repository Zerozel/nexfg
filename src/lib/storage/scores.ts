// lib/storage/scores.ts
import { STORAGE_KEYS } from "./keys";
import type { PendingScore, ClassScoreCache } from "@/types";

export function getScoresForClass(classId: string): ClassScoreCache | null {
  if (typeof window === "undefined") return null;
  const key = STORAGE_KEYS.SCORES(classId);
  const data = localStorage.getItem(key);
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export function saveScoresForClass(
  classId: string,
  cache: ClassScoreCache
): void {
  if (typeof window === "undefined") return;
  const key = STORAGE_KEYS.SCORES(classId);
  localStorage.setItem(
    key,
    JSON.stringify({
      ...cache,
      last_updated: new Date().toISOString(),
    })
  );
}

export function clearScoresForClass(classId: string): void {
  if (typeof window === "undefined") return;
  const key = STORAGE_KEYS.SCORES(classId);
  localStorage.removeItem(key);
}

export function getPendingScoresForClass(classId: string): PendingScore[] {
  const cache = getScoresForClass(classId);
  if (!cache) return [];
  return cache.scores.filter((s) => !s.synced);
}

export function getPendingCountForClass(classId: string): number {
  return getPendingScoresForClass(classId).length;
}

export function getAllPendingCount(): number {
  if (typeof window === "undefined") return 0;
  let count = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith("nexaforge_scores_")) {
      const classId = key.replace("nexaforge_scores_", "");
      count += getPendingCountForClass(classId);
    }
  }
  return count;
}

export function markScoreAsSynced(
  classId: string,
  studentId: string,
  assessmentId: string
): void {
  const cache = getScoresForClass(classId);
  if (!cache) return;
  cache.scores = cache.scores.map((s) =>
    s.student_id === studentId && s.assessment_id === assessmentId
      ? { ...s, synced: true, updated_at: new Date().toISOString() }
      : s
  );
  saveScoresForClass(classId, cache);
}

export function clearSyncedScores(classId: string): void {
  const cache = getScoresForClass(classId);
  if (!cache) return;
  cache.scores = cache.scores.filter((s) => !s.synced);
  saveScoresForClass(classId, cache);
}

export function upsertScore(
  classId: string,
  studentId: string,
  assessmentId: string,
  score: number | null
): void {
  let cache = getScoresForClass(classId);
  if (!cache) {
    cache = {
      class_id: classId,
      scores: [],
      last_updated: new Date().toISOString(),
    };
  }

  const existingIndex = cache.scores.findIndex(
    (s) => s.student_id === studentId && s.assessment_id === assessmentId
  );

  const scoreEntry: PendingScore = {
    student_id: studentId,
    assessment_id: assessmentId,
    score,
    synced: false,
    updated_at: new Date().toISOString(),
  };

  if (existingIndex >= 0) {
    cache.scores[existingIndex] = scoreEntry;
  } else {
    cache.scores.push(scoreEntry);
  }

  saveScoresForClass(classId, cache);
}

export function getScoreForCell(
  classId: string,
  studentId: string,
  assessmentId: string
): number | null {
  const cache = getScoresForClass(classId);
  if (!cache) return null;
  const record = cache.scores.find(
    (s) => s.student_id === studentId && s.assessment_id === assessmentId
  );
  return record?.score ?? null;
}
