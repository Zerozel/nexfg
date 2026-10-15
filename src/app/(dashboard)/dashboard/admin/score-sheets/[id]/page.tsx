"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, FileDown, Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SheetUploader } from "@/components/score-sheets/SheetUploader";
import { ExtractionReview } from "@/components/score-sheets/ExtractionReview";
import { useScoreSheetBatch } from "@/hooks/useScoreSheets";
import { supabase } from "@/lib/supabase/client";

const STATUS_STYLES: Record<string, string> = {
  created: "bg-gray-100 text-gray-700",
  uploaded: "bg-amber-100 text-amber-700",
  reviewed: "bg-blue-100 text-blue-700",
  confirmed: "bg-green-100 text-green-700",
  discarded: "bg-gray-100 text-gray-400",
};

export default function ScoreSheetBatchPage() {
  const params = useParams();
  const id = params.id as string;
  const { data, isLoading, error, refetch } = useScoreSheetBatch(id);

  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [students, setStudents] = useState<
    { id: string; full_name: string; admission_number: string | null }[]
  >([]);

  const batchId = data?.batch?.id;
  const sourceImagePath = data?.batch?.source_image_url;
  const classId = data?.batch?.class_id;
  const termId = data?.batch?.term_id;
  const subjectId = data?.batch?.subject_id;

  // Reset + reload when the batch or its source image changes
  useEffect(() => {
    if (!batchId || !classId || !termId || !subjectId) return;

    // Reset on batch switch
    setImageUrl(null);
    setImageError(null);
    setStudents([]);

    let cancelled = false;

    (async () => {
      // Signed URL for the source image, if there is one
      if (sourceImagePath) {
        const { data: signed, error: signErr } = await supabase.storage
          .from("score-sheets")
          .createSignedUrl(sourceImagePath, 60 * 30);
        if (cancelled) return;
        if (signErr) {
          setImageError(signErr.message);
        } else if (signed?.signedUrl) {
          setImageUrl(signed.signedUrl);
        }
      }

      // Roster
      const res = await fetch(
        `/api/admin/score-sheets/enrolled-students?classId=${classId}&termId=${termId}&subjectId=${subjectId}`
      );
      if (cancelled) return;
      if (res.ok) {
        const result = await res.json();
        setStudents(result.data?.students || []);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [batchId, sourceImagePath, classId, termId, subjectId]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-center py-16 text-red-600 text-sm">
        {error || "Batch not found"}
      </div>
    );
  }

  const { batch, extractions } = data;
  const isConfirmed = batch.status === "confirmed";

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/dashboard/admin/score-sheets"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-gray-900 mb-2"
        >
          <ArrowLeft className="mr-1 h-3.5 w-3.5" />
          Back to Score Sheets
        </Link>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {batch.class_name} · {batch.subject_name}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {batch.term_name}
              {batch.academic_session && ` — ${batch.academic_session}`}
              {batch.teacher_name && ` · ${batch.teacher_name}`}
            </p>
          </div>
          <Badge
            className={STATUS_STYLES[batch.status] || STATUS_STYLES.created}
          >
            {batch.status}
          </Badge>
        </div>
      </div>

      {isConfirmed && (
        <div className="flex items-start gap-3 p-3 rounded-lg bg-green-50 border border-green-200">
          <div className="text-sm text-green-900">
            <div className="font-medium">Scores saved</div>
            <div className="text-green-800 mt-0.5">
              This batch was confirmed on{" "}
              {batch.confirmed_at
                ? new Date(batch.confirmed_at).toLocaleString()
                : "—"}
              . Scores have been written to the gradebook.
            </div>
          </div>
        </div>
      )}

      {imageError && (
        <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-50 border border-amber-200">
          <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-amber-900">
            <div className="font-medium">Could not load source image</div>
            <div className="text-amber-800 mt-0.5">{imageError}</div>
          </div>
        </div>
      )}

      <div className="flex gap-3 flex-wrap">
        <Button
          variant="outline"
          onClick={() =>
            window.open(
              `/api/admin/score-sheets/batches/${batch.id}/pdf`,
              "_blank"
            )
          }
        >
          <FileDown className="mr-2 h-4 w-4" />
          {extractions.length > 0 ? "Reprint Blank Sheet" : "Print Blank Sheet"}
        </Button>
      </div>

      {/* State machine:
          - No extractions yet → show uploader
          - Extractions exist → show review editor
          Both components receive readOnly={isConfirmed}, which locks
          their inputs once the batch has been confirmed.
      */}
      {extractions.length === 0 ? (
        <SheetUploader
          batchId={batch.id}
          onExtracted={refetch}
          readOnly={isConfirmed}
        />
      ) : (
        <ExtractionReview
          batchId={batch.id}
          data={{ batch, extractions }}
          students={students}
          imageUrl={imageUrl}
          onSaved={refetch}
          readOnly={isConfirmed}
        />
      )}
    </div>
  );
}
