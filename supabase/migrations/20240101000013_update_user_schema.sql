-- Update user schema to separate common and specific fields

-- First, create temporary tables to store existing data
CREATE TABLE temp_parents AS SELECT * FROM parents;
CREATE TABLE temp_organizers AS SELECT * FROM organizers;

-- Drop existing tables
DROP TABLE IF EXISTS parents CASCADE;
DROP TABLE IF EXISTS organizers CASCADE;

-- Recreate parents table with only parent-specific fields
CREATE TABLE parents (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recreate organizers table with only organizer-specific fields
CREATE TABLE organizers (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  description TEXT,
  website TEXT,
  year_established INTEGER,
  rating DECIMAL(3,1),
  review_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Migrate data from temporary tables to new tables
INSERT INTO parents (id, created_at, updated_at)
SELECT id, created_at, updated_at FROM temp_parents;

INSERT INTO organizers (id, organization_name, contact_name, description, website, year_established, rating, review_count, created_at, updated_at)
SELECT id, organization_name, contact_name, description, website, year_established, rating, review_count, created_at, updated_at FROM temp_organizers;

-- Drop temporary tables
DROP TABLE temp_parents;
DROP TABLE temp_organizers;

-- Update auth.users metadata to include first_name, last_name, phone, and user_type
-- Note: This is handled by the application code when creating/updating users

-- Set up RLS policies
ALTER TABLE parents ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizers ENABLE ROW LEVEL SECURITY;

-- Parent policies
CREATE POLICY "Parents can view their own data" ON parents
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Parents can update their own data" ON parents
  FOR UPDATE USING (auth.uid() = id);

-- Organizer policies
CREATE POLICY "Organizers can view their own data" ON organizers
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Organizers can update their own data" ON organizers
  FOR UPDATE USING (auth.uid() = id);

-- Public read access for organizers (for event listings)
CREATE POLICY "Public can view organizer profiles" ON organizers
  FOR SELECT USING (true);
