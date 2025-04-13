-- Disable RLS to reset everything
ALTER TABLE children DISABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies for the children table again to ensure clean slate
DROP POLICY IF EXISTS "children_delete_parent" ON children;
DROP POLICY IF EXISTS "children_insert" ON children;
DROP POLICY IF EXISTS "children_insert_anyone" ON children;
DROP POLICY IF EXISTS "children_select_parent" ON children;
DROP POLICY IF EXISTS "children_select_registrations" ON children;
DROP POLICY IF EXISTS "children_update_parent" ON children;
DROP POLICY IF EXISTS "Parents can delete their own children" ON children;
DROP POLICY IF EXISTS "Parents can insert their own children" ON children;
DROP POLICY IF EXISTS "Parents can read their own children" ON children;
DROP POLICY IF EXISTS "Parents can update their own children" ON children;
DROP POLICY IF EXISTS "allow_insert_children" ON children;
DROP POLICY IF EXISTS "allow_select_own_children" ON children;
DROP POLICY IF EXISTS "allow_update_own_children" ON children;
DROP POLICY IF EXISTS "allow_delete_own_children" ON children;

-- Re-enable RLS
ALTER TABLE children ENABLE ROW LEVEL SECURITY;

-- Create a more permissive insert policy that doesn't check parent_id
-- This allows registration to create children records without authentication
CREATE POLICY "allow_insert_children_no_auth" ON children
  FOR INSERT TO public
  WITH CHECK (true);

-- Allow parents to view their own children
CREATE POLICY "allow_select_own_children" ON children
  FOR SELECT TO public
  USING (auth.uid() = parent_id OR parent_id IS NULL);

-- Allow parents to update their own children
CREATE POLICY "allow_update_own_children" ON children
  FOR UPDATE TO public
  USING (auth.uid() = parent_id);

-- Allow parents to delete their own children
CREATE POLICY "allow_delete_own_children" ON children
  FOR DELETE TO public
  USING (auth.uid() = parent_id);
