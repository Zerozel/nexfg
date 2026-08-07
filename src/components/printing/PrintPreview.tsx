"use client";

import { Button } from "@/components/ui/button";
import { Printer, X } from "lucide-react";
import type { ReactNode } from "react";

interface PrintPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  onPrint: () => void;
  title?: string;
  children: ReactNode;
}

export function PrintPreview({
  isOpen,
  onClose,
  onPrint,
  title = "Print Preview",
  children,
}: PrintPreviewProps) {
  if (!isOpen) return null;

  const handlePrint = () => {
    onPrint();
    // Small delay to ensure styles are applied before print dialog
    setTimeout(() => {
      window.print();
    }, 100);
  };

  return (
    <div className="print-preview-overlay no-print">
      <div className="print-preview-content">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b">
          <h2 className="text-xl font-semibold">{title}</h2>
          <div className="flex gap-2">
            <Button onClick={handlePrint} size="sm">
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
            <Button variant="outline" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Preview Content */}
        <div className="print-preview-body">{children}</div>
      </div>
    </div>
  );
}
