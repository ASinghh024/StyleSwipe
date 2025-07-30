-- Fix RLS policies for stylists table
-- Run this in your Supabase SQL Editor

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Stylists can insert their own profile" ON stylists;
DROP POLICY IF EXISTS "Stylists can update their own profile" ON stylists;
DROP POLICY IF EXISTS "Stylists can delete their own profile" ON stylists;
DROP POLICY IF EXISTS "Users can delete their own swipes" ON swipes;
DROP POLICY IF EXISTS "Users can delete their own matches" ON matches;

-- Add policies for stylists to manage their own records
CREATE POLICY "Stylists can insert their own profile" ON stylists
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Stylists can update their own profile" ON stylists
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Stylists can delete their own profile" ON stylists
  FOR DELETE USING (auth.uid() = id);

-- Also add the missing DELETE policies for swipes and matches
CREATE POLICY "Users can delete their own swipes" ON swipes
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own matches" ON matches
  FOR DELETE USING (auth.uid() = user_id); 