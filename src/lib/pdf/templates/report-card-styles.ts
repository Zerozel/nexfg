// src/lib/pdf/templates/report-card-styles.ts
import { StyleSheet } from "@react-pdf/renderer";

// ═══════════════════════════════════════════════════════════════════════════
// Design tokens
// ═══════════════════════════════════════════════════════════════════════════
export const COLOR = {
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

export const PAGE = {
  marginX: 30,
  marginTop: 24,
  marginBottom: 15, // For footer
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// Styles
// ═══════════════════════════════════════════════════════════════════════════
export const styles = StyleSheet.create({
  page: {
    paddingTop: PAGE.marginTop,
    paddingHorizontal: PAGE.marginX,
    paddingBottom: PAGE.marginBottom,
    fontFamily: "Helvetica",
    fontSize: 8,
    color: COLOR.black,
    backgroundColor: COLOR.white,
    flexDirection: "column", // Needed for the flex spacer
    height: "100%", // Needed for the flex spacer
  },
  
  // ── Header ──
  header: { alignItems: "center", marginBottom: 6 },
  logo: { width: 36, height: 36, marginBottom: 2, objectFit: "contain" },
  schoolName: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    textAlign: "center",
  },
  schoolContact: {
    fontSize: 7,
    color: COLOR.darkGrey,
    textAlign: "center",
    marginTop: 1,
  },

  // ── Title Banner ──
  titleBanner: {
    paddingVertical: 3,
    alignItems: "center",
    marginBottom: 6,
  },
  titleText: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 2,
    textTransform: "uppercase",
    color: COLOR.white,
    textAlign: "center",
  },

  // ── Identity ──
  identityRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 1,
  },
  identityText: {
    fontSize: 8,
  },
  bold: {
    fontFamily: "Helvetica-Bold",
  },

  // ── Table ──
  tableContainer: { flexDirection: "row", marginBottom: 6 },
  tableCol: { flex: 1 },
  tableHeaderRow: {
    flexDirection: "row",
    backgroundColor: COLOR.tableHeadBg,
    borderBottomWidth: 1,
    borderBottomColor: COLOR.black,
    minHeight: 14,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: COLOR.ruleGrey,
    alignItems: "center",
    minHeight: 13,
  },
  tableCell: {
    flex: 1,
    paddingVertical: 1,
    paddingHorizontal: 2,
    textAlign: "center",
    fontSize: 7,
  },
  tableCellSubject: {
    flex: 3,
    textAlign: "left",
    paddingLeft: 3,
  },
  tableCellBold: {
    fontFamily: "Helvetica-Bold",
  },

  // ── Banner ──
  bannerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
    gap: 4,
  },
  bannerCell: {
    flex: 1,
    borderWidth: 0.5,
    borderColor: COLOR.black,
    padding: 3,
    alignItems: "center",
  },
  bannerLabel: {
    fontSize: 6,
    textTransform: "uppercase",
    color: COLOR.midGrey,
  },
  bannerValue: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
  },

  // ── Spacer (pushes bottom content down) ──
  spacer: {
    flexGrow: 1,
  },

  // ── Bottom Content Container ──
  bottomContainer: {
    marginTop: 10,
  },

  // ── Traits Grid ──
  gridContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  gridColumn: {
    width: "48%",
  },
  sectionTitle: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    borderBottomWidth: 0.5,
    borderBottomColor: COLOR.black,
    marginBottom: 2,
    paddingBottom: 1,
  },
  legendRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 6,
    marginBottom: 2,
    fontSize: 6,
    color: COLOR.midGrey,
  },
  traitRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 1.5,
  },
  traitLabel: {
    width: 65,
    fontSize: 7,
  },
  checkboxGroup: {
    flexDirection: "row",
    gap: 3,
    flex: 1,
    justifyContent: "flex-end",
  },
  checkbox: {
    width: 6,
    height: 6,
    borderWidth: 0.5,
    borderColor: COLOR.black,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 1,
  },
  checkboxInner: {
    width: 3,
    height: 3,
    backgroundColor: COLOR.black,
  },
  checkboxLabel: {
    fontSize: 6,
    marginRight: 3,
  },

  // ── Remarks ──
  remarkRow: {
    flexDirection: "row",
    marginBottom: 3,
    alignItems: "flex-start",
  },
  remarkLabel: {
    width: 85,
    fontFamily: "Helvetica-Bold",
    fontSize: 7,
  },
  remarkValue: {
    flex: 1,
    fontSize: 7,
    borderBottomWidth: 0.5,
    borderBottomColor: COLOR.softGrey,
    borderStyle: "dotted",
    minHeight: 10,
  },

  // ── Signatures ──
  signatureRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    alignItems: "flex-end",
  },
  signatureBlock: {
    width: "40%",
    alignItems: "center",
  },
  signatureLine: {
    width: "100%",
    borderTopWidth: 0.5,
    borderTopColor: COLOR.black,
    marginBottom: 2,
    marginTop: 10,
  },
  signatureLabel: {
    fontSize: 6,
    textTransform: "uppercase",
  },
  signatureImage: {
    height: 20,
    width: 50,
    objectFit: "contain",
    marginBottom: 2,
  },

  // ── Footer ──
  footer: {
    position: "absolute",
    bottom: 15,
    left: PAGE.marginX,
    right: PAGE.marginX,
    textAlign: "center",
    fontSize: 6,
    color: COLOR.softGrey,
  },
});
