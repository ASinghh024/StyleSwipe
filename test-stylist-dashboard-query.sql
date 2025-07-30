-- Test query for stylist dashboard implementation
-- This simulates exactly what the getStylistMatches function does

-- Test the main query that fetches matches with user names and preferences
-- Replace 'STYLIST_USER_ID_HERE' with an actual stylist user ID

SELECT 
    -- Match data
    m.id as match_id,
    m.user_id,
    m.stylist_id,
    m.matched_at,
    
    -- User name (primary goal)
    COALESCE(up.full_name, CONCAT('User ', SUBSTRING(m.user_id, 1, 6))) as user_name,
    
    -- User profile data
    up.full_name,
    up.role,
    up.bio,
    
    -- Styling preferences (mapped to requested field names)
    pref.gender,
    pref.clothing_preferences as clothing_type,  -- maps to user's "clothing_type"
    pref.preferred_occasions as occasion,        -- maps to user's "occasion" 
    pref.style_preferences as style,             -- maps to user's "style"
    pref.budget_range as budget                  -- maps to user's "budget"
    
FROM matches m
LEFT JOIN user_profiles up ON m.user_id = up.user_id
LEFT JOIN user_preferences pref ON m.user_id = pref.user_id
WHERE m.stylist_id = 'STYLIST_USER_ID_HERE'  -- Replace with actual stylist ID
ORDER BY m.matched_at DESC;

-- Check if we have test data
SELECT 'SAMPLE TEST DATA' as info;
SELECT 
    COUNT(m.id) as total_matches,
    COUNT(up.user_id) as matches_with_profiles,
    COUNT(pref.user_id) as matches_with_preferences
FROM matches m
LEFT JOIN user_profiles up ON m.user_id = up.user_id  
LEFT JOIN user_preferences pref ON m.user_id = pref.user_id;

-- Show a sample of actual data structure
SELECT 'ACTUAL DATA SAMPLE' as info;
SELECT 
    m.user_id,
    up.full_name,
    pref.gender,
    pref.clothing_preferences,
    pref.style_preferences,
    pref.budget_range
FROM matches m
LEFT JOIN user_profiles up ON m.user_id = up.user_id
LEFT JOIN user_preferences pref ON m.user_id = pref.user_id
LIMIT 3; 