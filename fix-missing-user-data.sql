-- Fix missing user data for matched user
-- Based on console logs: user_id ef8455c4-6ce7-4a94-bf84-7c1a15abb22f is missing from both tables

-- 1. Add missing user profile
INSERT INTO user_profiles (
  user_id,
  full_name,
  role,
  bio,
  specialties,
  catalog_urls,
  is_verified,
  created_at,
  updated_at
) VALUES (
  'ef8455c4-6ce7-4a94-bf84-7c1a15abb22f',
  'Priya Sharma',  -- You can change this name
  'user',
  NULL,
  '{}',
  '{}',
  false,
  NOW(),
  NOW()
);

-- 2. Add missing user preferences
INSERT INTO user_preferences (
  user_id,
  gender,
  clothing_preferences,
  preferred_occasions,
  style_preferences,
  budget_range,
  profile_completed,
  created_at,
  updated_at
) VALUES (
  'ef8455c4-6ce7-4a94-bf84-7c1a15abb22f',
  'Female',
  ARRAY['casual', 'workwear'],
  ARRAY['office', 'party'],
  'minimalist',
  'mid-range',
  true,
  NOW(),
  NOW()
);

-- 3. Verify the records were created
SELECT 'User Profile Check' as check_type, COUNT(*) as count 
FROM user_profiles 
WHERE user_id = 'ef8455c4-6ce7-4a94-bf84-7c1a15abb22f'

UNION ALL

SELECT 'User Preferences Check', COUNT(*) 
FROM user_preferences 
WHERE user_id = 'ef8455c4-6ce7-4a94-bf84-7c1a15abb22f';

-- 4. Show what the dashboard will display
SELECT 
  up.full_name,
  upr.gender,
  upr.style_preferences,
  upr.budget_range,
  upr.clothing_preferences,
  upr.preferred_occasions
FROM user_profiles up
JOIN user_preferences upr ON up.user_id = upr.user_id
WHERE up.user_id = 'ef8455c4-6ce7-4a94-bf84-7c1a15abb22f'; 