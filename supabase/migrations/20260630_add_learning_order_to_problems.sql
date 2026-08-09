-- 1. Add learning_order column to public.problems table if it doesn't exist
ALTER TABLE public.problems ADD COLUMN IF NOT EXISTS learning_order INTEGER;

-- 2. Backfill learning_order sequentially using row_number() partitioned by user_id and primary_topic_id ordered by created_at
WITH ranked_problems AS (
  SELECT 
    id, 
    row_number() OVER (
      PARTITION BY user_id, primary_topic_id 
      ORDER BY created_at ASC, id ASC
    ) as calculated_order
  FROM public.problems
)
UPDATE public.problems p
SET learning_order = rp.calculated_order
FROM ranked_problems rp
WHERE p.id = rp.id AND p.learning_order IS NULL;
