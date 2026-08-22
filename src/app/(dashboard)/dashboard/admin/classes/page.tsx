'use client';

import { useState, useCallback } from 'react';
import { useAdminClasses, useClassMutations } from '@/hooks/useClasses';
import { useTeachers } from '@/hooks/useTeachers';
import { useAcademicYears } from '@/hooks/useAcademicYears';

import { DataTable } from '@/components/admin/DataTable';
import { CreateModal } from '@/components/admin/CreateModal';
import { EditModal } from '@/components/admin/EditModal';
import { DeleteConfirmation } from '@/components/admin/DeleteConfirmation';
import { ClassForm } from '@/components/admin/forms/ClassForm';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import type { Class } from '@/types/admin';
import { Column } from '@/components/admin/DataTable';

export default function ClassesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [formData, setFormData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { toast } = useToast();
  const { data, isLoading, refetch } = useAdminClasses({ page, search });
  const { data: teachersData } = useTeachers({ pageSize: 100 });
  const { data: academicYears } = useAcademicYears();
  const { createClass, updateClass, deleteClass } = useClassMutations();

  const teachers = teachersData?.data?.map((t) => ({ id: t.id, full_name: t.full_name })) || [];

  // Default a new class to the current session (falling back to the newest one)
  // so the required academic_year_id is always populated with a real UUID.
  const defaultAcademicYearId =
    academicYears.find((ay) => ay.is_current)?.id || academicYears[0]?.id || '';

  const handleSearch = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  const openCreate = () => {
    setFormData({ academic_year_id: defaultAcademicYearId });
    setShowCreate(true);
  };


  const handleCreate = async () => {
    setIsSubmitting(true);
    try {
      await createClass(formData);
      toast({ title: 'Success', description: 'Class created successfully' });
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
    if (!selectedClass) return;
    setIsSubmitting(true);
    try {
      await updateClass(selectedClass.id, formData);
      toast({ title: 'Success', description: 'Class updated successfully' });
      setShowEdit(false);
      setSelectedClass(null);
      setFormData({});
      refetch();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedClass) return;
    setIsSubmitting(true);
    try {
      await deleteClass(selectedClass.id);
      toast({ title: 'Success', description: 'Class deleted successfully' });
      setShowDelete(false);
      setSelectedClass(null);
      refetch();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns: Column<Class>[] = [
    { key: 'name', header: 'Class Name' },
    { key: 'teacher_name', header: 'Class Teacher' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Classes</h1>
          <p className="text-muted-foreground">
            Manage classes for your school.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Add Class
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
        onEdit={(cls: any) => {
          setSelectedClass(cls);
          setFormData(cls);
          setShowEdit(true);
        }}
        onDelete={(cls: any) => {
          setSelectedClass(cls);
          setShowDelete(true);
        }}
        isLoading={isLoading}
        searchPlaceholder="Search classes..."
      />

      <CreateModal
        open={showCreate}
        onOpenChange={setShowCreate}
        title="Add New Class"
        onSubmit={handleCreate}
        isLoading={isSubmitting}
      >
        <ClassForm data={formData} onChange={(f, v) => setFormData((prev) => ({ ...prev, [f]: v }))} academicYears={academicYears} teachers={teachers} />
      </CreateModal>

      <EditModal
        open={showEdit}
        onOpenChange={setShowEdit}
        title="Edit Class"
        onSubmit={handleEdit}
        isLoading={isSubmitting}
      >
        <ClassForm data={formData} onChange={(f, v) => setFormData((prev) => ({ ...prev, [f]: v }))} academicYears={academicYears} teachers={teachers} />
      </EditModal>

      <DeleteConfirmation
        open={showDelete}
        onOpenChange={setShowDelete}
        title="Delete Class"
        description={`Are you sure you want to delete ${selectedClass?.name}?`}
        onConfirm={handleDelete}
        isLoading={isSubmitting}
      />
    </div>
  );
}
