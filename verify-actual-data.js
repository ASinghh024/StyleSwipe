// Verify actual data using service role (bypasses RLS)
// This will show us the real data and help identify user ID mismatches

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY // Add this to your .env.local

// Create client with service role (bypasses RLS)
const supabaseAdmin = supabaseServiceKey ? 
  createClient(supabaseUrl, supabaseServiceKey) :
  null

async function verifyActualData() {
  try {
    console.log('🔍 VERIFYING ACTUAL DATA (Service Role Access)\n')
    
    if (!supabaseAdmin) {
      console.log('⚠️  SERVICE ROLE KEY NOT FOUND')
      console.log('   Add SUPABASE_SERVICE_ROLE_KEY to your .env.local file')
      console.log('   Get it from: Supabase Dashboard → Settings → API → service_role key')
      console.log('\n📋 Alternative: Manual verification steps below...\n')
      
      console.log('🔧 MANUAL VERIFICATION STEPS:')
      console.log('=============================\n')
      
      console.log('1️⃣ Check Matches Table:')
      console.log('   - Go to Supabase Dashboard → Table Editor → matches')
      console.log('   - Note down the exact user_id and stylist_id values')
      console.log('   - Screenshot the table if needed\n')
      
      console.log('2️⃣ Check User Profiles Table:')
      console.log('   - Go to Supabase Dashboard → Table Editor → user_profiles')
      console.log('   - Find the user_id that matches the user_id from matches table')
      console.log('   - Note the full_name value\n')
      
      console.log('3️⃣ Check User Preferences Table:')
      console.log('   - Go to Supabase Dashboard → Table Editor → user_preferences')
      console.log('   - Find the user_id that matches the user_id from matches table')
      console.log('   - Note the preference values\n')
      
      console.log('4️⃣ Check Authentication:')
      console.log('   - Sign in to your app as the stylist')
      console.log('   - Open browser dev tools → Console')
      console.log('   - Run: supabase.auth.getUser().then(console.log)')
      console.log('   - Note the user ID and compare with stylist_id in matches table\n')
      
      return
    }
    
    console.log('✅ Service role access available - bypassing RLS...\n')
    
    // Get ALL data using service role (bypasses RLS)
    console.log('📊 STEP 1: REAL DATA (Service Role)')
    console.log('==================================\n')
    
    // Get all matches
    console.log('🔗 ALL MATCHES (Real Data):')
    const { data: realMatches, error: matchesError } = await supabaseAdmin
      .from('matches')
      .select('*')
    
    if (matchesError) {
      console.log('❌ Error:', matchesError.message)
    } else {
      console.log(`✅ Found ${realMatches?.length || 0} real matches`)
      realMatches?.forEach((match, i) => {
        console.log(`   ${i+1}. Match ID: ${match.id}`)
        console.log(`      User ID: ${match.user_id}`)
        console.log(`      Stylist ID: ${match.stylist_id}`)
        console.log(`      Matched At: ${match.matched_at}`)
      })
    }
    
    // Get all user profiles
    console.log('\n👤 ALL USER PROFILES (Real Data):')
    const { data: realProfiles, error: profilesError } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
    
    if (profilesError) {
      console.log('❌ Error:', profilesError.message)
    } else {
      console.log(`✅ Found ${realProfiles?.length || 0} real profiles`)
      realProfiles?.forEach((profile, i) => {
        console.log(`   ${i+1}. User ID: ${profile.user_id}`)
        console.log(`      Full Name: "${profile.full_name}"`)
        console.log(`      Role: ${profile.role}`)
      })
    }
    
    // Get all user preferences
    console.log('\n🎯 ALL USER PREFERENCES (Real Data):')
    const { data: realPrefs, error: prefsError } = await supabaseAdmin
      .from('user_preferences')
      .select('*')
    
    if (prefsError) {
      console.log('❌ Error:', prefsError.message)
    } else {
      console.log(`✅ Found ${realPrefs?.length || 0} real preferences`)
      realPrefs?.forEach((pref, i) => {
        console.log(`   ${i+1}. User ID: ${pref.user_id}`)
        console.log(`      Gender: ${pref.gender}`)
        console.log(`      Style: ${pref.style_preferences}`)
        console.log(`      Budget: ${pref.budget_range}`)
        console.log(`      Clothing: ${JSON.stringify(pref.clothing_preferences)}`)
        console.log(`      Occasions: ${JSON.stringify(pref.preferred_occasions)}`)
      })
    }
    
    // Analyze the data
    console.log('\n🔍 STEP 2: DATA ANALYSIS')
    console.log('========================\n')
    
    if (realMatches?.length > 0) {
      realMatches.forEach((match, i) => {
        console.log(`🎯 Match ${i+1} Analysis:`)
        console.log(`   Match User ID: ${match.user_id}`)
        console.log(`   Match Stylist ID: ${match.stylist_id}`)
        
        // Find user profile
        const userProfile = realProfiles?.find(p => p.user_id === match.user_id)
        console.log(`   ✓ User Profile Found: ${userProfile ? 'YES' : 'NO'}`)
        if (userProfile) {
          console.log(`   ✓ User Name: "${userProfile.full_name}"`)
        }
        
        // Find user preferences
        const userPrefs = realPrefs?.find(p => p.user_id === match.user_id)
        console.log(`   ✓ User Preferences Found: ${userPrefs ? 'YES' : 'NO'}`)
        if (userPrefs) {
          const hasData = userPrefs.gender || userPrefs.style_preferences || userPrefs.budget_range
          console.log(`   ✓ Has Preference Data: ${hasData ? 'YES' : 'NO'}`)
        }
        
        // Find stylist profile
        const stylistProfile = realProfiles?.find(p => p.user_id === match.stylist_id && p.role === 'stylist')
        console.log(`   ✓ Stylist Profile Found: ${stylistProfile ? 'YES' : 'NO'}`)
        if (stylistProfile) {
          console.log(`   ✓ Stylist Name: "${stylistProfile.full_name}"`)
        }
        console.log('')
      })
      
      console.log('💡 SOLUTIONS BASED ON REAL DATA:')
      console.log('=================================\n')
      
      // Check for ID mismatches
      const matchedUserIds = realMatches.map(m => m.user_id)
      const profileUserIds = realProfiles?.map(p => p.user_id) || []
      const prefsUserIds = realPrefs?.map(p => p.user_id) || []
      
      const missingProfiles = matchedUserIds.filter(id => !profileUserIds.includes(id))
      const missingPrefs = matchedUserIds.filter(id => !prefsUserIds.includes(id))
      
      if (missingProfiles.length > 0) {
        console.log(`❌ ISSUE: ${missingProfiles.length} matched users missing profiles`)
        console.log(`   Missing profile user IDs: ${missingProfiles.map(id => id.slice(-6)).join(', ')}`)
        console.log('   FIX: Create user_profiles records for these user IDs\n')
      }
      
      if (missingPrefs.length > 0) {
        console.log(`❌ ISSUE: ${missingPrefs.length} matched users missing preferences`)
        console.log(`   Missing preferences user IDs: ${missingPrefs.map(id => id.slice(-6)).join(', ')}`)
        console.log('   FIX: Create user_preferences records for these user IDs\n')
      }
      
      console.log('🔧 AUTHENTICATION CHECK:')
      console.log('   1. Sign in to your app as the stylist')
      console.log(`   2. Your auth.uid() should be: ${realMatches[0]?.stylist_id}`)
      console.log('   3. Check browser console for auth errors')
      console.log('   4. Verify RLS policies were applied correctly\n')
      
    } else {
      console.log('❌ No matches found - you need to create test data first')
      console.log('   Run the create-test-data.sql script in Supabase\n')
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message)
  }
}

verifyActualData() 