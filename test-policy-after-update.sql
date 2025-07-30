-- Test RLS policies after update
-- Run this AFTER applying the stylist dashboard RLS policies

-- 1. First, verify the policies were created
SELECT 
  tablename,
  policyname,
  'Policy exists' as status
FROM pg_policies 
WHERE tablename IN ('user_profiles', 'user_preferences', 'matches')
  AND policyname LIKE '%Stylists can view%'
ORDER BY tablename;

-- 2. Test the exact match scenario from your dashboard
-- This should return 1 row if policies work correctly
SELECT 
  'Match Test' as test_type,
  COUNT(*) as result_count,
  CASE 
    WHEN COUNT(*) = 1 THEN '✅ SUCCESS - Match found'
    ELSE '❌ FAILED - No match accessible'
  END as status
FROM matches 
WHERE stylist_id = '99333eb6-5e87-4955-9069-e108ca40df75'
  AND user_id = 'ef8455c4-6ce7-4a94-bf84-7c1a15abb22f';

-- 3. Test user profile access (this is what was failing before)
-- This should return 1 row with the user's name if policies work
SELECT 
  'User Profile Test' as test_type,
  COUNT(*) as result_count,
  CASE 
    WHEN COUNT(*) = 1 THEN '✅ SUCCESS - Profile accessible'
    ELSE '❌ FAILED - Profile still blocked'
  END as status
FROM user_profiles 
WHERE user_id = 'ef8455c4-6ce7-4a94-bf84-7c1a15abb22f';

-- 4. Test user preferences access
-- This should return 1 row with preferences if policies work
SELECT 
  'User Preferences Test' as test_type,
  COUNT(*) as result_count,
  CASE 
    WHEN COUNT(*) = 1 THEN '✅ SUCCESS - Preferences accessible'
    ELSE '❌ FAILED - Preferences still blocked'
  END as status
FROM user_preferences 
WHERE user_id = 'ef8455c4-6ce7-4a94-bf84-7c1a15abb22f';

-- 5. If tests pass, show the actual data that will appear in dashboard
SELECT 
  '🎯 DASHBOARD PREVIEW' as section,
  up.full_name as user_name,
  upr.gender,
  upr.style_preferences,
  upr.budget_range,
  array_to_string(upr.clothing_preferences, ', ') as clothing,
  array_to_string(upr.preferred_occasions, ', ') as occasions
FROM user_profiles up
JOIN user_preferences upr ON up.user_id = upr.user_id
WHERE up.user_id = 'ef8455c4-6ce7-4a94-bf84-7c1a15abb22f';

-- 6. Expected results:
/*
EXPECTED RESULTS AFTER POLICY UPDATE:

✅ Policy checks: Should show 3-4 policies for stylists
✅ Match test: Should return 1 match  
✅ User profile test: Should return 1 profile (was 0 before)
✅ User preferences test: Should return 1 preference record (was 0 before)
✅ Dashboard preview: Should show actual user data

If any test shows ❌ FAILED, the policies need to be reapplied.
*/ 