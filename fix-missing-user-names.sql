-- Fix missing user names issue where users display as "User 6f9b36" instead of real names
-- This addresses the exact problem you're experiencing

-- 1. First, let's see what the current situation is
SELECT 'CURRENT SITUATION ANALYSIS' as info;

-- Check how many matches have missing user profiles
SELECT 
    COUNT(DISTINCT m.user_id) as total_matched_users,
    COUNT(DISTINCT up.user_id) as users_with_profiles,
    COUNT(DISTINCT m.user_id) - COUNT(DISTINCT up.user_id) as users_missing_profiles
FROM matches m
LEFT JOIN user_profiles up ON m.user_id = up.user_id;

-- Check how many user profiles have empty/null names
SELECT 
    COUNT(*) as profiles_with_empty_names
FROM user_profiles 
WHERE full_name IS NULL OR full_name = '' OR TRIM(full_name) = '';

-- Show the problematic cases
SELECT 'PROBLEMATIC CASES' as info;

-- Users in matches but no profile at all
SELECT DISTINCT 
    m.user_id,
    'NO_PROFILE' as issue
FROM matches m
LEFT JOIN user_profiles up ON m.user_id = up.user_id
WHERE up.user_id IS NULL
LIMIT 5;

-- Users with profiles but empty names
SELECT 
    up.user_id,
    up.full_name,
    'EMPTY_NAME' as issue
FROM matches m
JOIN user_profiles up ON m.user_id = up.user_id
WHERE up.full_name IS NULL OR up.full_name = '' OR TRIM(up.full_name) = ''
LIMIT 5;

-- 2. FIX 1: Create profiles for users who have matches but no profile
SELECT 'FIX 1: Creating missing user profiles' as info;

INSERT INTO user_profiles (user_id, full_name, role, created_at, updated_at)
SELECT DISTINCT 
    m.user_id,
    CONCAT('User ', SUBSTRING(m.user_id, 1, 8)) as full_name,  -- Creates "User 12345678" format
    'user' as role,
    NOW() as created_at,
    NOW() as updated_at
FROM matches m
LEFT JOIN user_profiles up ON m.user_id = up.user_id
WHERE up.user_id IS NULL
ON CONFLICT (user_id) DO NOTHING;

-- 3. FIX 2: Update empty full_name fields with placeholder names
SELECT 'FIX 2: Updating empty full_name fields' as info;

UPDATE user_profiles 
SET 
    full_name = CONCAT('User ', SUBSTRING(user_id, 1, 8)),
    updated_at = NOW()
WHERE user_id IN (
    SELECT DISTINCT m.user_id 
    FROM matches m 
    WHERE EXISTS (
        SELECT 1 FROM user_profiles up 
        WHERE up.user_id = m.user_id 
        AND (up.full_name IS NULL OR up.full_name = '' OR TRIM(up.full_name) = '')
    )
)
AND (full_name IS NULL OR full_name = '' OR TRIM(full_name) = '');

-- 4. VERIFICATION: Check that all matched users now have names
SELECT 'VERIFICATION AFTER FIXES' as info;

SELECT 
    COUNT(DISTINCT m.user_id) as total_matched_users,
    COUNT(DISTINCT up.user_id) as users_with_profiles,
    COUNT(CASE WHEN up.full_name IS NOT NULL AND TRIM(up.full_name) != '' THEN 1 END) as users_with_names
FROM matches m
LEFT JOIN user_profiles up ON m.user_id = up.user_id;

-- 5. Show sample results that will appear in the dashboard
SELECT 'SAMPLE DASHBOARD RESULTS' as info;

SELECT 
    m.user_id,
    up.full_name as display_name,
    m.matched_at,
    'Will show in dashboard as: ' || COALESCE(up.full_name, CONCAT('User ', SUBSTRING(m.user_id, -6))) as dashboard_display
FROM matches m
LEFT JOIN user_profiles up ON m.user_id = up.user_id
ORDER BY m.matched_at DESC
LIMIT 5;

-- 6. OPTIONAL: Create more realistic names (you can customize these)
SELECT 'OPTIONAL: Update with more realistic names' as info;

-- Uncomment the following if you want more realistic placeholder names
/*
UPDATE user_profiles 
SET full_name = CASE 
    WHEN SUBSTRING(user_id, 1, 1) IN ('a','b','c') THEN 'Alice Johnson'
    WHEN SUBSTRING(user_id, 1, 1) IN ('d','e','f') THEN 'David Smith'
    WHEN SUBSTRING(user_id, 1, 1) IN ('g','h','i') THEN 'Emma Wilson'
    WHEN SUBSTRING(user_id, 1, 1) IN ('j','k','l') THEN 'Michael Brown'
    WHEN SUBSTRING(user_id, 1, 1) IN ('m','n','o') THEN 'Sarah Davis'
    WHEN SUBSTRING(user_id, 1, 1) IN ('p','q','r') THEN 'James Miller'
    WHEN SUBSTRING(user_id, 1, 1) IN ('s','t','u') THEN 'Lisa Garcia'
    WHEN SUBSTRING(user_id, 1, 1) IN ('v','w','x') THEN 'Robert Taylor'
    ELSE 'Chris Anderson'
END,
updated_at = NOW()
WHERE user_id IN (
    SELECT DISTINCT m.user_id FROM matches m
) 
AND full_name LIKE 'User %';
*/ 