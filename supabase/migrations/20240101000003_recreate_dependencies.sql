-- Recreate the children table with foreign key to parents
CREATE TABLE IF NOT EXISTS children (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parent_id UUID REFERENCES parents(id),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recreate the registrations table with foreign key to parents
CREATE TABLE IF NOT EXISTS registrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID,
  child_id UUID REFERENCES children(id),
  parent_id UUID REFERENCES parents(id),
  status TEXT NOT NULL,
  payment_status TEXT NOT NULL,
  confirmation_code TEXT NOT NULL,
  registration_date TIMESTAMP WITH TIME ZONE NOT NULL,
  emergency_contact JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recreate the reviews table with foreign key to parents
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID,
  parent_id UUID REFERENCES parents(id),
  rating INTEGER NOT NULL,
  comment TEXT NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies for children
ALTER TABLE children ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parents can read their own children"
  ON children FOR SELECT
  USING (auth.uid() = parent_id);

CREATE POLICY "Parents can update their own children"
  ON children FOR UPDATE
  USING (auth.uid() = parent_id);

CREATE POLICY "Parents can insert their own children"
  ON children FOR INSERT
  WITH CHECK (auth.uid() = parent_id);

CREATE POLICY "Parents can delete their own children"
  ON children FOR DELETE
  USING (auth.uid() = parent_id);

-- Add RLS policies for registrations
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parents can read their own registrations"
  ON registrations FOR SELECT
  USING (auth.uid() = parent_id);

CREATE POLICY "Parents can insert their own registrations"
  ON registrations FOR INSERT
  WITH CHECK (auth.uid() = parent_id);

-- Add RLS policies for reviews
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parents can read all reviews"
  ON reviews FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Parents can insert their own reviews"
  ON reviews FOR INSERT
  WITH CHECK (auth.uid() = parent_id);

CREATE POLICY "Parents can update their own reviews"
  ON reviews FOR UPDATE
  USING (auth.uid() = parent_id);
