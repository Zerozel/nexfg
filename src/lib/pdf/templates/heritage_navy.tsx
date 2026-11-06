// src/lib/pdf/templates/heritage_navy.tsx
import React from "react";
import { Page, Text, View, Image } from "@react-pdf/renderer";
import type { IndividualReportCardData } from "@/types/printing";
import {
  heritageStyles as s,
  HERITAGE_COLOR,
} from "./heritage-navy-styles";

type RatingValue = "Excellent" | "Good" | "Fair" | "Poor" | null;

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

function getOrdinal(n: number): string {
  if (!Number.isFinite(n) || n <= 0) return "0";
  const ords = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (ords[(v - 20) % 10] || ords[v] || ords[0]);
}

function gradePillColor(grade: string | null | undefined): string {
  if (!grade) return HERITAGE_COLOR.blue;
  const g = grade.trim().toUpperCase();
  if (/^A/.test(g)) return HERITAGE_COLOR.blue;
  if (/^B/.test(g)) return HERITAGE_COLOR.teal;
  if (/^C/.test(g)) return HERITAGE_COLOR.gradeC;
  return HERITAGE_COLOR.gradeD;
}

function CheckboxGroup({ label, value }: { label: string; value: RatingValue }) {
  return (
    <View style={s.devTraitRow}>
      <Text style={s.devTraitLabel}>{label}</Text>
      <View style={s.checkboxGroup}>
        {RATING_OPTIONS.map((opt) => (
          <View key={opt.key} style={s.checkboxWrapper}>
            <View style={s.checkbox}>
              {value === opt.key && <View style={s.checkboxInner} />}
            </View>
            <Text style={s.checkboxLabel}>{opt.label}</Text>
          </View>
        ))}
      </View>
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
  const total = subject?.score ?? 0;
  const grade = subject?.grade || "—";
  const remark = subject?.remarks || "—";

  const fmt = (v: number | null | undefined) =>
    v === null || v === undefined ? "—" : String(v);

  return (
    <View style={[s.tableRow, isAlt ? s.tableRowAlt : {}]}>
      <Text
        style={[s.tableCell, showCA3 ? s.colSubject3 : s.colSubject2]}
      >
        {subject?.name || "—"}
      </Text>
      <Text
        style={[
          s.tableCellCenter,
          showCA3 ? s.colCA3 : s.colCA2,
        ]}
      >
        {fmt(ca1)}
      </Text>
      <Text
        style={[
          s.tableCellCenter,
          showCA3 ? s.colCA3 : s.colCA2,
        ]}
      >
        {fmt(ca2)}
      </Text>
      {showCA3 && (
        <Text style={[s.tableCellCenter, s.colCA3]}>{fmt(ca3)}</Text>
      )}
      <Text
        style={[
          s.tableCellCenter,
          showCA3 ? s.colExam3 : s.colExam2,
        ]}
      >
        {fmt(exam)}
      </Text>
      <Text
        style={[
          s.tableCellTotal,
          showCA3 ? s.colTotal3 : s.colTotal2,
        ]}
      >
        {total}
      </Text>
      <View style={showCA3 ? s.colGrade3 : s.colGrade2}>
        <Text
          style={[s.gradePill, { backgroundColor: gradePillColor(grade) }]}
        >
          {grade}
        </Text>
      </View>
      <Text
        style={[
          s.tableCellRemark,
          showCA3 ? s.colRemark3 : s.colRemark2,
        ]}
      >
        {remark}
      </Text>
    </View>
  );
}

export function HeritageNavyPage({ data }: { data: IndividualReportCardData }) {
  const safeSchool: any = data?.school || {};
  const safeStudent: any = data?.student || {};
  const safeClass: any = data?.class || {};
  const safeTerm: any = data?.term || {};
  const subjects: any[] = Array.isArray(data?.subjects) ? data.subjects : [];
  const safeOverall: any = data?.overall || {};

  // CA3 column only renders when the school has 3 CAs configured.
  const caCount: number = safeSchool.ca_count ?? 2;
  const showCA3 = caCount >= 3;

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
    .join(" • ");

  return (
    <Page size="A4" style={s.page}>
      {/* ── TOP BAR ── */}
      <View style={s.topBar} />

      {/* ── HEADER ── */}
      <View style={s.headerRow}>
        {safeSchool.logo_url ? (
          <Image src={safeSchool.logo_url} style={s.crest} />
        ) : (
          <View style={s.crest}>
            <Text style={s.crestText}>
              {(safeSchool.name || "S").charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
        <View style={s.headerCenter}>
          <Text style={s.schoolName}>
            {safeSchool.name || "School Name"}
          </Text>
          <Text style={s.schoolContact}>{schoolContact}</Text>
        </View>
        <View style={s.headerRight}>
          <Text style={s.titleMain}>STUDENT REPORT CARD</Text>
          <Text style={s.titleSub}>
            {(safeTerm.name || "").toUpperCase()}
            {safeTerm.academic_session
              ? ` • ${safeTerm.academic_session}`
              : ""}
          </Text>
        </View>
      </View>

      {/* ── INFO GRID ── */}
      <View style={s.infoGrid}>
        <View style={s.infoCell}>
          <Text style={s.infoLabel}>Student Name</Text>
          <Text style={s.infoValue}>{safeStudent.full_name || "—"}</Text>
        </View>
        <View style={s.infoCell}>
          <Text style={s.infoLabel}>Class</Text>
          <Text style={s.infoValue}>{safeClass.name || "—"}</Text>
        </View>
        <View style={s.infoCell}>
          <Text style={s.infoLabel}>Admission Number</Text>
          <Text style={s.infoValue}>
            {safeStudent.admission_number || "—"}
          </Text>
        </View>
        <View style={s.infoCellLastCol}>
          <Text style={s.infoLabel}>Session</Text>
          <Text style={s.infoValue}>
            {safeTerm.academic_session || "—"}
          </Text>
        </View>
        <View style={s.infoCellLastRow}>
          <Text style={s.infoLabel}>Term</Text>
          <Text style={s.infoValue}>{safeTerm.name || "—"}</Text>
        </View>
        <View style={s.infoCellLastRow}>
          <Text style={s.infoLabel}>Next Term Begins</Text>
          <Text style={s.infoValue}>—</Text>
        </View>
        <View style={s.infoCellLastRow}>
          <Text style={s.infoLabel}>Term Ends</Text>
          <Text style={s.infoValue}>—</Text>
        </View>
        <View style={s.infoCellLast}>
          <Text style={s.infoLabel}>Class Teacher</Text>
          <Text style={s.infoValue}>{safeClass.teacher_name || "—"}</Text>
        </View>
      </View>

      {/* ── ACADEMIC TABLE ── */}
      <Text style={s.sectionTitle}>Academic Performance</Text>
      <View style={s.table}>
        <View style={s.tableHeaderRow}>
          <Text
            style={[
              s.tableHeaderCell,
              showCA3 ? s.colSubject3 : s.colSubject2,
            ]}
          >
            Subject
          </Text>
          <Text
            style={[
              s.tableHeaderCellCenter,
              showCA3 ? s.colCA3 : s.colCA2,
            ]}
          >
            CA1
          </Text>
          <Text
            style={[
              s.tableHeaderCellCenter,
              showCA3 ? s.colCA3 : s.colCA2,
            ]}
          >
            CA2
          </Text>
          {showCA3 && (
            <Text style={[s.tableHeaderCellCenter, s.colCA3]}>CA3</Text>
          )}
          <Text
            style={[
              s.tableHeaderCellCenter,
              showCA3 ? s.colExam3 : s.colExam2,
            ]}
          >
            Exam
          </Text>
          <Text
            style={[
              s.tableHeaderCellCenter,
              showCA3 ? s.colTotal3 : s.colTotal2,
            ]}
          >
            Total
          </Text>
          <Text
            style={[
              s.tableHeaderCellCenter,
              showCA3 ? s.colGrade3 : s.colGrade2,
            ]}
          >
            Grade
          </Text>
          <Text
            style={[
              s.tableHeaderCell,
              showCA3 ? s.colRemark3 : s.colRemark2,
            ]}
          >
            Remark
          </Text>
        </View>

        {subjects.length === 0 ? (
          <View style={s.tableRow}>
            <Text
              style={[
                s.tableCell,
                { width: "100%", textAlign: "center", paddingVertical: 14 },
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
      </View>

      {/* ── STAT BAND ── */}
      <View style={s.statBand}>
        <View style={s.statCell}>
          <Text style={s.statValue}>{avg.toFixed(1)}%</Text>
          <Text style={s.statLabel}>Overall Average</Text>
        </View>
        <View style={s.statCell}>
          <Text style={s.statValue}>{overallGrade}</Text>
          <Text style={s.statLabel}>Overall Grade</Text>
        </View>
        <View style={s.statCellLast}>
          <Text style={s.statValue}>
            {getOrdinal(pos)} of {totalStudents}
          </Text>
          <Text style={s.statLabel}>Class Position</Text>
        </View>
      </View>

      {/* ── BOTTOM PINNED ZONE: PD + feedback + signatures + scale + footer ── */}
      <View style={s.bottomPinned}>
        {/* Personal Development */}
        <Text style={s.sectionTitle}>Personal Development</Text>
        <View style={s.devRow}>
          <View style={s.devColumn}>
            <View style={s.devHeader}>
              <Text style={s.devHeaderText}>Affective Traits</Text>
            </View>
            <View style={s.legendRow}>
              <Text style={s.legendItem}>E = Excellent</Text>
              <Text style={s.legendItem}>G = Good</Text>
              <Text style={s.legendItem}>F = Fair</Text>
              <Text style={s.legendItem}>P = Poor</Text>
            </View>
            {AFFECTIVE_TRAITS.map((trait) => (
              <CheckboxGroup
                key={trait}
                label={trait}
                value={getRatingValue(data.affective_traits, trait, "trait")}
              />
            ))}
          </View>

          <View style={s.devColumnLast}>
            <View style={s.devHeader}>
              <Text style={s.devHeaderText}>Psychomotor Skills</Text>
            </View>
            <View style={s.legendRow}>
              <Text style={s.legendItem}>E = Excellent</Text>
              <Text style={s.legendItem}>G = Good</Text>
              <Text style={s.legendItem}>F = Fair</Text>
              <Text style={s.legendItem}>P = Poor</Text>
            </View>
            {PSYCHOMOTOR_SKILLS.map((skill) => (
              <CheckboxGroup
                key={skill}
                label={skill}
                value={getRatingValue(
                  data.psychomotor_skills,
                  skill,
                  "skill"
                )}
              />
            ))}
          </View>
        </View>

        {/* Feedback — only teacher + principal */}
        <View style={s.feedbackBlock}>
          <View style={s.feedbackRow}>
            <Text style={s.feedbackLabel}>Class Teacher's Comment</Text>
            <Text style={s.feedbackLine} />
          </View>
          <View style={[s.feedbackRow, { borderBottomWidth: 0 }]}>
            <Text style={s.feedbackLabel}>Principal's Comment</Text>
            <Text style={s.feedbackLineLast} />
          </View>
        </View>

        {/* Signatures — only teacher + principal */}
        <View style={s.signatureRow}>
          <View style={s.signatureBlock}>
            <View style={s.signatureLine} />
            <Text style={s.signatureLabel}>Class Teacher</Text>
            <Text style={s.signatureDate}>Date: __________</Text>
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
            <Text style={s.signatureDate}>Date: __________</Text>
          </View>
        </View>

        {/* Scale + footer */}
        <Text style={s.scaleLine}>
          <Text style={s.scaleBold}>Grading scale: </Text>
          A1 75–100 Excellent  |  B2 70–74 Very Good  |  B3 65–69 Good  |  C4–C6 50–64 Credit  |  D7–E8 40–49 Pass  |  F9 0–39 Needs Support
        </Text>
        <View style={s.footerBar}>
          <Text>
            {(safeSchool.name || "SCHOOL").toUpperCase()} • STUDENT REPORT
          </Text>
          <Text>POWERED BY NEXAFORGES</Text>
        </View>
      </View>
    </Page>
  );
}
