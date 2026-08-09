-- Add description column to public.problems table if it doesn't exist
ALTER TABLE public.problems ADD COLUMN IF NOT EXISTS description TEXT;
