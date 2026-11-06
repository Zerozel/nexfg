// src/lib/pdf/templates/report-card-styles.ts
import { StyleSheet } from "@react-pdf/renderer";

// ═══════════════════════════════════════════════════════════════════════════
// DESIGN TOKENS — Deep green + black only. Prints cleanly in B&W.
// ═══════════════════════════════════════════════════════════════════════════
export const COLOR = {
  // Deep green (banner, headings) — safe in grayscale
  primary: "#14532d",
  primaryTint: "#eaf4ee",

  // Paper
  paper: "#ffffff",

  // Ink
  black: "#111111",
  darkGrey: "#2a2a2a",
  midGrey: "#555555",
  softGrey: "#7a7a7a",
  hairline: "#d0d0d0",
  ruleGrey: "#bbbbbb",
  tableHeadBg: "#e8f0ea",
  zebraBg: "#f7faf8",

  // All grades = black. Differentiation is by weight/style only.
  gradeText: "#111111",

  white: "#ffffff",
} as const;

export const PAGE = {
  marginX: 32,
  marginTop: 22,
  marginBottom: 14,
  width: 595.28,
  height: 841.89,
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// STYLES — verified against @react-pdf/renderer 4.9.0
// ═══════════════════════════════════════════════════════════════════════════
export const styles = StyleSheet.create({
  page: {
    width: PAGE.width,
    height: PAGE.height,
    paddingTop: PAGE.marginTop,
    paddingHorizontal: PAGE.marginX,
    paddingBottom: PAGE.marginBottom,
    backgroundColor: COLOR.paper,
    fontFamily: "Helvetica",
    fontSize: 9,
    color: COLOR.black,
  },

  // ── ZONE 1 — HEADER ──
  header: {
    alignItems: "center",
    marginBottom: 7,
  },
  logo: {
    width: 44,
    height: 44,
    marginBottom: 3,
    objectFit: "contain",
  },
  schoolName: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 1,
    textTransform: "uppercase",
    color: COLOR.primary,
    textAlign: "center",
    marginBottom: 1,
  },
  schoolContact: {
    fontSize: 8,
    color: COLOR.darkGrey,
    textAlign: "center",
    marginTop: 1,
  },

  // ── ZONE 2 — TITLE BAR (deep green) ──
  titleBar: {
    backgroundColor: COLOR.primary,
    paddingVertical: 5,
    alignItems: "center",
    marginBottom: 7,
  },
  titleText: {
    fontSize: 10.5,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 3,
    textTransform: "uppercase",
    color: COLOR.white,
  },

  // ── ZONE 3 — IDENTITY ──
  identityBlock: {
    flexDirection: "row",
    borderTopWidth: 0.5,
    borderBottomWidth: 0.5,
    borderColor: COLOR.ruleGrey,
    paddingVertical: 6,
    marginBottom: 7,
  },
  identityColumn: { flex: 1, paddingRight: 8 },
  identityColumnLast: { flex: 1 },
  identityRow: { flexDirection: "row", marginBottom: 3.5 },
  identityRowLast: { flexDirection: "row" },
  identityLabel: {
    width: 54,
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: COLOR.midGrey,
    letterSpacing: 0.4,
    textTransform: "uppercase",
    paddingTop: 0.5,
  },
  identityValue: {
    flex: 1,
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: COLOR.black,
  },

  // ── ZONE 4 — SUBJECT TABLE ──
  tableBlock: {
    marginBottom: 6,
  },
  tableHeaderRow: {
    flexDirection: "row",
    backgroundColor: COLOR.tableHeadBg,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLOR.primary,
    paddingVertical: 4,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: COLOR.hairline,
    paddingVertical: 3.5,
    minHeight: 17,
    alignItems: "center",
  },
  tableRowZebra: {
    backgroundColor: COLOR.zebraBg,
  },
  tableCellHeader: {
    fontSize: 7.5,
    fontFamily: "Helvetica-Bold",
    color: COLOR.primary,
    letterSpacing: 0.5,
    textTransform: "uppercase",
    textAlign: "center",
    paddingHorizontal: 2,
  },
  tableCellHeaderLeft: {
    fontSize: 7.5,
    fontFamily: "Helvetica-Bold",
    color: COLOR.primary,
    letterSpacing: 0.5,
    textTransform: "uppercase",
    textAlign: "left",
    paddingHorizontal: 4,
  },
  tableCell: {
    fontSize: 9,
    color: COLOR.black,
    paddingHorizontal: 2,
    textAlign: "center",
  },
  tableCellSubject: {
    fontSize: 9,
    color: COLOR.black,
    paddingHorizontal: 4,
    textAlign: "left",
  },
  tableCellBold: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: COLOR.black,
    paddingHorizontal: 2,
    textAlign: "center",
  },
  tableCellGrade: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: COLOR.gradeText,
    paddingHorizontal: 2,
    textAlign: "center",
  },
  tableCellRemark: {
    fontSize: 8,
    color: COLOR.darkGrey,
    paddingHorizontal: 3,
    textAlign: "left",
  },

  // Column flex weights
  colSubject: { flex: 3.0 },
  colCA: { flex: 0.9 },
  colExam: { flex: 0.9 },
  colTotal: { flex: 1.0 },
  colGrade: { flex: 0.9 },
  colRemark: { flex: 2.3 },

  // ── ZONE 4b — OVERALL BANNER ──
  bannerRow: {
    flexDirection: "row",
    marginBottom: 7,
  },
  bannerCell: {
    flex: 1,
    borderLeftWidth: 3,
    borderLeftColor: COLOR.primary,
    paddingLeft: 6,
    paddingVertical: 4,
    marginRight: 4,
  },
  bannerCellLast: {
    flex: 1,
    borderLeftWidth: 3,
    borderLeftColor: COLOR.primary,
    paddingLeft: 6,
    paddingVertical: 4,
  },
  bannerLabel: {
    fontSize: 6.5,
    letterSpacing: 0.5,
    textTransform: "uppercase",
    color: COLOR.midGrey,
    marginBottom: 1,
  },
  bannerValue: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: COLOR.black,
  },

  // ── ZONE 5 — AFFECTIVE + PSYCHOMOTOR ──
  traitsRow: {
    flexDirection: "row",
    marginBottom: 6,
  },
  traitsColumn: { flex: 1, paddingRight: 10 },
  traitsColumnLast: { flex: 1 },
  sectionTitle: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    color: COLOR.primary,
    borderBottomWidth: 0.7,
    borderBottomColor: COLOR.primary,
    paddingBottom: 2.5,
    marginBottom: 4,
  },
  legendRow: {
    flexDirection: "row",
    marginBottom: 4,
    justifyContent: "flex-end",
  },
  legendItem: {
    fontSize: 6.5,
    color: COLOR.midGrey,
    marginLeft: 8,
  },
  traitRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 2.5,
    borderBottomWidth: 0.3,
    borderBottomColor: COLOR.hairline,
  },
  traitLabel: { flex: 1.7, fontSize: 8, color: COLOR.black },
  checkboxGroup: {
    flexDirection: "row",
    flex: 1.3,
    justifyContent: "flex-end",
  },
  checkboxWrapper: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 6,
  },
  checkbox: {
    width: 7,
    height: 7,
    borderWidth: 0.7,
    borderColor: COLOR.black,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 1.5,
  },
  checkboxInner: { width: 3.8, height: 3.8, backgroundColor: COLOR.black },
  checkboxLabel: { fontSize: 6.5, color: COLOR.darkGrey },

  // ── ZONE 6 — REMARKS + SIGNATURES ──
  remarksBlock: {
    marginBottom: 8,
  },
  remarkRow: {
    flexDirection: "row",
    marginBottom: 4,
    alignItems: "flex-end",
  },
  remarkLabel: {
    width: 82,
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: COLOR.midGrey,
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  remarkLine: {
    flex: 1,
    borderBottomWidth: 0.5,
    borderBottomColor: COLOR.softGrey,
    height: 12,
    paddingHorizontal: 3,
    fontSize: 8,
    color: COLOR.black,
    paddingBottom: 1,
  },
  signatureRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  signatureBlock: {
    width: "30%",
    alignItems: "center",
  },
  signatureImage: {
    width: 72,
    height: 22,
    objectFit: "contain",
    marginBottom: 1,
  },
  signatureLine: {
    width: "100%",
    borderTopWidth: 0.6,
    borderTopColor: COLOR.black,
    marginTop: 14,
    marginBottom: 2,
  },
  signatureName: {
    fontSize: 7.5,
    fontFamily: "Helvetica-Bold",
    color: COLOR.black,
    textAlign: "center",
  },
  signatureTitle: {
    fontSize: 6,
    color: COLOR.midGrey,
    letterSpacing: 0.4,
    textTransform: "uppercase",
    textAlign: "center",
    marginTop: 0.5,
  },
    // ── BOTTOM BLOCK (pins traits + remarks + signatures to page bottom) ──
  bottomBlock: {
    position: "absolute",
    bottom: 28,
    left: PAGE.marginX,
    right: PAGE.marginX,
  },


  // ── FOOTER ──
  footer: {
    position: "absolute",
    bottom: 12,
    left: PAGE.marginX,
    right: PAGE.marginX,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 6,
    color: COLOR.softGrey,
    paddingTop: 3,
    borderTopWidth: 0.4,
    borderTopColor: COLOR.hairline,
  },
});
