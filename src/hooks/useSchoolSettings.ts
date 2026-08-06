'use client';

import { useState, useEffect, useCallback } from 'react';

interface SchoolSettings {
  id: string;
  name: string;
  slug: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  logo_url: string | null;
  motto: string | null;
  principal_signature_url: string | null;
  website_enabled: boolean;
  website_theme: {
    primary_color: string;
    font: string;
  } | null;
  website_content: {
    hero_title: string | null;
    hero_subtitle: string | null;
    about_text: string | null;
    contact_email: string | null;
    contact_phone: string | null;
    address: string | null;
    gallery: { url: string; type: string }[];
  } | null;
  social_links: {
    facebook: string | null;
    twitter: string | null;
    instagram: string | null;
  } | null;
}

export function useSchoolSettings() {
  const [data, setData] = useState<SchoolSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/school');
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to fetch school settings');
      }
      const result = await response.json();
      setData(result.school);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const updateSettings = async (settings: Record<string, any>) => {
    const response = await fetch('/api/admin/school', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Failed to update settings');
    }
    return response.json();
  };

  const uploadImage = async (file: File, type: 'logo' | 'signature') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    const response = await fetch('/api/admin/school/upload', {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Failed to upload image');
    }
    return response.json();
  };

  return { data, isLoading, error, refetch: fetchSettings, updateSettings, uploadImage };
}
