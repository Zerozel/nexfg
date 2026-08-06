'use client';

import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Upload, X } from 'lucide-react';

interface SignatureUploadProps {
  signatureUrl: string | null;
  onUpload: (file: File) => Promise<string>;
  onRemove: () => void;
}

export function SignatureUpload({ signatureUrl, onUpload, onRemove }: SignatureUploadProps) {
  const [preview, setPreview] = useState<string | null>(signatureUrl);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setPreview(previewUrl);
    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setIsUploading(true);
    try {
      await onUpload(selectedFile);
      setSelectedFile(null);
    } catch (error: any) {
      // Error handled by parent
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancel = () => {
    setPreview(signatureUrl);
    setSelectedFile(null);
  };

  const handleRemove = () => {
    setPreview(null);
    setSelectedFile(null);
    onRemove();
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label className="text-sm font-medium">Current Signature</label>
        {preview ? (
          <div className="flex items-start gap-4">
            <img
              src={preview}
              alt="Principal signature"
              className="max-w-[300px] max-h-[100px] object-contain border rounded-lg p-2 bg-white"
            />
            <div className="space-y-2">
              {selectedFile ? (
                <>
                  <Button size="sm" onClick={handleUpload} disabled={isUploading}>
                    {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Upload
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleCancel}>
                    Cancel
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Upload New Signature
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleRemove}>
                    <X className="mr-2 h-4 w-4" />
                    Remove
                  </Button>
                </>
              )}
            </div>
          </div>
        ) : (
          <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
            <Upload className="mr-2 h-4 w-4" />
            Upload Signature
          </Button>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png"
          onChange={handleFileSelect}
          className="hidden"
        />
        <p className="text-xs text-muted-foreground">
          Supported: PNG only | Max: 2MB | Recommended: 800x300
        </p>
      </div>
    </div>
  );
}
