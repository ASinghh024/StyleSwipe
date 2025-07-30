-- Create test data for stylist dashboard
-- This script creates sample users, preferences, and matches for testing

-- First, let's create some sample user preferences
-- (These will be for imaginary users that would match with existing stylists)

-- Sample user 1 - Priya Sharma
INSERT INTO user_preferences (
  user_id,
  gender,
  clothing_preferences,
  preferred_occasions,
  style_preferences,
  budget_range,
  profile_completed
) VALUES (
  'abb22f00-1234-5678-9abc-def012345678'::uuid,
  'Female',
  ARRAY['Casual', 'Workwear'],
  ARRAY['Office', 'Party'],
  'Minimalist',
  'mid-range',
  true
);

-- Sample user 2 - Rahul Kumar  
INSERT INTO user_preferences (
  user_id,
  gender,
  clothing_preferences,
  preferred_occasions,
  style_preferences,
  budget_range,
  profile_completed
) VALUES (
  'def456aa-5678-9abc-def0-123456789abc'::uuid,
  'Male',
  ARRAY['Formal', 'Business'],
  ARRAY['Work', 'Meeting'],
  'Classic',
  'luxury',
  true
);

-- Sample user 3 - Anita Singh
INSERT INTO user_preferences (
  user_id,
  gender,
  clothing_preferences,
  preferred_occasions,
  style_preferences,
  budget_range,
  profile_completed
) VALUES (
  'ghi789bb-9abc-def0-1234-56789abcdef0'::uuid,
  'Female',
  ARRAY['Evening', 'Casual'],
  ARRAY['Date', 'Wedding'],
  'Trendy',
  'budget',
  true
);

-- Add user profiles for these users
INSERT INTO user_profiles (
  user_id,
  full_name,
  role,
  clothing_preferences,
  preferred_occasions,
  style_preferences,
  budget_range
) VALUES 
(
  'abb22f00-1234-5678-9abc-def012345678'::uuid,
  'Priya Sharma',
  'user',
  ARRAY['Casual', 'Workwear'],
  ARRAY['Office', 'Party'],
  'Minimalist',
  'mid-range'
),
(
  'def456aa-5678-9abc-def0-123456789abc'::uuid,
  'Rahul Kumar',
  'user',
  ARRAY['Formal', 'Business'],
  ARRAY['Work', 'Meeting'],
  'Classic',
  'luxury'
),
(
  'ghi789bb-9abc-def0-1234-56789abcdef0'::uuid,
  'Anita Singh',
  'user',
  ARRAY['Evening', 'Casual'],
  ARRAY['Date', 'Wedding'],
  'Trendy',
  'budget'
);

-- Create matches between these users and the existing stylist
-- Get the stylist ID first (from the check-matches.js output: 99333eb6-5e87-4955-9069-e108ca40df75)
INSERT INTO matches (
  user_id,
  stylist_id,
  matched_at
) VALUES 
(
  'abb22f00-1234-5678-9abc-def012345678'::uuid,
  '99333eb6-5e87-4955-9069-e108ca40df75'::uuid,
  '2024-01-15 10:30:00+00:00'
),
(
  'def456aa-5678-9abc-def0-123456789abc'::uuid,
  '99333eb6-5e87-4955-9069-e108ca40df75'::uuid,
  '2024-01-16 14:22:00+00:00'
),
(
  'ghi789bb-9abc-def0-1234-56789abcdef0'::uuid,
  '99333eb6-5e87-4955-9069-e108ca40df75'::uuid,
  '2024-01-17 09:15:00+00:00'
);

-- Verify the data was inserted
SELECT 'User Preferences Count:' as check_type, COUNT(*) as count FROM user_preferences
UNION ALL
SELECT 'User Profiles Count:', COUNT(*) FROM user_profiles WHERE role = 'user'
UNION ALL  
SELECT 'Matches Count:', COUNT(*) FROM matches; 