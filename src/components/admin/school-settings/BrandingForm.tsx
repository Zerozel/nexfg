'use client';

import { useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Upload, X } from 'lucide-react';

interface BrandingFormProps {
  data: {
    primary_color: string;
    font: string;
    logo_url: string | null;
  };
  onChange: (field: string, value: string) => void;
  onSave: () => Promise<void>;
  onUploadLogo: (file: File) => Promise<string>;
  onRemoveLogo: () => void;
  isLoading: boolean;
}

export function BrandingForm({
  data,
  onChange,
  onSave,
  onUploadLogo,
  onRemoveLogo,
  isLoading,
}: BrandingFormProps) {
  const [logoPreview, setLogoPreview] = useState<string | null>(data.logo_url);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const preview = URL.createObjectURL(file);
    setLogoPreview(preview);
    setLogoFile(file);
  };

  const handleUpload = async () => {
    if (!logoFile) return;
    setIsUploading(true);
    try {
      await onUploadLogo(logoFile);
      setLogoFile(null);
    } catch (error: any) {
      // Error handled by parent
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancel = () => {
    setLogoPreview(data.logo_url);
    setLogoFile(null);
  };

  const handleRemove = () => {
    setLogoPreview(null);
    setLogoFile(null);
    onRemoveLogo();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="primary_color">Primary Color</Label>
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-md border"
            style={{ backgroundColor: data.primary_color }}
          />
          <Input
            id="primary_color"
            value={data.primary_color}
            onChange={(e) => onChange('primary_color', e.target.value)}
            placeholder="#2563eb"
            className="w-40"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="font">Font</Label>
        <Select value={data.font} onValueChange={(value) => onChange('font', value)}>
          <SelectTrigger className="w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Inter">Inter</SelectItem>
            <SelectItem value="Roboto">Roboto</SelectItem>
            <SelectItem value="Open Sans">Open Sans</SelectItem>
            <SelectItem value="Montserrat">Montserrat</SelectItem>
            <SelectItem value="Poppins">Poppins</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Logo</Label>
        {logoPreview ? (
          <div className="flex items-start gap-4">
            <img
              src={logoPreview}
              alt="School logo"
              className="w-24 h-24 object-contain border rounded-lg"
            />
            <div className="space-y-2">
              {logoFile ? (
                <>
                  <Button type="button" size="sm" onClick={handleUpload} disabled={isUploading}>
                    {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Upload
                  </Button>
                  <Button type="button" size="sm" variant="outline" onClick={handleCancel}>
                    Cancel
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Change Logo
                  </Button>
                  <Button type="button" size="sm" variant="outline" onClick={handleRemove}>
                    Remove
                  </Button>
                </>
              )}
            </div>
          </div>
        ) : (
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="mr-2 h-4 w-4" />
            Upload Logo
          </Button>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileSelect}
          className="hidden"
        />
        <p className="text-xs text-muted-foreground">
          Supported: JPEG, PNG, WebP | Max: 5MB
        </p>
      </div>

      <Button type="submit" disabled={isLoading}>
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isLoading ? 'Saving...' : 'Save Changes'}
      </Button>
    </form>
  );
}
