// src/lib/pdf/templates/report-card-styles.ts
import { StyleSheet } from "@react-pdf/renderer";

// ═══════════════════════════════════════════════════════════════════════════
// DESIGN TOKENS — NexaForge green primary, tuned harmonizing grades
// ═══════════════════════════════════════════════════════════════════════════
export const COLOR = {
  // NexaForge brand green (from global.css --primary)
  primary: "#15803d",
  primaryDark: "#0f5c2c",
  primaryTint: "#e8f5ee",

  // Paper
  paper: "#ffffff",
  paperTint: "#fbfdfa",

  // Ink
  black: "#111111",
  darkGrey: "#2f2f2f",
  midGrey: "#666666",
  softGrey: "#8a8a8a",
  hairline: "#d4d4d4",
  ruleGrey: "#c8c8c8",
  tableHeadBg: "#f0f7f2",
  zebraBg: "#f8fbf9",

  // Grades — harmonized with green (analogous + one warning red)
  gradeA: "#15803d", // green (primary)
  gradeB: "#0f766e", // teal (analogous)
  gradeC: "#a16207", // amber-700 (warm neutral)
  gradeD: "#b45309", // orange-700 (warm)
  gradeF: "#b91c1c", // red-700 (only warning color)

  white: "#ffffff",
} as const;

