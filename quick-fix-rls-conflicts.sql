-- Quick fix for RLS policy conflicts that might be causing the error
-- Run this in your Supabase SQL Editor

-- 1. Check if there are conflicting policies
SELECT 'CURRENT POLICIES FOR MATCHES' as info;
SELECT policyname, cmd, qual FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'matches'
ORDER BY policyname;

-- 2. Drop all existing policies and recreate them properly
-- This ensures no conflicts
DROP POLICY IF EXISTS "Users can view their own matches" ON matches;
DROP POLICY IF EXISTS "Stylists can view their matches" ON matches;
DROP POLICY IF EXISTS "Users and stylists can view relevant matches" ON matches;
DROP POLICY IF EXISTS "Bidirectional matches access" ON matches;

-- 3. Recreate with a single comprehensive policy
CREATE POLICY "Users and stylists can view relevant matches" ON matches
  FOR SELECT USING (
    auth.uid() = user_id OR auth.uid() = stylist_id
  );

-- 4. Ensure the INSERT policy still exists for users
CREATE POLICY "Users can insert their own matches" ON matches
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 5. Do the same for swipes table
DROP POLICY IF EXISTS "Users can view their own swipes" ON swipes;
DROP POLICY IF EXISTS "Stylists can view swipes on them" ON swipes;
DROP POLICY IF EXISTS "Users and stylists can view relevant swipes" ON swipes;

CREATE POLICY "Users and stylists can view relevant swipes" ON swipes
  FOR SELECT USING (
    auth.uid() = user_id OR auth.uid() = stylist_id
  );

-- 6. Ensure swipes INSERT policy exists
CREATE POLICY "Users can insert their own swipes" ON swipes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 7. Verify the final policies
SELECT 'FINAL POLICIES FOR MATCHES' as info;
SELECT policyname, cmd, qual FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'matches'
ORDER BY policyname;

SELECT 'FINAL POLICIES FOR SWIPES' as info;
SELECT policyname, cmd, qual FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'swipes'
ORDER BY policyname; 