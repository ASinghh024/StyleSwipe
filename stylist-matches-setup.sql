-- Update RLS policies to allow stylists to see their matches
-- This will enable bidirectional visibility for the matching system

-- 1. Update matches table policies to allow stylists to see matches where they are the stylist
CREATE POLICY "Stylists can view matches with them" ON matches
  FOR SELECT USING (
    auth.uid() = stylist_id OR auth.uid() = user_id
  );

-- Drop the old restrictive policy for matches
DROP POLICY IF EXISTS "Users can view their own matches" ON matches;

-- 2. Update swipes table policies to allow stylists to see swipes on them
CREATE POLICY "Stylists can view swipes on them" ON swipes
  FOR SELECT USING (
    auth.uid() = stylist_id OR auth.uid() = user_id
  );

-- Drop the old restrictive policy for swipes
DROP POLICY IF EXISTS "Users can view their own swipes" ON swipes;

-- 3. Add a match status field to track bidirectional matching
ALTER TABLE matches ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'mutual', 'declined'));
ALTER TABLE matches ADD COLUMN IF NOT EXISTS stylist_response BOOLEAN DEFAULT NULL;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS user_response BOOLEAN DEFAULT TRUE; -- User always likes when creating match

-- 4. Create a function to update match status when stylist responds
CREATE OR REPLACE FUNCTION update_match_status()
RETURNS TRIGGER AS $$
BEGIN
  -- If stylist responds positively and user already liked (user_response = true)
  IF NEW.stylist_response = true AND NEW.user_response = true THEN
    NEW.status = 'mutual';
  -- If either party declines
  ELSIF NEW.stylist_response = false OR NEW.user_response = false THEN
    NEW.status = 'declined';
  ELSE
    NEW.status = 'pending';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Create trigger to automatically update match status
DROP TRIGGER IF EXISTS match_status_trigger ON matches;
CREATE TRIGGER match_status_trigger
  BEFORE UPDATE ON matches
  FOR EACH ROW
  EXECUTE FUNCTION update_match_status();

-- 6. Add indexes for stylist queries
CREATE INDEX IF NOT EXISTS idx_matches_stylist_status ON matches(stylist_id, status);
CREATE INDEX IF NOT EXISTS idx_matches_user_status ON matches(user_id, status);

-- 7. Create a view for easy match querying
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

-- 8. Update existing matches to have proper status
UPDATE matches 
SET user_response = true, status = 'pending' 
WHERE user_response IS NULL;

-- 9. Create policies for the match_details view
CREATE POLICY "Users and stylists can view relevant match details" ON matches
  FOR SELECT USING (
    auth.uid() = user_id OR auth.uid() = stylist_id
  );

-- 10. Add notification tracking for matches
CREATE TABLE IF NOT EXISTS match_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  notification_type TEXT CHECK (notification_type IN ('new_match', 'match_accepted', 'match_declined')) NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for notifications
ALTER TABLE match_notifications ENABLE ROW LEVEL SECURITY;

-- Create policy for notifications
CREATE POLICY "Users can view their own notifications" ON match_notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON match_notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Add indexes for notifications
CREATE INDEX IF NOT EXISTS idx_match_notifications_user_id ON match_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_match_notifications_read ON match_notifications(user_id, is_read); 