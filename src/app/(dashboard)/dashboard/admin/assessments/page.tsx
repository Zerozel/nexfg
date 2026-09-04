'use client';

import { useState, useEffect } from 'react';
import { useAdminAssessments, useAssessmentMutations } from '@/hooks/useAssessments';
import { useAdminClasses } from '@/hooks/useClasses';
import { useSubjects } from '@/hooks/useSubjects';
import { supabase } from '@/lib/supabase/client';
import { AssessmentTable } from '@/components/admin/tables/AssessmentTable';
import { CreateModal } from '@/components/admin/CreateModal';
import { EditModal } from '@/components/admin/EditModal';
import { DeleteConfirmation } from '@/components/admin/DeleteConfirmation';
import { AssessmentForm } from '@/components/admin/forms/AssessmentForm';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Plus, Search } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import type { Assessment } from '@/types/admin';

export default function AssessmentsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [filterClassId, setFilterClassId] = useState<string>('');
  const [filterSubjectId, setFilterSubjectId] = useState<string>('');
  const [filterTermId, setFilterTermId] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('');
  const [filterGlobal, setFilterGlobal] = useState<string>('all'); // 'all', 'global', 'custom'
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);
  const [terms, setTerms] = useState<any[]>([]);
  const [termsLoading, setTermsLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    type: 'exam' as "exam" | "test" | "quiz",
    term_id: '',
    class_id: '',
    subject_id: '',
    max_score: 100,
    weight: 0,
    date: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { toast } = useToast();
  
  // Fetch assessments
  const { data, isLoading, refetch } = useAdminAssessments({
    page,
    search,
    classId: filterClassId || undefined,
    subjectId: filterSubjectId || undefined,
    termId: filterTermId || undefined,
    type: filterType || undefined,
  });
  const { data: classesData } = useAdminClasses({ pageSize: 100 });
  const { data: subjectsData } = useSubjects({ pageSize: 100 });
  const { createAssessment, updateAssessment, deleteAssessment } = useAssessmentMutations();

  const classes = classesData?.data || [];
  const subjects = subjectsData?.data || [];

  // Fetch terms directly from Supabase
  useEffect(() => {
    async function fetchTerms() {
      try {
        setTermsLoading(true);
        const { data: termsData, error } = await supabase
          .from('terms')
          .select('*')
          .is('is_deleted', false)
          .order('order', { ascending: true });

        if (error) throw error;
        setTerms(termsData || []);
      } catch (err) {
        console.error('Failed to fetch terms:', err);
      } finally {
        setTermsLoading(false);
      }
    }

    fetchTerms();
  }, []);

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'exam',
      term_id: '',
      class_id: '',
      subject_id: '',
      max_score: 100,
      weight: 0,
      date: '',
    });
  };

  const handleCreate = async () => {
    setIsSubmitting(true);
    try {
      await createAssessment(formData);
      toast({ title: 'Success', description: 'Assessment created successfully' });
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
    if (!selectedAssessment) return;
    setIsSubmitting(true);
    try {
      await updateAssessment(selectedAssessment.id, formData);
      toast({ title: 'Success', description: 'Assessment updated successfully' });
      setShowEdit(false);
      setSelectedAssessment(null);
      resetForm();
      refetch();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedAssessment) return;
    setIsSubmitting(true);
    try {
      await deleteAssessment(selectedAssessment.id);
      toast({ title: 'Success', description: 'Assessment deleted successfully' });
      setShowDelete(false);
      setSelectedAssessment(null);
      refetch();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter assessments based on type
  const filteredAssessments = (data?.data || []).filter((assessment: any) => {
    const isGlobal = !assessment.class_id && !assessment.subject_id && !assessment.term_id;
    
    if (filterGlobal === 'global') return isGlobal;
    if (filterGlobal === 'custom') return !isGlobal;
    return true; // 'all'
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Assessments</h1>
          <p className="text-muted-foreground">
            Manage exams, tests, and quizzes.
          </p>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Assessment
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search assessments..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        
        {/* ✅ NEW: Global/Custom filter */}
        <Select value={filterGlobal} onValueChange={setFilterGlobal}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="All Assessments" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Assessments</SelectItem>
            <SelectItem value="global">🌐 Global (Auto)</SelectItem>
            <SelectItem value="custom">📋 Custom</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterClassId} onValueChange={setFilterClassId}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="All Classes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Classes</SelectItem>
            {classes.map((c: any) => (
              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterSubjectId} onValueChange={setFilterSubjectId}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="All Subjects" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Subjects</SelectItem>
            {subjects.map((s: any) => (
              <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterTermId} onValueChange={setFilterTermId}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="All Terms" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Terms</SelectItem>
            {terms.map((t: any) => (
              <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Types</SelectItem>
            <SelectItem value="exam">Exam</SelectItem>
            <SelectItem value="test">Test</SelectItem>
            <SelectItem value="quiz">Quiz</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <AssessmentTable
        assessments={filteredAssessments as any}
        onEdit={(assessment: any) => {
          setSelectedAssessment(assessment);
          setFormData({
            name: assessment.name,
            type: assessment.type as "exam" | "test" | "quiz",
            term_id: assessment.term_id || '',
            class_id: assessment.class_id || '',
            subject_id: assessment.subject_id || '',
            max_score: assessment.max_score,
            weight: assessment.weight,
            date: assessment.date || '',
          });
          setShowEdit(true);
        }}
        onDelete={(assessment: any) => {
          setSelectedAssessment(assessment);
          setShowDelete(true);
        }}
      />

      {/* Pagination */}
      {data?.meta && data.meta.total_pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {((page - 1) * 10) + 1} to {Math.min(page * 10, data.meta.total)} of{' '}
            {data.meta.total} results
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page - 1)}
              disabled={page <= 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page + 1)}
              disabled={page >= data.meta.total_pages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Modals */}
      <CreateModal
        open={showCreate}
        onOpenChange={setShowCreate}
        title="Create Assessment"
        onSubmit={handleCreate}
        isLoading={isSubmitting}
      >
        <AssessmentForm
          data={formData}
          onChange={(f, v) => setFormData((prev) => ({ ...prev, [f]: v }))}
          terms={terms}
          classes={classes}
          subjects={subjects}
        />
      </CreateModal>

      <EditModal
        open={showEdit}
        onOpenChange={setShowEdit}
        title="Edit Assessment"
        onSubmit={handleEdit}
        isLoading={isSubmitting}
      >
        <AssessmentForm
          data={formData}
          onChange={(f, v) => setFormData((prev) => ({ ...prev, [f]: v }))}
          terms={terms}
          classes={classes}
          subjects={subjects}
        />
      </EditModal>

      <DeleteConfirmation
        open={showDelete}
        onOpenChange={setShowDelete}
        title="Delete Assessment"
        description={`Are you sure you want to delete "${selectedAssessment?.name}"?`}
        onConfirm={handleDelete}
        isLoading={isSubmitting}
      />
    </div>
  );
}