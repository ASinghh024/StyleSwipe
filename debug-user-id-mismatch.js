// Debug script to find user ID mismatches
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function debugUserIdMismatch() {
  try {
    console.log('🔍 Debugging User ID Mismatches...\n')
    
    // Step 1: Get ALL matches with full details
    console.log('📊 Step 1: ALL matches in database...')
    const { data: allMatches, error: matchesError } = await supabase
      .from('matches')
      .select('*')
    
    if (matchesError) {
      console.log('❌ Error fetching matches:', matchesError.message)
      return
    }
    
    console.log(`✅ Found ${allMatches?.length || 0} total matches`)
    allMatches?.forEach((match, index) => {
      console.log(`   ${index + 1}. Match ID: ${match.id}`)
      console.log(`      User ID: ${match.user_id}`)
      console.log(`      Stylist ID: ${match.stylist_id}`)
      console.log(`      Matched At: ${match.matched_at}`)
    })
    
    // Step 2: Get ALL user_preferences
    console.log('\n🎯 Step 2: ALL user preferences in database...')
    const { data: allPreferences, error: prefsError } = await supabase
      .from('user_preferences')
      .select('*')
    
    if (prefsError) {
      console.log('❌ Error fetching preferences:', prefsError.message)
      return
    }
    
    console.log(`✅ Found ${allPreferences?.length || 0} user preferences`)
    allPreferences?.forEach((pref, index) => {
      console.log(`   ${index + 1}. User ID: ${pref.user_id}`)
      console.log(`      Gender: ${pref.gender || 'Not set'}`)
      console.log(`      Style: ${pref.style_preferences || 'Not set'}`)
      console.log(`      Budget: ${pref.budget_range || 'Not set'}`)
      console.log(`      Clothing: ${pref.clothing_preferences || []}`)
      console.log(`      Occasions: ${pref.preferred_occasions || []}`)
    })
    
    // Step 3: Get ALL user_profiles
    console.log('\n👤 Step 3: ALL user profiles in database...')
    const { data: allProfiles, error: profilesError } = await supabase
      .from('user_profiles')
      .select('*')
    
    if (profilesError) {
      console.log('❌ Error fetching profiles:', profilesError.message)
      return
    }
    
    console.log(`✅ Found ${allProfiles?.length || 0} user profiles`)
    allProfiles?.forEach((profile, index) => {
      console.log(`   ${index + 1}. User ID: ${profile.user_id}`)
      console.log(`      Name: ${profile.full_name || 'No name'}`)
      console.log(`      Role: ${profile.role}`)
    })
    
    // Step 4: Cross-reference the IDs
    console.log('\n🔍 Step 4: Cross-referencing User IDs...')
    
    if (allMatches?.length > 0) {
      allMatches.forEach((match, index) => {
        console.log(`\n   Match ${index + 1} Analysis:`)
        console.log(`   Match User ID: ${match.user_id}`)
        console.log(`   Match Stylist ID: ${match.stylist_id}`)
        
        // Check if user_id exists in user_preferences
        const hasPreferences = allPreferences?.find(p => p.user_id === match.user_id)
        console.log(`   ✓ Has Preferences: ${hasPreferences ? 'YES' : 'NO'}`)
        
        // Check if user_id exists in user_profiles  
        const hasProfile = allProfiles?.find(p => p.user_id === match.user_id)
        console.log(`   ✓ Has Profile: ${hasProfile ? 'YES' : 'NO'}`)
        if (hasProfile) {
          console.log(`   ✓ Profile Name: ${hasProfile.full_name || 'No name'}`)
        }
        
        // Check if stylist_id exists as a stylist in user_profiles
        const stylistProfile = allProfiles?.find(p => p.user_id === match.stylist_id && p.role === 'stylist')
        console.log(`   ✓ Stylist Profile: ${stylistProfile ? 'YES' : 'NO'}`)
        if (stylistProfile) {
          console.log(`   ✓ Stylist Name: ${stylistProfile.full_name || 'No name'}`)
        }
      })
    }
    
    // Step 5: Test the exact query used by the dashboard
    console.log('\n🔧 Step 5: Testing dashboard query with actual stylist IDs...')
    
    // Get all stylist IDs from profiles
    const stylistProfiles = allProfiles?.filter(p => p.role === 'stylist') || []
    console.log(`Found ${stylistProfiles.length} stylists in user_profiles:`)
    stylistProfiles.forEach(s => {
      console.log(`   - ${s.full_name} (ID: ${s.user_id})`)
    })
    
    // Test query for each stylist
    for (const stylist of stylistProfiles) {
      console.log(`\n   Testing dashboard query for stylist: ${stylist.full_name} (${stylist.user_id})`)
      
      const { data: stylistMatches, error: queryError } = await supabase
        .from('matches')
        .select('id, user_id, stylist_id, matched_at')
        .eq('stylist_id', stylist.user_id)
        .order('matched_at', { ascending: false })
      
      if (queryError) {
        console.log(`   ❌ Query error: ${queryError.message}`)
      } else {
        console.log(`   ✅ Query successful: ${stylistMatches?.length || 0} matches found`)
        if (stylistMatches?.length > 0) {
          stylistMatches.forEach(m => {
            console.log(`      - User ${m.user_id} matched at ${m.matched_at}`)
          })
        }
      }
    }
    
    console.log('\n🎉 Debug completed!')
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message)
  }
}

debugUserIdMismatch() 