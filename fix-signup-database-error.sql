-- Comprehensive fix for "Database error saving new user" during signup
-- Run this in your Supabase SQL Editor

-- 1. Fix the handle_new_user function in user_profiles table
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, full_name, role)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', COALESCE(NEW.raw_user_meta_data->>'role', 'user'));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Fix the handle_new_user_preferences function
CREATE OR REPLACE FUNCTION public.handle_new_user_preferences()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_preferences (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Make sure the triggers are properly set up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

DROP TRIGGER IF EXISTS on_auth_user_created_preferences ON auth.users;
CREATE TRIGGER on_auth_user_created_preferences
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_preferences();

-- 4. Add gender column to user_preferences if it doesn't exist
ALTER TABLE user_preferences 
ADD COLUMN IF NOT EXISTS gender TEXT DEFAULT '';

-- 5. Fix the sync_user_preferences_to_profile function
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

-- 6. Create trigger to sync preferences to user_profiles
DROP TRIGGER IF EXISTS on_user_preferences_updated ON user_preferences;
CREATE TRIGGER on_user_preferences_updated
  AFTER INSERT OR UPDATE ON user_preferences
  FOR EACH ROW EXECUTE FUNCTION public.sync_user_preferences_to_profile();

-- 7. Verify the functions and triggers
SELECT 
  routine_name, 
  routine_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('handle_new_user', 'handle_new_user_preferences', 'sync_user_preferences_to_profile');

SELECT 
  trigger_name, 
  event_manipulation, 
  action_statement
FROM information_schema.triggers
WHERE event_object_schema = 'public'
AND event_object_table IN ('user_profiles', 'user_preferences')
OR trigger_name IN ('on_auth_user_created', 'on_auth_user_created_preferences');