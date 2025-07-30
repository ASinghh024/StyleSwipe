-- Fix Stylist Profile Update Timeout Issue
-- Run this in your Supabase SQL Editor

-- Step 1: Ensure stylists table exists with correct structure
CREATE TABLE IF NOT EXISTS stylists (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  bio TEXT NOT NULL,
  specialties TEXT[] DEFAULT '{}',
  catalog_urls TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 2: Enable RLS on stylists table
ALTER TABLE stylists ENABLE ROW LEVEL SECURITY;

-- Step 3: Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Stylists are viewable by everyone" ON stylists;
DROP POLICY IF EXISTS "Stylists can insert their own profile" ON stylists;
DROP POLICY IF EXISTS "Stylists can update their own profile" ON stylists;
DROP POLICY IF EXISTS "Stylists can delete their own profile" ON stylists;

-- Step 4: Create proper RLS policies for stylists table
-- Allow public read access to all stylists
CREATE POLICY "Stylists are viewable by everyone" ON stylists
  FOR SELECT USING (true);

-- Allow stylists to insert their own profile (using auth.uid() = id)
CREATE POLICY "Stylists can insert their own profile" ON stylists
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Allow stylists to update their own profile
CREATE POLICY "Stylists can update their own profile" ON stylists
  FOR UPDATE USING (auth.uid() = id);

-- Allow stylists to delete their own profile
CREATE POLICY "Stylists can delete their own profile" ON stylists
  FOR DELETE USING (auth.uid() = id);

-- Step 5: Create a trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_stylists_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_stylists_updated_at_trigger ON stylists;
CREATE TRIGGER update_stylists_updated_at_trigger
  BEFORE UPDATE ON stylists
  FOR EACH ROW
  EXECUTE FUNCTION update_stylists_updated_at();

-- Step 6: Ensure user_profiles table has stylist role support
-- Add role column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_profiles' AND column_name = 'role'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN role TEXT DEFAULT 'user';
  END IF;
END $$;

-- Step 7: Create index for better performance
CREATE INDEX IF NOT EXISTS idx_stylists_id ON stylists(id);

-- Step 8: Insert sample stylists if table is empty
INSERT INTO stylists (id, name, bio, specialties, catalog_urls) 
SELECT 
  gen_random_uuid(),
  'Sarah Johnson',
  'Fashion-forward stylist with 8 years of experience in contemporary fashion. Specializes in creating personalized looks that reflect your unique personality.',
  ARRAY['Contemporary Fashion', 'Personal Styling', 'Color Analysis'],
  ARRAY['https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400']
WHERE NOT EXISTS (SELECT 1 FROM stylists LIMIT 1);

-- Step 9: Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON stylists TO anon, authenticated;
GRANT ALL ON user_profiles TO anon, authenticated;

-- Step 10: Verify the setup
SELECT 
  'Stylists table exists' as check_item,
  EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'stylists') as result
UNION ALL
SELECT 
  'RLS enabled on stylists',
  EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'stylists' AND rowsecurity = true)
UNION ALL
SELECT 
  'Stylists policies exist',
  (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'stylists') >= 4; 