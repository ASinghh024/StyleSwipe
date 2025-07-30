-- Quick debug: Find the user causing "User 6f9b36" issue
-- This will show all matches with their profile status

SELECT 
    m.user_id,
    m.stylist_id,
    up.full_name,
    CASE 
        WHEN up.user_id IS NULL THEN '❌ NO_PROFILE_FOUND'
        WHEN up.full_name IS NULL THEN '⚠️ NULL_FULL_NAME'
        WHEN TRIM(up.full_name) = '' THEN '⚠️ EMPTY_FULL_NAME'
        ELSE '✅ HAS_FULL_NAME'
    END as status,
    'User ' || SUBSTRING(m.user_id, -6) as fallback_name_shown
FROM matches m
LEFT JOIN user_profiles up ON m.user_id = up.user_id
ORDER BY m.matched_at DESC
LIMIT 5;

-- Check if there's a specific user_id ending in 6f9b36
SELECT 
    'SPECIFIC USER CHECK' as info,
    user_id,
    full_name,
    role
FROM user_profiles 
WHERE user_id LIKE '%6f9b36';

-- Check what that user's matches look like
SELECT 
    'THAT USER MATCHES' as info,
    user_id,
    stylist_id,
    matched_at
FROM matches 
WHERE user_id LIKE '%6f9b36'; 