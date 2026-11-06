// src/lib/pdf/templates/heritage_burgundy.tsx
import React from "react";
import { Page, Text, View, Image } from "@react-pdf/renderer";
import type { IndividualReportCardData } from "@/types/printing";
import {
  burgundyStyles as s,
  BURGUNDY_COLOR,
} from "./heritage-burgundy-styles";

type RatingValue = "Excellent" | "Good" | "Fair" | "Poor" | null;

const AFFECTIVE_TRAITS = [
  "Punctuality",
  "Obedience",
  "Readiness to help",
  "Demonstrate Self Control",
  "Courteous",
  "Politeness",
  "Honesty",
  "Neatness",
  "Attentiveness",
];

// Dot scale: value 1–5, mapped from rating strings
const RATING_TO_DOTS: Record<Exclude<RatingValue, null>, number> = {
  Excellent: 5,
  Good: 4,
  Fair: 2,
  Poor: 1,
};

function getRatingValue(
  traits: any[] | null | undefined,
  targetName: string
): RatingValue {
  if (!traits) return null;
  const found = traits.find(
    (t) => t.trait?.toString().toLowerCase() === targetName.toLowerCase()
  );
  if (!found) return null;
  const val = found.rating?.toString().toLowerCase();
  if (!val) return null;
  if (val === "excellent" || val === "a") return "Excellent";
  if (val === "good" || val === "b") return "Good";
  if (val === "fair" || val === "c") return "Fair";
  if (val === "poor" || val === "d" || val === "f") return "Poor";
  return null;
}

function getOrdinal(n: number): string {
  if (!Number.isFinite(n) || n <= 0) return "0";
  const ords = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (ords[(v - 20) % 10] || ords[v] || ords[0]);
}

function gradeCircleColor(grade: string | null | undefined): string {
  if (!grade) return "#BDB0A6";
  const g = grade.trim().toUpperCase();
  if (/^A/.test(g)) return BURGUNDY_COLOR.gradeA;
  if (/^B/.test(g)) return BURGUNDY_COLOR.gradeB;
  if (/^C/.test(g)) return BURGUNDY_COLOR.gradeC;
  return BURGUNDY_COLOR.gradeD;
}

