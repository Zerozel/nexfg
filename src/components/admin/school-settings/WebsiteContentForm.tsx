'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2, X, Plus } from 'lucide-react';

interface GalleryItem {
  url: string;
  type: string;
}

interface HighlightItem {
  title: string;
  description: string;
  icon: string;
}

interface WebsiteContentFormProps {
  data: {
    hero_title: string;
    hero_subtitle: string;
    about_text: string;
    mission: string;
    vision: string;
    highlights: HighlightItem[];
    gallery: GalleryItem[];
  };
  onChange: (field: string, value: string) => void;
  onGalleryChange: (gallery: GalleryItem[]) => void;
  onHighlightsChange: (highlights: HighlightItem[]) => void;
  onSave: () => Promise<void>;
  isLoading: boolean;
}

export function WebsiteContentForm({
  data,
  onChange,
  onGalleryChange,
  onHighlightsChange,
  onSave,
  isLoading,
}: WebsiteContentFormProps) {
  const [newVideoUrl, setNewVideoUrl] = useState('');

  const handleAddVideo = () => {
    if (!newVideoUrl.trim()) return;
    onGalleryChange([
      ...data.gallery,
      { url: newVideoUrl.trim(), type: 'video' },
    ]);
    setNewVideoUrl('');
  };

  const handleRemoveVideo = (index: number) => {
    onGalleryChange(data.gallery.filter((_, i) => i !== index));
  };

  const handleAddHighlight = () => {
    if (data.highlights.length >= 4) return;
    onHighlightsChange([
      ...data.highlights,
      { title: '', description: '', icon: 'sparkles' },
    ]);
  };

  const handleUpdateHighlight = (
    index: number,
    field: keyof HighlightItem,
    value: string
  ) => {
    const updated = [...data.highlights];
    updated[index] = { ...updated[index], [field]: value };
    onHighlightsChange(updated);
  };

  const handleRemoveHighlight = (index: number) => {
    onHighlightsChange(data.highlights.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="hero_title">Hero Title</Label>
        <Input
          id="hero_title"
          value={data.hero_title}
          onChange={(e) => onChange('hero_title', e.target.value)}
          placeholder="Welcome to St. Mary's School"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="hero_subtitle">Hero Subtitle</Label>
        <Input
          id="hero_subtitle"
          value={data.hero_subtitle}
          onChange={(e) => onChange('hero_subtitle', e.target.value)}
          placeholder="Nurturing Excellence Since 1990"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="about_text">About Text</Label>
        <Textarea
          id="about_text"
          value={data.about_text}
          onChange={(e) => onChange('about_text', e.target.value)}
          placeholder="St. Mary's is a premier institution..."
          rows={5}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="mission">Mission Statement</Label>
          <Textarea
            id="mission"
            value={data.mission}
            onChange={(e) => onChange('mission', e.target.value)}
            placeholder="To empower students with knowledge..."
            rows={4}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="vision">Vision Statement</Label>
          <Textarea
            id="vision"
            value={data.vision}
            onChange={(e) => onChange('vision', e.target.value)}
            placeholder="To be a center of educational excellence..."
            rows={4}
          />
        </div>
      </div>

      {/* Highlights */}
      <div className="space-y-3 pt-4 border-t">
        <div className="flex items-center justify-between">
          <div>
            <Label>Why [Your School] — Key Highlights</Label>
            <p className="text-xs text-muted-foreground mt-1">
              Up to 4 highlights that show what makes your school special.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddHighlight}
            disabled={data.highlights.length >= 4}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Highlight
          </Button>
        </div>

        {data.highlights.length === 0 && (
          <div className="text-sm text-muted-foreground p-4 border border-dashed rounded-lg text-center">
            No highlights yet. Click &quot;Add Highlight&quot; to create your
            first one.
          </div>
        )}

        {data.highlights.map((h, index) => (
          <div
            key={index}
            className="p-4 border rounded-lg space-y-3 bg-gray-50/50"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500">
                Highlight {index + 1}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => handleRemoveHighlight(index)}
                className="h-7 w-7"
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>

            <Input
              placeholder="Title (e.g., Small Class Sizes)"
              value={h.title}
              onChange={(e) =>
                handleUpdateHighlight(index, 'title', e.target.value)
              }
            />

            <Textarea
              placeholder="Description..."
              value={h.description}
              onChange={(e) =>
                handleUpdateHighlight(index, 'description', e.target.value)
              }
              rows={2}
            />
          </div>
        ))}
      </div>

      {/* Gallery */}
      <div className="space-y-2 pt-4 border-t">
        <Label>Gallery (YouTube/Vimeo Videos)</Label>
        <div className="space-y-2">
          {data.gallery.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input value={item.url} readOnly className="flex-1" />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => handleRemoveVideo(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Enter YouTube embed URL..."
            value={newVideoUrl}
            onChange={(e) => setNewVideoUrl(e.target.value)}
            className="flex-1"
          />
          <Button type="button" variant="outline" onClick={handleAddVideo}>
            <Plus className="mr-2 h-4 w-4" />
            Add
          </Button>
        </div>
      </div>

      <Button type="submit" disabled={isLoading}>
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isLoading ? 'Saving...' : 'Save Changes'}
      </Button>
    </form>
  );
}
