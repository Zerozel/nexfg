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

  const midPoint = Math.ceil(safeSubjects.length / 2);
  const leftSubjects = safeSubjects.slice(0, midPoint);
  const rightSubjects = safeSubjects.slice(midPoint);

  const totalScore = safeSubjects.reduce((sum, s) => sum + (s.score || 0), 0);
  const totalMaxScore = safeSubjects.length * 100;
  const percentage = totalMaxScore > 0 ? ((totalScore / totalMaxScore) * 100).toFixed(1) : "0.0";

  const renderSubjectTable = (subjectsList: any[], isRight: boolean) => (
    <View style={[styles.tableCol, isRight ? { marginLeft: 6 } : {}]}>
      <View style={styles.tableHeaderRow}>
        <Text style={[styles.tableCell, styles.tableCellSubject]}>SUBJECT</Text>
        <Text style={styles.tableCell}>CA</Text>
        <Text style={styles.tableCell}>EXAM</Text>
        <Text style={[styles.tableCell, styles.tableCellBold]}>TOTAL</Text>
        <Text style={[styles.tableCell, styles.tableCellBold]}>GRADE</Text>
      </View>
      {subjectsList.map((subj, idx) => {
        const caTotal = (subj.ca1_score || 0) + (subj.ca2_score || 0) + (subj.ca3_score || 0);
        return (
          <View style={styles.tableRow} key={subj.id || idx}>
            <Text style={[styles.tableCell, styles.tableCellSubject]}>{subj.name || "Unknown"}</Text>
            <Text style={styles.tableCell}>{caTotal}</Text>
            <Text style={styles.tableCell}>{subj.exam_score || 0}</Text>
            <Text style={[styles.tableCell, styles.tableCellBold]}>{subj.score || 0}</Text>
            <Text style={[styles.tableCell, styles.tableCellBold]}>{subj.grade || "-"}</Text>
          </View>
        );
      })}
    </View>
  );

  return (
    <Page size="A4" style={styles.page}>
      {/* ── TOP CONTENT ── */}
      <View style={styles.header}>
        {safeSchool.logo_url && <Image src={safeSchool.logo_url} style={styles.logo} />}
        <Text style={styles.schoolName}>{safeSchool.name || "School Name"}</Text>
        {safeSchool.address && <Text style={styles.schoolContact}>{safeSchool.address}</Text>}
        {(safeSchool.phone || safeSchool.email) && (
          <Text style={styles.schoolContact}>{[safeSchool.phone, safeSchool.email].filter(Boolean).join(" | ")}</Text>
        )}
      </View>

      <View style={[styles.titleBanner, { backgroundColor: primaryColor }]}>
        <Text style={styles.titleText}>Student Report Card</Text>
      </View>

      <View style={{ marginBottom: 6 }}>
        <View style={styles.identityRow}>
          <Text style={styles.identityText}><Text style={styles.bold}>Name: </Text>{safeStudent.full_name || "Unknown"}</Text>
          <Text style={styles.identityText}><Text style={styles.bold}>Adm No: </Text>{safeStudent.admission_number || "N/A"}</Text>
        </View>
        <View style={styles.identityRow}>
          <Text style={styles.identityText}><Text style={styles.bold}>Class: </Text>{safeClass.name || "N/A"}</Text>
          <Text style={styles.identityText}><Text style={styles.bold}>Term: </Text>{safeTerm.name || "N/A"}</Text>
        </View>
        <View style={styles.identityRow}>
          <Text style={styles.identityText}><Text style={styles.bold}>Session: </Text>{safeTerm.academic_session || "N/A"}</Text>
          <Text style={styles.identityText}><Text style={styles.bold}>Date: </Text>{data.issued_date || "N/A"}</Text>
        </View>
      </View>

      <View style={styles.tableContainer}>
        {renderSubjectTable(leftSubjects, false)}
        {renderSubjectTable(rightSubjects, true)}
      </View>

      <View style={styles.bannerContainer}>
        <View style={styles.bannerCell}>
          <Text style={styles.bannerLabel}>Total</Text>
          <Text style={styles.bannerValue}>{totalScore} / {totalMaxScore} ({percentage}%)</Text>
        </View>
        <View style={styles.bannerCell}>
          <Text style={styles.bannerLabel}>Average</Text>
          <Text style={styles.bannerValue}>{safeAverage.toFixed(1)}%</Text>
        </View>
        <View style={styles.bannerCell}>
          <Text style={styles.bannerLabel}>Position</Text>
          <Text style={styles.bannerValue}>{safePosition} of {safeTotalStudents}</Text>
        </View>
      </View>

      {/* ── FLEX SPACER (Pushes everything below to the bottom) ── */}
      <View style={styles.spacer} />

      {/* ── BOTTOM CONTENT ── */}
      <View style={styles.bottomContainer}>
        <View style={styles.gridContainer}>
          <View style={styles.gridColumn}>
            <Text style={styles.sectionTitle}>Affective Traits</Text>
            <View style={styles.legendRow}>
              <Text>E=Excellent</Text><Text>G=Good</Text><Text>F=Fair</Text><Text>P=Poor</Text>
            </View>
            {AFFECTIVE_TRAITS.map((trait) => (
              <CheckboxGroup key={trait} label={trait} value={getRatingValue(data.affective_traits, trait, "trait")} />
            ))}
          </View>
          <View style={styles.gridColumn}>
            <Text style={styles.sectionTitle}>Psychomotor Skills</Text>
            <View style={styles.legendRow}>
              <Text>E=Excellent</Text><Text>G=Good</Text><Text>F=Fair</Text><Text>P=Poor</Text>
            </View>
            {PSYCHOMOTOR_SKILLS.map((skill) => (
              <CheckboxGroup key={skill} label={skill} value={getRatingValue(data.psychomotor_skills, skill, "skill")} />
            ))}
          </View>
        </View>

        <View style={{ marginBottom: 6 }}>
          <View style={styles.remarkRow}>
            <Text style={styles.remarkLabel}>Teacher's Remark:</Text>
            <Text style={styles.remarkValue}>{data.teacher_comment || ""}</Text>
          </View>
          <View style={styles.remarkRow}>
            <Text style={styles.remarkLabel}>Principal's Remark:</Text>
            <Text style={styles.remarkValue}>{data.principal_comment || ""}</Text>
          </View>
        </View>

        <View style={styles.signatureRow}>
          <View style={styles.signatureBlock}>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureLabel}>Class Teacher</Text>
          </View>
          <View style={styles.signatureBlock}>
            {safeSchool.principal_signature_url ? (
              <Image src={safeSchool.principal_signature_url} style={styles.signatureImage} />
            ) : (
              <View style={{ height: 20 }} />
            )}
            <View style={styles.signatureLine} />
            <Text style={styles.signatureLabel}>{safeSchool.principal_name || "Principal"}</Text>
          </View>
        </View>
      </View>

      {/* Footer pinned to bottom of page */}
      <Text style={styles.footer}>
        Generated by NexaForge • {new Date().toLocaleDateString()}
      </Text>
    </Page>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Batch Document
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
