import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
} from "@react-pdf/renderer";

/**
 * Score Sheet PDF — the document the admin prints and gives to the subject
 * teacher. Deterministic, A4 portrait, black and white.
 *
 * Layout:
 *   Header       — school logo (if any), school name, sheet title
 *   Meta row     — class, subject, term, teacher
 *   Table        — #, Adm. No., Student Name, CA1, CA2, CA3, Exam
 *   Extra rows   — 3 blank rows for late students
 *   Footer       — teacher signature, date, sheet generated stamp
 *
 * The extra 3 rows are ALWAYS present. They cost nothing on paper and save
 * a reprint when a student joins late.
 */

export interface ScoreSheetStudent {
  id: string;
  full_name: string;
  admission_number: string | null;
}

export interface ScoreSheetData {
  schoolName: string;
  logoUrl?: string | null;
  className: string;
  subjectName: string;
  termName: string;
  academicSession: string;
  teacherName: string | null;
  students: ScoreSheetStudent[];
  maxScores: {
    ca1: number;
    ca2: number;
    ca3: number;
    exam: number;
  };
  generatedAt: string; // ISO
  extraBlankRows?: number;
}

const styles = StyleSheet.create({
  page: {
    padding: 36, // 12.7mm
    fontFamily: "Helvetica",
    fontSize: 9.5,
    color: "#000000",
    backgroundColor: "#ffffff",
  },
  header: {
    textAlign: "center",
    borderBottomWidth: 2,
    borderBottomColor: "#000000",
    paddingBottom: 10,
    marginBottom: 14,
  },
  logo: {
    width: 48,
    height: 48,
    marginBottom: 6,
    alignSelf: "center",
    objectFit: "contain",
  },
  schoolName: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginBottom: 2,
  },
  sheetTitle: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginTop: 6,
  },
  metaGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#000000",
  },
  metaItem: {
    width: "50%",
    flexDirection: "row",
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderBottomWidth: 0.5,
    borderBottomColor: "#000000",
  },
  metaLabel: {
    width: 70,
    fontFamily: "Helvetica-Bold",
    fontSize: 8,
    textTransform: "uppercase",
    color: "#333333",
  },
  metaValue: {
    flex: 1,
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
  },
  table: {
    borderWidth: 1,
    borderColor: "#000000",
  },
  tableHeaderRow: {
    flexDirection: "row",
    backgroundColor: "#e5e5e5",
    borderBottomWidth: 1.5,
    borderBottomColor: "#000000",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: "#999999",
    minHeight: 22,
  },
  tableRowAlt: {
    backgroundColor: "#f5f5f5",
  },
  tableRowLate: {
    backgroundColor: "#fafafa",
  },
  cellIndex: {
    width: 24,
    borderRightWidth: 0.5,
    borderRightColor: "#999999",
    paddingHorizontal: 4,
    paddingVertical: 4,
    textAlign: "center",
    fontSize: 9,
  },
  cellAdmission: {
    width: 90,
    borderRightWidth: 0.5,
    borderRightColor: "#999999",
    paddingHorizontal: 4,
    paddingVertical: 4,
    fontSize: 9,
  },
  cellName: {
    flex: 1,
    borderRightWidth: 0.5,
    borderRightColor: "#999999",
    paddingHorizontal: 6,
    paddingVertical: 4,
    fontSize: 9,
  },
  cellScore: {
    width: 38,
    borderRightWidth: 0.5,
    borderRightColor: "#999999",
    paddingHorizontal: 4,
    paddingVertical: 4,
    textAlign: "center",
    fontSize: 9,
  },
  cellScoreLast: {
    width: 38,
    paddingHorizontal: 4,
    paddingVertical: 4,
    textAlign: "center",
    fontSize: 9,
  },
  headerText: {
    fontFamily: "Helvetica-Bold",
    fontSize: 8,
    textTransform: "uppercase",
    paddingHorizontal: 4,
    paddingVertical: 4,
    textAlign: "center",
  },
  headerTextLeft: {
    fontFamily: "Helvetica-Bold",
    fontSize: 8,
    textTransform: "uppercase",
    paddingHorizontal: 4,
    paddingVertical: 4,
    textAlign: "left",
  },
  maxBadge: {
    fontSize: 7,
    fontFamily: "Helvetica",
    color: "#555555",
  },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 36,
    right: 36,
    borderTopWidth: 1,
    borderTopColor: "#000000",
    paddingTop: 8,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  signatureLine: {
    width: 200,
    borderBottomWidth: 1,
    borderBottomColor: "#000000",
    paddingBottom: 2,
    marginBottom: 2,
  },
  footerLabel: {
    fontSize: 7.5,
    color: "#333333",
    textTransform: "uppercase",
  },
  generatedStamp: {
    fontSize: 7,
    color: "#666666",
    textAlign: "center",
    marginTop: 6,
  },
});

const ROWS_PER_PAGE = 28;

