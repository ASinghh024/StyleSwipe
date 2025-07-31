-- Add profile_picture field to stylists table
-- Run this in your Supabase SQL Editor

-- Step 1: Add profile_picture column to stylists table
ALTER TABLE stylists ADD COLUMN IF NOT EXISTS profile_picture TEXT DEFAULT NULL;

-- Step 2: Update existing RLS policies to ensure they work with the new field
-- (No changes needed as existing policies already cover all fields)

-- Step 3: Create index for better performance when querying by profile_picture
CREATE INDEX IF NOT EXISTS idx_stylists_profile_picture ON stylists(profile_picture) WHERE profile_picture IS NOT NULL;

-- Step 4: Verify the column was added
SELECT 
  'profile_picture column exists' as check_item,
  EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'stylists' AND column_name = 'profile_picture'
  ) as result;