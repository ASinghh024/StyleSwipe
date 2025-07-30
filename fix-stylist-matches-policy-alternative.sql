-- Alternative approach: Create a new policy with a different name
-- Run this in your Supabase SQL Editor

-- First, let's see what policies currently exist
SELECT policyname, qual FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'matches';

-- Create a new policy with a different name that allows bidirectional access
CREATE POLICY "Bidirectional matches access" ON matches
  FOR SELECT USING (
    auth.uid() = user_id OR auth.uid() = stylist_id
  );

-- Disable the old restrictive policy (without dropping it)
-- This is safer as it doesn't risk breaking anything
ALTER TABLE matches DISABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

-- The new policy should now be the only active one
-- Verify the policies
SELECT policyname, qual, permissive FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'matches';

-- If successful, you can then drop the old policy:
-- DROP POLICY "Users can view their own matches" ON matches; 