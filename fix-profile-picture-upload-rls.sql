-- Fix Profile Picture Upload RLS Policy
-- Run this in your Supabase SQL Editor

-- IMPORTANT: This script contains two parts:
-- 1. SQL commands that can be run directly in the SQL Editor
-- 2. Instructions for manual changes needed in the Supabase Dashboard for storage policies

-- PART 1: Database-side changes (run these in SQL Editor)

-- Ensure the profile_picture column exists in the stylists table
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'stylists' AND column_name = 'profile_picture'
  ) THEN
    ALTER TABLE stylists ADD COLUMN profile_picture TEXT DEFAULT NULL;
  END IF;
END $$;

-- Create index for better performance when querying by profile_picture
CREATE INDEX IF NOT EXISTS idx_stylists_profile_picture ON stylists(profile_picture) WHERE profile_picture IS NOT NULL;

-- Verify RLS policies for the stylists table allow updating the profile_picture field
-- The existing policy should work if it allows updating all fields, but we'll verify
SELECT tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'stylists' AND cmd = 'UPDATE';

-- PART 2: Storage policy changes (manual steps in Supabase Dashboard)

/*
IMPORTANT: The following changes must be made manually in the Supabase Dashboard:

1. Go to Storage > Policies
2. Find the 'catalog-images' bucket
3. Update the following policies:

For INSERT policy:
- Name: "Authenticated users can upload to their folder"
- Policy: 
  (bucket_id = 'catalog-images' AND auth.role() = 'authenticated' AND 
   (storage.foldername(name))[1] = auth.uid()::text)

For UPDATE policy:
- Name: "Users can update own files"
- Policy: 
  (bucket_id = 'catalog-images' AND 
   (storage.foldername(name))[1] = auth.uid()::text)

For DELETE policy:
- Name: "Users can delete own files"
- Policy: 
  (bucket_id = 'catalog-images' AND 
   (storage.foldername(name))[1] = auth.uid()::text)
*/

-- Verification query to check if the profile_picture column exists
SELECT 
  'profile_picture column exists' as check_item,
  EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'stylists' AND column_name = 'profile_picture'
  ) as result;

-- Note: After making these changes, test uploading a profile picture to verify
-- that both the database and storage policies are working correctly.