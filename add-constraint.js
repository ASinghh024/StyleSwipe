// Script to add constraint to prevent self-matches in the matches table
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function addConstraint() {
  try {
    console.log('🔍 Checking for self-matches in the matches table...');
    
    // Get all matches
    const { data: allMatches, error: fetchError } = await supabase
      .from('matches')
      .select('id, user_id, stylist_id, matched_at');
    
    if (fetchError) {
      console.error('❌ Error fetching matches:', fetchError.message);
      return;
    }
    
    if (!allMatches || allMatches.length === 0) {
      console.log('ℹ️ No matches found in the database.');
    } else {
      console.log(`ℹ️ Found ${allMatches.length} total matches in the database.`);
      
      // Check for self-matches (where user_id === stylist_id)
      const selfMatches = allMatches.filter(match => match.user_id === match.stylist_id);
      
      if (selfMatches.length === 0) {
        console.log('✅ No self-matches found!');
      } else {
        console.log(`⚠️ Found ${selfMatches.length} self-matches. These need to be deleted before adding the constraint.`);
        console.log('\n💡 To delete these self-matches, run this SQL in your Supabase SQL Editor:');
        console.log('DELETE FROM matches WHERE user_id = stylist_id;');
        return;
      }
    }
    
    console.log('\n🔒 Adding constraint to prevent future self-matches...');
    console.log('\n💡 Run this SQL in your Supabase SQL Editor:');
    console.log(`
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'prevent_self_matches' 
    AND table_name = 'matches'
  ) THEN
    ALTER TABLE matches ADD CONSTRAINT prevent_self_matches CHECK (user_id != stylist_id);
    RAISE NOTICE 'Constraint added successfully!';
  ELSE
    RAISE NOTICE 'Constraint already exists!';
  END IF;
END;
$$;
`);
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

// Run the function
addConstraint();