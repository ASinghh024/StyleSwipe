-- IMMEDIATE FIX: Apply RLS policies to allow stylist dashboard to work
-- This fixes the "User abb22f" issue by allowing stylists to see matched user data

-- Drop existing conflicting policies first (if they exist)
DROP POLICY IF EXISTS "Stylists can view their matches" ON matches;
DROP POLICY IF EXISTS "Users can view their matches" ON matches;
DROP POLICY IF EXISTS "Stylists can view matched user profiles" ON user_profiles;
DROP POLICY IF EXISTS "Stylists can view matched user preferences" ON user_preferences;

-- 1. Allow stylists to see matches where they are the stylist
CREATE POLICY "Stylists can view their matches" ON matches
  FOR SELECT USING (auth.uid() = stylist_id);

-- 2. Allow users to view their own matches  
CREATE POLICY "Users can view their matches" ON matches
  FOR SELECT USING (auth.uid() = user_id);

-- 3. CRITICAL: Allow stylists to view user profiles of their matched clients
CREATE POLICY "Stylists can view matched user profiles" ON user_profiles
  FOR SELECT USING (
    user_id IN (
      SELECT user_id FROM matches WHERE stylist_id = auth.uid()
    )
  );

-- 4. CRITICAL: Allow stylists to view user preferences of their matched clients  
CREATE POLICY "Stylists can view matched user preferences" ON user_preferences
  FOR SELECT USING (
    user_id IN (
      SELECT user_id FROM matches WHERE stylist_id = auth.uid()
    )
  );

-- 5. Verify the policies were created successfully
SELECT 'RLS POLICIES VERIFICATION' as status;
SELECT schemaname, tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('matches', 'user_profiles', 'user_preferences')
ORDER BY tablename, policyname;

-- 6. Test the fix with the actual data from your screenshots
SELECT 'TESTING THE FIX' as status;
SELECT 
  'This query should now work for stylist 99333eb6...' as test_description,
  COUNT(*) as matches_found
FROM matches 
WHERE stylist_id = '99333eb6-5e87-4955-9069-e108ca40df75';

-- 7. Final verification - simulate what the dashboard will now see
SELECT 'DASHBOARD PREVIEW' as status;
SELECT 
  m.user_id,
  up.full_name as display_name,
  ups.gender,
  ups.style_preferences,
  ups.budget_range,
  'This should now show: Ankit Singh' as expected_result
FROM matches m
LEFT JOIN user_profiles up ON m.user_id = up.user_id  
LEFT JOIN user_preferences ups ON m.user_id = ups.user_id
WHERE m.stylist_id = '99333eb6-5e87-4955-9069-e108ca40df75'
LIMIT 5;