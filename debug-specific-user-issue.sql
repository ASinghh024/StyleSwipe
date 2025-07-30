-- Debug the specific issue where full_name exists but dashboard shows "User 6f9b36"
-- Replace the user_id and stylist_id with the actual values you're seeing

-- 1. Find the specific user_id that's showing as "User 6f9b36"
-- Look for user_ids ending in "6f9b36" 
SELECT 'FINDING USER_ID ENDING IN 6f9b36' as debug_step;

SELECT 
    user_id,
    full_name,
    role,
    created_at
FROM user_profiles 
WHERE user_id LIKE '%6f9b36'
OR user_id LIKE '%6f9b36%';

-- 2. Check if this user has any matches
SELECT 'CHECKING MATCHES FOR THIS USER' as debug_step;

SELECT 
    m.id as match_id,
    m.user_id,
    m.stylist_id,
    m.matched_at,
    up.full_name as user_full_name
FROM matches m
LEFT JOIN user_profiles up ON m.user_id = up.user_id
WHERE m.user_id LIKE '%6f9b36'
OR m.user_id LIKE '%6f9b36%';

-- 3. Test the exact dashboard query for a specific stylist
-- Replace 'YOUR_STYLIST_ID' with the actual stylist ID you're testing with
SELECT 'TESTING DASHBOARD QUERY FOR SPECIFIC STYLIST' as debug_step;

SELECT 
    m.user_id,
    m.stylist_id,
    up.full_name,
    CASE 
        WHEN up.full_name IS NOT NULL AND TRIM(up.full_name) != '' THEN up.full_name
        ELSE CONCAT('User ', SUBSTRING(m.user_id, -6))
    END as display_name
FROM matches m
LEFT JOIN user_profiles up ON m.user_id = up.user_id
WHERE m.stylist_id = 'YOUR_STYLIST_ID'  -- Replace with actual stylist ID
ORDER BY m.matched_at DESC;

-- 4. Check for exact user_id match issues (case sensitivity, extra spaces, etc.)
SELECT 'CHECKING FOR EXACT MATCH ISSUES' as debug_step;

-- Show all matches with their profile status
SELECT 
    m.user_id as match_user_id,
    LENGTH(m.user_id) as user_id_length,
    up.user_id as profile_user_id,
    LENGTH(up.user_id) as profile_user_id_length,
    up.full_name,
    CASE 
        WHEN up.user_id IS NULL THEN 'NO_PROFILE_FOUND'
        WHEN up.full_name IS NULL THEN 'NULL_FULL_NAME'
        WHEN TRIM(up.full_name) = '' THEN 'EMPTY_FULL_NAME'
        ELSE 'HAS_FULL_NAME'
    END as status
FROM matches m
LEFT JOIN user_profiles up ON m.user_id = up.user_id
ORDER BY m.matched_at DESC
LIMIT 10;

-- 5. Test the batch query that the dashboard uses
SELECT 'TESTING BATCH QUERY LOGIC' as debug_step;

-- Simulate the exact steps the dashboard code follows:
-- Step 1: Get user_ids from matches
WITH match_user_ids AS (
    SELECT DISTINCT user_id 
    FROM matches 
    WHERE stylist_id = 'YOUR_STYLIST_ID'  -- Replace with actual stylist ID
)
-- Step 2: Get profiles using IN clause (like the code does)
SELECT 
    mui.user_id as from_matches,
    up.user_id as from_profiles,
    up.full_name,
    CASE 
        WHEN up.user_id IS NULL THEN 'PROFILE_NOT_FOUND_IN_BATCH'
        WHEN up.full_name IS NULL OR TRIM(up.full_name) = '' THEN 'EMPTY_NAME_IN_BATCH'
        ELSE 'SUCCESS_IN_BATCH'
    END as batch_status
FROM match_user_ids mui
LEFT JOIN user_profiles up ON mui.user_id = up.user_id;

-- 6. Check for potential UUID vs string issues
SELECT 'CHECKING DATA TYPES' as debug_step;

SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name IN ('matches', 'user_profiles')
AND column_name = 'user_id'
AND table_schema = 'public';

-- 7. Show any users that might have duplicate profiles
SELECT 'CHECKING FOR DUPLICATE PROFILES' as debug_step;

SELECT 
    user_id,
    COUNT(*) as profile_count,
    STRING_AGG(full_name, ', ') as all_names
FROM user_profiles 
GROUP BY user_id
HAVING COUNT(*) > 1;

-- 8. Final verification - show what should appear in dashboard
SELECT 'FINAL VERIFICATION - WHAT SHOULD APPEAR IN DASHBOARD' as debug_step;

SELECT 
    'Stylist ID: ' || stylist_id as info,
    'User: ' || user_id || ' → ' || COALESCE(up.full_name, 'MISSING_NAME') as what_should_show
FROM matches m
LEFT JOIN user_profiles up ON m.user_id = up.user_id
WHERE m.stylist_id = 'YOUR_STYLIST_ID'  -- Replace with actual stylist ID
ORDER BY m.matched_at DESC; 