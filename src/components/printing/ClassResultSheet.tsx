"use client";

import type { ClassResultSheetData } from "@/types/printing";
import { PrintHeader } from "./PrintHeader";
import { PrintFooter } from "./PrintFooter";
import { SignatureBlock } from "./SignatureBlock";
import { getOrdinal } from "@/lib/printing/data-transform";

interface ClassResultSheetProps {
  data: ClassResultSheetData;
}

export function ClassResultSheet({ data }: ClassResultSheetProps) {
  const {
    school,
    class: classInfo,
    term,
    subjects,
    students,
    issued_date,
    class_average,
    class_highest,
    class_lowest,
  } = data;

  return (
    <div className="class-result-sheet">
      {/* School Header */}
      <PrintHeader
        schoolName={school.name}
        logoUrl={school.logo_url}
        motto={school.motto}
        address={school.address}
        phone={school.phone}
        email={school.email}
        primaryColor={school.primary_color || "#2563eb"}
      />

      {/* Title */}
      <div className="report-card-title">Class Result Sheet</div>

      {/* Class Information */}
      <div className="student-info">
        <div>
          <div className="info-group">
            <span className="info-label">Class</span>
            <span className="info-value">{classInfo.name}</span>
          </div>
          {classInfo.teacher_name && (
            <div className="info-group">
              <span className="info-label">Class Teacher</span>
              <span className="info-value">
                {classInfo.teacher_name}
              </span>
            </div>
          )}
        </div>
        <div>
          <div className="info-group">
            <span className="info-label">Term</span>
            <span className="info-value">
              {term.name} — {term.academic_session}
            </span>
          </div>
          <div className="info-group">
            <span className="info-label">Total Students</span>
            <span className="info-value">{students.length}</span>
          </div>
        </div>
      </div>

      {/* Class Summary */}
      <div className="class-summary">
        <div className="summary-item">
          <div className="summary-value">
            {class_average.toFixed(1)}%
          </div>
          <div className="summary-label">Class Average</div>
        </div>
        <div className="summary-item">
          <div className="summary-value">
            {class_highest.toFixed(1)}%
          </div>
          <div className="summary-label">Highest Average</div>
        </div>
        <div className="summary-item">
          <div className="summary-value">
            {class_lowest.toFixed(1)}%
          </div>
          <div className="summary-label">Lowest Average</div>
        </div>
      </div>

      {/* Results Table */}
      <div className="subject-table-container">
        <table className="subject-table">
          <thead>
            <tr>
              <th style={{ width: "5%" }}>Pos</th>
              <th style={{ width: "20%" }}>Student Name</th>
              <th style={{ width: "12%" }}>Adm No</th>
              {subjects.map((subject) => (
                <th key={subject} style={{ width: `${60 / subjects.length}%` }}>
                  {subject.substring(0, 3)}.
                </th>
              ))}
              <th style={{ width: "8%" }}>Avg</th>
              <th style={{ width: "8%" }}>Grade</th>
            </tr>
          </thead>
          <tbody>
            {students.map((studentData, index) => (
              <tr key={studentData.student.id}>
                <td>
                  <span className="position-badge">
                    {getOrdinal(studentData.overall.position)}
                  </span>
                </td>
                <td className="student-name">
                  {studentData.student.full_name}
                </td>
                <td>{studentData.student.admission_number || "-"}</td>
                {subjects.map((subjectName) => {
                  const subject = studentData.subjects.find(
                    (s) => s.name === subjectName
                  );
                  return (
                    <td key={subjectName}>
                      {subject ? subject.score.toFixed(0) : "-"}
                    </td>
                  );
                })}
                <td className="score">
                  {studentData.overall.average.toFixed(1)}
                </td>
                <td>
                  <span className="grade grade-a1">
                    {studentData.overall.grade}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Subject Key */}
      <div style={{ marginTop: "12px", fontSize: "8pt", color: "#6a6a8a" }}>
        <strong>Subject Key: </strong>
        {subjects.map((subject, index) => (
          <span key={subject}>
            {subject.substring(0, 3)}. = {subject}
            {index < subjects.length - 1 ? " | " : ""}
          </span>
        ))}
      </div>

      {/* Signature Block */}
      <SignatureBlock
        principalName={school.principal_name}
        principalSignatureUrl={school.principal_signature_url}
        date={issued_date}
        teacherName={classInfo.teacher_name}
      />

      {/* Footer */}
      <PrintFooter />
    </div>
  );
}
