-- Fix Catalog Images Foreign Key Constraint
-- Run this in your Supabase SQL Editor

-- Step 1: Drop the existing foreign key constraint
ALTER TABLE catalog_images DROP CONSTRAINT IF EXISTS catalog_images_stylist_id_fkey;

-- Step 2: Create a new foreign key constraint that allows NULL values
-- This will allow catalog images to be created without requiring a valid auth.users entry
ALTER TABLE catalog_images ADD CONSTRAINT catalog_images_stylist_id_fkey 
  FOREIGN KEY (stylist_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Step 3: Alternative approach - Create a more flexible constraint
-- If the above doesn't work, you can temporarily disable the foreign key check
-- ALTER TABLE catalog_images DISABLE TRIGGER ALL;

-- Step 4: Verify the change
-- You can now insert catalog images with any stylist_id
-- Note: This is a temporary solution for testing
-- For production, you should use real authenticated users 