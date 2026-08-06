-- Create scores table with composite unique key including school_id
CREATE TABLE IF NOT EXISTS public.scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL,
    assessment_id UUID NOT NULL,
    score DECIMAL,
    school_id UUID NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Composite unique constraint including school_id for multi-tenant isolation
    CONSTRAINT unique_school_student_assessment UNIQUE (school_id, student_id, assessment_id),
    
    -- Foreign key constraints
    CONSTRAINT fk_student FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE,
    CONSTRAINT fk_assessment FOREIGN KEY (assessment_id) REFERENCES public.assessments(id) ON DELETE CASCADE,
    CONSTRAINT fk_school FOREIGN KEY (school_id) REFERENCES public.schools(id) ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX idx_scores_school_student ON public.scores(school_id, student_id);
CREATE INDEX idx_scores_school_assessment ON public.scores(school_id, assessment_id);
CREATE INDEX idx_scores_composite ON public.scores(school_id, student_id, assessment_id);

-- Enable RLS
ALTER TABLE public.scores ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view scores from their school"
    ON public.scores
    FOR SELECT
    USING (school_id = (auth.jwt() -> 'app_metadata' ->> 'school_id')::UUID);

CREATE POLICY "Users can insert scores for their school"
    ON public.scores
    FOR INSERT
    WITH CHECK (school_id = (auth.jwt() -> 'app_metadata' ->> 'school_id')::UUID);

CREATE POLICY "Users can update scores in their school"
    ON public.scores
    FOR UPDATE
    USING (school_id = (auth.jwt() -> 'app_metadata' ->> 'school_id')::UUID)
    WITH CHECK (school_id = (auth.jwt() -> 'app_metadata' ->> 'school_id')::UUID);

-- Trigger to automatically inject school_id and update timestamps
CREATE OR REPLACE FUNCTION public.scores_trigger_handler()
RETURNS TRIGGER AS $$
BEGIN
    -- Automatically inject school_id if not provided
    IF NEW.school_id IS NULL THEN
        NEW.school_id := (auth.jwt() -> 'app_metadata' ->> 'school_id')::UUID;
    END IF;
    
    -- Update timestamps
    NEW.updated_at = NOW();
    IF TG_OP = 'INSERT' THEN
        NEW.created_at = NOW();
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_scores_before_insert
    BEFORE INSERT ON public.scores
    FOR EACH ROW
    EXECUTE FUNCTION public.scores_trigger_handler();

CREATE TRIGGER trigger_scores_before_update
    BEFORE UPDATE ON public.scores
    FOR EACH ROW
    EXECUTE FUNCTION public.scores_trigger_handler();
