-- Add code and language columns to related_problems table
ALTER TABLE related_problems
ADD COLUMN IF NOT EXISTS code TEXT,
ADD COLUMN IF NOT EXISTS language TEXT;
