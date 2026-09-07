'use client';

import { useEffect, useState } from 'react';
import { CompileTrigger } from '@/components/admin/CompileTrigger';
import { useAdminClasses } from '@/hooks/useClasses';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase/client';

export default function CompilePage() {
  const { data: classesData, isLoading: classesLoading } = useAdminClasses({ pageSize: 100 });
  const [terms, setTerms] = useState<any[]>([]);
  const [termsLoading, setTermsLoading] = useState(true);
  const [schoolId, setSchoolId] = useState<string | null>(null);
  const { toast } = useToast();

  const classes = classesData?.data || [];

  // ✅ Get the user's school_id on mount
  useEffect(() => {
    async function getSchoolId() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.app_metadata?.school_id) {
        setSchoolId(user.app_metadata.school_id);
      }
    }
    getSchoolId();
  }, []);

  // ✅ Fetch ALL terms for the school (not just current)
  useEffect(() => {
    if (!schoolId) {
      setTerms([]);
      setTermsLoading(false);
      return;
    }

    async function fetchTerms() {
      try {
        setTermsLoading(true);
        const { data, error } = await supabase
          .from('terms')
          .select('*')
          .eq('school_id', schoolId)
          .is('is_deleted', false)
          .order('created_at', { ascending: true }); // First Term first

        if (error) throw error;
        setTerms(data || []);
      } catch (err) {
        console.error('Error fetching terms:', err);
        toast({
          title: 'Error',
          description: 'Failed to fetch terms',
          variant: 'destructive',
        });
      } finally {
        setTermsLoading(false);
      }
    }
    fetchTerms();
  }, [schoolId, toast]);

  const isLoading = classesLoading || termsLoading;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (terms.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Compile Results</h1>
          <p className="text-muted-foreground">
            Generate report card data for a class and term.
          </p>
        </div>
        <div className="text-center py-12 border rounded-lg bg-yellow-50">
          <p className="text-yellow-700">No terms found for this school.</p>
          <p className="text-sm text-yellow-600 mt-2">
            Please create terms before compiling results.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Compile Results</h1>
        <p className="text-muted-foreground">
          Generate report card data for a class and term.
        </p>
      </div>

      <CompileTrigger
        classes={classes}
        terms={terms}
        onComplete={() => {
          toast({
            title: 'Success',
            description: 'Report cards are now ready!',
          });
        }}
      />
    </div>
  );
}
