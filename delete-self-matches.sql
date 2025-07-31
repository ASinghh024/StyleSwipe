-- SQL script to delete matches where stylists are matched with themselves
-- Run this in your Supabase SQL Editor

-- First, let's check if there are any self-matches
SELECT 'CHECKING FOR SELF-MATCHES' as info;
SELECT 
  id, 
  user_id, 
  stylist_id, 
  matched_at
FROM matches 
WHERE user_id = stylist_id;

-- Count how many self-matches exist
SELECT 'SELF-MATCHES COUNT' as info;
SELECT COUNT(*) as self_matches_count
FROM matches 
WHERE user_id = stylist_id;

-- Delete all self-matches
SELECT 'DELETING SELF-MATCHES' as info;
DELETE FROM matches 
WHERE user_id = stylist_id;

-- Verify that all self-matches have been deleted
SELECT 'VERIFICATION AFTER DELETION' as info;
SELECT COUNT(*) as remaining_self_matches
FROM matches 
WHERE user_id = stylist_id;

-- Add a check constraint to prevent future self-matches
SELECT 'ADDING CONSTRAINT TO PREVENT FUTURE SELF-MATCHES' as info;
ALTER TABLE matches ADD CONSTRAINT prevent_self_matches CHECK (user_id != stylist_id);

-- Verify the constraint was added
SELECT 'VERIFICATION OF CONSTRAINT' as info;
SELECT 
  constraint_name, 
  check_clause
FROM information_schema.check_constraints
WHERE constraint_name = 'prevent_self_matches';