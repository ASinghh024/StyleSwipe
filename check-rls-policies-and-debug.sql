-- Comprehensive debugging script for stylist dashboard issues
-- Run this in your Supabase SQL Editor to diagnose the problem

-- 1. Check current RLS policies for matches table
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'matches'
ORDER BY policyname;

-- 2. Check current RLS policies for swipes table  
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'swipes'
ORDER BY policyname;

-- 3. Check if RLS is enabled on the tables
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('matches', 'swipes', 'user_profiles')
ORDER BY tablename;

-- 4. Check sample data structure
SELECT 'MATCHES TABLE STRUCTURE' as info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'matches' AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT 'SAMPLE MATCHES DATA' as info;
SELECT id, user_id, stylist_id, matched_at, created_at
FROM matches 
LIMIT 3;

-- 5. Check stylists table
SELECT 'STYLISTS TABLE STRUCTURE' as info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'stylists' AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT 'SAMPLE STYLISTS DATA' as info;
SELECT id, name, created_at
FROM stylists 
LIMIT 3;

-- 6. Check user_profiles table
SELECT 'USER_PROFILES TABLE STRUCTURE' as info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'user_profiles' AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT 'SAMPLE USER_PROFILES DATA' as info;
SELECT user_id, full_name, role, created_at
FROM user_profiles 
WHERE role = 'stylist'
LIMIT 3;

-- 7. Check for foreign key constraints
SELECT 'FOREIGN KEY CONSTRAINTS' as info;
SELECT
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name IN ('matches', 'swipes')
AND tc.table_schema = 'public';

-- 8. Test a simple query that the frontend would run
-- This simulates what happens when a stylist tries to see their matches
SELECT 'TESTING STYLIST MATCH QUERY' as info;
-- Replace 'your-stylist-user-id-here' with an actual stylist user ID for testing
-- SELECT m.*, up.full_name 
-- FROM matches m
-- LEFT JOIN user_profiles up ON m.user_id = up.user_id
-- WHERE m.stylist_id = 'your-stylist-user-id-here';

-- 9. Check if there are any matches at all
SELECT 'TOTAL MATCHES COUNT' as info;
SELECT COUNT(*) as total_matches FROM matches;

-- 10. Check if there are stylists who should have matches
SELECT 'STYLISTS WITH POTENTIAL MATCHES' as info;
SELECT 
  s.id as stylist_id,
  s.name as stylist_name,
  COUNT(m.id) as match_count
FROM stylists s
LEFT JOIN matches m ON s.id = m.stylist_id
GROUP BY s.id, s.name
ORDER BY match_count DESC
LIMIT 5; 