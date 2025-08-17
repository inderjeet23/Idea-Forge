-- First, drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own saved ideas" ON saved_ideas;
DROP POLICY IF EXISTS "Users can insert their own saved ideas" ON saved_ideas;

-- Disable RLS temporarily to test
ALTER TABLE saved_ideas DISABLE ROW LEVEL SECURITY;

-- Alternative: If you want to keep RLS enabled, use these policies instead:
-- These policies work with any user_id, not just authenticated users
/*
ALTER TABLE saved_ideas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON saved_ideas
    FOR SELECT USING (true);

CREATE POLICY "Enable insert access for all users" ON saved_ideas
    FOR INSERT WITH CHECK (true);
*/

-- Check if the table exists and show its structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'saved_ideas' 
ORDER BY ordinal_position;