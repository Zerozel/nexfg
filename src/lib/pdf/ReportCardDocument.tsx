import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
} from "@react-pdf/renderer";
import type {
  IndividualReportCardData,
  SubjectResult,
} from "@/types/printing";

/**
 * Report card PDF — one Page per student.
 *
 * Design principles:
 *   - Reads beautifully in pure black-and-white.
 *   - School primary color used only as an accent (title bar, banner borders,
 *     table header underline) — never as a large background.
 *   - Deterministic layout: all widths explicit, no flex-wrap.
 *   - Signature + date pinned to the bottom of every page regardless of
 *     content length, so short cards don't leave an awkward gap.
 *
 * CA count: schools on 2 CAs render CA1 + CA2 + Exam. Schools on 3 CAs
 * render CA1 + CA2 + CA3 + Exam. Driven by `school.ca_count`.
 */

// ═══════════════════════════════════════════════════════════════════════════
// Design tokens
// ═══════════════════════════════════════════════════════════════════════════

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

// ═══════════════════════════════════════════════════════════════════════════
// Styles (unchanged)
// ═══════════════════════════════════════════════════════════════════════════

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
  logo: {
    width: 56,
    height: 56,
    marginBottom: 6,
    objectFit: "contain",
  },
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
  attendanceRow: { flexDirection: "row", marginBottom: 12 },
  traitsRow: { flexDirection: "row", marginBottom: 12 },
  traitsCol: { flex: 1, marginRight: 12 },
  traitsColLast: { flex: 1 },
  traitRow: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: COLOR.ruleGrey,
    paddingVertical: 3,
  },
  traitRowLast: { flexDirection: "row", paddingVertical: 3 },
  traitName: { flex: 2, fontSize: 8, color: COLOR.black },
  traitRating: {
    flex: 1,
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    textAlign: "right",
    color: COLOR.darkGrey,
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

// ═══════════════════════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════════════════════

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

function hasBreakdown(subjects: SubjectResult[]): boolean {
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

// ═══════════════════════════════════════════════════════════════════════════
// Page
// ═══════════════════════════════════════════════════════════════════════════

export function ReportCardPage({ data }: { data: IndividualReportCardData }) {
  const { school, student, class: classInfo, term, subjects, overall } = data;

  // CA count drives column layout. Defaults to 2 if the school record
  // doesn't have ca_count set yet.
  const caCount = (school as any).ca_count ?? 2;
  const hasCA3 = caCount >= 3;

  // Show breakdown if any subject has CA or Exam scores (this is what
  // decides between the detailed table and the compact "score only" table).
  const showBreakdown = hasBreakdown(subjects);

  const primaryColor = school.primary_color || "#1e40af";

  const contactParts = [school.address, school.phone, school.email].filter(
    Boolean
  );

  // Flex weights for CA columns depend on whether CA3 is shown.
  // 3 CA: 1.2 / 1.2 / 1.2 (three equal CA cells)
  // 2 CA: 1.2 / 1.2 (two equal CA cells)
  // The "Continuous Assessment" header spans 2 or 3, so its flex
  // is caCount * 1.2.
  const caSpanFlex = (hasCA3 ? 3 : 2) * 1.2;
  const caCellFlex = 1.2;

  return (
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        {school.logo_url ? (
          <Image src={school.logo_url} style={styles.logo} />
        ) : null}
        <Text style={[styles.schoolName, { color: primaryColor }]}>
          {school.name}
        </Text>
        {school.motto ? <Text style={styles.motto}>{school.motto}</Text> : null}
        {contactParts.length > 0 ? (
          <Text style={styles.contact}>{contactParts.join("   ·   ")}</Text>
        ) : null}
      </View>

      {/* Title bar */}
      <View style={[styles.titleBar, { backgroundColor: primaryColor }]}>
        <Text style={styles.titleBarText}>Student Report Card</Text>
      </View>

      {/* Student identity */}
      <View style={styles.identity}>
        <View style={styles.identityColumn}>
          <View style={styles.identityRow}>
            <Text style={styles.identityLabel}>Student</Text>
            <Text style={styles.identityValue}>{student.full_name}</Text>
          </View>
          <View style={styles.identityRowLast}>
            <Text style={styles.identityLabel}>Adm. No.</Text>
            <Text style={styles.identityValue}>
              {student.admission_number || "—"}
            </Text>
          </View>
        </View>
        <View style={styles.identityColumnLast}>
          <View style={styles.identityRow}>
            <Text style={styles.identityLabel}>Class</Text>
            <Text style={styles.identityValue}>{classInfo.name}</Text>
          </View>
          <View style={styles.identityRowLast}>
            <Text style={styles.identityLabel}>Term</Text>
            <Text style={styles.identityValue}>
              {term.name}
              {term.academic_session ? `  ·  ${term.academic_session}` : ""}
            </Text>
          </View>
        </View>
      </View>

      {/* Subject table */}
      <View style={styles.table}>
        <View style={styles.tableHeaderRow} fixed>
          {showBreakdown ? (
            <>
              <Text style={[styles.headerCellLeft, { flex: 3.4 }]}>Subject</Text>
              <Text style={[styles.headerCell, { flex: caSpanFlex }]}>
                Continuous Assessment
              </Text>
              <Text style={[styles.headerCell, { flex: 1.2 }]}>Exam</Text>
              <Text style={[styles.headerCell, { flex: 1.2 }]}>Total</Text>
              <Text style={[styles.headerCell, { flex: 1.1 }]}>Grade</Text>
              <Text style={[styles.headerCell, { flex: 1 }]}>Pos</Text>
              <Text style={[styles.headerCell, { flex: 2.3 }]}>Remarks</Text>
            </>
          ) : (
            <>
              <Text style={[styles.headerCellLeft, { flex: 4 }]}>Subject</Text>
              <Text style={[styles.headerCell, { flex: 1.6 }]}>Score</Text>
              <Text style={[styles.headerCell, { flex: 1.2 }]}>Grade</Text>
              <Text style={[styles.headerCell, { flex: 1.6 }]}>Position</Text>
              <Text style={[styles.headerCell, { flex: 3.4 }]}>Remarks</Text>
            </>
          )}
        </View>

        {/* Sub-header row: CA1, CA2, [CA3] */}
        {showBreakdown && (
          <View style={styles.tableSubHeaderRow}>
            <Text style={[styles.headerCell, { flex: 3.4 }]} />
            <Text style={[styles.headerCell, { flex: caCellFlex }]}>CA1</Text>
            <Text style={[styles.headerCell, { flex: caCellFlex }]}>CA2</Text>
            {hasCA3 && (
              <Text style={[styles.headerCell, { flex: caCellFlex }]}>CA3</Text>
            )}
            <Text style={[styles.headerCell, { flex: 1.2 }]} />
            <Text style={[styles.headerCell, { flex: 1.2 }]} />
            <Text style={[styles.headerCell, { flex: 1.1 }]} />
            <Text style={[styles.headerCell, { flex: 1 }]} />
            <Text style={[styles.headerCell, { flex: 2.3 }]} />
          </View>
        )}

        {/* Body rows */}
        {subjects.length > 0 ? (
          subjects.map((subject, idx) => (
            <View
              key={subject.id}
              style={[
                styles.tableRow,
                idx % 2 === 1 ? styles.tableRowZebra : {},
              ]}
              wrap={false}
            >
              {showBreakdown ? (
                <>
                  <Text style={[styles.cell, { flex: 3.4 }]}>
                    {subject.name}
                  </Text>
                  <Text
                    style={[styles.cell, styles.cellCenter, { flex: caCellFlex }]}
                  >
                    {formatCell(subject.ca1_score)}
                  </Text>
                  <Text
                    style={[styles.cell, styles.cellCenter, { flex: caCellFlex }]}
                  >
                    {formatCell(subject.ca2_score)}
                  </Text>
                  {hasCA3 && (
                    <Text
                      style={[
                        styles.cell,
                        styles.cellCenter,
                        { flex: caCellFlex },
                      ]}
                    >
                      {formatCell(subject.ca3_score)}
                    </Text>
                  )}
                  <Text
                    style={[styles.cell, styles.cellCenter, { flex: 1.2 }]}
                  >
                    {formatCell(subject.exam_score)}
                  </Text>
                  <Text
                    style={[
                      styles.cell,
                      styles.cellBold,
                      styles.cellCenter,
                      { flex: 1.2 },
                    ]}
                  >
                    {subject.score.toFixed(1)}
                  </Text>
                  <Text
                    style={[
                      styles.cell,
                      styles.cellBold,
                      styles.cellCenter,
                      {
                        flex: 1.1,
                        color: gradeColor(subject.grade),
                      },
                    ]}
                  >
                    {subject.grade || "—"}
                  </Text>
                  <Text
                    style={[
                      styles.cell,
                      styles.cellCenter,
                      styles.cellMuted,
                      { flex: 1 },
                    ]}
                  >
                    {subject.subject_position
                      ? getOrdinal(subject.subject_position)
                      : "—"}
                  </Text>
                  <Text style={[styles.cell, { flex: 2.3 }]}>
                    {subject.remarks || "—"}
                  </Text>
                </>
              ) : (
                <>
                  <Text style={[styles.cell, { flex: 4 }]}>
                    {subject.name}
                  </Text>
                  <Text
                    style={[
                      styles.cell,
                      styles.cellBold,
                      styles.cellCenter,
                      { flex: 1.6 },
                    ]}
                  >
                    {subject.score.toFixed(1)}
                  </Text>
                  <Text
                    style={[
                      styles.cell,
                      styles.cellBold,
                      styles.cellCenter,
                      {
                        flex: 1.2,
                        color: gradeColor(subject.grade),
                      },
                    ]}
                  >
                    {subject.grade || "—"}
                  </Text>
                  <Text
                    style={[
                      styles.cell,
                      styles.cellCenter,
                      styles.cellMuted,
                      { flex: 1.6 },
                    ]}
                  >
                    {subject.subject_position
                      ? getOrdinal(subject.subject_position)
                      : "—"}
                  </Text>
                  <Text style={[styles.cell, { flex: 3.4 }]}>
                    {subject.remarks || "—"}
                  </Text>
                </>
              )}
            </View>
          ))
        ) : (
          <View style={styles.tableRow}>
            <Text
              style={[
                styles.cell,
                styles.cellCenter,
                { flex: 1, paddingVertical: 14 },
              ]}
            >
              {data.has_compiled_results === false
                ? "This term has not been compiled yet. Results will appear after compilation."
                : "No subject results available"}
            </Text>
          </View>
        )}
      </View>

      {/* Overall banner */}
      <View style={styles.banner}>
        <View
          style={[styles.bannerItem, { borderLeftColor: primaryColor }]}
        >
          <Text style={styles.bannerLabel}>Overall Average</Text>
          <Text style={styles.bannerValue}>{overall.average.toFixed(1)}%</Text>
        </View>
        <View
          style={[
            styles.bannerItem,
            { borderLeftColor: gradeColor(overall.grade) },
          ]}
        >
          <Text style={styles.bannerLabel}>Grade</Text>
          <Text style={styles.bannerValue}>{overall.grade || "—"}</Text>
        </View>
        <View
          style={[styles.bannerItemLast, { borderLeftColor: primaryColor }]}
        >
          <Text style={styles.bannerLabel}>Position</Text>
          <Text style={styles.bannerValue}>
            {getOrdinal(overall.position)} of {overall.total_students}
          </Text>
        </View>
      </View>

      {/* Attendance */}
      {data.attendance && (
        <View wrap={false} style={{ marginBottom: 12 }}>
          <Text style={styles.sectionLabel}>Attendance Record</Text>
          <View style={styles.attendanceRow}>
            <View
              style={[styles.bannerItem, { borderLeftColor: primaryColor }]}
            >
              <Text style={styles.bannerLabel}>School Days</Text>
              <Text style={styles.bannerValue}>
                {data.attendance.total_days}
              </Text>
            </View>
            <View
              style={[styles.bannerItem, { borderLeftColor: primaryColor }]}
            >
              <Text style={styles.bannerLabel}>Present</Text>
              <Text style={styles.bannerValue}>{data.attendance.present}</Text>
            </View>
            <View
              style={[styles.bannerItemLast, { borderLeftColor: primaryColor }]}
            >
              <Text style={styles.bannerLabel}>Absent</Text>
              <Text style={styles.bannerValue}>{data.attendance.absent}</Text>
            </View>
          </View>
        </View>
      )}

      {/* Affective Traits / Psychomotor Skills */}
      {data.affective_traits?.length || data.psychomotor_skills?.length ? (
        <View style={styles.traitsRow} wrap={false}>
          {data.affective_traits && data.affective_traits.length > 0 && (
            <View
              style={
                data.psychomotor_skills?.length
                  ? styles.traitsCol
                  : styles.traitsColLast
              }
            >
              <Text style={styles.sectionLabel}>Affective Traits</Text>
              {data.affective_traits.map((trait, idx) => (
                <View
                  key={idx}
                  style={
                    idx === data.affective_traits!.length - 1
                      ? styles.traitRowLast
                      : styles.traitRow
                  }
                >
                  <Text style={styles.traitName}>{trait.trait}</Text>
                  <Text style={styles.traitRating}>{trait.rating}</Text>
                </View>
              ))}
            </View>
          )}
          {data.psychomotor_skills && data.psychomotor_skills.length > 0 && (
            <View style={styles.traitsColLast}>
              <Text style={styles.sectionLabel}>Psychomotor Skills</Text>
              {data.psychomotor_skills.map((skill, idx) => (
                <View
                  key={idx}
                  style={
                    idx === data.psychomotor_skills!.length - 1
                      ? styles.traitRowLast
                      : styles.traitRow
                  }
                >
                  <Text style={styles.traitName}>{skill.skill}</Text>
                  <Text style={styles.traitRating}>{skill.rating}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      ) : null}

      {/* Comments */}
      {data.teacher_comment && (
        <View style={styles.comment} wrap={false}>
          <Text style={styles.commentLabel}>Class Teacher&apos;s Comment</Text>
          <Text style={styles.commentText}>{data.teacher_comment}</Text>
        </View>
      )}
      {data.principal_comment && (
        <View style={styles.comment} wrap={false}>
          <Text style={styles.commentLabel}>Principal&apos;s Comment</Text>
          <Text style={styles.commentText}>{data.principal_comment}</Text>
        </View>
      )}

      {/* Signature block */}
      <View style={styles.signatureBlock}>
        {classInfo.teacher_name && (
          <View style={styles.signatureItem}>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureName}>{classInfo.teacher_name}</Text>
            <Text style={styles.signatureTitle}>Class Teacher</Text>
          </View>
        )}
        <View style={styles.signatureItem}>
          <View style={styles.signatureLine} />
          <Text style={styles.signatureName}>
            {formatDate(data.issued_date)}
          </Text>
          <Text style={styles.signatureTitle}>Date</Text>
        </View>
        {school.principal_name && (
          <View style={styles.signatureItem}>
            {school.principal_signature_url ? (
              <Image
                src={school.principal_signature_url}
                style={styles.signatureImage}
              />
            ) : null}
            <View style={styles.signatureLine} />
            <Text style={styles.signatureName}>{school.principal_name}</Text>
            <Text style={styles.signatureTitle}>Principal</Text>
          </View>
        )}
      </View>

      {/* Footer */}
      <View style={styles.footer} fixed>
        <Text>Issued {formatDate(data.issued_date)}</Text>
        <Text>Powered by NexaForges</Text>
      </View>
    </Page>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Batch document — one Page per student
// ═══════════════════════════════════════════════════════════════════════════

interface BatchProps {
  school: IndividualReportCardData["school"];
  class: IndividualReportCardData["class"];
  term: IndividualReportCardData["term"];
  students: IndividualReportCardData[];
}

export function ReportCardBatchDocument({
  school,
  class: classInfo,
  term,
  students,
}: BatchProps) {
  return (
    <Document
      title={`${classInfo.name} Report Cards — ${term.name} ${term.academic_session}`}
      author={school.name}
      creator="NexaForge"
      subject={`Report cards for ${classInfo.name}`}
    >
      {students.map((student) => (
        <ReportCardPage key={student.student.id} data={student} />
      ))}
    </Document>
  );
}
