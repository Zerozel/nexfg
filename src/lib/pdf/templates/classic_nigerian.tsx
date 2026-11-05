import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";
import type { IndividualReportCardData } from "@/types/printing";

// ─────────────────────────────────────────────────────────────────────────────
// Design tokens
// ─────────────────────────────────────────────────────────────────────────────
const COLOR = {
  black: "#111111",
  darkGrey: "#333333",
  midGrey: "#666666",
  softGrey: "#888888",
  ruleGrey: "#cccccc",
  lightGrey: "#e5e5e5",
  tableHeadBg: "#f3f4f6",
  zebraBg: "#fafafa",
  gradeA: "#15803d",
  gradeB: "#1d4ed8",
  gradeC: "#b45309",
  gradeD: "#c2410c",
  gradeF: "#b91c1c",
  white: "#ffffff",
} as const;

const PAGE = {
  marginX: 56,
  marginTop: 48,
  marginBottom: 48,
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// Types & Helpers
// ─────────────────────────────────────────────────────────────────────────────
type RatingValue = "Excellent" | "Good" | "Fair" | "Poor" | null;

const getRatingValue = (
  traits: any[] | null | undefined,
  targetName: string,
  key: "trait" | "skill"
): RatingValue => {
  if (!traits) return null;
  const found = traits.find(
    (t) => t[key]?.toLowerCase() === targetName.toLowerCase()
  );
  if (!found) return null;
  const val = found.rating?.toLowerCase();
  if (val === "excellent" || val === "a") return "Excellent";
  if (val === "good" || val === "b") return "Good";
  if (val === "fair" || val === "c") return "Fair";
  if (val === "poor" || val === "d" || val === "f") return "Poor";
  return null;
};

const AFFECTIVE_TRAITS = [
  "Punctuality", "Obedience", "Readiness to Help", "Self Control",
  "Courteousness", "Politeness", "Honesty", "Neatness", "Attentiveness",
];

const PSYCHOMOTOR_SKILLS = [
  "Handwriting", "Verbal Fluency", "Games/Sports", "Drawing & Painting",
  "Handling Tools", "Musical Skills",
];

function formatCell(v: number | null | undefined): string {
  if (v === null || v === undefined) return "—";
  return Number.isInteger(v) ? String(v) : v.toFixed(1);
}

function getOrdinal(n: number): string {
  if (!Number.isFinite(n) || n <= 0) return "—";
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

function hasBreakdown(subjects: any[]): boolean {
  return subjects.some(
    (s) =>
      s.ca1_score !== null ||
      s.ca2_score !== null ||
      s.ca3_score !== null ||
      s.exam_score !== null
  );
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
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

// ─────────────────────────────────────────────────────────────────────────────
// Styles (Merged from working ReportCardDocument + new traits/checkbox styles)
// ─────────────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  page: {
    paddingTop: PAGE.marginTop,
    paddingHorizontal: PAGE.marginX,
    paddingBottom: 130,
    fontFamily: "Helvetica",
    fontSize: 9,
    color: COLOR.black,
    backgroundColor: COLOR.white,
  },
  header: { alignItems: "center", marginBottom: 12 },
  logo: { width: 56, height: 56, marginBottom: 6, objectFit: "contain" },
  schoolName: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    textAlign: "center",
    marginBottom: 2,
  },
  motto: {
    fontSize: 8,
    fontStyle: "italic",
    color: COLOR.midGrey,
    textAlign: "center",
    marginBottom: 3,
  },
  contact: {
    fontSize: 7.5,
    color: COLOR.darkGrey,
    textAlign: "center",
  },
  titleBar: {
    paddingVertical: 6,
    marginBottom: 12,
    textAlign: "center",
  },
  titleBarText: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 2,
    textTransform: "uppercase",
    color: COLOR.white,
    textAlign: "center",
  },
  identity: {
    flexDirection: "row",
    borderTopWidth: 0.5,
    borderTopColor: COLOR.ruleGrey,
    borderBottomWidth: 0.5,
    borderBottomColor: COLOR.ruleGrey,
    paddingVertical: 8,
    marginBottom: 14,
  },
  identityColumn: { flex: 1, paddingRight: 8 },
  identityColumnLast: { flex: 1 },
  identityRow: { flexDirection: "row", marginBottom: 5 },
  identityRowLast: { flexDirection: "row" },
  identityLabel: {
    width: 62,
    fontFamily: "Helvetica-Bold",
    fontSize: 7,
    letterSpacing: 0.5,
    textTransform: "uppercase",
    color: COLOR.midGrey,
    paddingTop: 1,
  },
  identityValue: {
    flex: 1,
    fontSize: 9.5,
    fontFamily: "Helvetica-Bold",
    color: COLOR.black,
  },
  table: { marginBottom: 12 },
  tableHeaderRow: {
    flexDirection: "row",
    backgroundColor: COLOR.tableHeadBg,
    borderBottomWidth: 1.5,
    borderBottomColor: COLOR.black,
  },
  tableSubHeaderRow: {
    flexDirection: "row",
    backgroundColor: COLOR.tableHeadBg,
    borderBottomWidth: 1,
    borderBottomColor: COLOR.black,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: COLOR.ruleGrey,
    minHeight: 18,
  },
  tableRowZebra: { backgroundColor: COLOR.zebraBg },
  headerCell: {
    fontFamily: "Helvetica-Bold",
    fontSize: 7,
    letterSpacing: 0.4,
    textTransform: "uppercase",
    textAlign: "center",
    paddingHorizontal: 3,
    paddingVertical: 5,
    color: COLOR.darkGrey,
  },
  headerCellLeft: {
    fontFamily: "Helvetica-Bold",
    fontSize: 7,
    letterSpacing: 0.4,
    textTransform: "uppercase",
    textAlign: "left",
    paddingHorizontal: 3,
    paddingVertical: 5,
    color: COLOR.darkGrey,
  },
  cell: {
    fontSize: 8.5,
    paddingHorizontal: 4,
    paddingVertical: 4,
    color: COLOR.black,
  },
  cellCenter: { textAlign: "center" },
  cellRight: { textAlign: "right" },
  cellMuted: { color: COLOR.midGrey },
  cellBold: { fontFamily: "Helvetica-Bold" },
  banner: { flexDirection: "row", marginBottom: 12 },
  bannerItem: {
    flex: 1,
    paddingLeft: 8,
    paddingVertical: 4,
    marginRight: 6,
    borderLeftWidth: 3,
  },
  bannerItemLast: {
    flex: 1,
    paddingLeft: 8,
    paddingVertical: 4,
    borderLeftWidth: 3,
  },
  bannerLabel: {
    fontSize: 7,
    letterSpacing: 0.6,
    textTransform: "uppercase",
    color: COLOR.midGrey,
    marginBottom: 3,
  },
  bannerValue: {
    fontSize: 15,
    fontFamily: "Helvetica-Bold",
    color: COLOR.black,
  },
  sectionLabel: {
    fontSize: 7.5,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 1,
    textTransform: "uppercase",
    color: COLOR.midGrey,
    borderBottomWidth: 0.5,
    borderBottomColor: COLOR.ruleGrey,
    paddingBottom: 3,
    marginBottom: 6,
  },
  traitsRow: { flexDirection: "row", marginBottom: 12 },
  traitsCol: { flex: 1, marginRight: 12 },
  traitsColLast: { flex: 1 },
  traitRow: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 0.5,
    borderBottomColor: COLOR.ruleGrey,
    paddingVertical: 3,
  },
  traitLabel: { flex: 2, fontSize: 8, color: COLOR.black },
  
  // Checkbox specific styles
  checkboxGroup: { flexDirection: "row", gap: 4, flex: 1, justifyContent: "flex-end" },
  checkbox: {
    width: 8,
    height: 8,
    borderWidth: 0.8,
    borderColor: COLOR.black,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 2,
  },
  checkboxInner: { width: 4, height: 4, backgroundColor: COLOR.black },
  checkboxLabel: { fontSize: 7, marginRight: 4, color: COLOR.darkGrey },
  legendRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginBottom: 4,
    fontSize: 6.5,
    color: COLOR.midGrey,
  },

  comment: { marginBottom: 12 },
  commentLabel: {
    fontSize: 7.5,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    color: COLOR.midGrey,
    borderBottomWidth: 0.5,
    borderBottomColor: COLOR.ruleGrey,
    paddingBottom: 3,
    marginBottom: 4,
  },
  commentText: {
    fontSize: 8.5,
    lineHeight: 1.4,
    color: COLOR.black,
  },
  signatureBlock: {
    position: "absolute",
    bottom: 42,
    left: PAGE.marginX,
    right: PAGE.marginX,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 8,
    borderTopWidth: 0.5,
    borderTopColor: COLOR.ruleGrey,
  },
  signatureItem: { width: "30%", alignItems: "center" },
  signatureImage: {
    width: 90,
    height: 26,
    objectFit: "contain",
    marginBottom: 2,
  },
  signatureLine: {
    width: "100%",
    borderBottomWidth: 0.75,
    borderBottomColor: COLOR.black,
    height: 22,
    marginBottom: 2,
  },
  signatureName: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    textAlign: "center",
    color: COLOR.black,
    marginBottom: 1,
  },
  signatureTitle: {
    fontSize: 6.5,
    letterSpacing: 0.5,
    textTransform: "uppercase",
    color: COLOR.midGrey,
    textAlign: "center",
  },
  footer: {
    position: "absolute",
    bottom: 16,
    left: PAGE.marginX,
    right: PAGE.marginX,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 6.5,
    color: COLOR.softGrey,
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────
function CheckboxGroup({ label, value }: { label: string; value: RatingValue }) {
  return (
    <View style={styles.traitRow}>
      <Text style={styles.traitLabel}>{label}</Text>
      <View style={styles.checkboxGroup}>
        {(["Excellent", "Good", "Fair", "Poor"] as const).map((opt) => (
          <View key={opt} style={{ flexDirection: "row", alignItems: "center" }}>
            <View style={styles.checkbox}>
              {value === opt && <View style={styles.checkboxInner} />}
            </View>
            <Text style={styles.checkboxLabel}>{opt.charAt(0)}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// The Page Component
// ─────────────────────────────────────────────────────────────────────────────
export function ClassicNigerianPage({ data }: { data: IndividualReportCardData }) {
  const safeSchool = data?.school || ({} as any);
  const safeStudent = data?.student || ({} as any);
  const safeClass = data?.class || ({} as any);
  const safeTerm = data?.term || ({} as any);
  const safeSubjects = Array.isArray(data?.subjects) ? data.subjects : [];
  const safeOverall = data?.overall || ({} as any);
  
  const primaryColor = safeSchool.primary_color || "#1e40af";
  const safeAverage = typeof safeOverall.average === "number" ? safeOverall.average : 0;
  const safePosition = typeof safeOverall.position === "number" ? safeOverall.position : 0;
  const safeTotalStudents = typeof safeOverall.total_students === "number" ? safeOverall.total_students : 0;

  const showBreakdown = hasBreakdown(safeSubjects);
  const contactParts = [safeSchool.address, safeSchool.phone, safeSchool.email].filter(Boolean);

  const caCount = (safeSchool as any).ca_count ?? 2;
  const hasCA3 = caCount >= 3;
  const caSpanFlex = (hasCA3 ? 3 : 2) * 1.2;
  const caCellFlex = 1.2;

  const midPoint = Math.ceil(safeSubjects.length / 2);
  const leftSubjects = safeSubjects.slice(0, midPoint);
  const rightSubjects = safeSubjects.slice(midPoint);

  const totalScore = safeSubjects.reduce((sum, s) => sum + (s.score || 0), 0);
  const totalMaxScore = safeSubjects.length * 100;
  const percentage = totalMaxScore > 0 ? ((totalScore / totalMaxScore) * 100).toFixed(1) : "0.0";

  const renderSubjectTable = (subjectsList: any[], isRight: boolean) => (
    <View style={{ flex: 1, marginRight: isRight ? 0 : 8 }}>
      <View style={[styles.tableHeaderRow, { borderBottomWidth: 1.5 }]}>
        <Text style={[styles.headerCellLeft, { flex: 3.4 }]}>Subject</Text>
        <Text style={[styles.headerCell, { flex: caSpanFlex }]}>CA</Text>
        <Text style={[styles.headerCell, { flex: 1.2 }]}>Exam</Text>
        <Text style={[styles.headerCell, { flex: 1.2 }]}>Total</Text>
        <Text style={[styles.headerCell, { flex: 1.1 }]}>Grade</Text>
      </View>

      {showBreakdown && (
        <View style={styles.tableSubHeaderRow}>
          <Text style={[styles.headerCell, { flex: 3.4 }]} />
          <Text style={[styles.headerCell, { flex: caCellFlex }]}>CA1</Text>
          <Text style={[styles.headerCell, { flex: caCellFlex }]}>CA2</Text>
          {hasCA3 && <Text style={[styles.headerCell, { flex: caCellFlex }]}>CA3</Text>}
          <Text style={[styles.headerCell, { flex: 1.2 }]} />
          <Text style={[styles.headerCell, { flex: 1.2 }]} />
          <Text style={[styles.headerCell, { flex: 1.1 }]} />
        </View>
      )}

      {subjectsList.length > 0 ? (
        subjectsList.map((subj, idx) => (
          <View style={[styles.tableRow, idx % 2 === 1 ? styles.tableRowZebra : {}]} key={subj.id || idx} wrap={false}>
            {showBreakdown ? (
              <>
                <Text style={[styles.cell, { flex: 3.4 }]}>{subj.name || "Unknown"}</Text>
                <Text style={[styles.cell, styles.cellCenter, { flex: caCellFlex }]}>{formatCell(subj.ca1_score)}</Text>
                <Text style={[styles.cell, styles.cellCenter, { flex: caCellFlex }]}>{formatCell(subj.ca2_score)}</Text>
                {hasCA3 && <Text style={[styles.cell, styles.cellCenter, { flex: caCellFlex }]}>{formatCell(subj.ca3_score)}</Text>}
                <Text style={[styles.cell, styles.cellCenter, { flex: 1.2 }]}>{formatCell(subj.exam_score)}</Text>
                <Text style={[styles.cell, styles.cellBold, styles.cellCenter, { flex: 1.2 }]}>{Number(subj.score || 0).toFixed(1)}</Text>
                <Text style={[styles.cell, styles.cellBold, styles.cellCenter, { flex: 1.1, color: gradeColor(subj.grade) }]}>{subj.grade || "—"}</Text>
              </>
            ) : (
              <>
                <Text style={[styles.cell, { flex: 3.4 }]}>{subj.name || "Unknown"}</Text>
                <Text style={[styles.cell, styles.cellBold, styles.cellCenter, { flex: 1.2 }]}>{Number(subj.score || 0).toFixed(1)}</Text>
                <Text style={[styles.cell, styles.cellBold, styles.cellCenter, { flex: 1.1, color: gradeColor(subj.grade) }]}>{subj.grade || "—"}</Text>
              </>
            )}
          </View>
        ))
      ) : (
        <View style={styles.tableRow}>
          <Text style={[styles.cell, styles.cellCenter, { flex: 1, paddingVertical: 14 }]}>No subjects</Text>
        </View>
      )}
    </View>
  );

  return (
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        {safeSchool.logo_url ? <Image src={safeSchool.logo_url} style={styles.logo} /> : null}
        <Text style={[styles.schoolName, { color: primaryColor }]}>{safeSchool.name || "School Name"}</Text>
        {safeSchool.motto ? <Text style={styles.motto}>{safeSchool.motto}</Text> : null}
        {contactParts.length > 0 ? <Text style={styles.contact}>{contactParts.join("   ·   ")}</Text> : null}
      </View>

      <View style={[styles.titleBar, { backgroundColor: primaryColor }]}>
        <Text style={styles.titleBarText}>Student Report Card</Text>
      </View>

      <View style={styles.identity}>
        <View style={styles.identityColumn}>
          <View style={styles.identityRow}>
            <Text style={styles.identityLabel}>Student</Text>
            <Text style={styles.identityValue}>{safeStudent.full_name || "Unknown"}</Text>
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
            <Text style={styles.identityValue}>{safeTerm.name || "—"}{safeTerm.academic_session ? `  ·  ${safeTerm.academic_session}` : ""}</Text>
          </View>
        </View>
      </View>

      <View style={{ flexDirection: "row", marginBottom: 12 }}>
        {renderSubjectTable(leftSubjects, false)}
        {renderSubjectTable(rightSubjects, true)}
      </View>

      <View style={styles.banner}>
        <View style={[styles.bannerItem, { borderLeftColor: primaryColor }]}>
          <Text style={styles.bannerLabel}>Total Obtained</Text>
          <Text style={styles.bannerValue}>{totalScore} of {totalMaxScore} ({percentage}%)</Text>
        </View>
        <View style={[styles.bannerItem, { borderLeftColor: primaryColor }]}>
          <Text style={styles.bannerLabel}>Average</Text>
          <Text style={styles.bannerValue}>{safeAverage.toFixed(1)}%</Text>
        </View>
        <View style={[styles.bannerItemLast, { borderLeftColor: primaryColor }]}>
          <Text style={styles.bannerLabel}>Position</Text>
          <Text style={styles.bannerValue}>{getOrdinal(safePosition)} of {safeTotalStudents}</Text>
        </View>
      </View>

      <View style={styles.traitsRow} wrap={false}>
        <View style={styles.traitsCol}>
          <Text style={styles.sectionLabel}>Affective Traits</Text>
          <View style={styles.legendRow}>
            <Text>E = Excellent</Text><Text>G = Good</Text><Text>F = Fair</Text><Text>P = Poor</Text>
          </View>
          {AFFECTIVE_TRAITS.map((trait) => (
            <CheckboxGroup key={trait} label={trait} value={getRatingValue(data.affective_traits, trait, "trait")} />
          ))}
        </View>
        <View style={styles.traitsColLast}>
          <Text style={styles.sectionLabel}>Psychomotor Skills</Text>
          <View style={styles.legendRow}>
            <Text>E = Excellent</Text><Text>G = Good</Text><Text>F = Fair</Text><Text>P = Poor</Text>
          </View>
          {PSYCHOMOTOR_SKILLS.map((skill) => (
            <CheckboxGroup key={skill} label={skill} value={getRatingValue(data.psychomotor_skills, skill, "skill")} />
          ))}
        </View>
      </View>

      <View style={styles.comment} wrap={false}>
        <Text style={styles.commentLabel}>Class Teacher's Remark</Text>
        <Text style={styles.commentText}>{data.teacher_comment || "—"}</Text>
      </View>
      <View style={styles.comment} wrap={false}>
        <Text style={styles.commentLabel}>Principal's Remark</Text>
        <Text style={styles.commentText}>{data.principal_comment || "—"}</Text>
      </View>

      <View style={styles.signatureBlock}>
        {safeClass.teacher_name && (
          <View style={styles.signatureItem}>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureName}>{safeClass.teacher_name}</Text>
            <Text style={styles.signatureTitle}>Class Teacher</Text>
          </View>
        )}
        <View style={styles.signatureItem}>
          <View style={styles.signatureLine} />
          <Text style={styles.signatureName}>{formatDate(data.issued_date || new Date().toISOString())}</Text>
          <Text style={styles.signatureTitle}>Date</Text>
        </View>
        {safeSchool.principal_name && (
          <View style={styles.signatureItem}>
            {safeSchool.principal_signature_url ? <Image src={safeSchool.principal_signature_url} style={styles.signatureImage} /> : null}
            <View style={styles.signatureLine} />
            <Text style={styles.signatureName}>{safeSchool.principal_name}</Text>
            <Text style={styles.signatureTitle}>Principal</Text>
          </View>
        )}
      </View>

      <View style={styles.footer} fixed>
        <Text>Issued {formatDate(data.issued_date || new Date().toISOString())}</Text>
        <Text>Powered by NexaForges</Text>
      </View>
    </Page>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// The Batch Document
// ─────────────────────────────────────────────────────────────────────────────
export function ClassicNigerianBatchDocument({ students }: { students: IndividualReportCardData[] }) {
  return (
    <Document>
      {students.map((student, i) => (
        <ClassicNigerianPage key={student.student?.id || i} data={student} />
      ))}
    </Document>
  );
}
