'use client';

import { useState } from 'react';
import { useSuperAdminSchools, useSuperAdminCreateSchool } from '@/hooks/useSuperAdminSchools';
import { SchoolStatusBadge } from '@/components/super-admin/SchoolStatusBadge';
import { SchoolCreateModal } from '@/components/super-admin/SchoolCreateModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Search, ChevronLeft, ChevronRight, LoaderCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';

export default function SchoolsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [tierFilter, setTierFilter] = useState('all');
  const [showCreate, setShowCreate] = useState(false);

  const { data, isLoading, refetch } = useSuperAdminSchools({
    page,
    search,
    status: statusFilter === 'all' ? '' : statusFilter,
    tier: tierFilter === 'all' ? '' : tierFilter,
  });
  const { createSchool, isLoading: isCreating } = useSuperAdminCreateSchool();

  const handleCreate = async (formData: Record<string, any>) => {
    try {
      const result = await createSchool(formData);
      toast({ title: 'Success', description: 'School created successfully' });
      refetch();
      return result;
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      throw error;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Schools</h1>
        <Button onClick={() => setShowCreate(true)}><Plus className="mr-2 h-4 w-4" />Create School</Button>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search schools..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
          <SelectTrigger className="w-[140px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="trial">Trial</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
          </SelectContent>
        </Select>
        <Select value={tierFilter} onValueChange={(v) => { setTierFilter(v); setPage(1); }}>
          <SelectTrigger className="w-[120px]"><SelectValue placeholder="Tier" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tiers</SelectItem>
            <SelectItem value="trial">Trial</SelectItem>
            <SelectItem value="free">Free</SelectItem>
            <SelectItem value="starter">Starter</SelectItem>
            <SelectItem value="growth">Growth</SelectItem>
            <SelectItem value="premium">Premium</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>School Name</TableHead>
              <TableHead>Subdomain</TableHead>
              <TableHead>Admin</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Tier</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8"><LoaderCircle className="h-6 w-6 animate-spin mx-auto" /></TableCell></TableRow>
            ) : (data?.data || []).length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No schools found</TableCell></TableRow>
            ) : (
              (data?.data || []).map((school: any) => (
                <TableRow key={school.id} className="cursor-pointer hover:bg-muted/50" onClick={() => router.push(`/dashboard/super-admin/schools/${school.id}`)}>
                  <TableCell className="font-medium">{school.name}</TableCell>
                  <TableCell className="text-muted-foreground">{school.subdomain}</TableCell>
                  <TableCell>{school.admin_email}</TableCell>
                  <TableCell><SchoolStatusBadge status={school.subscription_status} /></TableCell>
                  <TableCell className="capitalize">{school.subscription_tier}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {data?.meta && data.meta.total_pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Page {page} of {data.meta.total_pages}</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage(page - 1)} disabled={page <= 1}><ChevronLeft className="h-4 w-4" /></Button>
            <Button variant="outline" size="sm" onClick={() => setPage(page + 1)} disabled={page >= data.meta.total_pages}><ChevronRight className="h-4 w-4" /></Button>
          </div>
        </div>
      )}

      <SchoolCreateModal open={showCreate} onOpenChange={setShowCreate} onSubmit={handleCreate} isLoading={isCreating} />
    </div>
  );
}
