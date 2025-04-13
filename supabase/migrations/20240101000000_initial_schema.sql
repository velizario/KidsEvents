-- Create tables for the children's event platform

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Parents table
CREATE TABLE parents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Organizers table
CREATE TABLE organizers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  organization_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  description TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  website TEXT,
  year_established INTEGER,
  rating NUMERIC(3,1) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Children table
CREATE TABLE children (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  age INTEGER,
  allergies TEXT,
  special_needs TEXT,
  parent_id UUID NOT NULL REFERENCES parents(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Events table
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  long_description TEXT,
  date TEXT NOT NULL, -- Using TEXT to allow for recurring events like "Every Saturday"
  time TEXT NOT NULL,
  location TEXT NOT NULL,
  age_group TEXT NOT NULL,
  category TEXT NOT NULL,
  capacity INTEGER NOT NULL,
  registrations INTEGER DEFAULT 0,
  price TEXT NOT NULL,
  is_paid BOOLEAN DEFAULT TRUE,
  status TEXT NOT NULL CHECK (status IN ('draft', 'active', 'cancelled', 'completed')),
  image_url TEXT NOT NULL,
  organizer_id UUID NOT NULL REFERENCES organizers(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Registrations table
CREATE TABLE registrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  parent_id UUID NOT NULL REFERENCES parents(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  payment_status TEXT NOT NULL CHECK (payment_status IN ('pending', 'paid', 'refunded')),
  confirmation_code TEXT NOT NULL,
  registration_date TIMESTAMP WITH TIME ZONE NOT NULL,
  emergency_contact JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(event_id, child_id) -- Prevent duplicate registrations
);

-- Reviews table
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  parent_id UUID NOT NULL REFERENCES parents(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(event_id, parent_id) -- One review per event per parent
);

-- Create indexes for performance
CREATE INDEX idx_children_parent_id ON children(parent_id);
CREATE INDEX idx_events_organizer_id ON events(organizer_id);
CREATE INDEX idx_events_category ON events(category);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_registrations_event_id ON registrations(event_id);
CREATE INDEX idx_registrations_parent_id ON registrations(parent_id);
CREATE INDEX idx_registrations_status ON registrations(status);
CREATE INDEX idx_reviews_event_id ON reviews(event_id);

-- Create functions for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_parents_updated_at
BEFORE UPDATE ON parents
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_organizers_updated_at
BEFORE UPDATE ON organizers
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_children_updated_at
BEFORE UPDATE ON children
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_events_updated_at
BEFORE UPDATE ON events
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_registrations_updated_at
BEFORE UPDATE ON registrations
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_reviews_updated_at
BEFORE UPDATE ON reviews
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

-- Create RLS policies
ALTER TABLE parents ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizers ENABLE ROW LEVEL SECURITY;
ALTER TABLE children ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Parents can only see and edit their own data
CREATE POLICY parents_select_own ON parents
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY parents_update_own ON parents
  FOR UPDATE USING (auth.uid() = id);

-- Organizers can only see and edit their own data
CREATE POLICY organizers_select_own ON organizers
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY organizers_update_own ON organizers
  FOR UPDATE USING (auth.uid() = id);

-- Children can be seen by their parents
CREATE POLICY children_select_parent ON children
  FOR SELECT USING (auth.uid() = parent_id);

-- Allow parents to insert children records
CREATE POLICY children_insert_parent ON children
  FOR INSERT WITH CHECK (auth.uid() = parent_id);

-- Open policy for inserting children during registration
CREATE POLICY children_insert_open ON children
  FOR INSERT WITH CHECK (true);

CREATE POLICY children_update_parent ON children
  FOR UPDATE USING (auth.uid() = parent_id);

CREATE POLICY children_delete_parent ON children
  FOR DELETE USING (auth.uid() = parent_id);

-- Events can be seen by anyone
CREATE POLICY events_select_all ON events
  FOR SELECT USING (true);

-- Events can be created, updated, and deleted by their organizers
CREATE POLICY events_insert_organizer ON events
  FOR INSERT WITH CHECK (auth.uid() = organizer_id);

CREATE POLICY events_update_organizer ON events
  FOR UPDATE USING (auth.uid() = organizer_id);

CREATE POLICY events_delete_organizer ON events
  FOR DELETE USING (auth.uid() = organizer_id);

-- Registrations policies
-- Registrations can be seen by the parent who made them and the organizer of the event
CREATE POLICY registrations_select_parent ON registrations
  FOR SELECT USING (auth.uid() = parent_id OR 
                    auth.uid() IN (SELECT organizer_id FROM events WHERE id = event_id));

-- Registrations can be created by parents
CREATE POLICY registrations_insert_parent ON registrations
  FOR INSERT WITH CHECK (auth.uid() = parent_id);

-- Registrations can be updated by the parent who made them and the organizer of the event
CREATE POLICY registrations_update_parent_organizer ON registrations
  FOR UPDATE USING (auth.uid() = parent_id OR 
                    auth.uid() IN (SELECT organizer_id FROM events WHERE id = event_id));

-- Open registrations policies for general access
CREATE POLICY registrations_insert_policy ON registrations 
  FOR INSERT WITH CHECK (true);

CREATE POLICY registrations_select_policy ON registrations 
  FOR SELECT USING (true);

-- Reviews can be seen by anyone
CREATE POLICY reviews_select_all ON reviews
  FOR SELECT USING (true);

-- Reviews can be created by parents who have registered for the event
CREATE POLICY reviews_insert_parent ON reviews
  FOR INSERT WITH CHECK (auth.uid() = parent_id AND 
                         EXISTS (SELECT 1 FROM registrations 
                                 WHERE parent_id = auth.uid() AND event_id = reviews.event_id));

-- Reviews can be updated by the parent who created them
CREATE POLICY reviews_update_parent ON reviews
  FOR UPDATE USING (auth.uid() = parent_id);

-- Reviews can be deleted by the parent who created them
CREATE POLICY reviews_delete_parent ON reviews
  FOR DELETE USING (auth.uid() = parent_id);
