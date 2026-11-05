// src/lib/pdf/templates/classic_nigerian.tsx
import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  Image,
} from "@react-pdf/renderer";
import type { IndividualReportCardData } from "@/types/printing";
import { styles, COLOR } from "./report-card-styles";

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────
type RatingValue = "Excellent" | "Good" | "Fair" | "Poor" | null;

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────
const AFFECTIVE_TRAITS = [
  "Punctuality",
  "Obedience",
  "Readiness to Help",
  "Self Control",
  "Courteousness",
  "Politeness",
  "Honesty",
  "Neatness",
  "Attentiveness",
];

const PSYCHOMOTOR_SKILLS = [
  "Handwriting",
  "Verbal Fluency",
  "Games / Sports",
  "Drawing & Painting",
  "Handling Tools",
  "Musical Skills",
];

const RATING_OPTIONS: Array<{ key: Exclude<RatingValue, null>; label: string }> = [
  { key: "Excellent", label: "E" },
  { key: "Good", label: "G" },
  { key: "Fair", label: "F" },
  { key: "Poor", label: "P" },
];

// The report card is calibrated for a maximum of 16 subject rows.
// If a student has fewer, we pad with empty rows (score 0) so the layout
// remains identical across the class. If a student has more, we print all.
const SUBJECT_ROW_COUNT = 16;

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────
function getRatingValue(
  traits: any[] | null | undefined,
  targetName: string,
  key: "trait" | "skill"
): RatingValue {
  if (!traits) return null;
  const found = traits.find(
    (t) => t[key]?.toString().toLowerCase() === targetName.toLowerCase()
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

function gradeColor(grade: string | null | undefined): string {
  if (!grade) return COLOR.darkGrey;
  const g = grade.trim().toUpperCase();
  if (/^A/.test(g)) return COLOR.gradeA;
  if (/^B/.test(g)) return COLOR.gradeB;
  if (/^C/.test(g)) return COLOR.gradeC;
  if (/^D|^E/.test(g)) return COLOR.gradeD;
  if (/^F/.test(g)) return COLOR.gradeF;
  return COLOR.darkGrey;
}

function getOrdinal(n: number): string {
  if (!Number.isFinite(n) || n <= 0) return "0";
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return dateString;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SUB-COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────
function CheckboxGroup({ label, value }: { label: string; value: RatingValue }) {
  return (
    <View style={styles.traitRow}>
      <Text style={styles.traitLabel}>{label}</Text>
      <View style={styles.checkboxGroup}>
        {RATING_OPTIONS.map((opt) => (
          <View key={opt.key} style={styles.checkboxWrapper}>
            <View style={styles.checkbox}>
              {value === opt.key && <View style={styles.checkboxInner} />}
            </View>
            <Text style={styles.checkboxLabel}>{opt.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function SubjectTableRow({
  subject,
  index,
  showCA3,
}: {
  subject: any;
  index: number;
  showCA3: boolean;
}) {
  const isZebra = index % 2 === 1;
  const caTotal =
    (subject?.ca1_score || 0) +
    (subject?.ca2_score || 0) +
    (showCA3 ? subject?.ca3_score || 0 : 0);
  const exam = subject?.exam_score || 0;
  const total = subject?.score || caTotal + exam;
  const grade = subject?.grade || "—";

  return (
    <View style={[styles.tableRow, isZebra ? styles.tableRowZebra : {}]}>
      <Text style={[styles.tableCellSubject, styles.colSubject]}>
        {subject?.name || "—"}
      </Text>
      <Text style={[styles.tableCell, styles.colCA]}>{caTotal}</Text>
      <Text style={[styles.tableCell, styles.colExam]}>{exam}</Text>
      <Text style={[styles.tableCellBold, styles.colTotal]}>{total}</Text>
      <Text
        style={[
          styles.tableCellGrade,
          styles.colGrade,
          { color: gradeColor(grade) },
        ]}
      >
        {grade}
      </Text>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────────────────────
export function ClassicNigerianPage({ data }: { data: IndividualReportCardData }) {
  const safeSchool: any = data?.school || {};
  const safeStudent: any = data?.student || {};
  const safeClass: any = data?.class || {};
  const safeTerm: any = data?.term || {};
  const rawSubjects: any[] = Array.isArray(data?.subjects) ? data.subjects : [];
  const safeOverall: any = data?.overall || {};

  const primaryColor = safeSchool.primary_color || COLOR.primary;
  const caCount: number = safeSchool.ca_count ?? 2;
  const showCA3 = caCount >= 3;

  // Pad to exactly SUBJECT_ROW_COUNT rows; if more, keep all.
  const paddedSubjects: any[] =
    rawSubjects.length >= SUBJECT_ROW_COUNT
      ? rawSubjects
      : [
          ...rawSubjects,
          ...Array.from(
            { length: SUBJECT_ROW_COUNT - rawSubjects.length },
            () => null
          ),
        ];

  // ── Results math ──
  const scoredSubjects = rawSubjects.filter((s) => s && s.score != null);
  const totalObtained = scoredSubjects.reduce(
    (sum, s) => sum + Number(s.score || 0),
    0
  );
  const totalMax = scoredSubjects.length * 100;
  const percentage =
    totalMax > 0 ? ((totalObtained / totalMax) * 100).toFixed(1) : "0.0";
  const average: number =
    typeof safeOverall.average === "number" ? safeOverall.average : 0;
  const position: number =
    typeof safeOverall.position === "number" ? safeOverall.position : 0;
  const totalStudents: number =
    typeof safeOverall.total_students === "number"
      ? safeOverall.total_students
      : 0;

  // ── Contact parts ──
  const contactParts = [
    safeSchool.address,
    safeSchool.phone,
    safeSchool.email,
  ].filter(Boolean);

  return (
    <Page size="A4" style={styles.page}>
      {/* ═══════════════════════════════════════════════════════════════
          ZONE 1 — HEADER
      ═══════════════════════════════════════════════════════════════ */}
      <View style={styles.header}>
        {safeSchool.logo_url ? (
          <Image src={safeSchool.logo_url} style={styles.logo} />
        ) : null}
        <Text style={[styles.schoolName, { color: primaryColor }]}>
          {safeSchool.name || "School Name"}
        </Text>
        {contactParts.length > 0 ? (
          <Text style={styles.schoolContact}>{contactParts.join("   ·   ")}</Text>
        ) : null}
      </View>

      {/* ═══════════════════════════════════════════════════════════════
          ZONE 2 — TITLE BAR
      ═══════════════════════════════════════════════════════════════ */}
      <View style={[styles.titleBar, { backgroundColor: primaryColor }]}>
        <Text style={styles.titleText}>Student Report Card</Text>
      </View>

      {/* ═══════════════════════════════════════════════════════════════
          ZONE 3 — IDENTITY
      ═══════════════════════════════════════════════════════════════ */}
      <View style={styles.identityBlock}>
        <View style={styles.identityColumn}>
          <View style={styles.identityRow}>
            <Text style={styles.identityLabel}>Student</Text>
            <Text style={styles.identityValue}>
              {safeStudent.full_name || "—"}
            </Text>
          </View>
          <View style={styles.identityRowLast}>
            <Text style={styles.identityLabel}>Adm. No.</Text>
            <Text style={styles.identityValue}>
              {safeStudent.admission_number || "—"}
            </Text>
          </View>
        </View>
        <View style={styles.identityColumnLast}>
          <View style={styles.identityRow}>
            <Text style={styles.identityLabel}>Class</Text>
            <Text style={styles.identityValue}>{safeClass.name || "—"}</Text>
          </View>
          <View style={styles.identityRowLast}>
            <Text style={styles.identityLabel}>Term</Text>
            <Text style={styles.identityValue}>
              {safeTerm.name || "—"}
              {safeTerm.academic_session
                ? `  ·  ${safeTerm.academic_session}`
                : ""}
            </Text>
          </View>
        </View>
      </View>

      {/* ═══════════════════════════════════════════════════════════════
          ZONE 4 — SUBJECT TABLE (single-column, full-width)
      ═══════════════════════════════════════════════════════════════ */}
      <View style={styles.tableBlock}>
        <View style={styles.tableHeaderRow}>
          <Text style={[styles.tableCellHeaderLeft, styles.colSubject]}>
            Subject
          </Text>
          <Text style={[styles.tableCellHeader, styles.colCA]}>CA</Text>
          <Text style={[styles.tableCellHeader, styles.colExam]}>Exam</Text>
          <Text style={[styles.tableCellHeader, styles.colTotal]}>Total</Text>
          <Text style={[styles.tableCellHeader, styles.colGrade]}>Grade</Text>
        </View>

        {paddedSubjects.map((subject, idx) => (
          <SubjectTableRow
            key={subject?.id || `row-${idx}`}
            subject={subject}
            index={idx}
            showCA3={showCA3}
          />
        ))}
      </View>

      {/* ═══════════════════════════════════════════════════════════════
          ZONE 4b — OVERALL BANNER
      ═══════════════════════════════════════════════════════════════ */}
      <View style={styles.bannerRow}>
        <View style={[styles.bannerCell, { borderLeftColor: primaryColor }]}>
          <Text style={styles.bannerLabel}>Total Obtained</Text>
          <Text style={styles.bannerValue}>
            {totalObtained} of {totalMax} ({percentage}%)
          </Text>
        </View>
        <View style={[styles.bannerCell, { borderLeftColor: gradeColor(safeOverall.grade) }]}>
          <Text style={styles.bannerLabel}>Average</Text>
          <Text style={styles.bannerValue}>{average.toFixed(1)}%</Text>
        </View>
        <View style={[styles.bannerCellLast, { borderLeftColor: primaryColor }]}>
          <Text style={styles.bannerLabel}>Position</Text>
          <Text style={styles.bannerValue}>
            {getOrdinal(position)} of {totalStudents}
          </Text>
        </View>
      </View>

      {/* ═══════════════════════════════════════════════════════════════
          ZONE 5 — AFFECTIVE + PSYCHOMOTOR
      ═══════════════════════════════════════════════════════════════ */}
      <View style={styles.traitsRow}>
        <View style={styles.traitsColumn}>
          <Text style={styles.sectionTitle}>Affective Traits</Text>
          <View style={styles.legendRow}>
            <Text style={styles.legendItem}>E = Excellent</Text>
            <Text style={styles.legendItem}>G = Good</Text>
            <Text style={styles.legendItem}>F = Fair</Text>
            <Text style={styles.legendItem}>P = Poor</Text>
          </View>
          {AFFECTIVE_TRAITS.map((trait, idx) => (
            <CheckboxGroup
              key={trait}
              label={trait}
              value={getRatingValue(data.affective_traits, trait, "trait")}
            />
          ))}
        </View>

        <View style={styles.traitsColumnLast}>
          <Text style={styles.sectionTitle}>Psychomotor Skills</Text>
          <View style={styles.legendRow}>
            <Text style={styles.legendItem}>E = Excellent</Text>
            <Text style={styles.legendItem}>G = Good</Text>
            <Text style={styles.legendItem}>F = Fair</Text>
            <Text style={styles.legendItem}>P = Poor</Text>
          </View>
          {PSYCHOMOTOR_SKILLS.map((skill) => (
            <CheckboxGroup
              key={skill}
              label={skill}
              value={getRatingValue(data.psychomotor_skills, skill, "skill")}
            />
          ))}
        </View>
      </View>

      {/* ═══════════════════════════════════════════════════════════════
          ZONE 6 — REMARKS + SIGNATURES (absolute, bottom of page)
      ═══════════════════════════════════════════════════════════════ */}
      <View style={styles.bottomBlock}>
        <View style={styles.remarkRow}>
          <Text style={styles.remarkLabel}>Teacher's Remark</Text>
          <Text style={styles.remarkLine}>{data.teacher_comment || " "}</Text>
        </View>
        <View style={styles.remarkRow}>
          <Text style={styles.remarkLabel}>Principal's Remark</Text>
          <Text style={styles.remarkLine}>{data.principal_comment || " "}</Text>
        </View>

        <View style={styles.signatureRow}>
          <View style={styles.signatureBlock}>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureName}>
              {safeClass.teacher_name || " "}
            </Text>
            <Text style={styles.signatureTitle}>Class Teacher</Text>
          </View>

          <View style={styles.signatureBlock}>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureName}>
              {formatDate(data.issued_date || new Date().toISOString())}
            </Text>
            <Text style={styles.signatureTitle}>Date</Text>
          </View>

          <View style={styles.signatureBlock}>
            {safeSchool.principal_signature_url ? (
              <Image
                src={safeSchool.principal_signature_url}
                style={styles.signatureImage}
              />
            ) : (
              <View style={{ height: 20 }} />
            )}
            <View style={styles.signatureLine} />
            <Text style={styles.signatureName}>
              {safeSchool.principal_name || "Principal"}
            </Text>
            <Text style={styles.signatureTitle}>Principal</Text>
          </View>
        </View>
      </View>

      {/* ═══════════════════════════════════════════════════════════════
          FOOTER (absolute, always on page 1)
      ═══════════════════════════════════════════════════════════════ */}
      <View style={styles.footer} fixed>
        <Text>Issued {formatDate(data.issued_date || new Date().toISOString())}</Text>
        <Text>Powered by NexaForges</Text>
      </View>
    </Page>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// BATCH DOCUMENT
// ─────────────────────────────────────────────────────────────────────────────
export function ClassicNigerianBatchDocument({
  students,
}: {
  students: IndividualReportCardData[];
}) {
  return (
    <Document>
      {students.map((student, i) => (
        <ClassicNigerianPage
          key={student.student?.id || `student-${i}`}
          data={student}
        />
      ))}
    </Document>
  );
}
