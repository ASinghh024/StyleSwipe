// Script to delete matches where stylists are matched with themselves
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function deleteSelfMatches() {
  try {
    console.log('🔍 Checking for self-matches (where user_id = stylist_id)...')
    
    // Get all matches
    const { data: allMatches, error: fetchError } = await supabase
      .from('matches')
      .select('id, user_id, stylist_id, matched_at')
    
    if (fetchError) {
      console.error('❌ Error fetching matches:', fetchError.message)
      return
    }
    
    if (!allMatches || allMatches.length === 0) {
      console.log('ℹ️ No matches found in the database.')
      return
    }
    
    console.log(`ℹ️ Found ${allMatches.length} total matches in the database.`)
    
    // Filter for self-matches (where user_id === stylist_id)
    const selfMatches = allMatches.filter(match => match.user_id === match.stylist_id)
    
    if (selfMatches.length === 0) {
      console.log('✅ No self-matches found!')
      return
    }
    
    console.log(`⚠️ Found ${selfMatches.length} self-matches:`)
    selfMatches.forEach(match => {
      console.log(`  - Match ID: ${match.id}, User/Stylist ID: ${match.user_id}, Matched at: ${new Date(match.matched_at).toLocaleString()}`)
    })
    
    // Delete each self-match individually
    console.log('🗑️ Deleting self-matches one by one...')
    
    let deleteCount = 0
    for (const match of selfMatches) {
      const { error: deleteError } = await supabase
        .from('matches')
        .delete()
        .eq('id', match.id)
      
      if (deleteError) {
        console.error(`❌ Error deleting match ${match.id}:`, deleteError.message)
      } else {
        deleteCount++
      }
    }
    
    console.log(`✅ Successfully deleted ${deleteCount} out of ${selfMatches.length} self-matches!`)
    
    // Suggest adding a constraint
    console.log('\n💡 To prevent future self-matches, run the following SQL in your Supabase SQL Editor:')
    console.log('ALTER TABLE matches ADD CONSTRAINT prevent_self_matches CHECK (user_id != stylist_id);')
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message)
  }
}

// Run the function
deleteSelfMatches()