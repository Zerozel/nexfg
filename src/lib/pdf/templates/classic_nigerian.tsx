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

// Define the schema for the trait ratings as stored in DB
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
  "Games/Sports",
  "Drawing & Painting",
  "Handling Tools",
  "Musical Skills",
];

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 9,
    fontFamily: "Helvetica",
    color: "#000",
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: "#000",
    paddingBottom: 5,
  },
  schoolLogo: {
    width: 50,
    height: 50,
    marginBottom: 4,
  },
  schoolName: {
    fontSize: 16,
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 2,
  },
  schoolAddress: {
    fontSize: 8,
    marginBottom: 1,
  },
  titleBanner: {
    paddingVertical: 4,
    alignItems: "center",
    marginBottom: 10,
  },
  titleText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "bold",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  identityRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  identityText: {
    fontSize: 9,
  },
  bold: {
    fontWeight: "bold",
  },
  table: {
    width: "100%",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#000",
    marginBottom: 10,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    alignItems: "center",
    minHeight: 16,
  },
  tableHeader: {
    backgroundColor: "#f0f0f0",
    fontWeight: "bold",
  },
  tableCell: {
    flex: 1,
    paddingVertical: 3,
    paddingHorizontal: 2,
    textAlign: "center",
    borderRightWidth: 1,
    borderRightColor: "#000",
    fontSize: 8,
  },
  tableCellSubject: {
    flex: 2,
    textAlign: "left",
    paddingLeft: 4,
  },
  bannerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    gap: 5,
  },
  bannerCell: {
    flex: 1,
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#000",
    padding: 5,
    alignItems: "center",
  },
  bannerLabel: {
    fontSize: 7,
    textTransform: "uppercase",
    marginBottom: 2,
    color: "#555",
  },
  bannerValue: {
    fontSize: 12,
    fontWeight: "bold",
  },
  gridContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  gridColumn: {
    width: "48%",
  },
  sectionTitle: {
    fontSize: 9,
    fontWeight: "bold",
    textTransform: "uppercase",
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    marginBottom: 4,
    paddingBottom: 2,
  },
  traitRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 3,
  },
  traitLabel: {
    width: 80,
    fontSize: 8,
  },
  checkboxGroup: {
    flexDirection: "row",
    gap: 4,
    flex: 1,
  },
  checkbox: {
    width: 7,
    height: 7,
    borderWidth: 1,
    borderColor: "#000",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 2,
  },
  checkboxInner: {
    width: 4,
    height: 4,
    backgroundColor: "#000",
  },
  checkboxLabel: {
    fontSize: 7,
    marginRight: 4,
  },
  legendRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    marginBottom: 5,
    fontSize: 7,
  },
  remarksContainer: {
    marginBottom: 10,
  },
  remarkRow: {
    flexDirection: "row",
    marginBottom: 4,
    alignItems: "flex-start",
  },
  remarkLabel: {
    width: 100,
    fontWeight: "bold",
    fontSize: 8,
  },
  remarkValue: {
    flex: 1,
    fontSize: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    borderStyle: "dotted",
    minHeight: 12,
  },
  signatureRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
    alignItems: "flex-end",
  },
  signatureBlock: {
    width: "40%",
    alignItems: "center",
  },
  signatureLine: {
    width: "100%",
    borderTopWidth: 1,
    borderTopColor: "#000",
    marginBottom: 2,
    marginTop: 15,
  },
  signatureLabel: {
    fontSize: 7,
    textTransform: "uppercase",
  },
  signatureImage: {
    height: 25,
    width: 60,
    objectFit: "contain",
    marginBottom: 2,
  },
  footer: {
    position: "absolute",
    bottom: 15,
    left: 30,
    right: 30,
    textAlign: "center",
    fontSize: 7,
    color: "#888",
    borderTopWidth: 1,
    borderTopColor: "#ccc",
    paddingTop: 4,
  },
});

