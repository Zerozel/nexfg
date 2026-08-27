'use client';

import { useState, useCallback } from 'react';
import { useTeachers, useTeacherMutations } from '@/hooks/useTeachers';
import { DataTable } from '@/components/admin/DataTable';
import { CreateModal } from '@/components/admin/CreateModal';
import { EditModal } from '@/components/admin/EditModal';
import { DeleteConfirmation } from '@/components/admin/DeleteConfirmation';
import { CredentialModal } from '@/components/admin/CredentialModal';
import { TeacherForm } from '@/components/admin/forms/TeacherForm';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import type { Teacher } from '@/types/admin';
import { Column } from '@/components/admin/DataTable';

export default function TeachersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showCredentials, setShowCredentials] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [credentialData, setCredentialData] = useState<any>(null);
  const [formData, setFormData] = useState<{ 
	  full_name: string; email: string; role: "teacher" | "admin" | "principal" }>({ full_name: '', email: '', role: 'teacher' });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const { toast } = useToast();
  const { data, isLoading, refetch } = useTeachers({ page, search });
  const { createTeacher, updateTeacher, deleteTeacher } = useTeacherMutations();

  const handleSearch = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  const handleCreate = async () => {
    setIsSubmitting(true);
    try {
      const result = await createTeacher(formData);
      toast({ title: 'Success', description: 'Teacher created successfully' });
      setShowCreate(false);
      setCredentialData(result.data);
      setShowCredentials(true);
      setFormData({ full_name: '', email: '', role: 'teacher' });
      refetch();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async () => {
    if (!selectedTeacher) return;
    setIsSubmitting(true);
    try {
      await updateTeacher(selectedTeacher.id, formData);
      toast({ title: 'Success', description: 'Teacher updated successfully' });
      setShowEdit(false);
      setSelectedTeacher(null);
      setFormData({ full_name: '', email: '', role: 'teacher' });
      refetch();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedTeacher) return;
    setIsSubmitting(true);
    try {
      await deleteTeacher(selectedTeacher.id);
      toast({ title: 'Success', description: 'Teacher deleted successfully' });
      setShowDelete(false);
      setSelectedTeacher(null);
      refetch();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns: Column<Teacher>[] = [
    { key: 'full_name', header: 'Name' },
    { key: 'email', header: 'Email' },
    {
      key: 'role',
      header: 'Role',
      render: (t: any) => (
        <Badge variant={t.role === 'admin' ? 'default' : t.role === 'principal' ? 'secondary' : 'outline'}>
          {t.role}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Teachers</h1>
          <p className="text-muted-foreground">
            Manage teacher accounts for your school.
          </p>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Teacher
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={(data?.data || []) as any}
        total={data?.total || 0}
        page={page}
        pageSize={10}
        totalPages={data?.totalPages || 1}
        onSearch={handleSearch}
        onPageChange={setPage}
        onEdit={(teacher: any) => {
          setSelectedTeacher(teacher);
          setFormData({ full_name: teacher.full_name, email: teacher.email, role: teacher.role as "teacher" | "admin" | "principal" });
          setShowEdit(true);
        }}
        onDelete={(teacher: any) => {
          setSelectedTeacher(teacher);
          setShowDelete(true);
        }}
        isLoading={isLoading}
        searchPlaceholder="Search teachers..."
      />

      {/* Create Modal */}
      <CreateModal
        open={showCreate}
        onOpenChange={setShowCreate}
        title="Add New Teacher"
        description="A temporary password will be generated for the teacher."
        onSubmit={handleCreate}
        isLoading={isSubmitting}
      >
        <TeacherForm data={formData} onChange={(f, v) => setFormData((prev) => ({ ...prev, [f]: v }))} />
      </CreateModal>

      {/* Edit Modal */}
      <EditModal
        open={showEdit}
        onOpenChange={setShowEdit}
        title="Edit Teacher"
        onSubmit={handleEdit}
        isLoading={isSubmitting}
      >
        <TeacherForm data={formData} onChange={(f, v) => setFormData((prev) => ({ ...prev, [f]: v }))} isEditing />
      </EditModal>

      {/* Delete Confirmation */}
      <DeleteConfirmation
        open={showDelete}
        onOpenChange={setShowDelete}
        title="Delete Teacher"
        description={`Are you sure you want to delete ${selectedTeacher?.full_name}? This will soft-delete the teacher's account.`}
        onConfirm={handleDelete}
        isLoading={isSubmitting}
      />

      {/* Credential Modal */}
      <CredentialModal
        open={showCredentials}
        onOpenChange={setShowCredentials}
        teacher={credentialData}
      />
    </div>
  );
}
