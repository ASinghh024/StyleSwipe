-- Simple approach: Add a new policy for stylists alongside the existing user policy
-- Run this in your Supabase SQL Editor

-- Check existing policies first
SELECT policyname, qual FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'matches';

-- Add a new policy specifically for stylists to view their matches
-- This will work alongside the existing user policy
CREATE POLICY "Stylists can view their matches" ON matches
  FOR SELECT USING (auth.uid() = stylist_id);

-- Verify both policies now exist
SELECT policyname, qual FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'matches';

-- Also add policy for stylists to view swipes on them
CREATE POLICY "Stylists can view swipes on them" ON swipes
  FOR SELECT USING (auth.uid() = stylist_id);

-- Verify swipes policies
SELECT policyname, qual FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'swipes'; 