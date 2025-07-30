-- User Profile System Setup
-- This file sets up the user profile system with clothing preferences and occasions

-- 1. Add new columns to user_profiles table for user preferences
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS clothing_preferences TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS preferred_occasions TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS style_preferences TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS budget_range TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS size_preferences TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS color_preferences TEXT[] DEFAULT '{}';

-- 2. Create a new user_preferences table for more detailed preferences
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Basic preferences
  full_name TEXT DEFAULT '', -- User's full name
  clothing_preferences TEXT[] DEFAULT '{}', -- ['casual', 'formal', 'business', 'athletic', 'evening']
  preferred_occasions TEXT[] DEFAULT '{}', -- ['work', 'date', 'party', 'wedding', 'casual', 'travel']
  style_preferences TEXT DEFAULT '', -- 'minimalist', 'bohemian', 'classic', 'trendy', 'vintage'
  budget_range TEXT DEFAULT '', -- 'budget', 'mid-range', 'luxury'
  size_preferences TEXT DEFAULT '', -- 'XS', 'S', 'M', 'L', 'XL', 'XXL'
  color_preferences TEXT[] DEFAULT '{}', -- ['black', 'white', 'blue', 'red', etc.]
  
  -- Additional preferences
  fit_preferences TEXT[] DEFAULT '{}', -- ['loose', 'fitted', 'oversized', 'tailored']
  fabric_preferences TEXT[] DEFAULT '{}', -- ['cotton', 'silk', 'wool', 'denim', 'synthetic']
  brand_preferences TEXT[] DEFAULT '{}', -- ['nike', 'zara', 'h&m', etc.]
  seasonal_preferences TEXT[] DEFAULT '{}', -- ['spring', 'summer', 'fall', 'winter']
  
  -- Profile completion
  profile_completed BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id)
);

-- 3. Enable Row Level Security for user_preferences
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- 4. Create policies for user_preferences
CREATE POLICY "Users can view their own preferences" ON user_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences" ON user_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences" ON user_preferences
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own preferences" ON user_preferences
  FOR DELETE USING (auth.uid() = user_id);

-- 5. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_preferences_profile_completed ON user_preferences(profile_completed);

-- 6. Create a function to automatically create user preferences when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user_preferences()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_preferences (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Create trigger to automatically create user preferences on user signup
DROP TRIGGER IF EXISTS on_auth_user_created_preferences ON auth.users;
CREATE TRIGGER on_auth_user_created_preferences
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_preferences();

-- 8. Create a function to update user_profiles when user_preferences are updated
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

-- 9. Create trigger to sync preferences to user_profiles
DROP TRIGGER IF EXISTS on_user_preferences_updated ON user_preferences;
CREATE TRIGGER on_user_preferences_updated
  AFTER INSERT OR UPDATE ON user_preferences
  FOR EACH ROW EXECUTE FUNCTION public.sync_user_preferences_to_profile();

-- 10. Create a function to mark profile as completed
CREATE OR REPLACE FUNCTION public.mark_profile_completed(user_uuid UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE user_preferences 
  SET profile_completed = true, updated_at = NOW()
  WHERE user_id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. Add some sample data for testing (optional)
-- INSERT INTO user_preferences (user_id, clothing_preferences, preferred_occasions, style_preferences, budget_range)
-- VALUES 
--   ('sample-user-id', ARRAY['casual', 'business'], ARRAY['work', 'casual'], 'minimalist', 'mid-range'); 