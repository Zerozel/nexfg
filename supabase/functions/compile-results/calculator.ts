// supabase/functions/compile-results/calculator.ts

// ✅ FIX: Remove .ts extension from imports
import { AssessmentRecord, GradingSystemRecord, StudentSubjectAggregate } from './types.ts';

/**
 * Calculate weighted average for a student across subjects
 */
export function calculateWeightedAverage(
  scores: { assessment_id: string; score: number | null }[],
  assessments: AssessmentRecord[]
): number {
  let totalWeightedScore = 0;
  let totalWeight = 0;

  for (const score of scores) {
    if (score.score === null) continue;

    const assessment = assessments.find((a) => a.id === score.assessment_id);
    if (!assessment) continue;

    // Calculate percentage score
    const percentage = (score.score / assessment.max_score) * 100;
    totalWeightedScore += percentage * assessment.weight;
    totalWeight += assessment.weight;
  }

  if (totalWeight === 0) return 0;
  return Math.round((totalWeightedScore / totalWeight) * 100) / 100;
}

/**
 * Get grade and remarks for a score
 */
export function getGradeAndRemarks(
  score: number,
  gradingSystem: GradingSystemRecord[]
): { grade: string; remarks: string } {
  const band = gradingSystem.find(
    (g) => score >= g.min_score && score <= g.max_score
  );

  if (band) {
    return { grade: band.grade, remarks: band.remark };
  }

  // Fallback: lowest grade
  const lowest = gradingSystem[gradingSystem.length - 1];
  return {
    grade: lowest?.grade || 'F9',
    remarks: lowest?.remark || 'Fail',
  };
}

/**
 * Calculate positions for a list of scores
 * Ties: same position, skip next (1, 2, 2, 4)
 */
export function calculatePositions(
  items: { student_id: string; score: number }[]
): Map<string, number> {
  // Sort by score descending
  const sorted = [...items].sort((a, b) => b.score - a.score);

  const positions = new Map<string, number>();
  let currentPosition = 1;

  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i].score < sorted[i - 1].score) {
      currentPosition = i + 1;
    }
    positions.set(sorted[i].student_id, currentPosition);
  }

  return positions;
}

/**
 * Aggregate scores by student and subject
 */
export function aggregateScoresByStudentAndSubject(
  scores: { student_id: string; assessment_id: string; score: number | null }[],
  assessments: AssessmentRecord[],
  subjects: { id: string; name: string }[],
  gradingSystem: GradingSystemRecord[]
): StudentSubjectAggregate[] {
  // Group scores by student
  const studentMap = new Map<string, { assessment_id: string; score: number | null }[]>();

  for (const score of scores) {
    if (!studentMap.has(score.student_id)) {
      studentMap.set(score.student_id, []);
    }
    studentMap.get(score.student_id)!.push({
      assessment_id: score.assessment_id,
      score: score.score,
    });
  }

  // Group assessments by subject
  const subjectAssessments = new Map<string, AssessmentRecord[]>();
  for (const assessment of assessments) {
    if (!subjectAssessments.has(assessment.subject_id)) {
      subjectAssessments.set(assessment.subject_id, []);
    }
    subjectAssessments.get(assessment.subject_id)!.push(assessment);
  }

  // For each student, calculate subject averages
  const results: StudentSubjectAggregate[] = [];

  for (const [studentId, studentScores] of studentMap) {
    const subjectResults: StudentSubjectAggregate['subjects'] = [];
    let overallTotal = 0;
    let overallCount = 0;

    for (const [subjectId, subjectAssessmentsList] of subjectAssessments) {
      // Filter scores for this subject
      const subjectScoreItems = studentScores.filter((s) =>
        subjectAssessmentsList.some((a) => a.id === s.assessment_id)
      );

      if (subjectScoreItems.length === 0) {
        // No scores for this subject — skip
        continue;
      }

      const avg = calculateWeightedAverage(subjectScoreItems, subjectAssessmentsList);
      const { grade, remarks } = getGradeAndRemarks(avg, gradingSystem);

      const subjectName = subjects.find((s) => s.id === subjectId)?.name || 'Unknown';

      subjectResults.push({
        subject_id: subjectId,
        subject_name: subjectName,
        score: avg,
        grade,
        remarks,
      });

      overallTotal += avg;
      overallCount++;
    }

    const overallAverage = overallCount > 0 ? Math.round((overallTotal / overallCount) * 100) / 100 : 0;
    const { grade: overallGrade, remarks: overallRemarks } = getGradeAndRemarks(
      overallAverage,
      gradingSystem
    );

    results.push({
      student_id: studentId,
      subjects: subjectResults,
      overall_average: overallAverage,
      overall_grade: overallGrade,
      overall_remarks: overallRemarks,
    });
  }

  return results;
}
