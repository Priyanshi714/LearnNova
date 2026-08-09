-- Create problem_notes table
CREATE TABLE IF NOT EXISTS problem_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    problem_id UUID NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE problem_notes ENABLE ROW LEVEL SECURITY;

-- SELECT Policy
CREATE POLICY "Users can read their own notes" 
ON problem_notes FOR SELECT 
USING (auth.uid() = user_id);

-- INSERT Policy
CREATE POLICY "Users can insert their own notes" 
ON problem_notes FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- UPDATE Policy
CREATE POLICY "Users can update their own notes" 
ON problem_notes FOR UPDATE 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

-- DELETE Policy
CREATE POLICY "Users can delete their own notes" 
ON problem_notes FOR DELETE 
USING (auth.uid() = user_id);
