'use client';

import { useState, useCallback } from 'react';
import { useAdminStudents, useStudentMutations } from '@/hooks/useStudents';
import { useAdminClasses } from '@/hooks/useClasses';
import { DataTable } from '@/components/admin/DataTable';
import { CreateModal } from '@/components/admin/CreateModal';
import { EditModal } from '@/components/admin/EditModal';
import { DeleteConfirmation } from '@/components/admin/DeleteConfirmation';
import { StudentForm } from '@/components/admin/forms/StudentForm';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import type { Student } from '@/types/admin';
import { Column } from '@/components/admin/DataTable';

export default function StudentsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [formData, setFormData] = useState({
    full_name: '',
    admission_number: '',
    date_of_birth: '',
    gender: '',
    guardian_name: '',
    guardian_phone: '',
    guardian_email: '',
    address: '',
    enrollment_year: new Date().getFullYear(),
    class_id: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { toast } = useToast();
  const { data, isLoading, refetch } = useAdminStudents({ page, search });
  const { data: classesData } = useAdminClasses({ pageSize: 100 });
  const { createStudent, updateStudent, deleteStudent } = useStudentMutations();

  const classes = classesData?.data?.map((c: any) => ({ id: c.id, name: c.name })) || [];

  const handleSearch = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  const resetForm = () => {
    setFormData({
      full_name: '',
      admission_number: '',
      date_of_birth: '',
      gender: '',
      guardian_name: '',
      guardian_phone: '',
      guardian_email: '',
      address: '',
      enrollment_year: new Date().getFullYear(),
      class_id: null,
    });
  };

  const handleCreate = async () => {
    setIsSubmitting(true);
    try {
      // Transform empty strings to null and ensure proper types
      const submitData: Partial<Student> = {
        full_name: formData.full_name,
        admission_number: formData.admission_number,
        date_of_birth: formData.date_of_birth || null,
        gender: (formData.gender ? formData.gender : null) as 'male' | 'female' | 'other' | null,
        guardian_name: formData.guardian_name || null,
        guardian_phone: formData.guardian_phone || null,
        guardian_email: formData.guardian_email || null,
        address: formData.address || null,
        enrollment_year: typeof formData.enrollment_year === 'number'
          ? formData.enrollment_year
          : parseInt(formData.enrollment_year as any) || new Date().getFullYear(),
        class_id: formData.class_id || null,
      };
      await createStudent(submitData);
      toast({ title: 'Success', description: 'Student created successfully' });
      setShowCreate(false);
      resetForm();
      refetch();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async () => {
    if (!selectedStudent) return;
    setIsSubmitting(true);
    try {
      // Transform empty strings to null and ensure proper types
      const submitData: Partial<Student> = {
        full_name: formData.full_name,
        admission_number: formData.admission_number,
        date_of_birth: formData.date_of_birth || null,
        gender: (formData.gender ? formData.gender : null) as 'male' | 'female' | 'other' | null,
        guardian_name: formData.guardian_name || null,
        guardian_phone: formData.guardian_phone || null,
        guardian_email: formData.guardian_email || null,
        address: formData.address || null,
        enrollment_year: typeof formData.enrollment_year === 'number'
          ? formData.enrollment_year
          : parseInt(formData.enrollment_year as any) || new Date().getFullYear(),
        class_id: formData.class_id || null,
      };
      await updateStudent(selectedStudent.id, submitData);
      toast({ title: 'Success', description: 'Student updated successfully' });
      setShowEdit(false);
      setSelectedStudent(null);
      resetForm();
      refetch();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedStudent) return;
    setIsSubmitting(true);
    try {
      await deleteStudent(selectedStudent.id);
      toast({ title: 'Success', description: 'Student deleted successfully' });
      setShowDelete(false);
      setSelectedStudent(null);
      refetch();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns: Column<Student>[] = [
    { key: 'full_name', header: 'Name' },
    { key: 'admission_number', header: 'Admission #' },
    { key: 'class_name', header: 'Class' },
    { key: 'guardian_name', header: 'Guardian' },
    { key: 'guardian_phone', header: 'Phone' },
    {
      key: 'enrollment_year',
      header: 'Year',
      render: (s: any) => s.enrollment_year,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Students</h1>
          <p className="text-muted-foreground">
            Manage student records for your school.
          </p>
        </div>
        <Button onClick={() => { resetForm(); setShowCreate(true); }}>
          <Plus className="mr-2 h-4 w-4" />
          Add Student
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
        onEdit={(student: any) => {
          setSelectedStudent(student);
          setFormData(student);
          setShowEdit(true);
        }}
        onDelete={(student: any) => {
          setSelectedStudent(student);
          setShowDelete(true);
        }}
        isLoading={isLoading}
        searchPlaceholder="Search students..."
      />

      {/* Create Modal */}
      <CreateModal
        open={showCreate}
        onOpenChange={setShowCreate}
        title="Add New Student"
        onSubmit={handleCreate}
        isLoading={isSubmitting}
      >
        <StudentForm
          data={formData}
          onChange={(f, v) => setFormData((prev) => ({ ...prev, [f]: v }))}
          classes={classes}
        />
      </CreateModal>

      {/* Edit Modal */}
      <EditModal
        open={showEdit}
        onOpenChange={setShowEdit}
        title="Edit Student"
        onSubmit={handleEdit}
        isLoading={isSubmitting}
      >
        <StudentForm
          data={formData}
          onChange={(f, v) => setFormData((prev) => ({ ...prev, [f]: v }))}
          classes={classes}
        />
      </EditModal>

      {/* Delete Confirmation */}
      <DeleteConfirmation
        open={showDelete}
        onOpenChange={setShowDelete}
        title="Delete Student"
        description={`Are you sure you want to delete ${selectedStudent?.full_name}? This action will soft-delete the record.`}
        onConfirm={handleDelete}
        isLoading={isSubmitting}
      />
    </div>
  );
}