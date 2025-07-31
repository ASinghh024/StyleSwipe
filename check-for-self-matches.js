// Script to check for self-matches in the matches table
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkForSelfMatches() {
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
      return;
    }
    
    console.log(`ℹ️ Found ${allMatches.length} total matches in the database.`);
    
    // Log all matches for debugging
    console.log('\n📋 All matches:');
    allMatches.forEach(match => {
      console.log(`  - Match ID: ${match.id}, User ID: ${match.user_id}, Stylist ID: ${match.stylist_id}`);
    });
    
    // Check for self-matches (where user_id === stylist_id)
    const selfMatches = allMatches.filter(match => match.user_id === match.stylist_id);
    
    if (selfMatches.length === 0) {
      console.log('\n✅ No self-matches found!');
    } else {
      console.log(`\n⚠️ Found ${selfMatches.length} self-matches:`);
      selfMatches.forEach(match => {
        console.log(`  - Match ID: ${match.id}, User/Stylist ID: ${match.user_id}, Matched at: ${new Date(match.matched_at).toLocaleString()}`);
      });
      
      console.log('\n💡 To delete these self-matches and add a constraint, run this SQL in your Supabase SQL Editor:');
      console.log('-- Delete self-matches');
      console.log('DELETE FROM matches WHERE user_id = stylist_id;');
      console.log('-- Add constraint to prevent future self-matches');
      console.log('ALTER TABLE matches ADD CONSTRAINT prevent_self_matches CHECK (user_id != stylist_id);');
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

// Run the check
checkForSelfMatches();