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

interface WebsiteContentFormProps {
  data: {
    hero_title: string;
    hero_subtitle: string;
    about_text: string;
    gallery: GalleryItem[];
  };
  onChange: (field: string, value: string) => void;
  onGalleryChange: (gallery: GalleryItem[]) => void;
  onSave: () => Promise<void>;
  isLoading: boolean;
}

export function WebsiteContentForm({
  data,
  onChange,
  onGalleryChange,
  onSave,
  isLoading,
}: WebsiteContentFormProps) {
  const [newVideoUrl, setNewVideoUrl] = useState('');

  const handleAddVideo = () => {
    if (!newVideoUrl.trim()) return;
    onGalleryChange([...data.gallery, { url: newVideoUrl.trim(), type: 'video' }]);
    setNewVideoUrl('');
  };

  const handleRemoveVideo = (index: number) => {
    onGalleryChange(data.gallery.filter((_, i) => i !== index));
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

      <div className="space-y-2">
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