function formatPrintDate(): string {
  return new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// ── Sub-components ────────────────────────────────────────────────────────

function GradeCircle({ grade }: { grade: string | null | undefined }) {
  if (!grade || grade === "—") {
    return (
      <View style={s.gradeCircleEmpty}>
        <Text style={s.gradeCircleEmptyText}>—</Text>
      </View>
    );
  }
  return (
    <View
      style={[s.gradeCircle, { backgroundColor: gradeCircleColor(grade) }]}
    >
      <Text style={s.gradeCircleText}>{grade}</Text>
    </View>
  );
}

function ScoreBar({
  caTotal,
  exam,
  hasData,
}: {
  caTotal: number;
  exam: number;
  hasData: boolean;
}) {
  if (!hasData) {
    return <View style={s.barTrackNil} />;
  }
  // Normalize to 100. CA max is up to 40, exam up to 60 in the ledger vision.
  // Actual widths scale by score/100.
  const caPct = Math.min(100, Math.max(0, caTotal));
  const examPct = Math.min(100 - caPct, Math.max(0, exam));
  return (
    <View style={s.barTrack}>
      <View style={[s.barCA, { width: `${caPct}%` }]} />
      <View style={[s.barExam, { width: `${examPct}%` }]} />
    </View>
  );
}

interface SubjectRowProps {
  subject: any;
  index: number;
  showCA3: boolean;
}

function SubjectRow({ subject, index, showCA3 }: SubjectRowProps) {
  const isAlt = index % 2 === 1;
  const ca1 = subject?.ca1_score ?? null;
  const ca2 = subject?.ca2_score ?? null;
  const ca3 = subject?.ca3_score ?? null;
  const exam = subject?.exam_score ?? null;
  const hasData =
    ca1 !== null || ca2 !== null || ca3 !== null || exam !== null;
  const caTotal =
    (ca1 || 0) + (ca2 || 0) + (showCA3 ? ca3 || 0 : 0);
  const examTotal = exam || 0;
  const total = subject?.score ?? caTotal + examTotal;
  const grade = subject?.grade || null;
  const remark = subject?.remarks || null;

  const fmt = (v: number | null | undefined) =>
    v === null || v === undefined ? "—" : String(v);

  return (
    <View style={[s.tableRow, isAlt ? s.tableRowAlt : {}]}>
      <Text style={[s.tableCellSubject, s.colSubject]}>
        {subject?.name || "—"}
      </Text>
      <Text
        style={[
          s.tableCellCenter,
          s.colCA,
          !hasData ? s.tableCellNil : {},
        ]}
      >
        {fmt(caTotal || null)}
      </Text>
      <Text
        style={[
          s.tableCellCenter,
          s.colExam,
          !hasData ? s.tableCellNil : {},
        ]}
      >
        {fmt(examTotal || null)}
      </Text>
      <View style={s.colBar}>
        <ScoreBar caTotal={caTotal} exam={examTotal} hasData={hasData} />
      </View>
      <Text
        style={[
          s.tableCellTotal,
          s.colTotal,
          !hasData ? s.tableCellNil : {},
        ]}
      >
        {hasData ? total : "—"}
      </Text>
      <View style={s.colGrade}>
        <GradeCircle grade={hasData ? grade : null} />
      </View>
      <Text
        style={[
          s.tableCellRemark,
          s.colRemark,
          !hasData ? s.tableCellNil : {},
        ]}
      >
        {hasData ? remark || "—" : "—"}
      </Text>
    </View>
  );
}

function TraitRow({
  label,
  value,
}: {
  label: string;
  value: RatingValue;
}) {
  const dots = value ? RATING_TO_DOTS[value] : 0;
  return (
    <View style={s.devTraitRow}>
      <Text style={s.devTraitLabel}>{label}</Text>
      <View style={s.devDotsGroup}>
        <View style={s.devDots}>
          {[1, 2, 3, 4, 5].map((i) => (
            <View
              key={i}
              style={[s.devDot, i <= dots ? s.devDotOn : {}]}
            />
          ))}
        </View>
        <Text style={s.devRatingText}>{value || "—"}</Text>
      </View>
    </View>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────

export function HeritageBurgundyPage({
  data,
}: {
  data: IndividualReportCardData;
}) {
  const safeSchool: any = data?.school || {};
  const safeStudent: any = data?.student || {};
  const safeClass: any = data?.class || {};
  const safeTerm: any = data?.term || {};
  const subjects: any[] = Array.isArray(data?.subjects) ? data.subjects : [];
  const safeOverall: any = data?.overall || {};

  const caCount: number = safeSchool.ca_count ?? 2;
  const showCA3 = caCount >= 3;

  const scored = subjects.filter((sub) => sub && sub.score != null);
  const totalObtained = scored.reduce(
    (sum, sub) => sum + Number(sub.score || 0),
    0
  );
  const totalMax = scored.length * 100;

  const avg: number =
    typeof safeOverall.average === "number" ? safeOverall.average : 0;
  const pos: number =
    typeof safeOverall.position === "number" ? safeOverall.position : 0;
  const totalStudents: number =
    typeof safeOverall.total_students === "number"
      ? safeOverall.total_students
      : 0;
  const overallGrade: string = safeOverall.grade || "—";

  const schoolContact = [
    safeSchool.address,
    safeSchool.phone,
    safeSchool.email,
  ]
    .filter(Boolean)
    .join(" · ");

  const printDate = formatPrintDate();

  return (
    <Page size="A4" style={s.page}>
      {/* ── BAND ── */}
      <View style={s.band}>
        {safeSchool.logo_url ? (
          <Image src={safeSchool.logo_url} style={s.crest} />
        ) : (
          <View style={s.crest}>
            <Text style={s.crestText}>
              {(safeSchool.name || "S").charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
        <View style={s.bandCenter}>
          <Text style={s.bandSchoolName}>
            {safeSchool.name || "School Name"}
          </Text>
          <Text style={s.bandContact}>{schoolContact}</Text>
        </View>
        <View style={s.bandDoc}>
          <Text style={s.bandDocTitle}>Student Report Card</Text>
          <Text style={s.bandDocSub}>
            {safeTerm.name || "Term"}
            {safeTerm.academic_session
              ? ` · ${safeTerm.academic_session}`
              : ""}
          </Text>
        </View>
        <View style={s.bandRule} />
      </View>

      {/* ── FLOATING IDENTITY CARD ── */}
      <View style={s.card}>
        <View style={s.cardLeft}>
          <Text style={s.cardStudentName}>
            {safeStudent.full_name || "Unknown Student"}
          </Text>
          <View style={s.cardMetaRow}>
            <View style={s.cardMetaCell}>
              <Text style={s.cardMetaLabel}>Class</Text>
              <Text style={s.cardMetaValue}>{safeClass.name || "—"}</Text>
            </View>
            <View style={s.cardMetaCell}>
              <Text style={s.cardMetaLabel}>Admission No.</Text>
              <Text style={s.cardMetaValue}>
                {safeStudent.admission_number || "—"}
              </Text>
            </View>
            <View style={s.cardMetaCell}>
              <Text style={s.cardMetaLabel}>Session</Text>
              <Text style={s.cardMetaValue}>
                {safeTerm.academic_session || "—"}
              </Text>
            </View>
            <View style={s.cardMetaCell}>
              <Text style={s.cardMetaLabel}>Term</Text>
              <Text style={s.cardMetaValue}>{safeTerm.name || "—"}</Text>
            </View>
            <View style={s.cardMetaCell}>
              <Text style={s.cardMetaLabel}>Class Teacher</Text>
              <Text style={s.cardMetaValue}>
                {safeClass.teacher_name || "—"}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* ── STAT ROW ── */}
      <View style={s.statRow}>
        <View style={s.statCell}>
          <Text style={s.statLabel}>Total Score</Text>
          <Text style={s.statValue}>
            {scored.length > 0 ? totalObtained : "—"}
            <Text style={s.statValueSmall}>
              {scored.length > 0 ? ` / ${totalMax}` : ""}
            </Text>
          </Text>
        </View>
        <View style={s.statCell}>
          <Text style={s.statLabel}>Overall Average</Text>
          <Text style={s.statValue}>{avg.toFixed(1)}%</Text>
        </View>
        <View style={s.statCell}>
          <Text style={s.statLabel}>Overall Grade</Text>
          <Text style={s.statValue}>{overallGrade}</Text>
        </View>
        <View style={s.statCellLast}>
          <Text style={s.statLabel}>Class Position</Text>
          <Text style={s.statValue}>
            {getOrdinal(pos)}
            <Text style={s.statValueSmall}> of {totalStudents}</Text>
          </Text>
        </View>
      </View>

      {/* ── ACADEMIC TABLE ── */}
      <Text style={s.sectionTitle}>Academic Performance</Text>
      <View style={s.tableHeaderRow}>
        <Text style={[s.tableHeaderCell, s.colSubject]}>Subject</Text>
        <Text style={[s.tableHeaderCellCenter, s.colCA]}>CA</Text>
        <Text style={[s.tableHeaderCellCenter, s.colExam]}>Exam</Text>
        <Text style={[s.tableHeaderCell, s.colBar]}>Score / 100</Text>
        <Text style={[s.tableHeaderCellCenter, s.colTotal]}>Total</Text>
        <Text style={[s.tableHeaderCellCenter, s.colGrade]}>Grade</Text>
        <Text style={[s.tableHeaderCell, s.colRemark]}>Remark</Text>
      </View>

      {subjects.length === 0 ? (
        <View style={s.tableRow}>
          <Text
            style={[
              s.tableCellCenter,
              { width: "100%", paddingVertical: 14 },
            ]}
          >
            No compiled results available
          </Text>
        </View>
      ) : (
        subjects.map((subject, idx) => (
          <SubjectRow
            key={subject?.id || `row-${idx}`}
            subject={subject}
            index={idx}
            showCA3={showCA3}
          />
        ))
      )}

      <View style={s.tableLegend}>
        <View
          style={[s.legendSwatch, { backgroundColor: BURGUNDY_COLOR.primaryDeep }]}
        />
        <Text style={s.legendText}>Continuous assessment</Text>
        <View
          style={[s.legendSwatch, { backgroundColor: BURGUNDY_COLOR.primaryLight }]}
        />
        <Text style={s.legendText}>Exam</Text>
        <Text style={s.legendText}>
          A dash means the score is not available yet.
        </Text>
      </View>

      {/* ── BOTTOM PINNED ZONE ── */}
      <View style={s.bottomPinned}>
        {/* Personal Development */}
        <Text style={s.sectionTitle}>Personal Development</Text>
        <View style={s.devBlock}>
          {AFFECTIVE_TRAITS.map((trait) => (
            <TraitRow
              key={trait}
              label={trait}
              value={getRatingValue(data.affective_traits, trait)}
            />
          ))}
        </View>

        {/* Feedback — teacher + principal only */}
        <View style={s.feedbackBlock}>
          <View style={s.feedbackRow}>
            <Text style={s.feedbackLabel}>Class Teacher's Comment</Text>
            <Text style={s.feedbackValue}>
              {data.teacher_comment || " "}
            </Text>
          </View>
          <View style={s.feedbackRow}>
            <Text style={s.feedbackLabel}>Principal's Comment</Text>
            <Text style={s.feedbackValue}>
              {data.principal_comment || " "}
            </Text>
          </View>
        </View>

        {/* Signatures — teacher + principal only; date = print date */}
        <View style={s.signatureRow}>
          <View style={s.signatureBlock}>
            <View style={s.signatureLine} />
            <Text style={s.signatureLabel}>Class Teacher</Text>
            <Text style={s.signatureDate}>Date: {printDate}</Text>
          </View>
          <View style={s.signatureBlock}>
            {safeSchool.principal_signature_url ? (
              <Image
                src={safeSchool.principal_signature_url}
                style={s.signatureImage}
              />
            ) : null}
            <View style={s.signatureLine} />
            <Text style={s.signatureLabel}>
              {safeSchool.principal_name || "Principal"}
            </Text>
            <Text style={s.signatureDate}>Date: {printDate}</Text>
          </View>
        </View>

        {/* Scale + footer */}
        <Text style={s.scaleLine}>
          <Text style={s.scaleBold}>Grading scale: </Text>
          A1 75–100 Excellent  |  B2 70–74 Very Good  |  B3 65–69 Good  |  C4–C6 50–64 Credit  |  D7–E8 40–49 Pass  |  F9 0–39 Needs Support
        </Text>
        <View style={s.footerBar}>
          <Text>
            {(safeSchool.name || "SCHOOL").toUpperCase()} · STUDENT REPORT
          </Text>
          <Text>POWERED BY NEXAFORGES</Text>
        </View>
      </View>
    </Page>
  );
}
