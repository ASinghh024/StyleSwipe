-- Catalog Images Setup for Stylists
-- Run this in your Supabase SQL Editor

-- Step 1: Create catalog_images table
CREATE TABLE IF NOT EXISTS catalog_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  stylist_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT NOT NULL,
  file_name TEXT,
  file_size INTEGER,
  mime_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 2: Enable RLS on catalog_images table
ALTER TABLE catalog_images ENABLE ROW LEVEL SECURITY;

-- Step 3: Create RLS policies for catalog_images
-- Policy for SELECT: Users can only see their own catalog images
DROP POLICY IF EXISTS "Users can view own catalog images" ON catalog_images;
CREATE POLICY "Users can view own catalog images" ON catalog_images
  FOR SELECT USING (auth.uid() = stylist_id);

-- Policy for INSERT: Users can only insert their own catalog images
DROP POLICY IF EXISTS "Users can insert own catalog images" ON catalog_images;
CREATE POLICY "Users can insert own catalog images" ON catalog_images
  FOR INSERT WITH CHECK (auth.uid() = stylist_id);

-- Policy for UPDATE: Users can only update their own catalog images
DROP POLICY IF EXISTS "Users can update own catalog images" ON catalog_images;
CREATE POLICY "Users can update own catalog images" ON catalog_images
  FOR UPDATE USING (auth.uid() = stylist_id);

-- Policy for DELETE: Users can only delete their own catalog images
DROP POLICY IF EXISTS "Users can delete own catalog images" ON catalog_images;
CREATE POLICY "Users can delete own catalog images" ON catalog_images
  FOR DELETE USING (auth.uid() = stylist_id);

-- Step 4: Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_catalog_images_updated_at ON catalog_images;
CREATE TRIGGER update_catalog_images_updated_at
    BEFORE UPDATE ON catalog_images
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Step 5: Create index for better performance
CREATE INDEX IF NOT EXISTS idx_catalog_images_stylist_id ON catalog_images(stylist_id);
CREATE INDEX IF NOT EXISTS idx_catalog_images_created_at ON catalog_images(created_at);

-- Step 6: Create storage bucket for catalog images
-- Note: You'll need to create this bucket manually in Supabase Dashboard
-- Go to Storage > Create a new bucket named 'catalog-images'
-- Set it to public and configure the policies below

-- Step 7: Storage policies (run these after creating the bucket in Supabase Dashboard)
-- These policies allow authenticated users to upload/delete their own files
-- and allow public read access to catalog images

-- Policy for storage bucket access
-- Note: You'll need to run these in the Supabase Dashboard under Storage > Policies
-- after creating the 'catalog-images' bucket

/*
Storage Policies to add in Supabase Dashboard:

1. For the 'catalog-images' bucket:

SELECT Policy:
- Name: "Public read access"
- Policy: (bucket_id = 'catalog-images')
- This allows public read access to catalog images

INSERT Policy:
- Name: "Authenticated users can upload"
- Policy: (bucket_id = 'catalog-images' AND auth.role() = 'authenticated')
- This allows authenticated users to upload files

UPDATE Policy:
- Name: "Users can update own files"
- Policy: (bucket_id = 'catalog-images' AND auth.uid()::text = (storage.foldername(name))[1])
- This allows users to update their own files

DELETE Policy:
- Name: "Users can delete own files"
- Policy: (bucket_id = 'catalog-images' AND auth.uid()::text = (storage.foldername(name))[1])
- This allows users to delete their own files
*/

-- Step 8: Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON catalog_images TO authenticated;

-- Step 9: Verify the setup
SELECT 
  'catalog_images table created successfully' as status,
  COUNT(*) as row_count
FROM catalog_images; 