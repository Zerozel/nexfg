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
 * React-PDF equivalent of ReportCardTemplate.tsx.
 *
 * Consumes the same IndividualReportCardData shape as the browser template,
 * so both rendering paths stay in sync when data changes.
 *
 * A4 portrait. Black-and-white friendly (uses the school's primary color
 * as an accent, not a background).
 */

const styles = StyleSheet.create({
  page: {
    padding: 24,
    fontFamily: "Helvetica",
    fontSize: 9,
    color: "#000000",
    backgroundColor: "#ffffff",
  },

  // ── Header ──
  header: {
    textAlign: "center",
    borderBottomWidth: 1.5,
    borderBottomColor: "#000000",
    paddingBottom: 8,
    marginBottom: 8,
  },
  logo: {
    width: 60,
    height: 60,
    marginBottom: 4,
    alignSelf: "center",
    objectFit: "contain",
  },
  schoolName: {
    fontSize: 15,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginBottom: 2,
  },
  motto: {
    fontSize: 8,
    fontStyle: "italic",
    color: "#444444",
    marginBottom: 3,
  },
  contact: {
    fontSize: 7.5,
    color: "#333333",
  },

  // ── Title ──
  title: {
    textAlign: "center",
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginTop: 6,
    marginBottom: 8,
  },

  // ── Student info grid ──
  infoGrid: {
    flexDirection: "row",
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#000000",
  },
  infoColumn: {
    flex: 1,
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 2,
  },
  infoLabel: {
    width: 70,
    fontFamily: "Helvetica-Bold",
    fontSize: 7.5,
    textTransform: "uppercase",
    color: "#333333",
  },
  infoValue: {
    flex: 1,
    fontSize: 8.5,
  },

  // ── Subject table ──
  table: {
    borderWidth: 1,
    borderColor: "#000000",
    marginBottom: 8,
  },
  tableHeaderRow: {
    flexDirection: "row",
    backgroundColor: "#e5e5e5",
    borderBottomWidth: 1,
    borderBottomColor: "#000000",
  },
  tableSubHeaderRow: {
    flexDirection: "row",
    backgroundColor: "#f0f0f0",
    borderBottomWidth: 1,
    borderBottomColor: "#000000",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: "#999999",
  },
  tableRowAlt: {
    backgroundColor: "#fafafa",
  },
  headerCell: {
    fontFamily: "Helvetica-Bold",
    fontSize: 7,
    textTransform: "uppercase",
    textAlign: "center",
    paddingHorizontal: 2,
    paddingVertical: 4,
    borderRightWidth: 0.5,
    borderRightColor: "#999999",
  },
  cell: {
    fontSize: 8,
    paddingHorizontal: 3,
    paddingVertical: 3,
    borderRightWidth: 0.5,
    borderRightColor: "#e0e0e0",
  },
  cellCenter: {
    textAlign: "center",
  },
  cellRight: {
    textAlign: "right",
  },

  // ── Overall banner ──
  overallBanner: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 8,
    marginBottom: 8,
    borderRadius: 2,
  },
  overallItem: {
    alignItems: "center",
  },
  overallLabel: {
    fontSize: 7,
    textTransform: "uppercase",
    color: "#ffffff",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  overallValue: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    color: "#ffffff",
  },

  // ── Attendance ──
  section: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    borderBottomWidth: 1,
    borderBottomColor: "#000000",
    paddingBottom: 2,
    marginBottom: 4,
  },
  attendanceGrid: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#000000",
  },
  attendanceItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 6,
    borderRightWidth: 0.5,
    borderRightColor: "#999999",
  },
  attendanceItemLast: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 6,
  },
  attendanceValue: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    marginBottom: 2,
  },
  attendanceLabel: {
    fontSize: 7,
    textTransform: "uppercase",
    color: "#555555",
  },

  // ── Traits / Skills ──
  traitsRow: {
    flexDirection: "row",
    gap: 8,
  },
  traitsCol: {
    flex: 1,
  },
  traitRow: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: "#e0e0e0",
  },
  traitName: {
    flex: 2,
    fontSize: 7.5,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  traitRating: {
    flex: 1,
    fontSize: 7.5,
    paddingHorizontal: 4,
    paddingVertical: 2,
    textAlign: "right",
  },

  // ── Comments ──
  commentBox: {
    borderWidth: 1,
    borderColor: "#000000",
    padding: 6,
    marginBottom: 4,
  },
  commentLabel: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    color: "#555555",
    marginBottom: 3,
  },
  commentText: {
    fontSize: 8.5,
    lineHeight: 1.3,
  },

  // ── Signature block ──
  signatureBlock: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
    paddingTop: 8,
  },
  signatureItem: {
    width: "30%",
    alignItems: "center",
  },
  signatureImage: {
    width: 100,
    height: 30,
    objectFit: "contain",
    marginBottom: 2,
  },
  signatureLine: {
    width: "100%",
    borderBottomWidth: 1,
    borderBottomColor: "#000000",
    marginBottom: 2,
    height: 20,
  },
  signatureName: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    textAlign: "center",
    marginBottom: 1,
  },
  signatureTitle: {
    fontSize: 7,
    color: "#555555",
    textTransform: "uppercase",
    textAlign: "center",
  },

  // ── Footer ──
  footer: {
    position: "absolute",
    bottom: 12,
    left: 24,
    right: 24,
    textAlign: "center",
    fontSize: 6.5,
    color: "#888888",
  },
});

