// supabase/functions/compile-results/calculator.ts

import {
  AssessmentRecord,
  GradingSystemRecord,
  StudentSubjectAggregate,
} from './types.ts';

/**
 * Which assessment template slot a given assessment name belongs to.
 * The auto-provisioned names are CA1, CA2, CA3, Exam — anything else
 * falls into a generic bucket and does not feed the four report-card
 * columns directly.
 */
type AssessmentSlot = 'ca1' | 'ca2' | 'ca3' | 'exam' | 'other';

function slotForAssessmentName(name: string): AssessmentSlot {
  const upper = (name || '').toUpperCase().trim();
  if (upper === 'CA1') return 'ca1';
  if (upper === 'CA2') return 'ca2';
  if (upper === 'CA3') return 'ca3';
  if (upper === 'EXAM') return 'exam';
  return 'other';
}

/**
 * Compute the raw score for one assessment slot.
 * Returns 0 when the student has no score for that slot — per the
 * "force zero" policy, so missing scores count against the total and
 * the report card matches what a Nigerian school expects.
 */
function rawScoreForSlot(
  slot: AssessmentSlot,
  subjectScores: { assessment_id: string; score: number | null }[],
  subjectAssessments: AssessmentRecord[]
): number {
  if (slot === 'other') return 0;

  const assessment = subjectAssessments.find(
    (a) => slotForAssessmentName(a.name) === slot
  );
  if (!assessment) return 0;

  const score = subjectScores.find((s) => s.assessment_id === assessment.id);
  return score && typeof score.score === 'number' ? score.score : 0;
}

/**
 * Weighted average for a subject.
 * Missing scores are treated as 0 but the assessment weight still counts,
 * so a student who skipped CA3 is penalised. Matches the "force zero"
 * decision.
 */
export function calculateWeightedAverage(
  scores: { assessment_id: string; score: number | null }[],
  assessments: AssessmentRecord[]
): number {
  let totalWeightedScore = 0;
  let totalWeight = 0;

  for (const assessment of assessments) {
    const scoreEntry = scores.find((s) => s.assessment_id === assessment.id);
    const rawScore =
      scoreEntry && typeof scoreEntry.score === 'number'
        ? scoreEntry.score
        : 0;

    const percentage = (rawScore / assessment.max_score) * 100;
    totalWeightedScore += percentage * assessment.weight;
    totalWeight += assessment.weight;
  }

  if (totalWeight === 0) return 0;
  return Math.round((totalWeightedScore / totalWeight) * 100) / 100;
}

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

  const lowest = gradingSystem[gradingSystem.length - 1];
  return {
    grade: lowest?.grade || 'F9',
    remarks: lowest?.remark || 'Fail',
  };
}

export function calculatePositions(
  items: { student_id: string; score: number }[]
): Map<string, number> {
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
 * Aggregate scores by student and subject.
 * Every subject the class teaches (per the assessments list) is included
 * for every student in the map — no skips. Missing scores become 0.
 */
export function aggregateScoresByStudentAndSubject(
  scores: { student_id: string; assessment_id: string; score: number | null }[],
  assessments: AssessmentRecord[],
  subjects: { id: string; name: string }[],
  gradingSystem: GradingSystemRecord[]
): StudentSubjectAggregate[] {
  // Group scores by student
  const studentMap = new Map<
    string,
    { assessment_id: string; score: number | null }[]
  >();

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

  const results: StudentSubjectAggregate[] = [];

  for (const [studentId, studentScores] of studentMap) {
    const subjectResults: StudentSubjectAggregate['subjects'] = [];
    let overallTotal = 0;
    let overallCount = 0;

    for (const [subjectId, subjectAssessmentsList] of subjectAssessments) {
      const subjectScoreItems = studentScores.filter((s) =>
        subjectAssessmentsList.some((a) => a.id === s.assessment_id)
      );

      // Always compute a row for this subject. If the student has no scores
      // at all for it, the weighted average will still resolve to 0 and the
      // raw columns will each be 0.
      const avg = calculateWeightedAverage(
        subjectScoreItems,
        subjectAssessmentsList
      );
      const { grade, remarks } = getGradeAndRemarks(avg, gradingSystem);

      const subjectName =
        subjects.find((s) => s.id === subjectId)?.name || 'Unknown';

      const ca1_score = rawScoreForSlot('ca1', studentScores, subjectAssessmentsList);
      const ca2_score = rawScoreForSlot('ca2', studentScores, subjectAssessmentsList);
      const ca3_score = rawScoreForSlot('ca3', studentScores, subjectAssessmentsList);
      const exam_score = rawScoreForSlot('exam', studentScores, subjectAssessmentsList);

      subjectResults.push({
        subject_id: subjectId,
        subject_name: subjectName,
        score: avg,
        grade,
        remarks,
        ca1_score,
        ca2_score,
        ca3_score,
        exam_score,
      });

      overallTotal += avg;
      overallCount++;
    }

    const overallAverage =
      overallCount > 0
        ? Math.round((overallTotal / overallCount) * 100) / 100
        : 0;
    const { grade: overallGrade, remarks: overallRemarks } =
      getGradeAndRemarks(overallAverage, gradingSystem);

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
