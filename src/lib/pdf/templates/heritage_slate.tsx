// src/lib/pdf/templates/heritage_slate.tsx
import React from "react";
import { Page, Text, View, Image } from "@react-pdf/renderer";
import type { IndividualReportCardData } from "@/types/printing";
import {
  slateStyles as s,
  SLATE_COLOR,
} from "./heritage-slate-styles";

const AFFECTIVE_TRAITS = [
  "Punctuality",
  "Obedience",
  "Readiness to help",
  "Demonstrate Self Control",
  "Courteous",
  "Politeness",
  "Honesty",
  "Neatness",
  "Attentiveness",
];

const TRAIT_RUBRIC: Array<{ key: string; label: string }> = [
  { key: "Excellent", label: "Excellent" },
  { key: "Very Good", label: "Very Good" },
  { key: "Good", label: "Good" },
  { key: "Fair", label: "Fair" },
  { key: "Poor", label: "Poor" },
];

function getRatingValue(
  traits: any[] | null | undefined,
  targetName: string
): string | null {
  if (!traits) return null;
  const found = traits.find(
    (t) => t.trait?.toString().toLowerCase() === targetName.toLowerCase()
  );
  if (!found) return null;
  const raw = found.rating?.toString().trim() || "";
  if (!raw) return null;

  const upper = raw.toUpperCase();
  if (upper === "A") return "Excellent";
  if (upper === "B") return "Very Good";
  if (upper === "C") return "Good";
  if (upper === "D") return "Fair";
  if (upper === "F") return "Poor";

  const match = TRAIT_RUBRIC.find(
    (r) => r.label.toLowerCase() === raw.toLowerCase()
  );
  return match ? match.label : null;
}

function getOrdinal(n: number): string {
  if (!Number.isFinite(n) || n <= 0) return "0";
  const ords = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (ords[(v - 20) % 10] || ords[v] || ords[0]);
}

function gradeColor(grade: string | null | undefined): string {
  if (!grade) return SLATE_COLOR.nil;
  const g = grade.trim().toUpperCase();
  if (/^A/.test(g)) return SLATE_COLOR.gradeA;
  if (/^B/.test(g)) return SLATE_COLOR.gradeB;
  if (/^C/.test(g)) return SLATE_COLOR.gradeC;
  return SLATE_COLOR.gradeD;
}