function formatCell(v: number | null | undefined): string {
  if (v === null || v === undefined) return "-";
  return Number.isInteger(v) ? String(v) : v.toFixed(1);
}

function getOrdinal(n: number): string {
  if (!Number.isFinite(n) || n <= 0) return "-";
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
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function ReportCardPage({ data }: { data: IndividualReportCardData }) {
  const { school, student, class: classInfo, term, subjects, overall } = data;
  const showBreakdown = hasBreakdown(subjects);
  const primaryColor = school.primary_color || "#2563eb";

  return (
    <Page size="A4" style={styles.page}>
      {/* ── Header ── */}
      <View style={styles.header}>
        {school.logo_url ? (
          <Image src={school.logo_url} style={styles.logo} />
        ) : null}
        <Text style={[styles.schoolName, { color: primaryColor }]}>
          {school.name}
        </Text>
        {school.motto ? <Text style={styles.motto}>{school.motto}</Text> : null}
        {(school.address || school.phone || school.email) && (
          <Text style={styles.contact}>
            {[school.address, school.phone, school.email]
              .filter(Boolean)
              .join("  |  ")}
          </Text>
        )}
      </View>

      {/* ── Title ── */}
      <Text style={styles.title}>Student Report Card</Text>

      {/* ── Student info ── */}
      <View style={styles.infoGrid}>
        <View style={[styles.infoColumn, { borderRightWidth: 0.5, borderRightColor: "#999999" }]}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Name</Text>
            <Text style={styles.infoValue}>{student.full_name}</Text>
          </View>
          {student.admission_number ? (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Adm. No.</Text>
              <Text style={styles.infoValue}>{student.admission_number}</Text>
            </View>
          ) : null}
        </View>
        <View style={styles.infoColumn}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Class</Text>
            <Text style={styles.infoValue}>{classInfo.name}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Term</Text>
            <Text style={styles.infoValue}>
              {term.name} — {term.academic_session}
            </Text>
          </View>
        </View>
      </View>

      {/* ── Subject table ── */}
      <View style={styles.table}>
        {/* Header row */}
        <View style={styles.tableHeaderRow} fixed>
          {showBreakdown ? (
            <>
              <Text style={[styles.headerCell, { flex: 3, textAlign: "left" }]}>
                Subject
              </Text>
              <Text style={[styles.headerCell, { flex: 3 }]}>
                Continuous Assessment
              </Text>
              <Text style={[styles.headerCell, { flex: 1.2 }]}>Exam</Text>
              <Text style={[styles.headerCell, { flex: 1.2 }]}>Total</Text>
              <Text style={[styles.headerCell, { flex: 1 }]}>Grade</Text>
              <Text style={[styles.headerCell, { flex: 1 }]}>Pos</Text>
              <Text style={[styles.headerCell, { flex: 2, borderRightWidth: 0 }]}>
                Remarks
              </Text>
            </>
          ) : (
            <>
              <Text style={[styles.headerCell, { flex: 4, textAlign: "left" }]}>
                Subject
              </Text>
              <Text style={[styles.headerCell, { flex: 1.5 }]}>Score</Text>
              <Text style={[styles.headerCell, { flex: 1.2 }]}>Grade</Text>
              <Text style={[styles.headerCell, { flex: 1.5 }]}>Position</Text>
              <Text style={[styles.headerCell, { flex: 3.5, borderRightWidth: 0 }]}>
                Remarks
              </Text>
            </>
          )}
        </View>

        {/* Sub-header row for CA1/CA2/CA3 */}
        {showBreakdown && (
          <View style={styles.tableSubHeaderRow}>
            <Text style={[styles.headerCell, { flex: 3, borderRightWidth: 0 }]} />
            <Text style={[styles.headerCell, { flex: 1 }]}>CA1</Text>
            <Text style={[styles.headerCell, { flex: 1 }]}>CA2</Text>
            <Text style={[styles.headerCell, { flex: 1 }]}>CA3</Text>
            <Text style={[styles.headerCell, { flex: 1.2, borderRightWidth: 0 }]} />
            <Text style={[styles.headerCell, { flex: 1.2, borderRightWidth: 0 }]} />
            <Text style={[styles.headerCell, { flex: 1, borderRightWidth: 0 }]} />
            <Text style={[styles.headerCell, { flex: 1, borderRightWidth: 0 }]} />
            <Text style={[styles.headerCell, { flex: 2, borderRightWidth: 0 }]} />
          </View>
        )}

        {/* Data rows */}
        {subjects.length > 0 ? (
          subjects.map((subject, idx) => (
            <View
              key={subject.id}
              style={[
                styles.tableRow,
                idx % 2 === 1 ? styles.tableRowAlt : {},
              ]}
              wrap={false}
            >
              {showBreakdown ? (
                <>
                  <Text style={[styles.cell, { flex: 3 }]}>{subject.name}</Text>
                  <Text style={[styles.cell, styles.cellCenter, { flex: 1 }]}>
                    {formatCell(subject.ca1_score)}
                  </Text>
                  <Text style={[styles.cell, styles.cellCenter, { flex: 1 }]}>
                    {formatCell(subject.ca2_score)}
                  </Text>
                  <Text style={[styles.cell, styles.cellCenter, { flex: 1 }]}>
                    {formatCell(subject.ca3_score)}
                  </Text>
                  <Text style={[styles.cell, styles.cellCenter, { flex: 1.2 }]}>
                    {formatCell(subject.exam_score)}
                  </Text>
                  <Text style={[styles.cell, styles.cellCenter, { flex: 1.2 }]}>
                    {subject.score.toFixed(1)}
                  </Text>
                  <Text style={[styles.cell, styles.cellCenter, { flex: 1 }]}>
                    {subject.grade || "-"}
                  </Text>
                  <Text style={[styles.cell, styles.cellCenter, { flex: 1 }]}>
                    {subject.subject_position
                      ? getOrdinal(subject.subject_position)
                      : "-"}
                  </Text>
                  <Text style={[styles.cell, { flex: 2, borderRightWidth: 0 }]}>
                    {subject.remarks || "-"}
                  </Text>
                </>
              ) : (
                <>
                  <Text style={[styles.cell, { flex: 4 }]}>{subject.name}</Text>
                  <Text style={[styles.cell, styles.cellCenter, { flex: 1.5 }]}>
                    {subject.score.toFixed(1)}
                  </Text>
                  <Text style={[styles.cell, styles.cellCenter, { flex: 1.2 }]}>
                    {subject.grade || "-"}
                  </Text>
                  <Text style={[styles.cell, styles.cellCenter, { flex: 1.5 }]}>
                    {subject.subject_position
                      ? getOrdinal(subject.subject_position)
                      : "-"}
                  </Text>
                  <Text style={[styles.cell, { flex: 3.5, borderRightWidth: 0 }]}>
                    {subject.remarks || "-"}
                  </Text>
                </>
              )}
            </View>
          ))
        ) : (
          <View style={styles.tableRow}>
            <Text style={[styles.cell, { flex: 1, textAlign: "center" }]}>
              {data.has_compiled_results === false
                ? "This term has not been compiled yet. Results will appear after compilation."
                : "No subject results available"}
            </Text>
          </View>
        )}
      </View>

      {/* ── Overall banner ── */}
      <View style={[styles.overallBanner, { backgroundColor: primaryColor }]}>
        <View style={styles.overallItem}>
          <Text style={styles.overallLabel}>Overall Average</Text>
          <Text style={styles.overallValue}>{overall.average.toFixed(1)}%</Text>
        </View>
        <View style={styles.overallItem}>
          <Text style={styles.overallLabel}>Grade</Text>
          <Text style={styles.overallValue}>{overall.grade || "-"}</Text>
        </View>
        <View style={styles.overallItem}>
          <Text style={styles.overallLabel}>Position</Text>
          <Text style={styles.overallValue}>
            {getOrdinal(overall.position)} of {overall.total_students}
          </Text>
        </View>
      </View>

      {/* ── Attendance ── */}
      {data.attendance && (
        <View style={styles.section} wrap={false}>
          <Text style={styles.sectionTitle}>Attendance Record</Text>
          <View style={styles.attendanceGrid}>
            <View style={styles.attendanceItem}>
              <Text style={styles.attendanceValue}>
                {data.attendance.total_days}
              </Text>
              <Text style={styles.attendanceLabel}>School Days</Text>
            </View>
            <View style={styles.attendanceItem}>
              <Text style={styles.attendanceValue}>
                {data.attendance.present}
              </Text>
              <Text style={styles.attendanceLabel}>Present</Text>
            </View>
            <View style={styles.attendanceItemLast}>
              <Text style={styles.attendanceValue}>
                {data.attendance.absent}
              </Text>
              <Text style={styles.attendanceLabel}>Absent</Text>
            </View>
          </View>
        </View>
      )}

      {/* ── Affective Traits & Psychomotor Skills ── */}
      {(data.affective_traits?.length || data.psychomotor_skills?.length) ? (
        <View style={[styles.section, styles.traitsRow]} wrap={false}>
          {data.affective_traits && data.affective_traits.length > 0 && (
            <View style={styles.traitsCol}>
              <Text style={styles.sectionTitle}>Affective Traits</Text>
              {data.affective_traits.map((trait, idx) => (
                <View key={idx} style={styles.traitRow}>
                  <Text style={styles.traitName}>{trait.trait}</Text>
                  <Text style={styles.traitRating}>{trait.rating}</Text>
                </View>
              ))}
            </View>
          )}
          {data.psychomotor_skills && data.psychomotor_skills.length > 0 && (
            <View style={styles.traitsCol}>
              <Text style={styles.sectionTitle}>Psychomotor Skills</Text>
              {data.psychomotor_skills.map((skill, idx) => (
                <View key={idx} style={styles.traitRow}>
                  <Text style={styles.traitName}>{skill.skill}</Text>
                  <Text style={styles.traitRating}>{skill.rating}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      ) : null}

      {/* ── Comments ── */}
      {(data.teacher_comment || data.principal_comment) && (
        <View style={styles.section} wrap={false}>
          {data.teacher_comment && (
            <View style={styles.commentBox}>
              <Text style={styles.commentLabel}>
                Class Teacher&apos;s Comment
              </Text>
              <Text style={styles.commentText}>{data.teacher_comment}</Text>
            </View>
          )}
          {data.principal_comment && (
            <View style={styles.commentBox}>
              <Text style={styles.commentLabel}>
                Principal&apos;s Comment
              </Text>
              <Text style={styles.commentText}>{data.principal_comment}</Text>
            </View>
          )}
        </View>
      )}

      {/* ── Signatures ── */}
      <View style={styles.signatureBlock} wrap={false}>
        {classInfo.teacher_name && (
          <View style={styles.signatureItem}>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureName}>{classInfo.teacher_name}</Text>
            <Text style={styles.signatureTitle}>Class Teacher</Text>
          </View>
        )}
        <View style={styles.signatureItem}>
          <View style={styles.signatureLine} />
          <Text style={styles.signatureName}>{formatDate(data.issued_date)}</Text>
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

      {/* ── Footer ── */}
      <Text style={styles.footer} fixed>
        Powered by NexaForges — School Management Platform
      </Text>
    </Page>
  );
}
