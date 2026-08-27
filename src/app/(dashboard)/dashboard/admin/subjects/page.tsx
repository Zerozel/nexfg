'use client';

import { useState, useCallback } from 'react';
import { useSubjects, useSubjectMutations } from '@/hooks/useSubjects';
import { DataTable } from '@/components/admin/DataTable';
import { CreateModal } from '@/components/admin/CreateModal';
import { EditModal } from '@/components/admin/EditModal';
import { DeleteConfirmation } from '@/components/admin/DeleteConfirmation';
import { SubjectForm } from '@/components/admin/forms/SubjectForm';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Subject } from '@/types/admin';
import { Column } from '@/components/admin/DataTable';

export default function SubjectsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [formData, setFormData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { toast } = useToast();
  const { data, isLoading, refetch } = useSubjects({ page, search });
  const { createSubject, updateSubject, deleteSubject } = useSubjectMutations();

  const handleSearch = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  const handleCreate = async () => {
    setIsSubmitting(true);
    try {
      await createSubject(formData);
      toast({ title: 'Success', description: 'Subject created successfully' });
      setShowCreate(false);
      setFormData({});
      refetch();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async () => {
    if (!selectedSubject) return;
    setIsSubmitting(true);
    try {
      await updateSubject(selectedSubject.id, formData);
      toast({ title: 'Success', description: 'Subject updated successfully' });
      setShowEdit(false);
      setSelectedSubject(null);
      setFormData({});
      refetch();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedSubject) return;
    setIsSubmitting(true);
    try {
      await deleteSubject(selectedSubject.id);
      toast({ title: 'Success', description: 'Subject deleted successfully' });
      setShowDelete(false);
      setSelectedSubject(null);
      refetch();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns: Column<Subject>[] = [
    { key: 'name', header: 'Subject Name' },
    {
      key: 'code',
      header: 'Code',
      render: (s: any) => (
        <span className="font-mono text-sm bg-muted px-2 py-1 rounded">{s.code}</span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Subjects</h1>
          <p className="text-muted-foreground">
            Manage subjects offered at your school.
          </p>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Subject
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={data?.data || []}
        total={data?.total || 0}
        page={page}
        pageSize={10}
        totalPages={data?.totalPages || 1}
        onSearch={handleSearch}
        onPageChange={setPage}
        onEdit={(subject) => {
          setSelectedSubject(subject);
          setFormData(subject);
          setShowEdit(true);
        }}
        onDelete={(subject) => {
          setSelectedSubject(subject);
          setShowDelete(true);
        }}
        isLoading={isLoading}
        searchPlaceholder="Search subjects..."
      />

      <CreateModal
        open={showCreate}
        onOpenChange={setShowCreate}
        title="Add New Subject"
        onSubmit={handleCreate}
        isLoading={isSubmitting}
      >
        <SubjectForm data={formData} onChange={(f, v) => setFormData((prev) => ({ ...prev, [f]: v }))} />
      </CreateModal>

      <EditModal
        open={showEdit}
        onOpenChange={setShowEdit}
        title="Edit Subject"
        onSubmit={handleEdit}
        isLoading={isSubmitting}
      >
        <SubjectForm data={formData} onChange={(f, v) => setFormData((prev) => ({ ...prev, [f]: v }))} />
      </EditModal>

      <DeleteConfirmation
        open={showDelete}
        onOpenChange={setShowDelete}
        title="Delete Subject"
        description={`Are you sure you want to delete ${selectedSubject?.name}?`}
        onConfirm={handleDelete}
        isLoading={isSubmitting}
      />
    </div>
  );
}
