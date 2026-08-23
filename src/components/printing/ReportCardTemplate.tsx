"use client";

import type { IndividualReportCardData } from "@/types/printing";
import { PrintHeader } from "./PrintHeader";
import { PrintFooter } from "./PrintFooter";
import { SignatureBlock } from "./SignatureBlock";
import { getOrdinal, getGradeClass } from "@/lib/printing/data-transform";


interface ReportCardTemplateProps {
  data: IndividualReportCardData;
}

export function ReportCardTemplate({ data }: ReportCardTemplateProps) {
  const {
    school,
    student,
    class: classInfo,
    term,
    subjects,
    overall,
    issued_date,
    teacher_comment,
    principal_comment,
    attendance,
    affective_traits,
    psychomotor_skills,
  } = data;

  return (
    <div className="report-card-template">

      {/* Watermark */}
      <div className="watermark">{school.name}</div>

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

      {/* Report Card Title */}
      <div className="report-card-title">Student Report Card</div>

      {/* Student Information */}
      <div className="student-info">
        <div>
          <div className="info-group">
            <span className="info-label">Student Name</span>
            <span className="info-value">{student.full_name}</span>
          </div>
          {student.admission_number && (
            <div className="info-group">
              <span className="info-label">Admission Number</span>
              <span className="info-value">
                {student.admission_number}
              </span>
            </div>
          )}
        </div>
        <div>
          <div className="info-group">
            <span className="info-label">Class</span>
            <span className="info-value">{classInfo.name}</span>
          </div>
          <div className="info-group">
            <span className="info-label">Term</span>
            <span className="info-value">
              {term.name} — {term.academic_session}
            </span>
          </div>
        </div>
      </div>

      {/* Subject Results Table */}
      <div className="subject-table-container">
        <table className="subject-table">
          <thead>
            <tr>
              <th style={{ width: "35%" }}>Subject</th>
              <th style={{ width: "12%" }}>Score</th>
              <th style={{ width: "10%" }}>Grade</th>
              <th style={{ width: "12%" }}>Position</th>
              <th style={{ width: "31%" }}>Remarks</th>
            </tr>
          </thead>
          <tbody>
            {subjects.length > 0 ? (
              subjects.map((subject) => (
                <tr key={subject.id}>
                  <td className="subject-name">{subject.name}</td>
                  <td className="score">{subject.score.toFixed(1)}</td>
                  <td>
                    <span
                      className={`grade ${getGradeClass(subject.grade)}`}
                    >
                      {subject.grade}
                    </span>
                  </td>
                  <td>
                    {subject.subject_position
                      ? getOrdinal(subject.subject_position)
                      : "-"}
                  </td>
                  <td>{subject.remarks || "-"}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} style={{ textAlign: "center", padding: "20px" }}>
                  No subject results available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Overall Performance */}
      <div
        className="overall-section"
        style={{
          background: school.primary_color || "#2563eb",
        }}
      >
        <div className="overall-item">
          <span className="overall-label">Overall Average</span>
          <span className="overall-value">
            {overall.average.toFixed(1)}%
          </span>
        </div>
        <div className="overall-item">
          <span className="overall-label">Grade</span>
          <span className="overall-value">{overall.grade}</span>
        </div>
        <div className="overall-item">
          <span className="overall-label">Position</span>
          <span className="overall-value">
            {getOrdinal(overall.position)} of {overall.total_students}
          </span>
        </div>
      </div>

      {/* Attendance Section */}
      {attendance && (
        <div className="attendance-section avoid-break">
          <h4>Attendance Record</h4>
          <div className="attendance-grid">
            <div className="attendance-item">
              <div className="attendance-value">
                {attendance.total_days}
              </div>
              <div className="attendance-label">School Days</div>
            </div>
            <div className="attendance-item">
              <div className="attendance-value">
                {attendance.present}
              </div>
              <div className="attendance-label">Days Present</div>
            </div>
            <div className="attendance-item">
              <div className="attendance-value">
                {attendance.absent}
              </div>
              <div className="attendance-label">Days Absent</div>
            </div>
          </div>
        </div>
      )}

      {/* Affective Traits & Psychomotor Skills */}
      {(affective_traits || psychomotor_skills) && (
        <div className="additional-sections avoid-break">
          {affective_traits && affective_traits.length > 0 && (
            <div className="additional-section">
              <h4>Affective Traits</h4>
              <table>
                <tbody>
                  {affective_traits.map((trait, index) => (
                    <tr key={index}>
                      <td>{trait.trait}</td>
                      <td>{trait.rating}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {psychomotor_skills && psychomotor_skills.length > 0 && (
            <div className="additional-section">
              <h4>Psychomotor Skills</h4>
              <table>
                <tbody>
                  {psychomotor_skills.map((skill, index) => (
                    <tr key={index}>
                      <td>{skill.skill}</td>
                      <td>{skill.rating}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Comments */}
      {(teacher_comment || principal_comment) && (
        <div className="comments-section avoid-break">
          {teacher_comment && (
            <div className="comment-box">
              <div className="comment-label">Class Teacher's Comment</div>
              <div className="comment-text">{teacher_comment}</div>
            </div>
          )}
          {principal_comment && (
            <div className="comment-box">
              <div className="comment-label">Principal's Comment</div>
              <div className="comment-text">{principal_comment}</div>
            </div>
          )}
        </div>
      )}

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
