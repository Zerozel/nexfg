"use client";

import { useState, useRef } from "react";
import { Loader2, Upload, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { extractScoreSheet } from "@/hooks/useScoreSheets";

interface Props {
  batchId: string;
  onExtracted: () => void;
  /** When true, uploading is disabled (batch already confirmed). */
  readOnly?: boolean;
}

export function SheetUploader({ batchId, onExtracted, readOnly = false }: Props) {
  const { toast } = useToast();
  const [isExtracting, setIsExtracting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setIsExtracting(true);
    try {
      // Section 7: extractScoreSheet now returns the unwrapped ExtractResult
      const result = await extractScoreSheet(batchId, file);
      toast({
        title: "Extraction complete",
        description: `${result.extracted_count} rows read, ${result.matched_count} matched, ${result.unmatched_count} need review.`,
      });
      onExtracted();
    } catch (err: any) {
      toast({
        title: "Extraction failed",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsExtracting(false);
    }
  };

  if (readOnly) {
    return (
      <div className="border-2 border-dashed rounded-lg p-8 text-center">
        <Lock className="h-6 w-6 mx-auto mb-3 text-gray-400" />
        <p className="text-sm text-gray-500">
          This batch is already confirmed and cannot accept a new upload.
        </p>
      </div>
    );
  }

  return (
    <div className="border-2 border-dashed rounded-lg p-8 text-center">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
          // Reset the input so re-uploading the same file triggers change
          e.target.value = "";
        }}
      />
      <Button
        onClick={() => fileInputRef.current?.click()}
        disabled={isExtracting}
        size="lg"
      >
        {isExtracting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Extracting…
          </>
        ) : (
          <>
            <Upload className="mr-2 h-4 w-4" />
            Upload Filled Sheet
          </>
        )}
      </Button>
      <p className="text-xs text-gray-500 mt-4">
        Supported: JPEG, PNG, WebP · Max 10 MB
      </p>
    </div>
  );
}
