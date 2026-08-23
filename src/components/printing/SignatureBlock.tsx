"use client";

import Image from "next/image";
import { formatDate } from "@/lib/printing/data-transform";

interface SignatureBlockProps {
  principalName?: string | null;
  principalSignatureUrl?: string | null;
  date: string;
  teacherName?: string | null;
  /** Optional class-teacher signature image. Falls back to a blank line. */
  teacherSignatureUrl?: string | null;
}

export function SignatureBlock({
  principalName,
  principalSignatureUrl,
  date,
  teacherName,
  teacherSignatureUrl,
}: SignatureBlockProps) {
  return (
    <div className="signature-block">
      {/* Class Teacher Signature */}
      {teacherName && (
        <div className="signature-item">
          {teacherSignatureUrl && (
            <Image
              src={teacherSignatureUrl}
              alt="Class Teacher's Signature"
              width={150}
              height={50}
              className="signature-image"
              unoptimized
            />
          )}
          <div className="signature-line" />
          <div className="signature-name">{teacherName}</div>
          <div className="signature-title">Class Teacher</div>
        </div>
      )}

      {/* Date */}
      <div className="signature-item">
        <div className="signature-line" style={{ border: "none" }} />
        <div className="signature-date">{formatDate(date)}</div>
        <div className="signature-title">Date</div>
      </div>

      {/* Principal Signature */}
      {principalName && (
        <div className="signature-item">
          {principalSignatureUrl && (
            <Image
              src={principalSignatureUrl}
              alt="Principal's Signature"
              width={150}
              height={50}
              className="signature-image"
              unoptimized
            />
          )}
          <div className="signature-line" />
          <div className="signature-name">{principalName}</div>
          <div className="signature-title">Principal</div>
        </div>
      )}
    </div>
  );
}
