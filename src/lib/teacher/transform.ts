// src/lib/teacher/transform.ts

import { Assessment, StudentScore } from '@/types/teacher';

/**
 * Group assessments by subject and calculate totals
 */
export function groupAssessmentsBySubject(assessments: Assessment[]) {
  const groups: Record<string, { subjectId: string; assessments: Assessment[]; totalWeight: number }> = {};

  for (const assessment of assessments) {
    const key = assessment.subject_id;
    if (!groups[key]) {
      groups[key] = {
        subjectId: assessment.subject_id,
        assessments: [],
        totalWeight: 0,
      };
    }
    groups[key].assessments.push(assessment);
    groups[key].totalWeight += assessment.weight || 0;
  }

  return Object.values(groups);
}

/**
 * Calculate weighted average for a student's scores
 */
export function calculateWeightedAverage(
  scores: Record<string, number | null>,
  assessments: Assessment[]
): number | null {
  let totalWeighted = 0;
  let totalWeight = 0;

  for (const assessment of assessments) {
    const score = scores[assessment.id];
    if (score !== null && score !== undefined) {
      const weight = assessment.weight || 0;
      totalWeighted += score * weight;
      totalWeight += weight;
    }
  }

  if (totalWeight === 0) return null;
  return Math.round((totalWeighted / totalWeight) * 100) / 100;
}

/**
 * Transform raw database scores into a student score map
 */
export function transformScoresToMap(scores: any[]): Record<string, Record<string, number | null>> {
  const map: Record<string, Record<string, number | null>> = {};

  for (const score of scores) {
    if (!map[score.student_id]) {
      map[score.student_id] = {};
    }
    map[score.student_id][score.assessment_id] = score.score;
  }

  return map;
}