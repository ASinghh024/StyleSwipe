-- Script to create sample user preferences for users who have matches but no preferences
-- This helps stylists see more detailed information about their matched users

-- 1. Check users in matches who don't have preferences
SELECT 'USERS IN MATCHES WITHOUT PREFERENCES' as info;
SELECT DISTINCT m.user_id, up.full_name
FROM matches m
JOIN user_profiles up ON m.user_id = up.user_id
LEFT JOIN user_preferences pref ON m.user_id = pref.user_id
WHERE pref.user_id IS NULL
LIMIT 10;

-- 2. Create sample preferences for users without any
-- Note: These are placeholder preferences. In a real app, users would set these themselves.
INSERT INTO user_preferences (
  user_id,
  gender,
  clothing_preferences,
  preferred_occasions,
  style_preferences,
  budget_range
)
SELECT DISTINCT 
  m.user_id,
  CASE 
    WHEN RANDOM() < 0.4 THEN 'male'
    WHEN RANDOM() < 0.8 THEN 'female'
    ELSE 'non-binary'
  END as gender,
  CASE 
    WHEN RANDOM() < 0.3 THEN ARRAY['casual wear']
    WHEN RANDOM() < 0.6 THEN ARRAY['formal wear', 'business attire']
    ELSE ARRAY['casual wear', 'evening wear']
  END as clothing_preferences,
  CASE 
    WHEN RANDOM() < 0.3 THEN ARRAY['work', 'daily wear']
    WHEN RANDOM() < 0.6 THEN ARRAY['parties', 'social events']
    ELSE ARRAY['work', 'casual outings', 'special occasions']
  END as preferred_occasions,
  CASE 
    WHEN RANDOM() < 0.25 THEN 'minimalist'
    WHEN RANDOM() < 0.5 THEN 'contemporary'
    WHEN RANDOM() < 0.75 THEN 'bohemian'
    ELSE 'classic'
  END as style_preferences,
  CASE 
    WHEN RANDOM() < 0.3 THEN '5000-15000'
    WHEN RANDOM() < 0.6 THEN '15000-30000'
    WHEN RANDOM() < 0.8 THEN '30000-50000'
    ELSE '50000+'
  END as budget_range
FROM matches m
JOIN user_profiles up ON m.user_id = up.user_id
LEFT JOIN user_preferences pref ON m.user_id = pref.user_id
WHERE pref.user_id IS NULL
ON CONFLICT (user_id) DO NOTHING;

-- 3. Verify the sample preferences were created
SELECT 'VERIFICATION - USERS WITH PREFERENCES' as info;
SELECT 
  up.full_name,
  pref.gender,
  pref.style_preferences,
  pref.budget_range,
  array_length(pref.clothing_preferences, 1) as clothing_count,
  array_length(pref.preferred_occasions, 1) as occasion_count
FROM matches m
JOIN user_profiles up ON m.user_id = up.user_id
JOIN user_preferences pref ON m.user_id = pref.user_id
LIMIT 10;

-- 4. Check remaining users without preferences
SELECT 'REMAINING USERS WITHOUT PREFERENCES' as info;
SELECT COUNT(*) as users_without_preferences
FROM matches m
JOIN user_profiles up ON m.user_id = up.user_id
LEFT JOIN user_preferences pref ON m.user_id = pref.user_id
WHERE pref.user_id IS NULL; 