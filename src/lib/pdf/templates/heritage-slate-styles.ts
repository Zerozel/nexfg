// src/lib/pdf/templates/heritage-slate-styles.ts
import { StyleSheet } from "@react-pdf/renderer";

// ═══════════════════════════════════════════════════════════════════════════
// "Heritage Slate" — dark slate sidebar + amber accent.
// Sidebar layout: fixed left column (~62mm), scrolling main content right.
// Prints cleanly in B&W. Only slate, white, amber, and grey.
// ═══════════════════════════════════════════════════════════════════════════
export const SLATE_COLOR = {
  side: "#1F2A3A",
  side2: "#2B3A50",
  sideText: "#B9C4D4",
  accent: "#F0A202",
  tint: "#F5F7FA",
  line: "#E1E6ED",
  ink: "#1B2230",
  soft: "#667388",
  paper: "#FFFFFF",
  nil: "#B5BDCB",
  rule: "#A5AEBD",
  gradeA: "#2F8A5B",
  gradeB: "#2C6E9B",
  gradeC: "#C0831A",
  gradeD: "#B4492E",
  white: "#FFFFFF",
} as const;

export const SLATE_PAGE = {
  width: 595.28,
  height: 841.89,
  sidebarWidth: 175, // ~62mm in points
  mainPadX: 28,
  mainPadTop: 28,
  mainPadBottom: 16,
} as const;

