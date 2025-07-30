-- Fix RLS policies for stylist dashboard
-- This allows stylists to see data for users who have matched with them

-- 1. Add policy for stylists to see matches where they are the stylist
CREATE POLICY "Stylists can view their matches" ON matches
  FOR SELECT USING (auth.uid() = stylist_id);

-- 2. Add policy for users to view their own matches  
CREATE POLICY "Users can view their matches" ON matches
  FOR SELECT USING (auth.uid() = user_id);

-- 3. Add policy for stylists to view user profiles of their matched clients
CREATE POLICY "Stylists can view matched user profiles" ON user_profiles
  FOR SELECT USING (
    auth.uid() IN (
      SELECT stylist_id FROM matches WHERE user_id = user_profiles.user_id
    )
  );

-- 4. Add policy for stylists to view user preferences of their matched clients
CREATE POLICY "Stylists can view matched user preferences" ON user_preferences
  FOR SELECT USING (
    auth.uid() IN (
      SELECT stylist_id FROM matches WHERE user_id = user_preferences.user_id
    )
  );

-- 5. Verify the policies were created
SELECT schemaname, tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('matches', 'user_profiles', 'user_preferences')
ORDER BY tablename, policyname; 