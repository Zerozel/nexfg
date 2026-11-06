// src/lib/pdf/templates/heritage-navy-styles.ts
import { StyleSheet } from "@react-pdf/renderer";

// ═══════════════════════════════════════════════════════════════════════════
// "Heritage Navy" — deep navy + gold rule + teal accent.
// Prints cleanly in B&W. Only black, white, and three muted hues.
// ═══════════════════════════════════════════════════════════════════════════
export const HERITAGE_COLOR = {
  blue: "#1A4F9C",
  navy: "#12356B",
  gold: "#E8B730",
  teal: "#0E7C86",
  tint: "#EEF3FA",
  line: "#D5DEEC",
  ink: "#1B2433",
  soft: "#5E6B80",
  paper: "#FFFFFF",
  rule: "#9AA8BF",
  gradeC: "#B7791F",
  gradeD: "#B4492E",
  gradeA: "#0B6B3A",
} as const;

export const HERITAGE_PAGE = {
  marginX: 34,
  marginTop: 24,
  marginBottom: 16,
  width: 595.28,
  height: 841.89,
} as const;

export const heritageStyles = StyleSheet.create({
  page: {
    width: HERITAGE_PAGE.width,
    height: HERITAGE_PAGE.height,
    paddingTop: HERITAGE_PAGE.marginTop,
    paddingHorizontal: HERITAGE_PAGE.marginX,
    paddingBottom: HERITAGE_PAGE.marginBottom,
    backgroundColor: HERITAGE_COLOR.paper,
    fontFamily: "Helvetica",
    fontSize: 8.6,
    color: HERITAGE_COLOR.ink,
  },

  // ── TOP BAR ──
  topBar: {
    height: 10,
    backgroundColor: HERITAGE_COLOR.blue,
    marginHorizontal: -HERITAGE_PAGE.marginX,
    marginTop: -HERITAGE_PAGE.marginTop,
    marginBottom: 14,
  },

  // ── HEADER ──
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 10,
    borderBottomWidth: 4,
    borderBottomColor: HERITAGE_COLOR.gold,
    marginBottom: 12,
  },
  crest: {
    width: 42,
    height: 42,
    borderWidth: 2,
    borderColor: HERITAGE_COLOR.blue,
    backgroundColor: HERITAGE_COLOR.tint,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  crestText: {
    fontSize: 20,
    fontFamily: "Helvetica-Bold",
    color: HERITAGE_COLOR.blue,
  },
  headerCenter: {
    flex: 1,
  },
  schoolName: {
    fontSize: 17,
    fontFamily: "Helvetica-Bold",
    color: HERITAGE_COLOR.navy,
    lineHeight: 1.15,
  },
  schoolContact: {
    fontSize: 7.8,
    color: HERITAGE_COLOR.soft,
    marginTop: 2,
  },
  headerRight: {
    alignItems: "flex-end",
    marginLeft: 10,
  },
  titleMain: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: HERITAGE_COLOR.blue,
    letterSpacing: 0.3,
  },
  titleSub: {
    fontSize: 7.8,
    color: HERITAGE_COLOR.teal,
    letterSpacing: 0.4,
    marginTop: 1.5,
  },

  // ── INFO GRID (2 rows × 4 cells) ──
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    borderWidth: 0.6,
    borderColor: HERITAGE_COLOR.line,
    backgroundColor: HERITAGE_COLOR.tint,
    marginBottom: 12,
  },
  infoCell: {
    width: "25%",
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRightWidth: 0.6,
    borderRightColor: HERITAGE_COLOR.line,
    borderBottomWidth: 0.6,
    borderBottomColor: HERITAGE_COLOR.line,
  },
  infoCellLastCol: {
    width: "25%",
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderBottomWidth: 0.6,
    borderBottomColor: HERITAGE_COLOR.line,
  },
  infoCellLastRow: {
    width: "25%",
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRightWidth: 0.6,
    borderRightColor: HERITAGE_COLOR.line,
  },
  infoCellLast: {
    width: "25%",
    paddingVertical: 5,
    paddingHorizontal: 8,
  },
  infoLabel: {
    fontSize: 6.6,
    fontFamily: "Helvetica-Bold",
    color: HERITAGE_COLOR.soft,
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginBottom: 1.5,
  },
  infoValue: {
    fontSize: 9.6,
    fontFamily: "Helvetica-Bold",
    color: HERITAGE_COLOR.navy,
  },

  // ── SECTION TITLE ──
  sectionTitle: {
    fontSize: 8.6,
    fontFamily: "Helvetica-Bold",
    color: HERITAGE_COLOR.navy,
    letterSpacing: 0.6,
    textTransform: "uppercase",
    marginBottom: 4,
  },

  // ── ACADEMIC TABLE ──
  table: {
    borderWidth: 0.6,
    borderColor: HERITAGE_COLOR.line,
    marginBottom: 10,
  },
  tableHeaderRow: {
    flexDirection: "row",
    backgroundColor: HERITAGE_COLOR.blue,
    paddingVertical: 4,
  },
  tableHeaderCell: {
    fontSize: 7.4,
    fontFamily: "Helvetica-Bold",
    color: HERITAGE_COLOR.paper,
    letterSpacing: 0.3,
    paddingHorizontal: 3,
  },
  tableHeaderCellCenter: {
    fontSize: 7.4,
    fontFamily: "Helvetica-Bold",
    color: HERITAGE_COLOR.paper,
    letterSpacing: 0.3,
    paddingHorizontal: 3,
    textAlign: "center",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: HERITAGE_COLOR.line,
    alignItems: "center",
  },
  tableRowAlt: {
    backgroundColor: HERITAGE_COLOR.tint,
  },
  tableCell: {
    fontSize: 8.8,
    paddingHorizontal: 3,
    color: HERITAGE_COLOR.ink,
  },
  tableCellCenter: {
    fontSize: 8.8,
    paddingHorizontal: 3,
    color: HERITAGE_COLOR.ink,
    textAlign: "center",
  },
  tableCellTotal: {
    fontSize: 8.8,
    fontFamily: "Helvetica-Bold",
    color: HERITAGE_COLOR.navy,
    paddingHorizontal: 3,
    textAlign: "center",
  },
  tableCellRemark: {
    fontSize: 8,
    paddingHorizontal: 3,
    color: HERITAGE_COLOR.ink,
  },

  // Column weights
  colSubject: { width: "30%" },
  colCA: { width: "8%" },
  colExam: { width: "8%" },
  colTotal: { width: "9%" },
  colGrade: { width: "10%" },
  colRemark: { width: "27%" },

  // Grade pill
  gradePill: {
    paddingVertical: 1,
    paddingHorizontal: 4,
    borderRadius: 3,
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: HERITAGE_COLOR.paper,
    textAlign: "center",
  },

  // ── STAT BAND (3 cells: Average / Grade / Position) ──
  statBand: {
    flexDirection: "row",
    borderWidth: 0.6,
    borderColor: HERITAGE_COLOR.line,
    backgroundColor: HERITAGE_COLOR.tint,
    borderTopWidth: 3,
    borderTopColor: HERITAGE_COLOR.blue,
    marginBottom: 12,
  },
  statCell: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 6,
    borderRightWidth: 0.6,
    borderRightColor: HERITAGE_COLOR.line,
  },
  statCellLast: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 6,
  },
  statValue: {
    fontSize: 15,
    fontFamily: "Helvetica-Bold",
    color: HERITAGE_COLOR.navy,
  },
  statLabel: {
    fontSize: 6.6,
    fontFamily: "Helvetica-Bold",
    color: HERITAGE_COLOR.soft,
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginTop: 1.5,
  },

  // ── PERSONAL DEVELOPMENT (two columns) ──
  devRow: {
    flexDirection: "row",
    marginBottom: 10,
  },
  devColumn: {
    flex: 1,
    borderWidth: 0.6,
    borderColor: HERITAGE_COLOR.line,
    marginRight: 6,
  },
  devColumnLast: {
    flex: 1,
    borderWidth: 0.6,
    borderColor: HERITAGE_COLOR.line,
  },
  devHeader: {
    backgroundColor: HERITAGE_COLOR.teal,
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  devHeaderText: {
    fontSize: 7.4,
    fontFamily: "Helvetica-Bold",
    color: HERITAGE_COLOR.paper,
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },
  devTraitRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderBottomWidth: 0.3,
    borderBottomColor: HERITAGE_COLOR.line,
  },
  devTraitLabel: {
    flex: 1.6,
    fontSize: 8,
    color: HERITAGE_COLOR.ink,
  },
  checkboxGroup: {
    flexDirection: "row",
    flex: 1.2,
    justifyContent: "flex-end",
  },
  checkboxWrapper: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 5,
  },
  checkbox: {
    width: 7,
    height: 7,
    borderWidth: 0.7,
    borderColor: HERITAGE_COLOR.ink,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 1.5,
  },
  checkboxInner: {
    width: 3.8,
    height: 3.8,
    backgroundColor: HERITAGE_COLOR.ink,
  },
  checkboxLabel: {
    fontSize: 6.5,
    color: HERITAGE_COLOR.soft,
  },
  legendRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: 6,
    paddingTop: 3,
    paddingBottom: 2,
  },
  legendItem: {
    fontSize: 6.2,
    color: HERITAGE_COLOR.soft,
    marginLeft: 6,
  },

  // ── FEEDBACK / REMARKS ──
  feedbackBlock: {
    borderWidth: 0.6,
    borderColor: HERITAGE_COLOR.line,
    marginBottom: 8,
  },
  feedbackRow: {
    flexDirection: "row",
    borderBottomWidth: 0.3,
    borderBottomColor: HERITAGE_COLOR.line,
    paddingVertical: 4,
    paddingHorizontal: 8,
    alignItems: "flex-end",
  },
  feedbackLabel: {
    width: 120,
    fontSize: 7.2,
    fontFamily: "Helvetica-Bold",
    color: HERITAGE_COLOR.navy,
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  feedbackLine: {
    flex: 1,
    borderBottomWidth: 0.5,
    borderBottomColor: HERITAGE_COLOR.rule,
    height: 11,
    paddingHorizontal: 3,
    fontSize: 8,
    color: HERITAGE_COLOR.ink,
  },
  feedbackLineLast: {
    flex: 1,
    height: 11,
    paddingHorizontal: 3,
    fontSize: 8,
    color: HERITAGE_COLOR.ink,
  },

  // ── SIGNATURES ──
  signatureRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
    marginBottom: 8,
  },
  signatureBlock: {
    flex: 1,
    marginHorizontal: 4,
    alignItems: "center",
  },
  signatureLine: {
    width: "100%",
    borderTopWidth: 0.8,
    borderTopColor: HERITAGE_COLOR.ink,
    marginTop: 16,
    marginBottom: 2,
  },
  signatureImage: {
    height: 22,
    width: 60,
    objectFit: "contain",
    marginBottom: 1,
  },
  signatureLabel: {
    fontSize: 7.2,
    fontFamily: "Helvetica-Bold",
    color: HERITAGE_COLOR.navy,
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  signatureDate: {
    fontSize: 7,
    color: HERITAGE_COLOR.soft,
    marginTop: 1,
  },

  // ── GRADING SCALE + FOOTER (pinned to page bottom) ──
  bottomPinned: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  scaleLine: {
    fontSize: 6.8,
    color: HERITAGE_COLOR.soft,
    paddingVertical: 4,
    paddingHorizontal: HERITAGE_PAGE.marginX,
    borderTopWidth: 0.6,
    borderTopColor: HERITAGE_COLOR.line,
    lineHeight: 1.4,
  },
  scaleBold: {
    fontFamily: "Helvetica-Bold",
    color: HERITAGE_COLOR.navy,
  },
  footerBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
    paddingHorizontal: HERITAGE_PAGE.marginX,
    borderTopWidth: 0.6,
    borderTopColor: HERITAGE_COLOR.line,
    fontSize: 6.8,
    color: HERITAGE_COLOR.soft,
    letterSpacing: 0.4,
  },
});
