-- Simplify user_preferences table to only keep new style preferences
-- This script removes old columns and keeps only the essential ones

-- First, let's see what columns currently exist
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'user_preferences' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Drop old columns that are no longer needed
ALTER TABLE user_preferences 
DROP COLUMN IF EXISTS full_name,
DROP COLUMN IF EXISTS size_preferences,
DROP COLUMN IF EXISTS color_preferences,
DROP COLUMN IF EXISTS fit_preferences,
DROP COLUMN IF EXISTS fabric_preferences,
DROP COLUMN IF EXISTS brand_preferences,
DROP COLUMN IF EXISTS seasonal_preferences;

-- Keep only the essential columns for the new style preferences
-- The table should now have:
-- - id (UUID, PRIMARY KEY)
-- - user_id (UUID, REFERENCES auth.users)
-- - gender (TEXT)
-- - clothing_preferences (TEXT[])
-- - preferred_occasions (TEXT[])
-- - style_preferences (TEXT)
-- - budget_range (TEXT)
-- - profile_completed (BOOLEAN)
-- - created_at (TIMESTAMP)
-- - updated_at (TIMESTAMP)

-- Verify the new structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'user_preferences' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Update the sync function to only sync the new fields
CREATE OR REPLACE FUNCTION public.sync_user_preferences_to_profile()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE user_profiles 
  SET 
    clothing_preferences = NEW.clothing_preferences,
    preferred_occasions = NEW.preferred_occasions,
    style_preferences = NEW.style_preferences,
    budget_range = NEW.budget_range,
    updated_at = NOW()
  WHERE user_id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Test the new structure by trying to insert a sample record
-- (This will be blocked by RLS, but it will show if the structure is correct)
-- INSERT INTO user_preferences (
--   user_id, 
--   gender, 
--   clothing_preferences, 
--   preferred_occasions, 
--   style_preferences, 
--   budget_range, 
--   profile_completed
-- ) VALUES (
--   '00000000-0000-0000-0000-000000000001',
--   'male',
--   ARRAY['casual'],
--   ARRAY['daily'],
--   'minimalist',
--   '1000-3000',
--   true
-- ); 