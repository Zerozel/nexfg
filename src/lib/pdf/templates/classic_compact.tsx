// src/lib/pdf/templates/classic_compact.tsx
import React from "react";
import { Page, Text, View, Image } from "@react-pdf/renderer";
import type { IndividualReportCardData } from "@/types/printing";
import { styles, COLOR, PAGE } from "./report-card-styles";

type RatingValue = "Excellent" | "Good" | "Fair" | "Poor" | null;

const AFFECTIVE_TRAITS = [
  "Punctuality", "Obedience", "Readiness to Help", "Self Control",
  "Courteousness", "Politeness", "Honesty", "Neatness", "Attentiveness",
];

const PSYCHOMOTOR_SKILLS = [
  "Handwriting", "Verbal Fluency", "Games / Sports", "Drawing & Painting",
  "Handling Tools", "Musical Skills",
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
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

function formatDate(dateString: string): string {
  try {
    const d = new Date(dateString);
    return d.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return dateString;
  }
}

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

function CompactSubjectRow({ subject, index }: { subject: any; index: number }) {
  const isZebra = index % 2 === 1;
  const caTotal =
    (subject.ca1_score || 0) + (subject.ca2_score || 0) + (subject.ca3_score || 0);
  const exam = subject.exam_score || 0;
  const total = subject.score != null ? subject.score : caTotal + exam;
  const grade = subject.grade || "—";

  return (
    <View style={[styles.tableRow, isZebra ? styles.tableRowZebra : {}]}>
      <Text style={[styles.tableCellSubject, { flex: 2.4 }]}>
        {subject.name || "—"}
      </Text>
      <Text style={[styles.tableCell, { flex: 0.7 }]}>{caTotal}</Text>
      <Text style={[styles.tableCell, { flex: 0.7 }]}>{exam}</Text>
      <Text style={[styles.tableCellBold, { flex: 0.8 }]}>{total}</Text>
      <Text style={[styles.tableCellGrade, { flex: 0.7 }]}>{grade}</Text>
    </View>
  );
}

export function ClassicCompactPage({ data }: { data: IndividualReportCardData }) {
  const safeSchool: any = data?.school || {};
  const safeStudent: any = data?.student || {};
  const safeClass: any = data?.class || {};
  const safeTerm: any = data?.term || {};
  const subjects: any[] = Array.isArray(data?.subjects) ? data.subjects : [];
  const safeOverall: any = data?.overall || {};

  const primaryColor = safeSchool.primary_color || COLOR.primary;

  const midPoint = Math.ceil(subjects.length / 2);
  const leftSubjects = subjects.slice(0, midPoint);
  const rightSubjects = subjects.slice(midPoint);

  const scored = subjects.filter((s) => s && s.score != null);
  const totalObtained = scored.reduce((sum, s) => sum + Number(s.score || 0), 0);
  const totalMax = scored.length * 100;
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

  const contactParts = [safeSchool.address, safeSchool.phone, safeSchool.email].filter(Boolean);

  return (
    <Page size="A4" style={styles.page}>
      {/* Header */}
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

      {/* Title */}
      <View style={[styles.titleBar, { backgroundColor: primaryColor }]}>
        <Text style={styles.titleText}>Student Report Card — Compact</Text>
      </View>

      {/* Identity */}
      <View style={styles.identityBlock}>
        <View style={styles.identityColumn}>
          <View style={styles.identityRow}>
            <Text style={styles.identityLabel}>Student</Text>
            <Text style={styles.identityValue}>{safeStudent.full_name || "—"}</Text>
          </View>
          <View style={styles.identityRowLast}>
            <Text style={styles.identityLabel}>Adm. No.</Text>
            <Text style={styles.identityValue}>{safeStudent.admission_number || "—"}</Text>
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
              {safeTerm.academic_session ? `  ·  ${safeTerm.academic_session}` : ""}
            </Text>
          </View>
        </View>
      </View>

      {/* Two-column subject table */}
      <View style={{ flexDirection: "row", marginBottom: 7 }}>
        <View style={{ flex: 1, marginRight: 6 }}>
          <View style={styles.tableHeaderRow}>
            <Text style={[styles.tableCellHeaderLeft, { flex: 2.4 }]}>Subject</Text>
            <Text style={[styles.tableCellHeader, { flex: 0.7 }]}>CA</Text>
            <Text style={[styles.tableCellHeader, { flex: 0.7 }]}>Exam</Text>
            <Text style={[styles.tableCellHeader, { flex: 0.8 }]}>Tot</Text>
            <Text style={[styles.tableCellHeader, { flex: 0.7 }]}>Gr</Text>
          </View>
          {leftSubjects.length === 0 ? (
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 1, textAlign: "center", paddingVertical: 12 }]}>—</Text>
            </View>
          ) : (
            leftSubjects.map((s, i) => <CompactSubjectRow key={s.id || i} subject={s} index={i} />)
          )}
        </View>
        <View style={{ flex: 1 }}>
          <View style={styles.tableHeaderRow}>
            <Text style={[styles.tableCellHeaderLeft, { flex: 2.4 }]}>Subject</Text>
            <Text style={[styles.tableCellHeader, { flex: 0.7 }]}>CA</Text>
            <Text style={[styles.tableCellHeader, { flex: 0.7 }]}>Exam</Text>
            <Text style={[styles.tableCellHeader, { flex: 0.8 }]}>Tot</Text>
            <Text style={[styles.tableCellHeader, { flex: 0.7 }]}>Gr</Text>
          </View>
          {rightSubjects.length === 0 ? (
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 1, textAlign: "center", paddingVertical: 12 }]}>—</Text>
            </View>
          ) : (
            rightSubjects.map((s, i) => <CompactSubjectRow key={s.id || i} subject={s} index={i} />)
          )}
        </View>
      </View>

      {/* Banner */}
      <View style={styles.bannerRow}>
        <View style={[styles.bannerCell, { borderLeftColor: primaryColor }]}>
          <Text style={styles.bannerLabel}>Total Obtained</Text>
          <Text style={styles.bannerValue}>
            {totalObtained} of {totalMax} ({percentage}%)
          </Text>
        </View>
        <View style={[styles.bannerCell, { borderLeftColor: primaryColor }]}>
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

      {/* Bottom pinned block */}
      <View style={styles.bottomBlock}>
        <View style={styles.traitsRow}>
          <View style={styles.traitsColumn}>
            <Text style={styles.sectionTitle}>Affective Traits</Text>
            <View style={styles.legendRow}>
              <Text style={styles.legendItem}>E = Excellent</Text>
              <Text style={styles.legendItem}>G = Good</Text>
              <Text style={styles.legendItem}>F = Fair</Text>
              <Text style={styles.legendItem}>P = Poor</Text>
            </View>
            {AFFECTIVE_TRAITS.map((t) => (
              <CheckboxGroup key={t} label={t} value={getRatingValue(data.affective_traits, t, "trait")} />
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
            {PSYCHOMOTOR_SKILLS.map((s) => (
              <CheckboxGroup key={s} label={s} value={getRatingValue(data.psychomotor_skills, s, "skill")} />
            ))}
          </View>
        </View>

        <View style={styles.remarksBlock}>
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
              <Text style={styles.signatureName}>{safeClass.teacher_name || " "}</Text>
              <Text style={styles.signatureTitle}>Class Teacher</Text>
            </View>
            <View style={styles.signatureBlock}>
              <View style={styles.signatureLine} />
              <Text style={styles.signatureName}>{formatDate(data.issued_date || new Date().toISOString())}</Text>
              <Text style={styles.signatureTitle}>Date</Text>
            </View>
            <View style={styles.signatureBlock}>
              {safeSchool.principal_signature_url ? (
                <Image src={safeSchool.principal_signature_url} style={styles.signatureImage} />
              ) : (
                <View style={{ height: 22 }} />
              )}
              <View style={styles.signatureLine} />
              <Text style={styles.signatureName}>{safeSchool.principal_name || "Principal"}</Text>
              <Text style={styles.signatureTitle}>Principal</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.footer} fixed>
        <Text>Issued {formatDate(data.issued_date || new Date().toISOString())}</Text>
        <Text>Powered by NexaForges</Text>
      </View>
    </Page>
  );
}
