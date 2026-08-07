'use client';

import { useState, useEffect } from 'react';

interface PublicSchool {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  motto: string | null;
  website_theme: { primary_color: string; font: string } | null;
  website_content: {
    hero_title: string | null;
    hero_subtitle: string | null;
    about_text: string | null;
    contact_email: string | null;
    contact_phone: string | null;
    address: string | null;
    gallery: { url: string; type: string }[];
  } | null;
  social_links: { facebook: string | null; twitter: string | null; instagram: string | null } | null;
}

export function usePublicSchool(slug: string) {
  const [school, setSchool] = useState<PublicSchool | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    setIsLoading(true);
    fetch(`/api/public/school/${slug}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setSchool(data.school);
        else setError(data.error);
      })
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, [slug]);

  const theme = {
    primaryColor: school?.website_theme?.primary_color || '#2563eb',
    font: school?.website_theme?.font || 'Inter',
  };

  return { school, isLoading, error, theme };
}