function CheckboxGroup({
  label,
  value,
}: {
  label: string;
  value: RatingValue;
}) {
  return (
    <View style={styles.traitRow}>
      <Text style={styles.traitLabel}>{label}</Text>
      <View style={styles.checkboxGroup}>
        {(["Excellent", "Good", "Fair", "Poor"] as const).map((opt) => (
          <View
            key={opt}
            style={{ flexDirection: "row", alignItems: "center" }}
          >
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

export function ClassicNigerianDocument({
  data,
}: {
  data: IndividualReportCardData;
}) {
  const { school, student, class: classInfo, term, subjects, overall } = data;
  const primaryColor = school.primary_color || "#000";

  // Split subjects into two columns for compactness
  const midPoint = Math.ceil(subjects.length / 2);
  const leftSubjects = subjects.slice(0, midPoint);
  const rightSubjects = subjects.slice(midPoint);

  const totalScore = subjects.reduce((sum, s) => sum + s.score, 0);
  const totalMaxScore = subjects.length * 100;
  const percentage =
    totalMaxScore > 0 ? ((totalScore / totalMaxScore) * 100).toFixed(1) : "0.0";

  const renderSubjectTable = (subjectsList: any[], isRight: boolean) => (
    <View style={{ flex: 1, marginRight: isRight ? 0 : 4 }}>
      <View style={[styles.tableRow, styles.tableHeader]}>
        <Text style={[styles.tableCell, styles.tableCellSubject]}>SUBJECT</Text>
        <Text style={styles.tableCell}>CA</Text>
        <Text style={styles.tableCell}>EXAM</Text>
        <Text style={styles.tableCell}>TOTAL</Text>
        <Text style={styles.tableCell}>GRADE</Text>
      </View>
      {subjectsList.map((subj, idx) => {
        const caTotal =
          (subj.ca1_score || 0) + (subj.ca2_score || 0) + (subj.ca3_score || 0);
        return (
          <View style={styles.tableRow} key={subj.id || idx}>
            <Text style={[styles.tableCell, styles.tableCellSubject]}>
              {subj.name}
            </Text>
            <Text style={styles.tableCell}>{caTotal}</Text>
            <Text style={styles.tableCell}>{subj.exam_score || 0}</Text>
            <Text style={[styles.tableCell, styles.bold]}>{subj.score}</Text>
            <Text style={[styles.tableCell, styles.bold]}>{subj.grade}</Text>
          </View>
        );
      })}
    </View>
  );

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* ── Header ── */}
        <View style={styles.headerContainer}>
          {school.logo_url && (
            <Image src={school.logo_url} style={styles.schoolLogo} />
          )}
          <Text style={styles.schoolName}>{school.name}</Text>
          {school.address && (
            <Text style={styles.schoolAddress}>{school.address}</Text>
          )}
          {(school.phone || school.email) && (
            <Text style={styles.schoolAddress}>
              {[school.phone, school.email].filter(Boolean).join(" | ")}
            </Text>
          )}
        </View>

        {/* ── Title Banner ── */}
        <View style={[styles.titleBanner, { backgroundColor: primaryColor }]}>
          <Text style={styles.titleText}>Student Report Card</Text>
        </View>

        {/* ── Identity Block ── */}
        <View style={{ marginBottom: 8 }}>
          <View style={styles.identityRow}>
            <Text style={styles.identityText}>
              <Text style={styles.bold}>Name: </Text>
              {student.full_name}
            </Text>
            <Text style={styles.identityText}>
              <Text style={styles.bold}>Admission No: </Text>
              {student.admission_number || "N/A"}
            </Text>
          </View>
          <View style={styles.identityRow}>
            <Text style={styles.identityText}>
              <Text style={styles.bold}>Class: </Text>
              {classInfo.name}
            </Text>
            <Text style={styles.identityText}>
              <Text style={styles.bold}>Term: </Text>
              {term.name}
            </Text>
          </View>
          <View style={styles.identityRow}>
            <Text style={styles.identityText}>
              <Text style={styles.bold}>Session: </Text>
              {term.academic_session}
            </Text>
            <Text style={styles.identityText}>
              <Text style={styles.bold}>Date Issued: </Text>
              {data.issued_date}
            </Text>
          </View>
        </View>

        {/* ── Subject Tables (Two Columns) ── */}
        <View style={{ flexDirection: "row", marginBottom: 8 }}>
          {renderSubjectTable(leftSubjects, false)}
          {renderSubjectTable(rightSubjects, true)}
        </View>

        {/* ── Overall Banner ── */}
        <View style={styles.bannerContainer}>
          <View style={styles.bannerCell}>
            <Text style={styles.bannerLabel}>Total Obtained</Text>
            <Text style={styles.bannerValue}>
              {totalScore} of {totalMaxScore} ({percentage}%)
            </Text>
          </View>
          <View style={styles.bannerCell}>
            <Text style={styles.bannerLabel}>Average</Text>
            <Text style={styles.bannerValue}>{overall.average.toFixed(1)}%</Text>
          </View>
          <View style={styles.bannerCell}>
            <Text style={styles.bannerLabel}>Position</Text>
            <Text style={styles.bannerValue}>
              {overall.position} of {overall.total_students}
            </Text>
          </View>
        </View>

        {/* ── Affective & Psychomotor Grid ── */}
        <View style={styles.gridContainer}>
          {/* Affective Traits */}
          <View style={styles.gridColumn}>
            <Text style={styles.sectionTitle}>Affective Traits</Text>
            <View style={styles.legendRow}>
              <Text>E = Excellent</Text>
              <Text>G = Good</Text>
              <Text>F = Fair</Text>
              <Text>P = Poor</Text>
            </View>
            {AFFECTIVE_TRAITS.map((trait) => (
              <CheckboxGroup
                key={trait}
                label={trait}
                value={getRatingValue(
                  data.affective_traits,
                  trait,
                  "trait"
                )}
              />
            ))}
          </View>

          {/* Psychomotor Skills */}
          <View style={styles.gridColumn}>
            <Text style={styles.sectionTitle}>Psychomotor Skills</Text>
            <View style={styles.legendRow}>
              <Text>E = Excellent</Text>
              <Text>G = Good</Text>
              <Text>F = Fair</Text>
              <Text>P = Poor</Text>
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

        {/* ── Remarks ── */}
        <View style={styles.remarksContainer}>
          <View style={styles.remarkRow}>
            <Text style={styles.remarkLabel}>Class Teacher's Remark:</Text>
            <Text style={styles.remarkValue}>
              {data.teacher_comment || ""}
            </Text>
          </View>
          <View style={styles.remarkRow}>
            <Text style={styles.remarkLabel}>Principal's Remark:</Text>
            <Text style={styles.remarkValue}>
              {data.principal_comment || ""}
            </Text>
          </View>
        </View>

        {/* ── Signatures ── */}
        <View style={styles.signatureRow}>
          <View style={styles.signatureBlock}>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureLabel}>Class Teacher</Text>
          </View>
          <View style={styles.signatureBlock}>
            {school.principal_signature_url ? (
              <Image
                src={school.principal_signature_url}
                style={styles.signatureImage}
              />
            ) : (
              <View style={{ height: 25 }} />
            )}
            <View style={styles.signatureLine} />
            <Text style={styles.signatureLabel}>
              {school.principal_name || "Principal"}
            </Text>
          </View>
        </View>

        {/* ── Footer ── */}
        <Text style={styles.footer}>
          Generated by NexaForge • {new Date().toLocaleDateString()}
        </Text>
      </Page>
    </Document>
  );
}
