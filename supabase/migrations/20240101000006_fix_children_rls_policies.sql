-- Drop all existing policies for the children table
DROP POLICY IF EXISTS "children_select_parent" ON children;
DROP POLICY IF EXISTS "Children are viewable by parent" ON children;
DROP POLICY IF EXISTS "children_insert_parent" ON children;
DROP POLICY IF EXISTS "children_insert_open" ON children;
DROP POLICY IF EXISTS "Children are insertable by anyone" ON children;
DROP POLICY IF EXISTS "children_update_parent" ON children;
DROP POLICY IF EXISTS "Children are updatable by parent" ON children;
DROP POLICY IF EXISTS "children_delete_parent" ON children;
DROP POLICY IF EXISTS "Children are deletable by parent" ON children;

-- Create clear policies with consistent naming
-- Allow anyone to insert children records (needed for registration)
CREATE POLICY "children_insert_anyone" ON children
  FOR INSERT WITH CHECK (true);

-- Allow parents to view their own children
CREATE POLICY "children_select_parent" ON children
  FOR SELECT USING (auth.uid() = parent_id);

-- Allow parents to update their own children
CREATE POLICY "children_update_parent" ON children
  FOR UPDATE USING (auth.uid() = parent_id);

-- Allow parents to delete their own children
CREATE POLICY "children_delete_parent" ON children
  FOR DELETE USING (auth.uid() = parent_id);

-- Allow authenticated users to view children they've registered for events
CREATE POLICY "children_select_registrations" ON children
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM registrations 
      WHERE registrations.child_id = children.id AND registrations.parent_id = auth.uid()
    )
  );
