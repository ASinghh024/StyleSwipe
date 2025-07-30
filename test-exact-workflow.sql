-- Test the EXACT workflow for stylist dashboard
-- Replace 'YOUR_STYLIST_USER_ID' with an actual stylist user ID

-- STEP 1: Get all user_ids from matches table which have matched with the stylist
SELECT 'STEP 1: Getting user_ids from matches table' as workflow_step;

SELECT 
    id as match_id,
    user_id,
    stylist_id, 
    matched_at
FROM matches 
WHERE stylist_id = 'YOUR_STYLIST_USER_ID'  -- Replace with actual stylist ID
ORDER BY matched_at DESC;

-- Get the user_ids for next steps (this simulates what the code does)
SELECT 'User IDs that matched with this stylist:' as info;
SELECT DISTINCT user_id 
FROM matches 
WHERE stylist_id = 'YOUR_STYLIST_USER_ID'  -- Replace with actual stylist ID
ORDER BY user_id;

-- STEP 2: Using those user_ids, get full_name from user_profiles table
SELECT 'STEP 2: Getting full_name from user_profiles table' as workflow_step;

SELECT 
    user_id,
    full_name,
    role,
    bio
FROM user_profiles 
WHERE user_id IN (
    SELECT DISTINCT user_id 
    FROM matches 
    WHERE stylist_id = 'YOUR_STYLIST_USER_ID'  -- Replace with actual stylist ID
);

-- STEP 3: Using those same user_ids, get all relevant data from user_preferences table
SELECT 'STEP 3: Getting preferences from user_preferences table' as workflow_step;

SELECT 
    user_id,
    gender,
    clothing_preferences,
    preferred_occasions,
    style_preferences,
    budget_range
FROM user_preferences 
WHERE user_id IN (
    SELECT DISTINCT user_id 
    FROM matches 
    WHERE stylist_id = 'YOUR_STYLIST_USER_ID'  -- Replace with actual stylist ID
);

-- STEP 4: COMBINED QUERY - This shows the final result as it appears in the dashboard
SELECT 'STEP 4: COMBINED RESULT - What the dashboard displays' as workflow_step;

SELECT 
    -- Match info
    m.id as match_id,
    m.matched_at,
    
    -- User identification
    m.user_id,
    COALESCE(up.full_name, CONCAT('User ', SUBSTRING(m.user_id, 1, 6))) as user_name,
    
    -- User profile data
    up.role,
    up.bio,
    
    -- Styling preferences (the exact fields requested)
    pref.gender,
    pref.clothing_preferences,
    pref.preferred_occasions, 
    pref.style_preferences,
    pref.budget_range
    
FROM matches m
LEFT JOIN user_profiles up ON m.user_id = up.user_id
LEFT JOIN user_preferences pref ON m.user_id = pref.user_id
WHERE m.stylist_id = 'YOUR_STYLIST_USER_ID'  -- Replace with actual stylist ID
ORDER BY m.matched_at DESC;

-- SUMMARY: Show counts to verify data
SELECT 'SUMMARY: Data availability for this stylist' as workflow_step;

SELECT 
    COUNT(m.id) as total_matches,
    COUNT(up.user_id) as matches_with_profiles,
    COUNT(pref.user_id) as matches_with_preferences,
    COUNT(CASE WHEN up.full_name IS NOT NULL AND up.full_name != '' THEN 1 END) as matches_with_names
FROM matches m
LEFT JOIN user_profiles up ON m.user_id = up.user_id
LEFT JOIN user_preferences pref ON m.user_id = pref.user_id
WHERE m.stylist_id = 'YOUR_STYLIST_USER_ID';  -- Replace with actual stylist ID

-- BONUS: Show any stylists that have matches (for testing)
SELECT 'STYLISTS WITH MATCHES (for testing):' as info;
SELECT 
    m.stylist_id,
    up.full_name as stylist_name,
    COUNT(m.id) as match_count
FROM matches m
LEFT JOIN user_profiles up ON m.stylist_id = up.user_id
GROUP BY m.stylist_id, up.full_name
ORDER BY match_count DESC
LIMIT 5; 