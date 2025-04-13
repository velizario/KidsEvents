-- Drop conflicting policies
DROP POLICY IF EXISTS children_insert_parent ON children;
DROP POLICY IF EXISTS children_insert_open ON children;

-- Create a single, clear policy for inserting children
CREATE POLICY children_insert ON children
  FOR INSERT WITH CHECK (true);

-- Ensure the select policy works correctly
DROP POLICY IF EXISTS children_select_parent ON children;
CREATE POLICY children_select_parent ON children
  FOR SELECT USING (auth.uid() = parent_id OR auth.uid() IN (
    SELECT parent_id FROM registrations WHERE child_id = children.id
  ));
