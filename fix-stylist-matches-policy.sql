-- Fix RLS policy for matches table to allow stylists to see their matches
-- Run this in your Supabase SQL Editor

-- First, let's check what policies currently exist
SELECT policyname, qual FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'matches';

-- Drop existing policies one by one (more explicit approach)
DROP POLICY "Users can view their own matches" ON matches;
DROP POLICY IF EXISTS "Users can insert their own matches" ON matches;
DROP POLICY IF EXISTS "Users and stylists can view relevant matches" ON matches;

-- Create new policies that allow both users and stylists to see relevant matches
CREATE POLICY "Users and stylists can view relevant matches" ON matches
  FOR SELECT USING (
    auth.uid() = user_id OR auth.uid() = stylist_id
  );

-- Recreate the insert policy (users can still only insert their own matches)
CREATE POLICY "Users can insert their own matches" ON matches
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Also update swipes table policy for consistency (optional but recommended)
DROP POLICY IF EXISTS "Users can view their own swipes" ON swipes;
DROP POLICY IF EXISTS "Users and stylists can view relevant swipes" ON swipes;

CREATE POLICY "Users and stylists can view relevant swipes" ON swipes
  FOR SELECT USING (
    auth.uid() = user_id OR auth.uid() = stylist_id
  );

-- Verify the new policies
SELECT policyname, qual FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'matches'; 