export const slateStyles = StyleSheet.create({
  page: {
    width: SLATE_PAGE.width,
    height: SLATE_PAGE.height,
    flexDirection: "row",
    backgroundColor: SLATE_COLOR.paper,
    fontFamily: "Helvetica",
    fontSize: 8.4,
    color: SLATE_COLOR.ink,
  },

  // ── SIDEBAR ──
  sidebar: {
    width: SLATE_PAGE.sidebarWidth,
    height: SLATE_PAGE.height,
    backgroundColor: SLATE_COLOR.side,
    paddingTop: 30,
    paddingHorizontal: 22,
    paddingBottom: 20,
    flexDirection: "column",
  },
  sideAccentBar: {
    position: "absolute",
    top: 0,
    left: 0,
    width: SLATE_PAGE.sidebarWidth,
    height: 6,
    backgroundColor: SLATE_COLOR.accent,
  },
  crest: {
    width: 40,
    height: 40,
    backgroundColor: SLATE_COLOR.accent,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  crestText: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    color: SLATE_COLOR.side,
  },
  sideSchoolName: {
    fontSize: 11.5,
    fontFamily: "Helvetica-Bold",
    color: SLATE_COLOR.white,
    lineHeight: 1.15,
    marginTop: 4,
  },
  sideContact: {
    fontSize: 7,
    color: SLATE_COLOR.sideText,
    lineHeight: 1.5,
    marginTop: 6,
  },
  sideRule: {
    height: 0.8,
    backgroundColor: SLATE_COLOR.side2,
    marginVertical: 12,
  },
  sideLabel: {
    fontSize: 6.3,
    fontFamily: "Helvetica-Bold",
    color: SLATE_COLOR.accent,
    letterSpacing: 0.9,
    textTransform: "uppercase",
    marginBottom: 3,
  },
  sideStudentName: {
    fontSize: 19,
    fontFamily: "Helvetica-Bold",
    color: SLATE_COLOR.white,
    lineHeight: 1.05,
    letterSpacing: -0.2,
  },
  sideKVBlock: {
    marginTop: 10,
  },
  sideKVRow: {
    marginBottom: 6,
  },
  sideKVLabel: {
    fontSize: 6.5,
    color: SLATE_COLOR.sideText,
    letterSpacing: 0.5,
    marginBottom: 1,
  },
  sideKVValue: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: SLATE_COLOR.white,
  },
  sideStatsBlock: {
    marginTop: 4,
  },
  sideStatRow: {
    borderLeftWidth: 3,
    borderLeftColor: SLATE_COLOR.accent,
    paddingLeft: 8,
    marginBottom: 8,
  },
  sideStatLabel: {
    fontSize: 6.5,
    color: SLATE_COLOR.sideText,
    letterSpacing: 0.6,
    textTransform: "uppercase",
    marginBottom: 1,
  },
  sideStatValue: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    color: SLATE_COLOR.white,
  },
  sideStatValueSmall: {
    fontSize: 8.5,
    color: SLATE_COLOR.sideText,
    fontFamily: "Helvetica",
  },
  sideScaleBlock: {
    marginTop: "auto",
  },
  sideScaleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 2.4,
    borderBottomWidth: 0.6,
    borderBottomColor: SLATE_COLOR.side2,
  },
  sideScaleGrade: {
    fontSize: 6.8,
    fontFamily: "Helvetica-Bold",
    color: SLATE_COLOR.white,
  },
  sideScaleRange: {
    fontSize: 6.8,
    color: SLATE_COLOR.sideText,
  },
  sideFooter: {
    fontSize: 6.3,
    letterSpacing: 0.8,
    color: SLATE_COLOR.sideText,
    marginTop: 8,
  },

  // ── MAIN ──
  main: {
    flex: 1,
    paddingTop: SLATE_PAGE.mainPadTop,
    paddingHorizontal: SLATE_PAGE.mainPadX,
    paddingBottom: SLATE_PAGE.mainPadBottom,
  },
  mainTopBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    borderBottomWidth: 0.8,
    borderBottomColor: SLATE_COLOR.line,
    paddingBottom: 7,
    marginBottom: 10,
  },
  mainTitle: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    color: SLATE_COLOR.ink,
    letterSpacing: -0.1,
  },
  mainTerm: {
    fontSize: 7.6,
    fontFamily: "Helvetica-Bold",
    color: SLATE_COLOR.soft,
  },

  sectionHeader: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    color: SLATE_COLOR.side,
    marginBottom: 6,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionHeaderHint: {
    fontSize: 6.8,
    fontFamily: "Helvetica",
    color: SLATE_COLOR.soft,
    letterSpacing: 0,
    textTransform: "none",
  },

  // ── SUBJECT TILES (2-column grid) ──
  tilesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  tile: {
    width: "48.5%",
    borderWidth: 0.6,
    borderColor: SLATE_COLOR.line,
    borderLeftWidth: 5,
    borderLeftColor: SLATE_COLOR.gradeA,
    borderRadius: 3,
    paddingVertical: 5,
    paddingHorizontal: 8,
    marginBottom: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  tileEmpty: {
    borderLeftColor: SLATE_COLOR.nil,
    backgroundColor: SLATE_COLOR.tint,
  },
  tileLeft: {
    flex: 1,
    paddingRight: 6,
  },
  tileSubjectName: {
    fontSize: 8.6,
    fontFamily: "Helvetica-Bold",
    color: SLATE_COLOR.ink,
    lineHeight: 1.2,
    marginBottom: 2,
  },
  tileMeta: {
    fontSize: 6.8,
    color: SLATE_COLOR.soft,
  },
  tileMetaBold: {
    fontFamily: "Helvetica-Bold",
    color: SLATE_COLOR.ink,
  },
  tileRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  tileTotal: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    color: SLATE_COLOR.ink,
    marginRight: 6,
    lineHeight: 1,
  },
  tileTotalEmpty: {
    color: SLATE_COLOR.nil,
  },
  tileGrade: {
    minWidth: 28,
    borderRadius: 12,
    paddingVertical: 2,
    paddingHorizontal: 5,
    textAlign: "center",
    fontSize: 7.6,
    fontFamily: "Helvetica-Bold",
    color: SLATE_COLOR.white,
  },
  tileGradeEmpty: {
    backgroundColor: SLATE_COLOR.paper,
    borderWidth: 0.6,
    borderColor: SLATE_COLOR.nil,
    borderStyle: "dashed",
    color: SLATE_COLOR.nil,
  },

  tileNote: {
    fontSize: 6.8,
    color: SLATE_COLOR.soft,
    marginBottom: 10,
  },

  // ── PERSONAL DEVELOPMENT (tick rubric) ──
  devBlock: {
    marginBottom: 10,
  },
  devRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 2.5,
    borderBottomWidth: 0.4,
    borderBottomColor: SLATE_COLOR.line,
  },
  devLabel: {
    fontSize: 8.4,
    fontFamily: "Helvetica-Bold",
    color: SLATE_COLOR.ink,
    width: 130,
  },
  devRubricGroup: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  devRubricItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  devRubricCheckbox: {
    width: 7,
    height: 7,
    borderWidth: 0.7,
    borderColor: SLATE_COLOR.ink,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 2,
  },
  devRubricCheckboxChecked: {
    backgroundColor: SLATE_COLOR.side,
    borderColor: SLATE_COLOR.side,
  },
  devRubricCheckmark: {
    width: 4,
    height: 4,
    backgroundColor: SLATE_COLOR.white,
  },
  devRubricLabel: {
    fontSize: 6.6,
    color: SLATE_COLOR.soft,
  },

  // ── FEEDBACK ──
  feedbackBlock: {
    marginBottom: 8,
  },
  feedbackBox: {
    backgroundColor: SLATE_COLOR.tint,
    borderRadius: 3,
    paddingVertical: 5,
    paddingHorizontal: 8,
    marginBottom: 5,
  },
  feedbackLabel: {
    fontSize: 6.5,
    fontFamily: "Helvetica-Bold",
    color: SLATE_COLOR.soft,
    letterSpacing: 0.6,
    textTransform: "uppercase",
    marginBottom: 3,
  },
  feedbackValue: {
    fontSize: 8,
    color: SLATE_COLOR.ink,
    lineHeight: 1.4,
    minHeight: 12,
  },

  // ── SIGNATURES ──
  signatureRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
    marginBottom: 6,
  },
  signatureBlock: {
    flex: 1,
    marginHorizontal: 5,
    alignItems: "center",
  },
  signatureImage: {
    height: 20,
    width: 60,
    objectFit: "contain",
    marginBottom: 1,
  },
  signatureLine: {
    width: "100%",
    borderTopWidth: 0.8,
    borderTopColor: SLATE_COLOR.ink,
    marginTop: 10,
    marginBottom: 2,
  },
  signatureLabel: {
    fontSize: 6.8,
    fontFamily: "Helvetica-Bold",
    color: SLATE_COLOR.side,
    letterSpacing: 0.7,
    textTransform: "uppercase",
  },
  signatureDate: {
    fontSize: 6.6,
    color: SLATE_COLOR.soft,
    marginTop: 1,
  },
});
