// Comprehensive debug script for stylist dashboard
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function debugDashboardDetailed() {
  try {
    console.log('🔍 COMPREHENSIVE STYLIST DASHBOARD DEBUG\n')
    
    // Step 1: Show all data in each table (raw data inspection)
    console.log('📊 STEP 1: RAW DATA INSPECTION')
    console.log('================================\n')
    
    // Get all matches
    console.log('🔗 ALL MATCHES:')
    const { data: allMatches, error: matchesError } = await supabase
      .from('matches')
      .select('*')
    
    if (matchesError) {
      console.log('❌ Error fetching matches:', matchesError.message)
    } else {
      console.log(`✅ Found ${allMatches?.length || 0} matches`)
      allMatches?.forEach((match, i) => {
        console.log(`   ${i+1}. Match ID: ${match.id}`)
        console.log(`      User ID: ${match.user_id}`)
        console.log(`      Stylist ID: ${match.stylist_id}`)
        console.log(`      Matched At: ${match.matched_at}`)
      })
    }
    
    // Get all user profiles
    console.log('\n👤 ALL USER PROFILES:')
    const { data: allProfiles, error: profilesError } = await supabase
      .from('user_profiles')
      .select('*')
    
    if (profilesError) {
      console.log('❌ Error fetching profiles:', profilesError.message)
    } else {
      console.log(`✅ Found ${allProfiles?.length || 0} profiles`)
      allProfiles?.forEach((profile, i) => {
        console.log(`   ${i+1}. Profile ID: ${profile.id}`)
        console.log(`      User ID: ${profile.user_id}`)
        console.log(`      Full Name: "${profile.full_name}"`)
        console.log(`      Role: ${profile.role}`)
      })
    }
    
    // Get all user preferences
    console.log('\n🎯 ALL USER PREFERENCES:')
    const { data: allPrefs, error: prefsError } = await supabase
      .from('user_preferences')
      .select('*')
    
    if (prefsError) {
      console.log('❌ Error fetching preferences:', prefsError.message)
    } else {
      console.log(`✅ Found ${allPrefs?.length || 0} preferences`)
      allPrefs?.forEach((pref, i) => {
        console.log(`   ${i+1}. Preference ID: ${pref.id}`)
        console.log(`      User ID: ${pref.user_id}`)
        console.log(`      Gender: ${pref.gender}`)
        console.log(`      Style: ${pref.style_preferences}`)
        console.log(`      Budget: ${pref.budget_range}`)
        console.log(`      Clothing: ${JSON.stringify(pref.clothing_preferences)}`)
        console.log(`      Occasions: ${JSON.stringify(pref.preferred_occasions)}`)
      })
    }
    
    // Step 2: Test the exact getMatchedUsers function logic
    console.log('\n🔧 STEP 2: SIMULATING getMatchedUsers() FUNCTION')
    console.log('===============================================\n')
    
    if (allMatches?.length > 0) {
      // Get unique stylist IDs
      const stylistIds = [...new Set(allMatches.map(m => m.stylist_id))]
      
      for (const stylistId of stylistIds) {
        console.log(`🎯 Testing for Stylist ID: ${stylistId}`)
        
        // Step 2a: Get matches for this stylist
        console.log('   Step 2a: Getting matches...')
        const matchesForStylist = allMatches.filter(m => m.stylist_id === stylistId)
        console.log(`   ✅ Found ${matchesForStylist.length} matches for this stylist`)
        
        if (matchesForStylist.length > 0) {
          const userIds = matchesForStylist.map(m => m.user_id)
          console.log(`   📋 User IDs to look up: ${userIds.map(id => id.slice(-6)).join(', ')}`)
          
          // Step 2b: Get user profiles for these user IDs
          console.log('\n   Step 2b: Getting user profiles...')
          const profilesForUsers = allProfiles?.filter(p => userIds.includes(p.user_id)) || []
          console.log(`   ✅ Found ${profilesForUsers.length} profiles for these users`)
          
          profilesForUsers.forEach(profile => {
            console.log(`      - User ${profile.user_id.slice(-6)}: "${profile.full_name}"`)
          })
          
          // Step 2c: Get user preferences for these user IDs
          console.log('\n   Step 2c: Getting user preferences...')
          const prefsForUsers = allPrefs?.filter(p => userIds.includes(p.user_id)) || []
          console.log(`   ✅ Found ${prefsForUsers.length} preferences for these users`)
          
          prefsForUsers.forEach(pref => {
            console.log(`      - User ${pref.user_id.slice(-6)}: Gender=${pref.gender}, Style=${pref.style_preferences}`)
          })
          
          // Step 2d: Combine data (simulate the dashboard logic)
          console.log('\n   Step 2d: Combining data for dashboard display...')
          
          matchesForStylist.forEach((match, i) => {
            console.log(`\n   📱 Match ${i+1} - Dashboard Display:`)
            console.log(`      Match User ID: ${match.user_id}`)
            
            // Find profile
            const userProfile = profilesForUsers.find(p => p.user_id === match.user_id)
            const userName = userProfile?.full_name || `User ${match.user_id.slice(-6)}`
            console.log(`      👤 Display Name: "${userName}"`)
            
            // Find preferences
            const userPrefs = prefsForUsers.find(p => p.user_id === match.user_id)
            console.log(`      🎯 Preferences Found: ${userPrefs ? 'YES' : 'NO'}`)
            
            if (userPrefs) {
              const hasAnyPrefs = userPrefs.gender || userPrefs.style_preferences || userPrefs.budget_range || 
                                 (userPrefs.clothing_preferences && userPrefs.clothing_preferences.length > 0) ||
                                 (userPrefs.preferred_occasions && userPrefs.preferred_occasions.length > 0)
              
              console.log(`      📊 Has Any Preference Data: ${hasAnyPrefs ? 'YES' : 'NO'}`)
              
              if (hasAnyPrefs) {
                console.log(`         Gender: ${userPrefs.gender || 'Not set'}`)
                console.log(`         Style: ${userPrefs.style_preferences || 'Not set'}`)
                console.log(`         Budget: ${userPrefs.budget_range || 'Not set'}`)
                console.log(`         Clothing: ${userPrefs.clothing_preferences || []}`)
                console.log(`         Occasions: ${userPrefs.preferred_occasions || []}`)
              } else {
                console.log(`         ⚠️  All preference fields are empty/null`)
              }
            } else {
              console.log(`      ❌ No preferences record found for this user`)
            }
          })
        }
      }
    }
    
    // Step 3: Check for common issues
    console.log('\n🔍 STEP 3: ISSUE ANALYSIS')
    console.log('=========================\n')
    
    let issuesFound = []
    
    // Check 1: Do we have matches?
    if (!allMatches || allMatches.length === 0) {
      issuesFound.push('❌ No matches found in database')
    }
    
    // Check 2: Do matched users have profiles?
    if (allMatches?.length > 0) {
      const matchedUserIds = allMatches.map(m => m.user_id)
      const profilesForMatched = allProfiles?.filter(p => matchedUserIds.includes(p.user_id)) || []
      
      if (profilesForMatched.length === 0) {
        issuesFound.push('❌ No user profiles found for matched users')
      } else if (profilesForMatched.length < matchedUserIds.length) {
        issuesFound.push(`⚠️  Only ${profilesForMatched.length}/${matchedUserIds.length} matched users have profiles`)
      }
      
      // Check for empty names
      const emptyNames = profilesForMatched.filter(p => !p.full_name || p.full_name.trim() === '')
      if (emptyNames.length > 0) {
        issuesFound.push(`⚠️  ${emptyNames.length} user profiles have empty/null names`)
      }
    }
    
    // Check 3: Do matched users have preferences?
    if (allMatches?.length > 0) {
      const matchedUserIds = allMatches.map(m => m.user_id)
      const prefsForMatched = allPrefs?.filter(p => matchedUserIds.includes(p.user_id)) || []
      
      if (prefsForMatched.length === 0) {
        issuesFound.push('❌ No user preferences found for matched users')
      } else if (prefsForMatched.length < matchedUserIds.length) {
        issuesFound.push(`⚠️  Only ${prefsForMatched.length}/${matchedUserIds.length} matched users have preferences`)
      }
      
      // Check for empty preferences
      const emptyPrefs = prefsForMatched.filter(p => 
        !p.gender && !p.style_preferences && !p.budget_range && 
        (!p.clothing_preferences || p.clothing_preferences.length === 0) &&
        (!p.preferred_occasions || p.preferred_occasions.length === 0)
      )
      if (emptyPrefs.length > 0) {
        issuesFound.push(`⚠️  ${emptyPrefs.length} users have completely empty preferences`)
      }
    }
    
    if (issuesFound.length > 0) {
      console.log('🚨 ISSUES FOUND:')
      issuesFound.forEach(issue => console.log(`   ${issue}`))
    } else {
      console.log('✅ No obvious data issues found')
    }
    
    console.log('\n💡 NEXT STEPS:')
    if (allMatches?.length === 0) {
      console.log('   1. Create test matches using the create-test-data.sql script')
      console.log('   2. Or have real users swipe on stylists')
    } else {
      console.log('   1. Check if you\'re signed in as the correct stylist in the app')
      console.log('   2. Verify the RLS policies were applied correctly')
      console.log('   3. Check browser console for any JavaScript errors')
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message)
  }
}

debugDashboardDetailed() 