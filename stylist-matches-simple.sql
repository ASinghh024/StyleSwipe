-- Simplified one-way matching system
-- Users match with stylists, stylists only view the matches

-- 1. Update RLS policies to allow stylists to see their matches
DROP POLICY IF EXISTS "Stylists can view matches with them" ON matches;
DROP POLICY IF EXISTS "Users can view their own matches" ON matches;

CREATE POLICY "Users and stylists can view relevant matches" ON matches
  FOR SELECT USING (
    auth.uid() = user_id OR auth.uid() = stylist_id
  );

-- 2. Update swipes table policies for bidirectional visibility
DROP POLICY IF EXISTS "Stylists can view swipes on them" ON swipes;
DROP POLICY IF EXISTS "Users can view their own swipes" ON swipes;

CREATE POLICY "Users and stylists can view relevant swipes" ON swipes
  FOR SELECT USING (
    auth.uid() = user_id OR auth.uid() = stylist_id
  );

-- 3. Remove complex match status tracking (not needed for one-way)
-- Keep the table simple with just basic match info
ALTER TABLE matches DROP COLUMN IF EXISTS status;
ALTER TABLE matches DROP COLUMN IF EXISTS stylist_response;
ALTER TABLE matches DROP COLUMN IF EXISTS user_response;

-- 4. Drop the status update function (not needed)
DROP FUNCTION IF EXISTS update_match_status();
DROP TRIGGER IF EXISTS match_status_trigger ON matches;

-- 5. Drop notifications table (not needed for simple view-only)
DROP TABLE IF EXISTS match_notifications CASCADE;

-- 6. Drop the match_details view and recreate simple version
DROP VIEW IF EXISTS match_details;

CREATE OR REPLACE VIEW match_details AS
SELECT 
  m.*,
  up.full_name as user_name,
  up.role as user_role,
  s.name as stylist_name,
  s.bio as stylist_bio,
  s.specialties as stylist_specialties
FROM matches m
JOIN user_profiles up ON m.user_id = up.user_id
JOIN stylists s ON m.stylist_id = s.id;

-- 7. Update indexes to remove status-based ones
DROP INDEX IF EXISTS idx_matches_stylist_status;
DROP INDEX IF EXISTS idx_matches_user_status;

-- Keep the basic indexes
CREATE INDEX IF NOT EXISTS idx_matches_user_id ON matches(user_id);
CREATE INDEX IF NOT EXISTS idx_matches_stylist_id ON matches(stylist_id);

-- 8. Ensure the basic structure is correct
-- The matches table should have:
-- - id (UUID, PRIMARY KEY)
-- - user_id (UUID, REFERENCES auth.users)
-- - stylist_id (UUID, REFERENCES stylists)
-- - matched_at (TIMESTAMP)

-- Verify the structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'matches' AND table_schema = 'public'
ORDER BY ordinal_position; 