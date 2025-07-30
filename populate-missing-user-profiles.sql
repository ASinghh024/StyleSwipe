-- Script to populate missing user profiles for users who have matches
-- This helps ensure that matched users show proper names instead of "Anonymous User"

-- 1. Check users in matches who don't have profiles
SELECT 'USERS IN MATCHES WITHOUT PROFILES' as info;
SELECT DISTINCT m.user_id, m.stylist_id, m.matched_at
FROM matches m
LEFT JOIN user_profiles up ON m.user_id = up.user_id
WHERE up.user_id IS NULL
LIMIT 10;

-- 2. Check users in matches who have empty/null full_name
SELECT 'USERS WITH EMPTY NAMES' as info;
SELECT up.user_id, up.full_name, up.role
FROM matches m
JOIN user_profiles up ON m.user_id = up.user_id
WHERE up.full_name IS NULL OR up.full_name = '' OR TRIM(up.full_name) = ''
LIMIT 10;

-- 3. Create basic profiles for users in matches who don't have any profile
-- Note: This creates placeholder profiles. You might want to customize the names.
INSERT INTO user_profiles (user_id, full_name, role)
SELECT DISTINCT 
  m.user_id,
  CONCAT('User ', SUBSTRING(m.user_id, 1, 8)) as full_name,
  'user' as role
FROM matches m
LEFT JOIN user_profiles up ON m.user_id = up.user_id
WHERE up.user_id IS NULL
ON CONFLICT (user_id) DO NOTHING;

-- 4. Update empty full_names with placeholder names
UPDATE user_profiles 
SET full_name = CONCAT('User ', SUBSTRING(user_id, 1, 8))
WHERE user_id IN (
  SELECT DISTINCT m.user_id 
  FROM matches m 
  JOIN user_profiles up ON m.user_id = up.user_id
  WHERE up.full_name IS NULL OR up.full_name = '' OR TRIM(up.full_name) = ''
)
AND (full_name IS NULL OR full_name = '' OR TRIM(full_name) = '');

-- 5. Verify the changes
SELECT 'VERIFICATION - USERS IN MATCHES WITH PROFILES' as info;
SELECT 
  m.user_id,
  up.full_name,
  up.role,
  COUNT(m.id) as match_count
FROM matches m
JOIN user_profiles up ON m.user_id = up.user_id
GROUP BY m.user_id, up.full_name, up.role
ORDER BY match_count DESC
LIMIT 10;

-- 6. Check if there are any remaining users without profiles
SELECT 'REMAINING USERS WITHOUT PROFILES' as info;
SELECT COUNT(*) as users_without_profiles
FROM matches m
LEFT JOIN user_profiles up ON m.user_id = up.user_id
WHERE up.user_id IS NULL;

-- Add foreign key for user_profiles
ALTER TABLE user_profiles 
ADD CONSTRAINT fk_user_profiles_user_id 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add foreign key for user_preferences  
ALTER TABLE user_preferences
ADD CONSTRAINT fk_user_preferences_user_id
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;