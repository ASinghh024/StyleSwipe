-- Add gender field to user_preferences table
-- This script adds the gender field that was missing from the original table structure

-- Add gender column to user_preferences table
ALTER TABLE user_preferences 
ADD COLUMN IF NOT EXISTS gender TEXT DEFAULT '';

-- Update the sync function to include gender
CREATE OR REPLACE FUNCTION public.sync_user_preferences_to_profile()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE user_profiles 
  SET 
    full_name = COALESCE(NEW.full_name, user_profiles.full_name),
    clothing_preferences = NEW.clothing_preferences,
    preferred_occasions = NEW.preferred_occasions,
    style_preferences = NEW.style_preferences,
    budget_range = NEW.budget_range,
    size_preferences = NEW.size_preferences,
    color_preferences = NEW.color_preferences,
    updated_at = NOW()
  WHERE user_id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Verify the column was added
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'user_preferences' AND column_name = 'gender'; 