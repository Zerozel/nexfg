-- Academic Years (aka "sessions" in the Nigerian schooling sector).
-- A Nigerian academic session typically spans September -> July and is written
-- as a two-year span, e.g. "2024/2025". Each school manages its own sessions and
-- exactly one is flagged as the current session at any time.
CREATE TABLE IF NOT EXISTS public.academic_years (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL,
    name TEXT NOT NULL,                 -- e.g. "2024/2025"
    start_date DATE,
    end_date DATE,
    is_current BOOLEAN NOT NULL DEFAULT false,
    is_deleted BOOLEAN NOT NULL DEFAULT false,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- A session name is unique within a school
    CONSTRAINT unique_school_academic_year_name UNIQUE (school_id, name),

    CONSTRAINT fk_academic_year_school FOREIGN KEY (school_id) REFERENCES public.schools(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_academic_years_school ON public.academic_years(school_id);

-- Only one active (non-deleted) current session per school
CREATE UNIQUE INDEX IF NOT EXISTS idx_academic_years_one_current
    ON public.academic_years(school_id)
    WHERE is_current = true AND is_deleted = false;

-- Enable RLS
ALTER TABLE public.academic_years ENABLE ROW LEVEL SECURITY;

-- RLS Policies (mirror the multi-tenant pattern used across the schema)
CREATE POLICY "Users can view academic years from their school"
    ON public.academic_years
    FOR SELECT
    USING (school_id = (auth.jwt() -> 'app_metadata' ->> 'school_id')::UUID);

CREATE POLICY "Users can insert academic years for their school"
    ON public.academic_years
    FOR INSERT
    WITH CHECK (school_id = (auth.jwt() -> 'app_metadata' ->> 'school_id')::UUID);

CREATE POLICY "Users can update academic years in their school"
    ON public.academic_years
    FOR UPDATE
    USING (school_id = (auth.jwt() -> 'app_metadata' ->> 'school_id')::UUID)
    WITH CHECK (school_id = (auth.jwt() -> 'app_metadata' ->> 'school_id')::UUID);

-- Trigger: auto-inject school_id from the JWT and maintain timestamps
CREATE OR REPLACE FUNCTION public.academic_years_trigger_handler()
RETURNS TRIGGER AS $$
BEGIN
    -- Automatically inject school_id if not provided
    IF NEW.school_id IS NULL THEN
        NEW.school_id := (auth.jwt() -> 'app_metadata' ->> 'school_id')::UUID;
    END IF;

    -- Maintain timestamps
    NEW.updated_at = NOW();
    IF TG_OP = 'INSERT' THEN
        NEW.created_at = NOW();
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_academic_years_before_insert
    BEFORE INSERT ON public.academic_years
    FOR EACH ROW
    EXECUTE FUNCTION public.academic_years_trigger_handler();

CREATE TRIGGER trigger_academic_years_before_update
    BEFORE UPDATE ON public.academic_years
    FOR EACH ROW
    EXECUTE FUNCTION public.academic_years_trigger_handler();

-- classes.academic_year_id references this table. The column may already exist
-- (created in an earlier Section-2 migration); add the FK only if missing so
-- this migration is safe to run against existing databases.
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'classes'
          AND column_name = 'academic_year_id'
    ) THEN
        ALTER TABLE public.classes ADD COLUMN academic_year_id UUID;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE table_schema = 'public'
          AND table_name = 'classes'
          AND constraint_name = 'fk_classes_academic_year'
    ) THEN
        ALTER TABLE public.classes
            ADD CONSTRAINT fk_classes_academic_year
            FOREIGN KEY (academic_year_id)
            REFERENCES public.academic_years(id)
            ON DELETE SET NULL;
    END IF;
END $$;
