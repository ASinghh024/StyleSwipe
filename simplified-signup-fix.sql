-- SIMPLIFIED FIX FOR "DATABASE ERROR SAVING NEW USER"
-- Run this entire script at once in your Supabase SQL Editor

-- 1. First, let's check if the tables exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_profiles') THEN
    RAISE EXCEPTION 'user_profiles table does not exist';
  END IF;
  
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_preferences') THEN
    RAISE EXCEPTION 'user_preferences table does not exist';
  END IF;
  
  RAISE NOTICE 'Tables check passed: user_profiles and user_preferences exist';
END;
$$ LANGUAGE plpgsql;

-- 2. Add gender column to user_preferences if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'user_preferences' 
                 AND column_name = 'gender') THEN
    ALTER TABLE public.user_preferences ADD COLUMN gender TEXT DEFAULT '';
    RAISE NOTICE 'Added gender column to user_preferences';
  ELSE
    RAISE NOTICE 'Gender column already exists in user_preferences';
  END IF;
END;
$$ LANGUAGE plpgsql;

-- 3. Drop existing triggers and functions to ensure clean recreation
DO $$
BEGIN
  DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
  DROP TRIGGER IF EXISTS on_auth_user_created_preferences ON auth.users;
  DROP TRIGGER IF EXISTS on_user_preferences_updated ON public.user_preferences;

  DROP FUNCTION IF EXISTS public.handle_new_user();
  DROP FUNCTION IF EXISTS public.handle_new_user_preferences();
  DROP FUNCTION IF EXISTS public.sync_user_preferences_to_profile();

  RAISE NOTICE 'Dropped existing triggers and functions for clean recreation';
END;
$$ LANGUAGE plpgsql;

-- 4. Create the handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, full_name, role)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', COALESCE(NEW.raw_user_meta_data->>'role', 'user'));
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Error in handle_new_user function: %', SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Create the handle_new_user_preferences function
CREATE OR REPLACE FUNCTION public.handle_new_user_preferences()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_preferences (user_id)
  VALUES (NEW.id);
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Error in handle_new_user_preferences function: %', SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Create the sync_user_preferences_to_profile function
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
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Error in sync_user_preferences_to_profile function: %', SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Create the triggers
DO $$
BEGIN
  CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

  CREATE TRIGGER on_auth_user_created_preferences
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_preferences();

  CREATE TRIGGER on_user_preferences_updated
    AFTER INSERT OR UPDATE ON user_preferences
    FOR EACH ROW EXECUTE FUNCTION public.sync_user_preferences_to_profile();

  RAISE NOTICE 'Created all functions and triggers successfully';
END;
$$ LANGUAGE plpgsql;

-- 8. Verify the functions and triggers
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