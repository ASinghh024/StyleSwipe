-- Check database schema to ensure we're using correct table and field names
-- This will help us understand the exact structure for user data and preferences

-- 1. Check if there's a 'users' table vs 'user_profiles' table
SELECT 'CHECKING FOR USERS TABLE' as info;
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'user_profiles', 'auth.users')
ORDER BY table_name;

-- 2. Check user_profiles table structure
SELECT 'USER_PROFILES TABLE STRUCTURE' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'user_profiles' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Check user_preferences table structure  
SELECT 'USER_PREFERENCES TABLE STRUCTURE' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'user_preferences' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 4. Check matches table structure
SELECT 'MATCHES TABLE STRUCTURE' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'matches' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 5. Check sample data from user_preferences to see actual field names
SELECT 'SAMPLE USER_PREFERENCES DATA' as info;
SELECT *
FROM user_preferences 
LIMIT 3;

-- 6. Check sample data from user_profiles
SELECT 'SAMPLE USER_PROFILES DATA' as info;
SELECT user_id, full_name, role, bio
FROM user_profiles 
LIMIT 3;

-- 7. Check sample data from matches
SELECT 'SAMPLE MATCHES DATA' as info;
SELECT id, user_id, stylist_id, matched_at
FROM matches 
ORDER BY matched_at DESC
LIMIT 3;

-- 8. Test the join query we'll use in the frontend
SELECT 'TEST JOIN QUERY' as info;
SELECT 
  m.id as match_id,
  m.user_id,
  m.stylist_id,
  m.matched_at,
  up.full_name,
  up.role,
  pref.gender,
  pref.clothing_preferences,
  pref.preferred_occasions,
  pref.style_preferences,
  pref.budget_range
FROM matches m
LEFT JOIN user_profiles up ON m.user_id = up.user_id
LEFT JOIN user_preferences pref ON m.user_id = pref.user_id
ORDER BY m.matched_at DESC
LIMIT 5; 