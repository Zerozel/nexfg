'use client';

import { useState, useEffect } from 'react';
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
import {
  Loader2,
  Copy,
  ExternalLink,
  Check,
  AlertTriangle,
  Clock,
} from 'lucide-react';
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

  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    motto: '',
  });

  const [branding, setBranding] = useState({
    primary_color: '#2563eb',
    font: 'Inter',
    logo_url: null as string | null,
  });

  const [content, setContent] = useState({
    hero_title: '',
    hero_subtitle: '',
    about_text: '',
    gallery: [] as { url: string; type: string }[],
  });

  const [social, setSocial] = useState({
    facebook: '',
    twitter: '',
    instagram: '',
  });

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

      {/* School URL card */}
      {publicUrl && (
        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex flex-wrap items-center justify-between gap-2">
              <span>Your School Website</span>
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="bg-amber-50 text-amber-700 border-amber-200"
                >
                  <Clock className="h-3 w-3 mr-1" />
                  Preview
                </Badge>
                {data?.website_enabled ? (
                  <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                    Live
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-gray-600">
                    Not Published
                  </Badge>
                )}
              </div>
            </CardTitle>
            <CardDescription>
              Your public website URL. Content and features are in preview
              while we finish the audit.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <code className="flex-1 min-w-0 rounded-md border bg-white px-3 py-2 text-sm font-mono truncate">
                {publicUrl}
              </code>
              <div className="flex gap-2 shrink-0">
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

      {/*
        Tabs layout: the tab bar is a full-width bar sitting above the tab
        content. The content fills the space directly below with no vertical
        gap. On mobile the tab bar scrolls horizontally so all tabs stay
        reachable without cramming.
      */}
      <Tabs defaultValue="profile" className="w-full gap-0">
        {/* Full-width tab bar */}
        <div className="border-b">
          <TabsList
            variant="line"
            className="w-full h-auto p-0 gap-0 rounded-none bg-transparent justify-start overflow-x-auto flex-nowrap"
          >
            <TabsTrigger
              value="profile"
              className="flex-shrink-0 rounded-none border-b-2 border-transparent data-[active]:border-primary data-[active]:text-foreground px-4 py-3 text-sm font-medium"
            >
              Profile
            </TabsTrigger>
            <TabsTrigger
              value="branding"
              className="flex-shrink-0 rounded-none border-b-2 border-transparent data-[active]:border-primary data-[active]:text-foreground px-4 py-3 text-sm font-medium"
            >
              Branding
            </TabsTrigger>
            <TabsTrigger
              value="documents"
              className="flex-shrink-0 rounded-none border-b-2 border-transparent data-[active]:border-primary data-[active]:text-foreground px-4 py-3 text-sm font-medium"
            >
              Documents
            </TabsTrigger>
            <TabsTrigger
              value="content"
              className="flex-shrink-0 rounded-none border-b-2 border-transparent data-[active]:border-primary data-[active]:text-foreground px-4 py-3 text-sm font-medium whitespace-nowrap"
            >
              Website
              <Badge
                variant="outline"
                className="ml-2 text-[10px] bg-amber-50 text-amber-700 border-amber-200 py-0 px-1.5 hidden sm:inline-flex"
              >
                Soon
              </Badge>
            </TabsTrigger>
            <TabsTrigger
              value="social"
              className="flex-shrink-0 rounded-none border-b-2 border-transparent data-[active]:border-primary data-[active]:text-foreground px-4 py-3 text-sm font-medium"
            >
              Social
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Content directly below the bar — no gap */}
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
          <Card className="border-amber-200 bg-amber-50/50 mb-4">
            <CardContent className="flex items-start gap-3 py-4">
              <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-amber-900">
                  Website feature — coming soon
                </p>
                <p className="text-amber-800 mt-0.5">
                  Editing website content is available in preview while we
                  complete the audit. Changes you make here may not be
                  publicly visible yet.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Website Content</CardTitle>
              <CardDescription>
                Edit the hero section, about text, and video gallery shown on
                your public website at{' '}
                {data?.slug
                  ? `${data.slug}.nexaforges.me`
                  : 'your subdomain'}
                .
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
