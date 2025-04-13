-- Enable RLS on tables
ALTER TABLE children ENABLE ROW LEVEL SECURITY;
ALTER TABLE parents ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can read their own children" ON children;
DROP POLICY IF EXISTS "Users can insert their own children" ON children;
DROP POLICY IF EXISTS "Users can update their own children" ON children;
DROP POLICY IF EXISTS "Users can delete their own children" ON children;
DROP POLICY IF EXISTS "Service role can manage all children" ON children;

DROP POLICY IF EXISTS "Users can read their own profile" ON parents;
DROP POLICY IF EXISTS "Users can insert their own profile" ON parents;
DROP POLICY IF EXISTS "Users can update their own profile" ON parents;
DROP POLICY IF EXISTS "Service role can manage all profiles" ON parents;

-- Children table policies
CREATE POLICY "Users can read their own children" 
ON children 
FOR SELECT 
USING (auth.uid() = parent_id);

CREATE POLICY "Users can insert their own children" 
ON children 
FOR INSERT 
WITH CHECK (auth.uid() = parent_id OR auth.role() = 'service_role');

CREATE POLICY "Users can update their own children" 
ON children 
FOR UPDATE 
USING (auth.uid() = parent_id);

CREATE POLICY "Users can delete their own children" 
ON children 
FOR DELETE 
USING (auth.uid() = parent_id);

CREATE POLICY "Service role can manage all children" 
ON children 
FOR ALL 
USING (auth.role() = 'service_role');

-- Parents table policies
CREATE POLICY "Users can read their own profile" 
ON parents 
FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
ON parents 
FOR INSERT 
WITH CHECK (auth.uid() = id OR auth.role() = 'service_role');

CREATE POLICY "Users can update their own profile" 
ON parents 
FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "Service role can manage all profiles" 
ON parents 
FOR ALL 
USING (auth.role() = 'service_role');