function formatPrintDate(): string {
  return new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function TraitRow({
  label,
  value,
}: {
  label: string;
  value: string | null;
}) {
  return (
    <View style={s.devRow}>
      <Text style={s.devLabel}>{label}</Text>
      <View style={s.devRubricGroup}>
        {TRAIT_RUBRIC.map((opt) => {
          const isChecked = value === opt.label;
          return (
            <View key={opt.label} style={s.devRubricItem}>
              <View
                style={[
                  s.devRubricCheckbox,
                  isChecked ? s.devRubricCheckboxChecked : {},
                ]}
              >
                {isChecked && <View style={s.devRubricCheckmark} />}
              </View>
              <Text style={s.devRubricLabel}>{opt.label}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function SubjectTile({ subject }: { subject: any }) {
  const ca1 = subject?.ca1_score ?? null;
  const ca2 = subject?.ca2_score ?? null;
  const ca3 = subject?.ca3_score ?? null;
  const exam = subject?.exam_score ?? null;
  const hasData =
    ca1 !== null || ca2 !== null || ca3 !== null || exam !== null;
  const caTotal = (ca1 || 0) + (ca2 || 0) + (ca3 || 0);
  const examTotal = exam || 0;
  const total = subject?.score ?? caTotal + examTotal;
  const grade = subject?.grade || null;

  return (
    <View style={[s.tile, hasData ? {} : s.tileEmpty, hasData ? { borderLeftColor: gradeColor(grade) } : {}]}>
      <View style={s.tileLeft}>
        <Text style={s.tileSubjectName}>
          {subject?.name || "—"}
        </Text>
        <Text style={s.tileMeta}>
          CA <Text style={s.tileMetaBold}>{caTotal}</Text> · Exam{" "}
          <Text style={s.tileMetaBold}>{examTotal}</Text>
        </Text>
      </View>
      <View style={s.tileRight}>
        <Text style={[s.tileTotal, hasData ? {} : s.tileTotalEmpty]}>
          {hasData ? total : "—"}
        </Text>
        <View
          style={[
            s.tileGrade,
            hasData
              ? { backgroundColor: gradeColor(grade) }
              : s.tileGradeEmpty,
          ]}
        >
          <Text
            style={{
              fontSize: 7.6,
              fontFamily: "Helvetica-Bold",
              color: hasData ? SLATE_COLOR.white : SLATE_COLOR.nil,
            }}
          >
            {hasData ? grade || "—" : "—"}
          </Text>
        </View>
      </View>
    </View>
  );
}

export function HeritageSlatePage({
  data,
}: {
  data: IndividualReportCardData;
}) {
  const safeSchool: any = data?.school || {};
  const safeStudent: any = data?.student || {};
  const safeClass: any = data?.class || {};
  const safeTerm: any = data?.term || {};
  const subjects: any[] = Array.isArray(data?.subjects) ? data.subjects : [];
  const safeOverall: any = data?.overall || {};

  const scored = subjects.filter((sub) => sub && sub.score != null);
  const totalObtained = scored.reduce(
    (sum, sub) => sum + Number(sub.score || 0),
    0
  );
  const totalMax = scored.length * 100;

  const avg: number =
    typeof safeOverall.average === "number" ? safeOverall.average : 0;
  const pos: number =
    typeof safeOverall.position === "number" ? safeOverall.position : 0;
  const totalStudents: number =
    typeof safeOverall.total_students === "number"
      ? safeOverall.total_students
      : 0;
  const overallGrade: string = safeOverall.grade || "—";

  const printDate = formatPrintDate();

  return (
    <Page size="A4" style={s.page}>
      {/* ── SIDEBAR ── */}
      <View style={s.sidebar}>
        <View style={s.sideAccentBar} />

        {safeSchool.logo_url ? (
          <Image src={safeSchool.logo_url} style={s.crest} />
        ) : (
          <View style={s.crest}>
            <Text style={s.crestText}>
              {(safeSchool.name || "S").charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
        <Text style={s.sideSchoolName}>
          {safeSchool.name || "School Name"}
        </Text>
        <Text style={s.sideContact}>
          {[safeSchool.address, safeSchool.phone, safeSchool.email]
            .filter(Boolean)
            .join("\n")}
        </Text>

        <View style={s.sideRule} />

        <Text style={s.sideLabel}>Student</Text>
        <Text style={s.sideStudentName}>
          {safeStudent.full_name || "Unknown"}
        </Text>

        <View style={s.sideKVBlock}>
          <View style={s.sideKVRow}>
            <Text style={s.sideKVLabel}>Class</Text>
            <Text style={s.sideKVValue}>{safeClass.name || "—"}</Text>
          </View>
          <View style={s.sideKVRow}>
            <Text style={s.sideKVLabel}>Admission number</Text>
            <Text style={s.sideKVValue}>
              {safeStudent.admission_number || "—"}
            </Text>
          </View>
          <View style={s.sideKVRow}>
            <Text style={s.sideKVLabel}>Session · term</Text>
            <Text style={s.sideKVValue}>
              {safeTerm.academic_session || "—"}
              {safeTerm.name ? ` · ${safeTerm.name}` : ""}
            </Text>
          </View>
        </View>

        <View style={s.sideRule} />

        <View style={s.sideStatsBlock}>
          <View style={s.sideStatRow}>
            <Text style={s.sideStatLabel}>Total score</Text>
            <Text style={s.sideStatValue}>
              {scored.length > 0 ? totalObtained : "—"}
              <Text style={s.sideStatValueSmall}>
                {scored.length > 0 ? ` / ${totalMax}` : ""}
              </Text>
            </Text>
          </View>
          <View style={s.sideStatRow}>
            <Text style={s.sideStatLabel}>Overall average</Text>
            <Text style={s.sideStatValue}>{avg.toFixed(1)}%</Text>
          </View>
          <View style={s.sideStatRow}>
            <Text style={s.sideStatLabel}>Overall grade</Text>
            <Text style={s.sideStatValue}>{overallGrade}</Text>
          </View>
          <View style={s.sideStatRow}>
            <Text style={s.sideStatLabel}>Class position</Text>
            <Text style={s.sideStatValue}>
              {getOrdinal(pos)}
              <Text style={s.sideStatValueSmall}>
                {" "}
                of {totalStudents}
              </Text>
            </Text>
          </View>
        </View>

        <View style={s.sideScaleBlock}>
          <Text style={s.sideLabel}>Grading scale</Text>
          {[
            ["A1", "75–100 Excellent"],
            ["B2", "70–74 Very Good"],
            ["B3", "65–69 Good"],
            ["C4–C6", "50–64 Credit"],
            ["D7–E8", "40–49 Pass"],
            ["F9", "0–39 Needs Support"],
          ].map(([g, r]) => (
            <View key={g} style={s.sideScaleRow}>
              <Text style={s.sideScaleGrade}>{g}</Text>
              <Text style={s.sideScaleRange}>{r}</Text>
            </View>
          ))}
          <Text style={s.sideFooter}>POWERED BY NEXAFORGES</Text>
        </View>
      </View>

      {/* ── MAIN ── */}
      <View style={s.main}>
        <View style={s.mainTopBar}>
          <Text style={s.mainTitle}>Student report card</Text>
          <Text style={s.mainTerm}>
            {safeTerm.name || "Term"}
            {safeTerm.academic_session
              ? ` · ${safeTerm.academic_session}`
              : ""}
          </Text>
        </View>

        {/* Academic Performance */}
        <View style={s.sectionHeader}>
          <Text>Academic performance</Text>
          <Text style={s.sectionHeaderHint}>
            CA out of 20 · Exam out of 80 · Total out of 100
          </Text>
        </View>

        <View style={s.tilesGrid}>
          {subjects.length === 0 ? (
            <View style={{ width: "100%", paddingVertical: 12 }}>
              <Text
                style={{
                  fontSize: 8.4,
                  color: SLATE_COLOR.soft,
                  textAlign: "center",
                }}
              >
                No compiled results available
              </Text>
            </View>
          ) : (
            subjects.map((subject, idx) => (
              <SubjectTile
                key={subject?.id || `tile-${idx}`}
                subject={subject}
              />
            ))
          )}
        </View>

        <Text style={s.tileNote}>
          A dash means the score is not available yet.
        </Text>

        {/* Personal Development */}
        <View style={s.sectionHeader}>
          <Text>Personal development</Text>
        </View>
        <View style={s.devBlock}>
          {AFFECTIVE_TRAITS.map((trait) => (
            <TraitRow
              key={trait}
              label={trait}
              value={getRatingValue(data.affective_traits, trait)}
            />
          ))}
        </View>

        {/* Feedback */}
        <View style={s.sectionHeader}>
          <Text>Teacher and school feedback</Text>
        </View>
        <View style={s.feedbackBlock}>
          <View style={s.feedbackBox}>
            <Text style={s.feedbackLabel}>Class teacher's comment</Text>
            <Text style={s.feedbackValue}>
              {data.teacher_comment || " "}
            </Text>
          </View>
          <View style={s.feedbackBox}>
            <Text style={s.feedbackLabel}>Principal's comment</Text>
            <Text style={s.feedbackValue}>
              {data.principal_comment || " "}
            </Text>
          </View>
        </View>

        {/* Signatures */}
        <View style={s.signatureRow}>
          <View style={s.signatureBlock}>
            <View style={s.signatureLine} />
            <Text style={s.signatureLabel}>Class Teacher</Text>
            <Text style={s.signatureDate}>Date: {printDate}</Text>
          </View>
          <View style={s.signatureBlock}>
            {safeSchool.principal_signature_url ? (
              <Image
                src={safeSchool.principal_signature_url}
                style={s.signatureImage}
              />
            ) : null}
            <View style={s.signatureLine} />
            <Text style={s.signatureLabel}>
              {safeSchool.principal_name || "Principal"}
            </Text>
            <Text style={s.signatureDate}>Date: {printDate}</Text>
          </View>
        </View>
      </View>
    </Page>
  );
}
