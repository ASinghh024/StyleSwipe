-- Fix Catalog Images Public Access
-- Run this in your Supabase SQL Editor

-- Step 1: Drop the existing restrictive SELECT policy
DROP POLICY IF EXISTS "Users can view own catalog images" ON catalog_images;

-- Step 2: Create a new public SELECT policy that allows everyone to view catalog images
CREATE POLICY "Public can view catalog images" ON catalog_images
  FOR SELECT USING (true);

-- Step 3: Drop the existing restrictive INSERT policy
DROP POLICY IF EXISTS "Users can insert own catalog images" ON catalog_images;

-- Step 4: Create a new public INSERT policy for testing (you can make this more restrictive later)
CREATE POLICY "Public can insert catalog images" ON catalog_images
  FOR INSERT WITH CHECK (true);

-- Step 5: Keep the existing restrictive policies for UPDATE, DELETE
-- (These should already exist from the catalog-images-setup.sql)

-- Step 6: Verify the policies
-- You can check the policies in Supabase Dashboard > Authentication > Policies > catalog_images

-- Step 7: Test the public access
-- This will allow users to view and insert catalog images without authentication
-- while still maintaining security for update/delete operations 