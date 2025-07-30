-- Check current RLS policies for stylist dashboard tables
-- This will show what policies exist and help identify missing ones

-- 1. Check all policies for relevant tables
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd,
  permissive,
  roles,
  qual
FROM pg_policies 
WHERE tablename IN ('user_profiles', 'user_preferences', 'matches')
ORDER BY tablename, policyname;

-- 2. Check if RLS is enabled on tables
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename IN ('user_profiles', 'user_preferences', 'matches', 'stylists');

-- 3. Test query to see what user data should be accessible to stylist
-- (This shows what the stylist SHOULD be able to see based on matches)
SELECT 
  m.id as match_id,
  m.user_id,
  m.stylist_id,
  'Should be accessible to stylist' as note
FROM matches m
WHERE m.stylist_id = '99333eb6-5e87-4955-9069-e108ca40df75';

-- 4. Check if the specific user data exists
SELECT 
  'user_profiles' as table_name,
  user_id,
  full_name,
  role
FROM user_profiles 
WHERE user_id = 'ef8455c4-6ce7-4a94-bf84-7c1a15abb22f'

UNION ALL

SELECT 
  'user_preferences' as table_name,
  user_id,
  CONCAT(gender, ' - ', style_preferences, ' - ', budget_range) as details,
  'user' as role
FROM user_preferences 
WHERE user_id = 'ef8455c4-6ce7-4a94-bf84-7c1a15abb22f';

-- 5. If policies are missing, here are the correct ones to add:
/*
MISSING POLICIES TO ADD:

-- For matches table
CREATE POLICY "Stylists can view their matches" ON matches
  FOR SELECT USING (auth.uid() = stylist_id);

CREATE POLICY "Users can view their matches" ON matches
  FOR SELECT USING (auth.uid() = user_id);

-- For user_profiles table  
CREATE POLICY "Stylists can view matched user profiles" ON user_profiles
  FOR SELECT USING (
    auth.uid() IN (
      SELECT stylist_id FROM matches WHERE user_id = user_profiles.user_id
    )
  );

-- For user_preferences table
CREATE POLICY "Stylists can view matched user preferences" ON user_preferences
  FOR SELECT USING (
    auth.uid() IN (
      SELECT stylist_id FROM matches WHERE user_id = user_preferences.user_id
    )
  );
*/ 