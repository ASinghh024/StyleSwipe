-- Check the relationship between user_profiles and user_preferences tables
-- This will help us understand how these tables are connected

-- 1. Check if both tables exist
SELECT 'CHECKING TABLE EXISTENCE' as info;
SELECT table_name, table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('user_profiles', 'user_preferences')
ORDER BY table_name;

-- 2. Check the structure of user_profiles table
SELECT 'USER_PROFILES TABLE STRUCTURE' as info;
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default,
    ordinal_position
FROM information_schema.columns 
WHERE table_name = 'user_profiles' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Check the structure of user_preferences table  
SELECT 'USER_PREFERENCES TABLE STRUCTURE' as info;
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default,
    ordinal_position
FROM information_schema.columns 
WHERE table_name = 'user_preferences' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 4. Check for foreign key constraints between the tables
SELECT 'FOREIGN KEY CONSTRAINTS' as info;
SELECT
    tc.table_name as source_table,
    kcu.column_name as source_column,
    ccu.table_name as target_table,
    ccu.column_name as target_column,
    tc.constraint_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND (tc.table_name IN ('user_profiles', 'user_preferences')
     OR ccu.table_name IN ('user_profiles', 'user_preferences'))
AND tc.table_schema = 'public';

-- 5. Check for common columns between the tables (likely user_id)
SELECT 'COMMON COLUMNS' as info;
SELECT 
    up.column_name,
    up.data_type as user_profiles_type,
    upref.data_type as user_preferences_type
FROM information_schema.columns up
JOIN information_schema.columns upref 
    ON up.column_name = upref.column_name
WHERE up.table_name = 'user_profiles' 
AND upref.table_name = 'user_preferences'
AND up.table_schema = 'public' 
AND upref.table_schema = 'public';

-- 6. Check if user_id exists in both tables and what it references
SELECT 'USER_ID COLUMN ANALYSIS' as info;
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND column_name = 'user_id'
AND table_name IN ('user_profiles', 'user_preferences')
ORDER BY table_name;

-- 7. Test the actual data relationship
SELECT 'DATA RELATIONSHIP TEST' as info;
SELECT 
    'user_profiles' as table_name,
    COUNT(*) as total_records,
    COUNT(DISTINCT user_id) as unique_user_ids
FROM user_profiles
UNION ALL
SELECT 
    'user_preferences' as table_name,
    COUNT(*) as total_records,
    COUNT(DISTINCT user_id) as unique_user_ids  
FROM user_preferences;

-- 8. Check how many users have both profile and preferences
SELECT 'USERS WITH BOTH PROFILE AND PREFERENCES' as info;
SELECT 
    COUNT(DISTINCT up.user_id) as users_with_both_profile_and_preferences,
    COUNT(DISTINCT p.user_id) as total_users_with_profiles,
    COUNT(DISTINCT pr.user_id) as total_users_with_preferences
FROM user_profiles p
FULL OUTER JOIN user_preferences pr ON p.user_id = pr.user_id
LEFT JOIN user_profiles up ON up.user_id = pr.user_id AND up.user_id = p.user_id;

-- 9. Sample data showing the relationship
SELECT 'SAMPLE DATA SHOWING RELATIONSHIP' as info;
SELECT 
    up.user_id,
    up.full_name,
    up.role,
    CASE WHEN pref.user_id IS NOT NULL THEN 'Has Preferences' ELSE 'No Preferences' END as has_preferences,
    pref.gender,
    pref.style_preferences
FROM user_profiles up
LEFT JOIN user_preferences pref ON up.user_id = pref.user_id
LIMIT 5;

-- 10. Check if user_id references auth.users (the authentication table)
SELECT 'CHECKING AUTH.USERS REFERENCE' as info;
SELECT
    tc.table_name,
    kcu.column_name,
    ccu.table_name as referenced_table,
    ccu.column_name as referenced_column
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND kcu.column_name = 'user_id'
AND tc.table_name IN ('user_profiles', 'user_preferences')
AND tc.table_schema = 'public'; 