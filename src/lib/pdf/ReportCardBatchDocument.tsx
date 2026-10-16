import { Document } from "@react-pdf/renderer";
import type {
  IndividualReportCardData,
  SchoolInfo,
  ClassInfo,
  TermInfo,
} from "@/types/printing";
import { ReportCardPage } from "./ReportCardDocument";

interface Props {
  school: SchoolInfo;
  class: ClassInfo;
  term: TermInfo;
  students: IndividualReportCardData[];
}

/**
 * Multi-page report card document. One page per student.
 *
 * Title metadata lands in the PDF properties for searchability.
 */
export function ReportCardBatchDocument({
  school,
  class: classInfo,
  term,
  students,
}: Props) {
  return (
    <Document
      title={`${classInfo.name} Report Cards — ${term.name} ${term.academic_session}`}
      author={school.name}
      creator="NexaForge"
      subject={`Report cards for ${classInfo.name}`}
    >
      {students.map((student) => (
        <ReportCardPage key={student.student.id} data={student} />
      ))}
    </Document>
  );
}
