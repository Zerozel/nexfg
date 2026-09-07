'use client';

import { useEffect, useState } from 'react';
import { CompileTrigger } from '@/components/admin/CompileTrigger';
import { useAdminClasses } from '@/hooks/useClasses';
import { useAcademicYears } from '@/hooks/useAcademicYears';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase/client';

export default function CompilePage() {
  const { data: classesData, isLoading: classesLoading } = useAdminClasses({ pageSize: 100 });
  const { data: academicYears, isLoading: yearsLoading } = useAcademicYears();
  const [terms, setTerms] = useState<any[]>([]);
  const [termsLoading, setTermsLoading] = useState(true);
  const { toast } = useToast();

  const classes = classesData?.data || [];

  // Fetch terms
  useEffect(() => {
    async function fetchTerms() {
      try {
        setTermsLoading(true);
        const { data, error } = await supabase
          .from('terms')
          .select('*')
          .eq('is_current', true)
          .is('is_deleted', false);

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
  }, [toast]);

  const isLoading = classesLoading || yearsLoading || termsLoading;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
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
