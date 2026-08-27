'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useSchoolSettings } from '@/hooks/useSchoolSettings';
import { SchoolProfileForm } from '@/components/admin/school-settings/SchoolProfileForm';
import { BrandingForm } from '@/components/admin/school-settings/BrandingForm';
import { WebsiteContentForm } from '@/components/admin/school-settings/WebsiteContentForm';
import { SocialLinksForm } from '@/components/admin/school-settings/SocialLinksForm';
import { SignatureUpload } from '@/components/admin/school-settings/SignatureUpload';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function SchoolSettingsPage() {
  const { data, isLoading: isFetching, updateSettings, uploadImage, refetch } = useSchoolSettings();
  const [isSaving, setIsSaving] = useState(false);

  // Profile state
  const [profile, setProfile] = useState({ name: '', email: '', phone: '', address: '', motto: '' });

  // Branding state
  const [branding, setBranding] = useState({ primary_color: '#2563eb', font: 'Inter', logo_url: null as string | null });

  // Content state
  const [content, setContent] = useState({ hero_title: '', hero_subtitle: '', about_text: '', gallery: [] as { url: string; type: string }[] });

  // Social state
  const [social, setSocial] = useState({ facebook: '', twitter: '', instagram: '' });

  // Sync state from fetched data
  useEffect(() => {
    if (!data) return;
    setProfile({
      name: data.name || '',
      email: data.email || '',
      phone: data.phone || '',
      address: data.address || '',
      motto: data.motto || '',
    });
    setBranding({
      primary_color: data.website_theme?.primary_color || '#2563eb',
      font: data.website_theme?.font || 'Inter',
      logo_url: data.logo_url || null,
    });
    setContent({
      hero_title: data.website_content?.hero_title || '',
      hero_subtitle: data.website_content?.hero_subtitle || '',
      about_text: data.website_content?.about_text || '',
      gallery: data.website_content?.gallery || [],
    });
    setSocial({
      facebook: data.social_links?.facebook || '',
      twitter: data.social_links?.twitter || '',
      instagram: data.social_links?.instagram || '',
    });
  }, [data]);

  const handleSave = async (settings: Record<string, any>) => {
    setIsSaving(true);
    try {
      await updateSettings(settings);
      toast.success('Settings updated successfully');
      refetch();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveProfile = () => {
    return handleSave({
      name: profile.name,
      email: profile.email || null,
      phone: profile.phone || null,
      address: profile.address || null,
      motto: profile.motto || null,
    });
  };

  const handleSaveBranding = () => {
    return handleSave({
      website_theme: {
        primary_color: branding.primary_color,
        font: branding.font,
      },
    });
  };

  const handleUploadLogo = async (file: File): Promise<string> => {
    try {
      const result = await uploadImage(file, 'logo');
      toast.success('Logo uploaded successfully');
      refetch();
      return result.url;
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload logo');
      throw error;
    }
  };

  const handleRemoveLogo = () => {
    setBranding((prev) => ({ ...prev, logo_url: null }));
    handleSave({ logo_url: null });
  };

  const handleSaveContent = () => {
    return handleSave({
      website_content: {
        hero_title: content.hero_title || null,
        hero_subtitle: content.hero_subtitle || null,
        about_text: content.about_text || null,
        gallery: content.gallery,
      },
    });
  };

  const handleSaveSocial = () => {
    return handleSave({
      social_links: {
        facebook: social.facebook || null,
        twitter: social.twitter || null,
        instagram: social.instagram || null,
      },
    });
  };

  const handleUploadSignature = async (file: File): Promise<string> => {
    try {
      const result = await uploadImage(file, 'signature');
      toast.success('Signature uploaded successfully');
      refetch();
      return result.url;
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload signature');
      throw error;
    }
  };

  const handleRemoveSignature = () => {
    handleSave({ principal_signature_url: null });
  };

  if (isFetching) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">School Settings</h1>
        <p className="text-muted-foreground">
          Manage your school profile, branding, and website content.
        </p>
      </div>

      <Tabs defaultValue="profile">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="branding">Branding</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="social">Social</TabsTrigger>
          <TabsTrigger value="signature">Signature</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>School Profile</CardTitle>
              <CardDescription>Update your school's contact information and motto.</CardDescription>
            </CardHeader>
            <CardContent>
              <SchoolProfileForm
                data={profile}
                onChange={(field: string, value: string) => setProfile((prev) => ({ ...prev, [field]: value }))}
                onSave={handleSaveProfile}
                isLoading={isSaving}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="branding">
          <Card>
            <CardHeader>
              <CardTitle>Branding</CardTitle>
              <CardDescription>Customize your school's colors, font, and logo.</CardDescription>
            </CardHeader>
            <CardContent>
              <BrandingForm
                data={branding}
                onChange={(field: string, value: string) => setBranding((prev) => ({ ...prev, [field]: value }))}
                onSave={handleSaveBranding}
                onUploadLogo={handleUploadLogo}
                onRemoveLogo={handleRemoveLogo}
                isLoading={isSaving}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content">
          <Card>
            <CardHeader>
              <CardTitle>Website Content</CardTitle>
              <CardDescription>Edit your school website's hero section, about text, and gallery.</CardDescription>
            </CardHeader>
            <CardContent>
              <WebsiteContentForm
                data={content}
                onChange={(field: string, value: string) => setContent((prev) => ({ ...prev, [field]: value }))}
                onGalleryChange={(gallery: { url: string; type: string }[]) => setContent((prev) => ({ ...prev, gallery }))}
                onSave={handleSaveContent}
                isLoading={isSaving}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="social">
          <Card>
            <CardHeader>
              <CardTitle>Social Links</CardTitle>
              <CardDescription>Add links to your school's social media profiles.</CardDescription>
            </CardHeader>
            <CardContent>
              <SocialLinksForm
                data={social}
                onChange={(field: string, value: string) => setSocial((prev) => ({ ...prev, [field]: value }))}
                onSave={handleSaveSocial}
                isLoading={isSaving}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="signature">
          <Card>
            <CardHeader>
              <CardTitle>Principal Signature</CardTitle>
              <CardDescription>
                Upload the principal's signature for report cards. PNG format recommended for transparency.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SignatureUpload
                signatureUrl={data?.principal_signature_url || null}
                onUpload={handleUploadSignature}
                onRemove={handleRemoveSignature}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