export function ScoreSheetDocument({ data }: { data: ScoreSheetData }) {
  const extraRows = data.extraBlankRows ?? 3;
  const allRows = [
    ...data.students.map((s) => ({ type: "student" as const, student: s })),
    ...Array.from({ length: extraRows }, () => ({
      type: "late" as const,
      student: null,
    })),
  ];

  // Chunk rows into pages. Page 1 has the header + meta grid so it fits
  // fewer rows than subsequent pages; subsequent pages fit more.
  const FIRST_PAGE_ROWS = 22;
  const OTHER_PAGE_ROWS = 32;

  const pages: (typeof allRows)[] = [];
  let cursor = 0;
  if (allRows.length === 0) {
    pages.push([]);
  } else {
    pages.push(allRows.slice(cursor, cursor + FIRST_PAGE_ROWS));
    cursor += FIRST_PAGE_ROWS;
    while (cursor < allRows.length) {
      pages.push(allRows.slice(cursor, cursor + OTHER_PAGE_ROWS));
      cursor += OTHER_PAGE_ROWS;
    }
  }

  const generatedDate = new Date(data.generatedAt).toLocaleDateString(
    "en-GB",
    { year: "numeric", month: "long", day: "numeric" }
  );

  // Running row number across pages
  const rowOffsetForPage = (pageIndex: number) => {
    if (pageIndex === 0) return 0;
    return FIRST_PAGE_ROWS + (pageIndex - 1) * OTHER_PAGE_ROWS;
  };

  return (
    <Document
      title={`${data.className} ${data.subjectName} Score Sheet`}
      author={data.schoolName}
      creator="NexaForge"
    >
      {pages.map((pageRows, pageIndex) => {
        const offset = rowOffsetForPage(pageIndex);
        return (
          <Page key={pageIndex} size="A4" style={styles.page}>
            {/* Header — first page only */}
            {pageIndex === 0 && (
              <>
                <View style={styles.header}>
                  {data.logoUrl ? (
                    <Image src={data.logoUrl} style={styles.logo} />
                  ) : null}
                  <Text style={styles.schoolName}>{data.schoolName}</Text>
                  <Text style={styles.sheetTitle}>Score Sheet</Text>
                </View>

                <View style={styles.metaGrid}>
                  <View style={styles.metaItem}>
                    <Text style={styles.metaLabel}>Class</Text>
                    <Text style={styles.metaValue}>{data.className}</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Text style={styles.metaLabel}>Subject</Text>
                    <Text style={styles.metaValue}>{data.subjectName}</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Text style={styles.metaLabel}>Term</Text>
                    <Text style={styles.metaValue}>
                      {data.termName}
                      {data.academicSession ? ` — ${data.academicSession}` : ""}
                    </Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Text style={styles.metaLabel}>Teacher</Text>
                    <Text style={styles.metaValue}>
                      {data.teacherName || "___________________"}
                    </Text>
                  </View>
                </View>
              </>
            )}

            {/* Table */}
            <View style={styles.table}>
              <View style={styles.tableHeaderRow}>
                <View style={styles.cellIndex}>
                  <Text style={styles.headerText}>#</Text>
                </View>
                <View style={styles.cellAdmission}>
                  <Text style={styles.headerTextLeft}>Adm. No.</Text>
                </View>
                <View style={styles.cellName}>
                  <Text style={styles.headerTextLeft}>Student Name</Text>
                </View>
                <View style={styles.cellScore}>
                  <Text style={styles.headerText}>CA1</Text>
                  <Text style={styles.maxBadge}>({data.maxScores.ca1})</Text>
                </View>
                <View style={styles.cellScore}>
                  <Text style={styles.headerText}>CA2</Text>
                  <Text style={styles.maxBadge}>({data.maxScores.ca2})</Text>
                </View>
                <View style={styles.cellScore}>
                  <Text style={styles.headerText}>CA3</Text>
                  <Text style={styles.maxBadge}>({data.maxScores.ca3})</Text>
                </View>
                <View style={styles.cellScoreLast}>
                  <Text style={styles.headerText}>Exam</Text>
                  <Text style={styles.maxBadge}>({data.maxScores.exam})</Text>
                </View>
              </View>

              {pageRows.map((row, idx) => {
                const globalIndex = offset + idx + 1;
                const isLate = row.type === "late";
                const isAlternate = !isLate && idx % 2 === 1;

                return (
                  <View
                    key={idx}
                    style={[
                      styles.tableRow,
                      isAlternate ? styles.tableRowAlt : {},
                      isLate ? styles.tableRowLate : {},
                    ]}
                  >
                    <View style={styles.cellIndex}>
                      <Text>{globalIndex}</Text>
                    </View>
                    <View style={styles.cellAdmission}>
                      <Text>
                        {isLate ? "" : row.student?.admission_number || ""}
                      </Text>
                    </View>
                    <View style={styles.cellName}>
                      <Text>{isLate ? "" : row.student?.full_name || ""}</Text>
                    </View>
                    <View style={styles.cellScore}>
                      <Text> </Text>
                    </View>
                    <View style={styles.cellScore}>
                      <Text> </Text>
                    </View>
                    <View style={styles.cellScore}>
                      <Text> </Text>
                    </View>
                    <View style={styles.cellScoreLast}>
                      <Text> </Text>
                    </View>
                  </View>
                );
              })}
            </View>

            <View style={styles.footer}>
              <View style={styles.footerRow}>
                <View>
                  <View style={styles.signatureLine} />
                  <Text style={styles.footerLabel}>
                    Subject Teacher Signature
                  </Text>
                </View>
                <View>
                  <View style={styles.signatureLine} />
                  <Text style={styles.footerLabel}>Date Completed</Text>
                </View>
              </View>
              <Text style={styles.generatedStamp}>
                Generated by NexaForge · {generatedDate} · Page{" "}
                {pageIndex + 1} of {pages.length}
              </Text>
            </View>
          </Page>
        );
      })}
    </Document>
  );
}
