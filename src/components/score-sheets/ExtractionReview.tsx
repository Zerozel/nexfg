"use client";

import { useState, useMemo, useEffect } from "react";
import { Loader2, Save, AlertTriangle, Check, Lock, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import type { BatchDetail } from "@/hooks/useScoreSheets";
import { resolveScores } from "@/hooks/useScoreSheets";

interface Student {
  id: string;
  full_name: string;
  admission_number: string | null;
}

interface Props {
  batchId: string;
  data: BatchDetail;
  students: Student[];
  imageUrl: string | null;
  onSaved: () => void;
  /** When true, all inputs are disabled and the save button is hidden. */
  readOnly?: boolean;
}

interface EditableRow {
  extraction_id: string;
  student_id: string | null;
  name_on_sheet: string | null;
  ca1: number | null;
  ca2: number | null;
  ca3: number | null;
  exam: number | null;
  matched: boolean;
  is_extra: boolean;
  /** True if the admin marked this row for removal. Not persisted. */
  removed: boolean;
}

export function ExtractionReview({
  batchId,
  data,
  students,
  imageUrl,
  onSaved,
  readOnly = false,
}: Props) {
  const { toast } = useToast();
  const [rows, setRows] = useState<EditableRow[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Seed rows from extractions
  useEffect(() => {
    setRows(
      data.extractions.map((e) => ({
        extraction_id: e.id,
        student_id: e.student_id,
        name_on_sheet: e.name_on_sheet,
        ca1: e.resolved_ca1 ?? e.raw_ca1,
        ca2: e.resolved_ca2 ?? e.raw_ca2,
        ca3: e.resolved_ca3 ?? e.raw_ca3,
        exam: e.resolved_exam ?? e.raw_exam,
        matched: e.matched,
        is_extra: e.is_extra,
        removed: false,
      }))
    );
  }, [data]);

  const activeRows = useMemo(() => rows.filter((r) => !r.removed), [rows]);

  const unmatchedCount = useMemo(
    () => activeRows.filter((r) => r.is_extra && !r.student_id).length,
    [activeRows]
  );

  const updateRow = (idx: number, patch: Partial<EditableRow>) => {
    setRows((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], ...patch };
      return next;
    });
  };

  const removeRow = (idx: number) => {
    updateRow(idx, { removed: true });
  };

  const undoRemove = (idx: number) => {
    updateRow(idx, { removed: false });
  };

  const parseNum = (v: string): number | null => {
    if (v.trim() === "") return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  };

  const handleSave = async () => {
    if (unmatchedCount > 0) {
      toast({
        title: "Unmatched rows",
        description:
          "Every row must be matched to a student, or removed, before saving.",
        variant: "destructive",
      });
      return;
    }
    setIsSaving(true);
    try {
      const result = await resolveScores(
        batchId,
        activeRows
          .filter((r) => r.student_id)
          .map((r) => ({
            student_id: r.student_id,
            ca1: r.ca1,
            ca2: r.ca2,
            ca3: r.ca3,
            exam: r.exam,
          }))
      );

      if (result.skipped && result.skipped.length > 0) {
        toast({
          title: "Some rows were skipped",
          description: `${result.skipped.length} row(s) rejected. Check the console for details.`,
          variant: "destructive",
        });
        console.warn("Resolve skipped rows:", result.skipped);
      } else {
        toast({
          title: "Scores saved",
          description: `${result.written} score(s) written. You can now recompile this term.`,
        });
      }
      onSaved();
    } catch (err: any) {
      toast({
        title: "Save failed",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      {readOnly && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-gray-100 border">
          <Lock className="h-4 w-4 text-gray-600 flex-shrink-0" />
          <span className="text-sm text-gray-700">
            This batch has been confirmed. Fields are read-only.
          </span>
        </div>
      )}

      {unmatchedCount > 0 && !readOnly && (
        <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-50 border border-amber-200">
          <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-amber-900">
            <div className="font-medium">
              {unmatchedCount} unmatched row{unmatchedCount > 1 ? "s" : ""}
            </div>
            <div className="text-amber-800 mt-0.5">
              Assign each row to a student, or remove it, before saving.
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: image */}
        <div className="border rounded-lg bg-gray-50 p-2 overflow-auto max-h-[70vh]">
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl}
              alt="Score sheet"
              className="w-full h-auto rounded"
            />
          ) : (
            <div className="text-center py-12 text-sm text-gray-500">
              No image
            </div>
          )}
        </div>

        {/* Right: editable table */}
        <div className="border rounded-lg overflow-auto max-h-[70vh]">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 sticky top-0">
              <tr>
                <th className="p-2 text-left">Row</th>
                <th className="p-2 text-left">Student</th>
                <th className="p-2 text-center">CA1</th>
                <th className="p-2 text-center">CA2</th>
                <th className="p-2 text-center">CA3</th>
                <th className="p-2 text-center">Exam</th>
                {!readOnly && <th className="p-2 w-10" />}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => {
                const matchedStudent = students.find(
                  (s) => s.id === row.student_id
                );
                const isUnmatched = row.is_extra && !row.student_id;

                if (row.removed) {
                  return (
                    <tr key={row.extraction_id} className="border-t opacity-50">
                      <td
                        className="p-2 text-gray-400 line-through"
                        colSpan={readOnly ? 6 : 7}
                      >
                        Removed: {row.name_on_sheet || "unnamed row"}
                        {!readOnly && (
                          <button
                            type="button"
                            onClick={() => undoRemove(idx)}
                            className="ml-3 text-xs text-blue-600 underline"
                          >
                            undo
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                }

                return (
                  <tr
                    key={row.extraction_id}
                    className={`border-t ${
                      isUnmatched ? "bg-amber-50" : ""
                    }`}
                  >
                    <td className="p-2 text-gray-500">
                      {row.is_extra ? "extra" : idx + 1}
                    </td>
                    <td className="p-2 min-w-[220px]">
                      {readOnly ? (
                        <div className="flex items-center gap-2">
                          {matchedStudent ? (
                            <>
                              <Check className="h-3.5 w-3.5 text-green-600 flex-shrink-0" />
                              <span className="text-sm truncate">
                                {matchedStudent.full_name}
                              </span>
                            </>
                          ) : (
                            <span className="text-xs italic text-gray-500">
                              {row.name_on_sheet || "(unmatched)"}
                            </span>
                          )}
                        </div>
                      ) : matchedStudent ? (
                        <div className="flex items-center gap-2">
                          <Check className="h-3.5 w-3.5 text-green-600 flex-shrink-0" />
                          <span className="text-sm truncate">
                            {matchedStudent.full_name}
                          </span>
                        </div>
                      ) : (
                        <Select
                          value={row.student_id || ""}
                          onValueChange={(v) =>
                            updateRow(idx, {
                              student_id: v,
                              is_extra: false,
                            })
                          }
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue
                              placeholder={
                                row.name_on_sheet
                                  ? `Match "${row.name_on_sheet}" to…`
                                  : "Assign to…"
                              }
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {students.map((s) => (
                              <SelectItem key={s.id} value={s.id}>
                                {s.full_name}
                                {s.admission_number
                                  ? ` · ${s.admission_number}`
                                  : ""}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </td>
                    <td className="p-2 w-16">
                      <Input
                        type="number"
                        className="h-8 text-xs text-center"
                        value={row.ca1 ?? ""}
                        disabled={readOnly}
                        onChange={(e) =>
                          updateRow(idx, { ca1: parseNum(e.target.value) })
                        }
                      />
                    </td>
                    <td className="p-2 w-16">
                      <Input
                        type="number"
                        className="h-8 text-xs text-center"
                        value={row.ca2 ?? ""}
                        disabled={readOnly}
                        onChange={(e) =>
                          updateRow(idx, { ca2: parseNum(e.target.value) })
                        }
                      />
                    </td>
                    <td className="p-2 w-16">
                      <Input
                        type="number"
                        className="h-8 text-xs text-center"
                        value={row.ca3 ?? ""}
                        disabled={readOnly}
                        onChange={(e) =>
                          updateRow(idx, { ca3: parseNum(e.target.value) })
                        }
                      />
                    </td>
                    <td className="p-2 w-16">
                      <Input
                        type="number"
                        className="h-8 text-xs text-center"
                        value={row.exam ?? ""}
                        disabled={readOnly}
                        onChange={(e) =>
                          updateRow(idx, { exam: parseNum(e.target.value) })
                        }
                      />
                    </td>
                    {!readOnly && (
                      <td className="p-2 w-10 text-right">
                        <button
                          type="button"
                          onClick={() => removeRow(idx)}
                          className="text-gray-400 hover:text-red-600"
                          title="Remove this row"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {!readOnly && (
        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            disabled={isSaving || unmatchedCount > 0}
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving…
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Confirm & Save Scores
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
