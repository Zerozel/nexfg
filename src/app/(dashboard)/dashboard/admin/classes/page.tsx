'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  useAdminClasses,
  useClassMutations,
  useClassGroup,
} from '@/hooks/useClasses';
import { useTeachers } from '@/hooks/useTeachers';
import { useAcademicYears } from '@/hooks/useAcademicYears';

import { DataTable, Column } from '@/components/admin/DataTable';
import { CreateModal } from '@/components/admin/CreateModal';
import { EditModal } from '@/components/admin/EditModal';
import { DeleteConfirmation } from '@/components/admin/DeleteConfirmation';
import { ClassForm } from '@/components/admin/forms/ClassForm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import type { Class } from '@/types/admin';

export default function ClassesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit modal state — the whole group of arms
  const [editBaseName, setEditBaseName] = useState<string | null>(null);
  const [editArmsCount, setEditArmsCount] = useState<number>(1);
  const [editAcademicYearId, setEditAcademicYearId] = useState<string>('');
  const [editArmTeachers, setEditArmTeachers] = useState<
    Record<string, string | null>
  >({});

  const { toast } = useToast();
  const { data, isLoading, refetch } = useAdminClasses({ page, search });
  const { data: teachersData } = useTeachers({ pageSize: 100 });
  const { data: academicYears } = useAcademicYears();
  const { createClass, deleteClass, syncClassGroup } = useClassMutations();

  // Load the whole group when editing
  const { arms: editArms, isLoading: editArmsLoading } = useClassGroup(editBaseName);

  // Seed edit state from the fetched group. Depends on editArms.length so it
  // fires once the group has loaded — the earlier version short-circuited on
  // the first render (editArms empty) and never re-ran.
  useEffect(() => {
    if (!showEdit || !editBaseName) return;
    if (editArms.length === 0) return;

    setEditArmsCount(editArms.length);
    setEditAcademicYearId(editArms[0].academic_year_id);

    const teachers: Record<string, string | null> = {};
    const letters = 'ABCDEFGHIJ';
    editArms.forEach((arm, i) => {
      teachers[letters[i]] = arm.teacher_id ?? null;
    });
    setEditArmTeachers(teachers);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editArms.length, editBaseName, showEdit]);

  const teachers =
    teachersData?.data?.map((t) => ({ id: t.id, full_name: t.full_name })) || [];

  const defaultAcademicYearId =
    academicYears.find((ay) => ay.is_current)?.id || academicYears[0]?.id || '';

  const handleSearch = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  const openCreate = () => {
    setFormData({ academic_year_id: defaultAcademicYearId, arms_count: 1 });
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
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEdit = (cls: Class) => {
    setSelectedClass(cls);
    setEditBaseName(cls.base_name || cls.name);
    setEditArmsCount(cls.arms_count ?? 1);
    setEditAcademicYearId(cls.academic_year_id);
    setEditArmTeachers({});
    setShowEdit(true);
  };

  const handleEditSave = async () => {
    if (!editBaseName || !editAcademicYearId) return;
    setIsSubmitting(true);
    try {
      const letters = 'ABCDEFGHIJ';
      const arms = Array.from({ length: editArmsCount }, (_, i) => {
        const letter = letters[i];
        const existing = editArms[i];
        return {
          id: existing?.id,
          name: existing?.name || `${editBaseName}${letter}`,
          teacher_id: editArmTeachers[letter] ?? null,
        };
      });

      await syncClassGroup(editBaseName, {
        academic_year_id: editAcademicYearId,
        arms_count: editArmsCount,
        arms,
      });

      toast({ title: 'Success', description: 'Class group updated successfully' });
      setShowEdit(false);
      setSelectedClass(null);
      setEditBaseName(null);
      refetch();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
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
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns: Column<Class>[] = [
    { key: 'name', header: 'Class Name' },
    { key: 'teacher_name', header: 'Class Teacher' },
  ];

  const letters = 'ABCDEFGHIJ'.split('').slice(0, editArmsCount);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Classes</h1>
          <p className="text-muted-foreground">Manage classes for your school.</p>
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
        onEdit={(cls: any) => openEdit(cls)}
        onDelete={(cls: any) => {
          setSelectedClass(cls);
          setShowDelete(true);
        }}
        isLoading={isLoading}
        searchPlaceholder="Search classes..."
      />

      {/* CREATE — uses ClassForm */}
      <CreateModal
        open={showCreate}
        onOpenChange={setShowCreate}
        title="Add New Class"
        onSubmit={handleCreate}
        isLoading={isSubmitting}
      >
        <ClassForm
          data={formData}
          onChange={(f, v) => setFormData((prev: any) => ({ ...prev, [f]: v }))}
          academicYears={academicYears}
          teachers={teachers}
        />
      </CreateModal>

      {/* EDIT — shows the whole group with per-arm teachers */}
      <EditModal
        open={showEdit}
        onOpenChange={(open) => {
          setShowEdit(open);
          if (!open) {
            setEditBaseName(null);
            setSelectedClass(null);
          }
        }}
        title={`Edit Class Group — ${editBaseName || ''}`}
        onSubmit={handleEditSave}
        isLoading={isSubmitting}
      >
        {editArmsLoading ? (
          <div className="py-6 text-center text-sm text-gray-500">
            Loading class group...
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Base Class Name</Label>
              <Input value={editBaseName || ''} disabled />
              <p className="text-xs text-gray-500">
                Base name is fixed for existing groups.
              </p>
            </div>

            <div className="space-y-2">
              <Label>Number of Arms</Label>
              <Select
                value={String(editArmsCount)}
                onValueChange={(v) => setEditArmsCount(parseInt(v, 10))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6].map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {n} arm{n > 1 ? 's' : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {editArmsCount > editArms.length && (
                <p className="text-xs text-amber-600">
                  {editArmsCount - editArms.length} new arm(s) will be created.
                </p>
              )}
              {editArmsCount < editArms.length && (
                <p className="text-xs text-red-600">
                  {editArms.length - editArmsCount} arm(s) will be removed.
                </p>
              )}
            </div>

            <div className="space-y-3 pt-2 border-t">
              <Label>Class Teachers per Arm</Label>
              {letters.map((letter, i) => {
                const existing = editArms[i];
                const armName = existing?.name || `${editBaseName}${letter}`;
                return (
                  <div key={letter} className="flex items-center gap-3">
                    <span className="w-24 text-sm font-medium text-gray-700 shrink-0">
                      {armName}
                    </span>
                    <Select
                      value={editArmTeachers[letter] || 'none'}
                      onValueChange={(v) =>
                        setEditArmTeachers((prev) => ({
                          ...prev,
                          [letter]: v === 'none' ? null : v,
                        }))
                      }
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Select class teacher" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No teacher</SelectItem>
                        {teachers.map((t) => (
                          <SelectItem key={t.id} value={t.id}>
                            {t.full_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                );
              })}
            </div>
          </div>
        )}
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
