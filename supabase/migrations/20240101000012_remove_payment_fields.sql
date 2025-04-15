-- Remove payment-related fields from registrations table
ALTER TABLE registrations DROP COLUMN IF EXISTS payment_status;

-- Update emergency_contact JSONB structure to remove relationship field
UPDATE registrations
SET emergency_contact = jsonb_build_object(
  'name', emergency_contact->>'name',
  'phone', emergency_contact->>'phone'
)
WHERE emergency_contact ? 'relationship';
