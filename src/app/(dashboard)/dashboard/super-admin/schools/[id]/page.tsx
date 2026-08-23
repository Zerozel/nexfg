'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  useSuperAdminSchoolDetail,
  useSuperAdminUpdateStatus,
  useSuperAdminSuspendSchool,
} from '@/hooks/useSuperAdminSchools';
import { SchoolStatusBadge } from '@/components/super-admin/SchoolStatusBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ArrowLeft,
  Users,
  GraduationCap,
  BookOpen,
  Ban,
  Power,
  Mail,
  Phone,
  Building2,
  Calendar,
  ClipboardList,
  LoaderCircle,
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

function formatDate(value: string | null): string {
  if (!value) return '—';
  return new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function SchoolDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const router = useRouter();
  const { toast } = useToast();

  const { data, isLoading, error, refetch } = useSuperAdminSchoolDetail(id);
  const { updateStatus, isLoading: isUpdating } = useSuperAdminUpdateStatus();
  const { suspendSchool, isLoading: isSuspending } = useSuperAdminSuspendSchool();

  const [status, setStatus] = useState('active');
  const [tier, setTier] = useState('trial');
  const [expiresAt, setExpiresAt] = useState('');

  const school = data?.school;
  const admin = data?.admin;
  const stats = data?.stats;

  useEffect(() => {
    if (school) {
      setStatus(school.subscription_status);
      setTier(school.subscription_tier);
      setExpiresAt(school.subscription_expires_at ? school.subscription_expires_at.slice(0, 10) : '');
    }
  }, [school]);

  const handleSaveSubscription = async () => {
    try {
      await updateStatus(id, {
        status,
        tier,
        expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
      });
      toast({ title: 'Success', description: 'Subscription updated successfully' });
      refetch();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const handleToggleSuspend = async () => {
    const suspend = school?.subscription_status !== 'inactive';
    try {
      await suspendSchool(id, { suspend });
      toast({
        title: 'Success',
        description: suspend ? 'School suspended' : 'School reactivated',
      });
      refetch();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <LoaderCircle className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !school) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => router.push('/dashboard/super-admin/schools')}>
          <ArrowLeft className="mr-2 h-4 w-4" />Back to Schools
        </Button>
        <p className="text-destructive">{error || 'School not found'}</p>
      </div>
    );
  }

  const isSuspended = school.subscription_status === 'inactive';

  const statCards = [
    { label: 'Students', value: stats?.students ?? 0, icon: Users },
    { label: 'Teachers', value: stats?.teachers ?? 0, icon: GraduationCap },
    { label: 'Classes', value: stats?.classes ?? 0, icon: BookOpen },
    { label: 'Subjects', value: stats?.subjects ?? 0, icon: ClipboardList },
    { label: 'Assessments', value: stats?.assessments ?? 0, icon: ClipboardList },
  ];

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => router.push('/dashboard/super-admin/schools')}>
        <ArrowLeft className="mr-2 h-4 w-4" />Back to Schools
      </Button>

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
            <Building2 className="h-6 w-6 text-muted-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{school.name}</h1>
            <p className="text-sm text-muted-foreground">{school.subdomain}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <SchoolStatusBadge status={school.subscription_status} />
          <Button
            variant={isSuspended ? 'default' : 'destructive'}
            onClick={handleToggleSuspend}
            disabled={isSuspending}
          >
            {isSuspending ? (
              <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
            ) : isSuspended ? (
              <Power className="mr-2 h-4 w-4" />
            ) : (
              <Ban className="mr-2 h-4 w-4" />
            )}
            {isSuspended ? 'Reactivate' : 'Suspend'}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
        {statCards.map((s) => (
          <Card key={s.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{s.label}</CardTitle>
              <s.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{s.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>School Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{school.email || '—'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{school.phone || '—'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>Created {formatDate(school.created_at)}</span>
            </div>
            <div className="pt-2 border-t">
              <p className="text-xs uppercase text-muted-foreground mb-1">School Admin</p>
              {admin ? (
                <>
                  <p className="font-medium">{admin.full_name}</p>
                  <p className="text-muted-foreground">{admin.email}</p>
                </>
              ) : (
                <p className="text-muted-foreground">No admin assigned</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Subscription</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="trial">Trial</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Tier</Label>
              <Select value={tier} onValueChange={setTier}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="trial">Trial</SelectItem>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="starter">Starter</SelectItem>
                  <SelectItem value="growth">Growth</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Expires At</Label>
              <Input type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} />
            </div>
            <Button onClick={handleSaveSubscription} disabled={isUpdating} className="w-full">
              {isUpdating && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