export const PAGE = {
  marginX: 32,
  marginTop: 22,
  marginBottom: 14,
  // A4 = 210 × 297mm = 595.28 × 841.89 pt
  width: 595.28,
  height: 841.89,
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// STYLES — verified against @react-pdf/renderer 4.9.0
//   No `gap`. No `borderStyle: "dotted"`. No `boxSizing`. Explicit margins.
// ═══════════════════════════════════════════════════════════════════════════
export const styles = StyleSheet.create({
  // ── Page ──
  page: {
    width: PAGE.width,
    height: PAGE.height,
    paddingTop: PAGE.marginTop,
    paddingHorizontal: PAGE.marginX,
    paddingBottom: PAGE.marginBottom,
    backgroundColor: COLOR.paper,
    fontFamily: "Helvetica",
    fontSize: 8,
    color: COLOR.black,
    // NOTE: do NOT set flexDirection:column or height:100% here — we use
    // absolute positioning for the footer only, and vertical flow for zones.
  },

  // ═══════════════════════════════════════════════════════════════════════
  // ZONE 1 — HEADER
  // ═══════════════════════════════════════════════════════════════════════
  header: {
    alignItems: "center",
    marginBottom: 6,
  },
  logo: {
    width: 42,
    height: 42,
    marginBottom: 3,
    objectFit: "contain",
  },
  schoolName: {
    fontSize: 15,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 1,
    textTransform: "uppercase",
    color: COLOR.primary,
    textAlign: "center",
    marginBottom: 1,
  },
  schoolContact: {
    fontSize: 7,
    color: COLOR.darkGrey,
    textAlign: "center",
    marginTop: 1,
  },

  // ═══════════════════════════════════════════════════════════════════════
  // ZONE 2 — TITLE BAR (NexaForge green)
  // ═══════════════════════════════════════════════════════════════════════
  titleBar: {
    backgroundColor: COLOR.primary,
    paddingVertical: 4,
    alignItems: "center",
    marginBottom: 6,
  },
  titleText: {
    fontSize: 9.5,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 3,
    textTransform: "uppercase",
    color: COLOR.white,
  },

  // ═══════════════════════════════════════════════════════════════════════
  // ZONE 3 — IDENTITY
  // ═══════════════════════════════════════════════════════════════════════
  identityBlock: {
    flexDirection: "row",
    borderTopWidth: 0.5,
    borderBottomWidth: 0.5,
    borderColor: COLOR.ruleGrey,
    paddingVertical: 5,
    marginBottom: 6,
  },
  identityColumn: {
    flex: 1,
    paddingRight: 8,
  },
  identityColumnLast: {
    flex: 1,
  },
  identityRow: {
    flexDirection: "row",
    marginBottom: 3,
  },
  identityRowLast: {
    flexDirection: "row",
  },
  identityLabel: {
    width: 52,
    fontSize: 6.5,
    fontFamily: "Helvetica-Bold",
    color: COLOR.midGrey,
    letterSpacing: 0.4,
    textTransform: "uppercase",
    paddingTop: 0.5,
  },
  identityValue: {
    flex: 1,
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: COLOR.black,
  },

  // ═══════════════════════════════════════════════════════════════════════
  // ZONE 4 — SUBJECT TABLE (single-column, full-width)
  // ═══════════════════════════════════════════════════════════════════════
  tableBlock: {
    marginBottom: 5,
  },
  tableHeaderRow: {
    flexDirection: "row",
    backgroundColor: COLOR.primaryTint,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLOR.primary,
    paddingVertical: 3,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: COLOR.hairline,
    paddingVertical: 2.5,
    minHeight: 14,
    alignItems: "center",
  },
  tableRowZebra: {
    backgroundColor: COLOR.zebraBg,
  },
  tableCellHeader: {
    fontSize: 6.5,
    fontFamily: "Helvetica-Bold",
    color: COLOR.primaryDark,
    letterSpacing: 0.5,
    textTransform: "uppercase",
    textAlign: "center",
    paddingHorizontal: 2,
  },
  tableCellHeaderLeft: {
    fontSize: 6.5,
    fontFamily: "Helvetica-Bold",
    color: COLOR.primaryDark,
    letterSpacing: 0.5,
    textTransform: "uppercase",
    textAlign: "left",
    paddingHorizontal: 4,
  },
  tableCell: {
    fontSize: 7.5,
    color: COLOR.black,
    paddingHorizontal: 2,
    textAlign: "center",
  },
  tableCellSubject: {
    fontSize: 7.5,
    color: COLOR.black,
    paddingHorizontal: 4,
    textAlign: "left",
  },
  tableCellBold: {
    fontSize: 7.5,
    fontFamily: "Helvetica-Bold",
    color: COLOR.black,
    paddingHorizontal: 2,
    textAlign: "center",
  },
  tableCellGrade: {
    fontSize: 7.5,
    fontFamily: "Helvetica-Bold",
    paddingHorizontal: 2,
    textAlign: "center",
  },
  // Column flex weights (sum to full row)
  colSubject: { flex: 3.2 },
  colCA: { flex: 1.1 },
  colExam: { flex: 1.1 },
  colTotal: { flex: 1.1 },
  colGrade: { flex: 1.0 },

  // ═══════════════════════════════════════════════════════════════════════
  // ZONE 4b — OVERALL BANNER
  // ═══════════════════════════════════════════════════════════════════════
  bannerRow: {
    flexDirection: "row",
    marginBottom: 6,
  },
  bannerCell: {
    flex: 1,
    borderLeftWidth: 3,
    borderLeftColor: COLOR.primary,
    paddingLeft: 6,
    paddingVertical: 3,
    marginRight: 4,
  },
  bannerCellLast: {
    flex: 1,
    borderLeftWidth: 3,
    borderLeftColor: COLOR.primary,
    paddingLeft: 6,
    paddingVertical: 3,
  },
  bannerLabel: {
    fontSize: 6,
    letterSpacing: 0.5,
    textTransform: "uppercase",
    color: COLOR.midGrey,
    marginBottom: 1,
  },
  bannerValue: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: COLOR.black,
  },

  // ═══════════════════════════════════════════════════════════════════════
  // ZONE 5 — AFFECTIVE + PSYCHOMOTOR (two columns)
  // ═══════════════════════════════════════════════════════════════════════
  traitsRow: {
    flexDirection: "row",
    marginBottom: 6,
  },
  traitsColumn: {
    flex: 1,
    paddingRight: 8,
  },
  traitsColumnLast: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    color: COLOR.primaryDark,
    borderBottomWidth: 0.5,
    borderBottomColor: COLOR.primary,
    paddingBottom: 2,
    marginBottom: 3,
  },
  legendRow: {
    flexDirection: "row",
    marginBottom: 3,
    justifyContent: "flex-end",
  },
  legendItem: {
    fontSize: 6,
    color: COLOR.midGrey,
    marginLeft: 6,
  },
  traitRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 1.5,
    borderBottomWidth: 0.3,
    borderBottomColor: COLOR.hairline,
  },
  traitRowLast: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 1.5,
  },
  traitLabel: {
    flex: 1.6,
    fontSize: 7,
    color: COLOR.black,
  },
  // CRITICAL for react-pdf 4.9.0: NO `gap`. Explicit marginRight per box.
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
    width: 6,
    height: 6,
    borderWidth: 0.6,
    borderColor: COLOR.black,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 1.5,
  },
  checkboxInner: {
    width: 3.2,
    height: 3.2,
    backgroundColor: COLOR.black,
  },
  checkboxLabel: {
    fontSize: 6,
    color: COLOR.darkGrey,
  },

  // ═══════════════════════════════════════════════════════════════════════
  // ZONE 6 — REMARKS + SIGNATURES (pinned to bottom via absolute)
  // ═══════════════════════════════════════════════════════════════════════
  bottomBlock: {
    position: "absolute",
    bottom: 30,
    left: PAGE.marginX,
    right: PAGE.marginX,
  },
  remarkRow: {
    flexDirection: "row",
    marginBottom: 3,
    alignItems: "flex-end",
  },
  remarkLabel: {
    width: 78,
    fontSize: 6.5,
    fontFamily: "Helvetica-Bold",
    color: COLOR.midGrey,
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  remarkLine: {
    flex: 1,
    borderBottomWidth: 0.5,
    borderBottomColor: COLOR.softGrey,
    height: 11,
    paddingHorizontal: 3,
    fontSize: 7,
    color: COLOR.black,
    paddingBottom: 1,
  },
  signatureRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  signatureBlock: {
    width: "30%",
    alignItems: "center",
  },
  signatureImage: {
    width: 70,
    height: 20,
    objectFit: "contain",
    marginBottom: 1,
  },
  signatureLine: {
    width: "100%",
    borderTopWidth: 0.6,
    borderTopColor: COLOR.black,
    marginTop: 12,
    marginBottom: 2,
  },
  signatureName: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: COLOR.black,
    textAlign: "center",
  },
  signatureTitle: {
    fontSize: 5.5,
    color: COLOR.midGrey,
    letterSpacing: 0.4,
    textTransform: "uppercase",
    textAlign: "center",
    marginTop: 0.5,
  },

  // ═══════════════════════════════════════════════════════════════════════
  // FOOTER (absolute, always on page 1)
  // ═══════════════════════════════════════════════════════════════════════
  footer: {
    position: "absolute",
    bottom: 12,
    left: PAGE.marginX,
    right: PAGE.marginX,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 5.5,
    color: COLOR.softGrey,
    paddingTop: 3,
    borderTopWidth: 0.4,
    borderTopColor: COLOR.hairline,
  },
});
