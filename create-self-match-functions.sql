-- SQL script to create functions for finding and deleting self-matches
-- Run this in your Supabase SQL Editor before running the delete-self-matches.js script

-- Function to find self-matches
CREATE OR REPLACE FUNCTION find_self_matches()
RETURNS TABLE (
  id UUID,
  user_id UUID,
  stylist_id UUID,
  matched_at TIMESTAMP WITH TIME ZONE
) LANGUAGE SQL SECURITY DEFINER AS $$
  SELECT id, user_id, stylist_id, matched_at
  FROM matches
  WHERE user_id = stylist_id;
$$;

-- Function to delete self-matches
CREATE OR REPLACE FUNCTION delete_self_matches()
RETURNS INTEGER LANGUAGE SQL SECURITY DEFINER AS $$
  WITH deleted AS (
    DELETE FROM matches
    WHERE user_id = stylist_id
    RETURNING id
  )
  SELECT COUNT(*) FROM deleted;
$$;

-- Function to add constraint to prevent future self-matches
CREATE OR REPLACE FUNCTION add_self_match_constraint()
RETURNS BOOLEAN LANGUAGE PLPGSQL SECURITY DEFINER AS $$
BEGIN
  -- Check if constraint already exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'prevent_self_matches' 
    AND table_name = 'matches'
  ) THEN
    -- Add constraint
    ALTER TABLE matches ADD CONSTRAINT prevent_self_matches CHECK (user_id != stylist_id);
    RETURN TRUE;
  ELSE
    RETURN FALSE;
  END IF;
END;
$$;

-- Function to create the find_self_matches function (meta-function)
CREATE OR REPLACE FUNCTION create_find_self_matches_function()
RETURNS BOOLEAN LANGUAGE PLPGSQL SECURITY DEFINER AS $$
BEGIN
  EXECUTE $EXEC$
    CREATE OR REPLACE FUNCTION find_self_matches()
    RETURNS TABLE (
      id UUID,
      user_id UUID,
      stylist_id UUID,
      matched_at TIMESTAMP WITH TIME ZONE
    ) LANGUAGE SQL SECURITY DEFINER AS $INNER$
      SELECT id, user_id, stylist_id, matched_at
      FROM matches
      WHERE user_id = stylist_id;
    $INNER$;
  $EXEC$;
  RETURN TRUE;
EXCEPTION WHEN OTHERS THEN
  RETURN FALSE;
END;
$$;

-- Function to create the delete_self_matches function (meta-function)
CREATE OR REPLACE FUNCTION create_delete_self_matches_function()
RETURNS BOOLEAN LANGUAGE PLPGSQL SECURITY DEFINER AS $$
BEGIN
  EXECUTE $EXEC$
    CREATE OR REPLACE FUNCTION delete_self_matches()
    RETURNS INTEGER LANGUAGE SQL SECURITY DEFINER AS $INNER$
      WITH deleted AS (
        DELETE FROM matches
        WHERE user_id = stylist_id
        RETURNING id
      )
      SELECT COUNT(*) FROM deleted;
    $INNER$;
  $EXEC$;
  RETURN TRUE;
EXCEPTION WHEN OTHERS THEN
  RETURN FALSE;
END;
$$;

-- Test the functions
SELECT 'TESTING FUNCTIONS' as info;
SELECT COUNT(*) as self_matches_count FROM find_self_matches();