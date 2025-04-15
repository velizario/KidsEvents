-- Remove columns from organizers table
ALTER TABLE organizers
DROP COLUMN IF EXISTS year_established,
DROP COLUMN IF EXISTS rating,
DROP COLUMN IF EXISTS review_count;

-- Remove columns from events table
ALTER TABLE events
DROP COLUMN IF EXISTS age_group,
DROP COLUMN IF EXISTS registrations,
DROP COLUMN IF EXISTS price;

-- Remove columns from registrations table
ALTER TABLE registrations
DROP COLUMN IF EXISTS confirmation_code,
DROP COLUMN IF EXISTS emergency_contact;

-- Add column to reviews table
ALTER TABLE reviews
ADD COLUMN IF NOT EXISTS organizer_id UUID REFERENCES organizers(id);

-- Create index for the new column
CREATE INDEX IF NOT EXISTS reviews_organizer_id_idx ON reviews(organizer_id);
