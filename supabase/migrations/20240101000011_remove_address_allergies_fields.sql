-- Remove address, city, state, and zip_code columns from parents table
ALTER TABLE parents
DROP COLUMN IF EXISTS address,
DROP COLUMN IF EXISTS city,
DROP COLUMN IF EXISTS state,
DROP COLUMN IF EXISTS zip_code;

-- Remove address, city, state, and zip_code columns from organizers table
ALTER TABLE organizers
DROP COLUMN IF EXISTS address,
DROP COLUMN IF EXISTS city,
DROP COLUMN IF EXISTS state,
DROP COLUMN IF EXISTS zip_code;

-- Remove allergies and special_needs columns from children table
ALTER TABLE children
DROP COLUMN IF EXISTS allergies,
DROP COLUMN IF EXISTS special_needs;
