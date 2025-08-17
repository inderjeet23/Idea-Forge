-- Create the saved_ideas table for storing user's saved business ideas
CREATE TABLE saved_ideas (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL,
  idea_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  market TEXT,
  complexity TEXT,
  time_to_revenue TEXT,
  match_score INTEGER,
  tags TEXT[], -- Array of strings
  match_reasoning TEXT,
  confidence INTEGER,
  generated_by TEXT,
  saved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index on user_id for faster queries
CREATE INDEX idx_saved_ideas_user_id ON saved_ideas(user_id);

-- Create an index on saved_at for ordering
CREATE INDEX idx_saved_ideas_saved_at ON saved_ideas(saved_at);