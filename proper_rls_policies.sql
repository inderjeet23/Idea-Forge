-- Re-enable RLS and create proper policies
ALTER TABLE saved_ideas ENABLE ROW LEVEL SECURITY;

-- Create policies that work with your Supabase auth
CREATE POLICY "Users can view their own saved ideas" ON saved_ideas
    FOR SELECT USING (user_id::text = auth.uid()::text);

CREATE POLICY "Users can insert their own saved ideas" ON saved_ideas
    FOR INSERT WITH CHECK (user_id::text = auth.uid()::text);

CREATE POLICY "Users can update their own saved ideas" ON saved_ideas
    FOR UPDATE USING (user_id::text = auth.uid()::text);

CREATE POLICY "Users can delete their own saved ideas" ON saved_ideas
    FOR DELETE USING (user_id::text = auth.uid()::text);