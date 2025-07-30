-- Remove Sample Stylists
-- Run this in your Supabase SQL Editor

-- Step 1: Remove all catalog images for sample stylists
DELETE FROM catalog_images 
WHERE stylist_id IN (
  '86d0106b-74d7-4b03-90f7-f32a9eecde51',
  '68338ab1-a08b-4ebb-b5cf-f0b4d0532979',
  '64f1d201-a142-41eb-b294-48cab01a4ad8',
  'add9e9f6-09a6-4bcc-bbd7-bf203b659534',
  'e9ea7c5f-8275-4f7c-b33d-8afab828edd8',
  '904d466f-fb3c-4ce9-ba44-747b914e9c7e',
  '99333eb6-5e87-4955-9069-e108ca40df75'
);

-- Step 2: Remove all swipes for sample stylists
DELETE FROM swipes 
WHERE stylist_id IN (
  '86d0106b-74d7-4b03-90f7-f32a9eecde51',
  '68338ab1-a08b-4ebb-b5cf-f0b4d0532979',
  '64f1d201-a142-41eb-b294-48cab01a4ad8',
  'add9e9f6-09a6-4bcc-bbd7-bf203b659534',
  'e9ea7c5f-8275-4f7c-b33d-8afab828edd8',
  '904d466f-fb3c-4ce9-ba44-747b914e9c7e',
  '99333eb6-5e87-4955-9069-e108ca40df75'
);

-- Step 3: Remove all matches for sample stylists
DELETE FROM matches 
WHERE stylist_id IN (
  '86d0106b-74d7-4b03-90f7-f32a9eecde51',
  '68338ab1-a08b-4ebb-b5cf-f0b4d0532979',
  '64f1d201-a142-41eb-b294-48cab01a4ad8',
  'add9e9f6-09a6-4bcc-bbd7-bf203b659534',
  'e9ea7c5f-8275-4f7c-b33d-8afab828edd8',
  '904d466f-fb3c-4ce9-ba44-747b914e9c7e',
  '99333eb6-5e87-4955-9069-e108ca40df75'
);

-- Step 4: Remove all sample stylists
DELETE FROM stylists 
WHERE id IN (
  '86d0106b-74d7-4b03-90f7-f32a9eecde51',
  '68338ab1-a08b-4ebb-b5cf-f0b4d0532979',
  '64f1d201-a142-41eb-b294-48cab01a4ad8',
  'add9e9f6-09a6-4bcc-bbd7-bf203b659534',
  'e9ea7c5f-8275-4f7c-b33d-8afab828edd8',
  '904d466f-fb3c-4ce9-ba44-747b914e9c7e',
  '99333eb6-5e87-4955-9069-e108ca40df75'
);

-- Step 5: Verify the cleanup
-- You can run these queries to verify:
-- SELECT COUNT(*) FROM stylists;
-- SELECT COUNT(*) FROM catalog_images;
-- SELECT COUNT(*) FROM swipes;
-- SELECT COUNT(*) FROM matches; 