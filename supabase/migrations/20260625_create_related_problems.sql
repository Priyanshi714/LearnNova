-- Create related_problems table
CREATE TABLE IF NOT EXISTS related_problems (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    problem_id UUID NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    solution TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE related_problems ENABLE ROW LEVEL SECURITY;

-- SELECT Policy
CREATE POLICY "Users can read their own related problems" 
ON related_problems FOR SELECT 
USING (auth.uid() = user_id);

-- INSERT Policy
CREATE POLICY "Users can insert their own related problems" 
ON related_problems FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- UPDATE Policy
CREATE POLICY "Users can update their own related problems" 
ON related_problems FOR UPDATE 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

-- DELETE Policy
CREATE POLICY "Users can delete their own related problems" 
ON related_problems FOR DELETE 
USING (auth.uid() = user_id);
