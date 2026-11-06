// src/lib/pdf/templates/heritage-burgundy-styles.ts
import { StyleSheet } from "@react-pdf/renderer";

// ═══════════════════════════════════════════════════════════════════════════
// "Heritage Burgundy" — burgundy band + brass accent + cream tints.
// The most premium of the heritage family. Prints cleanly in B&W.
// ═══════════════════════════════════════════════════════════════════════════
export const BURGUNDY_COLOR = {
  primary: "#7A1F3D",
  primaryDeep: "#521229",
  primaryLight: "#D9A9B8",
  brass: "#C79A3B",
  cream: "#FAF6F0",
  tint: "#F5EEE6",
  line: "#E7DDD0",
  ink: "#26191E",
  soft: "#6F6168",
  paper: "#FFFFFF",
  rule: "#A89A91",
  gradeA: "#2F7D58",
  gradeB: "#2C6E9B",
  gradeC: "#B7791F",
  gradeD: "#B4492E",
  white: "#FFFFFF",
} as const;

export const BURGUNDY_PAGE = {
  marginX: 34,
  marginTop: 0, // Band bleeds to the top edge
  marginBottom: 16,
  width: 595.28,
  height: 841.89,
} as const;

export const burgundyStyles = StyleSheet.create({
  page: {
    width: BURGUNDY_PAGE.width,
    height: BURGUNDY_PAGE.height,
    paddingTop: BURGUNDY_PAGE.marginTop,
    paddingHorizontal: BURGUNDY_PAGE.marginX,
    paddingBottom: BURGUNDY_PAGE.marginBottom,
    backgroundColor: BURGUNDY_COLOR.paper,
    fontFamily: "Helvetica",
    fontSize: 8.4,
    color: BURGUNDY_COLOR.ink,
  },

  // ── BAND ──
  band: {
    backgroundColor: BURGUNDY_COLOR.primary,
    paddingTop: 14,
    paddingBottom: 22,
    paddingHorizontal: 18,
    marginHorizontal: -BURGUNDY_PAGE.marginX,
    marginBottom: 0,
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
  },
  bandRule: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 4,
    backgroundColor: BURGUNDY_COLOR.brass,
  },
  crest: {
    width: 42,
    height: 42,
    backgroundColor: BURGUNDY_COLOR.brass,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 4,
    marginRight: 12,
  },
  crestText: {
    fontSize: 20,
    fontFamily: "Helvetica-Bold",
    color: BURGUNDY_COLOR.primaryDeep,
  },
  bandCenter: {
    flex: 1,
  },
  bandSchoolName: {
    fontSize: 17,
    fontFamily: "Helvetica-Bold",
    color: BURGUNDY_COLOR.white,
    lineHeight: 1.1,
  },
  bandContact: {
    fontSize: 7.2,
    color: BURGUNDY_COLOR.primaryLight,
    marginTop: 3,
  },
  bandDoc: {
    alignItems: "flex-end",
    marginLeft: 10,
  },
  bandDocTitle: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: BURGUNDY_COLOR.white,
    letterSpacing: 0.2,
    marginBottom: 2,
  },
  bandDocSub: {
    fontSize: 7.2,
    color: BURGUNDY_COLOR.primaryLight,
    letterSpacing: 1,
    textTransform: "uppercase",
  },

  // ── FLOATING IDENTITY CARD ──
  card: {
    marginTop: -22,
    backgroundColor: BURGUNDY_COLOR.paper,
    borderWidth: 0.8,
    borderColor: BURGUNDY_COLOR.line,
    borderTopWidth: 4,
    borderTopColor: BURGUNDY_COLOR.brass,
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  cardLeft: {
    flex: 1,
  },
  cardStudentName: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    color: BURGUNDY_COLOR.primaryDeep,
    lineHeight: 1.1,
    marginBottom: 6,
  },
  cardMetaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  cardMetaCell: {
    marginRight: 18,
    marginBottom: 2,
  },
  cardMetaLabel: {
    fontSize: 6.2,
    fontFamily: "Helvetica-Bold",
    color: BURGUNDY_COLOR.soft,
    letterSpacing: 0.6,
    textTransform: "uppercase",
    marginBottom: 1,
  },
  cardMetaValue: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: BURGUNDY_COLOR.ink,
  },

  // ── STAT ROW (4 columns with brass left rules) ──
  statRow: {
    flexDirection: "row",
    marginBottom: 12,
  },
  statCell: {
    flex: 1,
    borderLeftWidth: 3,
    borderLeftColor: BURGUNDY_COLOR.brass,
    paddingLeft: 6,
    paddingVertical: 2,
    marginRight: 6,
  },
  statCellLast: {
    flex: 1,
    borderLeftWidth: 3,
    borderLeftColor: BURGUNDY_COLOR.brass,
    paddingLeft: 6,
    paddingVertical: 2,
  },
  statLabel: {
    fontSize: 6.2,
    fontFamily: "Helvetica-Bold",
    color: BURGUNDY_COLOR.soft,
    letterSpacing: 0.6,
    textTransform: "uppercase",
    marginBottom: 2,
  },
  statValue: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    color: BURGUNDY_COLOR.primaryDeep,
    lineHeight: 1.1,
  },
  statValueSmall: {
    fontSize: 9,
    color: BURGUNDY_COLOR.soft,
  },

  // ── SECTION TITLE ──
  sectionTitle: {
    fontSize: 9.5,
    fontFamily: "Helvetica-Bold",
    color: BURGUNDY_COLOR.primaryDeep,
    letterSpacing: 0.3,
    paddingBottom: 2,
    borderBottomWidth: 1.5,
    borderBottomColor: BURGUNDY_COLOR.primary,
    marginBottom: 6,
  },

  // ── ACADEMIC TABLE ──
  tableHeaderRow: {
    flexDirection: "row",
    paddingBottom: 3,
    paddingHorizontal: 2,
    borderBottomWidth: 1.5,
    borderBottomColor: BURGUNDY_COLOR.primary,
    marginBottom: 1,
  },
  tableHeaderCell: {
    fontSize: 6.5,
    fontFamily: "Helvetica-Bold",
    color: BURGUNDY_COLOR.soft,
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  tableHeaderCellCenter: {
    fontSize: 6.5,
    fontFamily: "Helvetica-Bold",
    color: BURGUNDY_COLOR.soft,
    letterSpacing: 0.6,
    textTransform: "uppercase",
    textAlign: "center",
  },

  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 2,
    paddingVertical: 3,
    borderBottomWidth: 0.5,
    borderBottomColor: BURGUNDY_COLOR.line,
    minHeight: 17,
  },
  tableRowAlt: {
    backgroundColor: BURGUNDY_COLOR.cream,
  },
  tableCellSubject: {
    fontSize: 8.4,
    fontFamily: "Helvetica-Bold",
    color: BURGUNDY_COLOR.ink,
  },
  tableCell: {
    fontSize: 8.4,
    color: BURGUNDY_COLOR.ink,
  },
  tableCellCenter: {
    fontSize: 8.4,
    color: BURGUNDY_COLOR.ink,
    textAlign: "center",
  },
  tableCellTotal: {
    fontSize: 9.2,
    fontFamily: "Helvetica-Bold",
    color: BURGUNDY_COLOR.primaryDeep,
    textAlign: "center",
  },
  tableCellRemark: {
    fontSize: 7.8,
    color: BURGUNDY_COLOR.soft,
  },
  tableCellNil: {
    color: "#B3A79E",
  },

  // Column widths (percentages)
  colSubject: { width: "30%" },
  colCA: { width: "9%" },
  colExam: { width: "9%" },
  colBar: { width: "17%" },
  colTotal: { width: "9%" },
  colGrade: { width: "9%" },
  colRemark: { width: "17%" },

  // ── SCORE PROGRESS BAR ──
  barTrack: {
    height: 6,
    backgroundColor: BURGUNDY_COLOR.tint,
    borderRadius: 3,
    flexDirection: "row",
    overflow: "hidden",
    marginHorizontal: 4,
  },
  barTrackNil: {
    height: 6,
    borderWidth: 0.6,
    borderColor: BURGUNDY_COLOR.line,
    borderStyle: "dashed",
    borderRadius: 3,
    marginHorizontal: 4,
  },
  barCA: {
    height: 6,
    backgroundColor: BURGUNDY_COLOR.primaryDeep,
  },
  barExam: {
    height: 6,
    backgroundColor: BURGUNDY_COLOR.primaryLight,
  },

  // ── GRADE CIRCLE ──
  gradeCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
  },
  gradeCircleText: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: BURGUNDY_COLOR.white,
  },
  gradeCircleEmpty: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 0.6,
    borderColor: "#BDB0A6",
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
  },
  gradeCircleEmptyText: {
    fontSize: 7,
    color: "#BDB0A6",
  },

  // ── TABLE LEGEND ──
  tableLegend: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    marginBottom: 10,
  },
  legendSwatch: {
    width: 9,
    height: 5,
    borderRadius: 2,
    marginRight: 3,
  },
  legendText: {
    fontSize: 6.4,
    color: BURGUNDY_COLOR.soft,
    marginRight: 10,
  },

  // ── PERSONAL DEVELOPMENT (dots scale) ──
  devBlock: {
    marginBottom: 8,
  },
  devTraitRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 2,
    borderBottomWidth: 0.4,
    borderBottomColor: BURGUNDY_COLOR.line,
  },
  devTraitLabel: {
    fontSize: 8.6,
    fontFamily: "Helvetica-Bold",
    color: BURGUNDY_COLOR.ink,
    flex: 1,
  },
  devDotsGroup: {
    flexDirection: "row",
    alignItems: "center",
  },
  devDots: {
    flexDirection: "row",
    marginLeft: 4,
  },
  devDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: BURGUNDY_COLOR.line,
    marginLeft: 1.5,
  },
  devDotOn: {
    backgroundColor: BURGUNDY_COLOR.primary,
  },
  devRatingText: {
    fontSize: 7.4,
    color: BURGUNDY_COLOR.soft,
    marginLeft: 6,
    width: 60,
    textAlign: "right",
  },

  // ── FEEDBACK (remarks) ──
  feedbackBlock: {
    marginBottom: 8,
  },
  feedbackRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 4,
    paddingBottom: 2,
    borderBottomWidth: 0.5,
    borderBottomColor: BURGUNDY_COLOR.rule,
  },
  feedbackLabel: {
    width: 130,
    fontSize: 7.2,
    fontFamily: "Helvetica-Bold",
    color: BURGUNDY_COLOR.primaryDeep,
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  feedbackValue: {
    flex: 1,
    fontSize: 8.4,
    color: BURGUNDY_COLOR.ink,
    height: 12,
  },

  // ── SIGNATURES ──
  signatureRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  signatureBlock: {
    flex: 1,
    alignItems: "center",
    marginHorizontal: 6,
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
    borderTopColor: BURGUNDY_COLOR.ink,
    marginTop: 10,
    marginBottom: 2,
  },
  signatureLabel: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: BURGUNDY_COLOR.primaryDeep,
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  signatureDate: {
    fontSize: 6.6,
    color: BURGUNDY_COLOR.soft,
    marginTop: 1,
  },

  // ── BOTTOM PINNED (PD + feedback + signatures + scale + footer) ──
  bottomPinned: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: BURGUNDY_PAGE.marginX,
    paddingBottom: BURGUNDY_PAGE.marginBottom,
  },

  // ── SCALE + FOOTER ──
  scaleLine: {
    fontSize: 6.6,
    color: BURGUNDY_COLOR.soft,
    paddingVertical: 3,
    borderTopWidth: 0.6,
    borderTopColor: BURGUNDY_COLOR.line,
    lineHeight: 1.4,
  },
  scaleBold: {
    fontFamily: "Helvetica-Bold",
    color: BURGUNDY_COLOR.primaryDeep,
  },
  footerBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: BURGUNDY_COLOR.primaryDeep,
    marginHorizontal: -BURGUNDY_PAGE.marginX,
    paddingHorizontal: BURGUNDY_PAGE.marginX,
    paddingVertical: 5,
    fontSize: 6.6,
    color: BURGUNDY_COLOR.primaryLight,
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
});
