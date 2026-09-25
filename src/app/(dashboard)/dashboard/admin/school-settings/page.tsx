'use client';

import { useState, useEffect, useRef } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSchoolSettings } from '@/hooks/useSchoolSettings';
import { SchoolProfileForm } from '@/components/admin/school-settings/SchoolProfileForm';
import { BrandingForm } from '@/components/admin/school-settings/BrandingForm';
import { WebsiteContentForm } from '@/components/admin/school-settings/WebsiteContentForm';
import { SocialLinksForm } from '@/components/admin/school-settings/SocialLinksForm';
import { SignatureUpload } from '@/components/admin/school-settings/SignatureUpload';
import { Loader2, Copy, ExternalLink, Check } from 'lucide-react';
import { toast } from 'sonner';

export default function SchoolSettingsPage() {
  const {
    data,
    isLoading: isFetching,
    updateSettings,
    uploadImage,
    refetch,
  } = useSchoolSettings();
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  // Profile state
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    motto: '',
  });

  // Branding state
  const [branding, setBranding] = useState({
    primary_color: '#2563eb',
    font: 'Inter',
    logo_url: null as string | null,
  });

  // Content state
  const [content, setContent] = useState({
    hero_title: '',
    hero_subtitle: '',
    about_text: '',
    gallery: [] as { url: string; type: string }[],
  });

  // Social state
  const [social, setSocial] = useState({
    facebook: '',
    twitter: '',
    instagram: '',
  });

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

  const handleSaveProfile = () =>
    handleSave({
      name: profile.name,
      email: profile.email || null,
      phone: profile.phone || null,
      address: profile.address || null,
      motto: profile.motto || null,
    });

  const handleSaveBranding = () =>
    handleSave({
      website_theme: {
        primary_color: branding.primary_color,
        font: branding.font,
      },
    });

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

  const handleSaveContent = () =>
    handleSave({
      website_content: {
        hero_title: content.hero_title || null,
        hero_subtitle: content.hero_subtitle || null,
        about_text: content.about_text || null,
        gallery: content.gallery,
      },
    });

  const handleSaveSocial = () =>
    handleSave({
      social_links: {
        facebook: social.facebook || null,
        twitter: social.twitter || null,
        instagram: social.instagram || null,
      },
    });

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

  const publicUrl = data?.slug
    ? `https://${data.slug}.nexaforges.me`
    : null;

  const handleCopy = async () => {
    if (!publicUrl) return;
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy link');
    }
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

      {/* School URL card — shown prominently at the top for onboarding */}
      {publicUrl && (
        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center justify-between">
              <span>Your School Website</span>
              {data?.website_enabled ? (
                <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                  Live
                </Badge>
              ) : (
                <Badge variant="outline" className="text-gray-600">
                  Not Published
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              {data?.website_enabled
                ? 'Your public website is live and shareable.'
                : 'Enable website content below to publish your public site.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <code className="flex-1 rounded-md border bg-white px-3 py-2 text-sm font-mono truncate">
                {publicUrl}
              </code>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                  className="flex-1 sm:flex-none"
                >
                  {copied ? (
                    <>
                      <Check className="mr-2 h-4 w-4" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy className="mr-2 h-4 w-4" /> Copy
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(publicUrl, '_blank')}
                  className="flex-1 sm:flex-none"
                >
                  <ExternalLink className="mr-2 h-4 w-4" /> Visit
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="profile">
        {/* Responsive tabs: 2 columns on mobile, 5 on desktop */}
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-5 h-auto">
          <TabsTrigger value="profile" className="text-xs sm:text-sm">
            Profile
          </TabsTrigger>
          <TabsTrigger value="branding" className="text-xs sm:text-sm">
            Branding
          </TabsTrigger>
          <TabsTrigger value="documents" className="text-xs sm:text-sm">
            Documents
          </TabsTrigger>
          <TabsTrigger value="content" className="text-xs sm:text-sm">
            Website
          </TabsTrigger>
          <TabsTrigger value="social" className="text-xs sm:text-sm">
            Social
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>School Profile</CardTitle>
              <CardDescription>
                Update your school&apos;s contact information and motto. This
                appears on report cards and your public website.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SchoolProfileForm
                data={profile}
                onChange={(field: string, value: string) =>
                  setProfile((prev) => ({ ...prev, [field]: value }))
                }
                onSave={handleSaveProfile}
                isLoading={isSaving}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="branding" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Branding</CardTitle>
              <CardDescription>
                Customize your school&apos;s colors, font, and logo. Used on
                report cards, the dashboard, and your public website.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BrandingForm
                data={branding}
                onChange={(field: string, value: string) =>
                  setBranding((prev) => ({ ...prev, [field]: value }))
                }
                onSave={handleSaveBranding}
                onUploadLogo={handleUploadLogo}
                onRemoveLogo={handleRemoveLogo}
                isLoading={isSaving}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Documents</CardTitle>
              <CardDescription>
                Upload official signatures and seals used on printed report
                cards, transcripts, and letters.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold mb-2">
                    Principal&apos;s Signature
                  </h3>
                  <SignatureUpload
                    signatureUrl={data?.principal_signature_url || null}
                    onUpload={handleUploadSignature}
                    onRemove={handleRemoveSignature}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Website Content</CardTitle>
              <CardDescription>
                Edit the hero section, about text, and video gallery shown on
                your public website at{' '}
                {data?.slug ? `${data.slug}.nexaforges.me` : 'your subdomain'}.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <WebsiteContentForm
                data={content}
                onChange={(field: string, value: string) =>
                  setContent((prev) => ({ ...prev, [field]: value }))
                }
                onGalleryChange={(gallery: { url: string; type: string }[]) =>
                  setContent((prev) => ({ ...prev, gallery }))
                }
                onSave={handleSaveContent}
                isLoading={isSaving}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="social" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Social Links</CardTitle>
              <CardDescription>
                Add links to your school&apos;s social media profiles. These
                appear in the footer of your public website.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SocialLinksForm
                data={social}
                onChange={(field: string, value: string) =>
                  setSocial((prev) => ({ ...prev, [field]: value }))
                }
                onSave={handleSaveSocial}
                isLoading={isSaving}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
