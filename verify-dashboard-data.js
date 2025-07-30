// Script to verify stylist dashboard data
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function verifyDashboardData() {
  try {
    console.log('🔍 Verifying Stylist Dashboard Data...\n')
    
    const stylistId = '99333eb6-5e87-4955-9069-e108ca40df75' // Manish M
    
    // Step 1: Check matches
    console.log('📊 Step 1: Checking matches...')
    const { data: matches, error: matchesError } = await supabase
      .from('matches')
      .select('*')
      .eq('stylist_id', stylistId)
    
    if (matchesError) {
      console.log('❌ Error fetching matches:', matchesError.message)
      return
    }
    
    console.log(`✅ Found ${matches?.length || 0} matches for stylist`)
    if (matches?.length > 0) {
      console.log('   User IDs:', matches.map(m => m.user_id.slice(-6)).join(', '))
    }
    
    // Step 2: Check user profiles
    console.log('\n📋 Step 2: Checking user profiles...')
    if (matches?.length > 0) {
      const userIds = matches.map(m => m.user_id)
      
      const { data: profiles, error: profilesError } = await supabase
        .from('user_profiles')
        .select('user_id, full_name, role')
        .in('user_id', userIds)
      
      if (profilesError) {
        console.log('❌ Error fetching profiles:', profilesError.message)
      } else {
        console.log(`✅ Found ${profiles?.length || 0} user profiles`)
        profiles?.forEach(p => {
          console.log(`   - ${p.full_name} (${p.user_id.slice(-6)})`)
        })
      }
    }
    
    // Step 3: Check user preferences
    console.log('\n🎯 Step 3: Checking user preferences...')
    if (matches?.length > 0) {
      const userIds = matches.map(m => m.user_id)
      
      const { data: preferences, error: prefsError } = await supabase
        .from('user_preferences')
        .select('user_id, gender, clothing_preferences, preferred_occasions, style_preferences, budget_range')
        .in('user_id', userIds)
      
      if (prefsError) {
        console.log('❌ Error fetching preferences:', prefsError.message)
      } else {
        console.log(`✅ Found ${preferences?.length || 0} user preferences`)
        preferences?.forEach(p => {
          console.log(`   - User ${p.user_id.slice(-6)}:`)
          console.log(`     Gender: ${p.gender || 'Not set'}`)
          console.log(`     Style: ${p.style_preferences || 'Not set'}`)
          console.log(`     Budget: ${p.budget_range || 'Not set'}`)
          console.log(`     Clothing: ${p.clothing_preferences?.join(', ') || 'Not set'}`)
          console.log(`     Occasions: ${p.preferred_occasions?.join(', ') || 'Not set'}`)
        })
      }
    }
    
    // Step 4: Test the actual dashboard query
    console.log('\n🔧 Step 4: Testing dashboard query...')
    
    // This mimics the getMatchedUsers function
    const { data: matchesData, error: dashboardError } = await supabase
      .from('matches')
      .select('id, user_id, stylist_id, matched_at')
      .eq('stylist_id', stylistId)
      .order('matched_at', { ascending: false })
    
    if (dashboardError) {
      console.log('❌ Dashboard query error:', dashboardError.message)
      return
    }
    
    console.log(`✅ Dashboard query successful - ${matchesData?.length || 0} matches`)
    
    if (matchesData?.length > 0) {
      // Test enriching with user data
      const userIds = matchesData.map(m => m.user_id)
      
      const { data: userProfiles } = await supabase
        .from('user_profiles')
        .select('user_id, full_name, role, bio')
        .in('user_id', userIds)
      
      const { data: userPreferences } = await supabase
        .from('user_preferences')
        .select('user_id, gender, clothing_preferences, preferred_occasions, style_preferences, budget_range')
        .in('user_id', userIds)
      
      console.log('\n📱 Dashboard will show:')
      matchesData.forEach(match => {
        const profile = userProfiles?.find(p => p.user_id === match.user_id)
        const prefs = userPreferences?.find(p => p.user_id === match.user_id)
        
        console.log(`\n   👤 ${profile?.full_name || 'Anonymous User'}`)
        console.log(`      📅 Matched: ${new Date(match.matched_at).toLocaleDateString()}`)
        
        if (prefs && (prefs.gender || prefs.style_preferences || prefs.budget_range || 
                     prefs.clothing_preferences?.length > 0 || prefs.preferred_occasions?.length > 0)) {
          console.log('      🎯 Preferences:')
          if (prefs.gender) console.log(`         Gender: ${prefs.gender}`)
          if (prefs.style_preferences) console.log(`         Style: ${prefs.style_preferences}`)
          if (prefs.budget_range) console.log(`         Budget: ${prefs.budget_range}`)
          if (prefs.clothing_preferences?.length > 0) console.log(`         Clothing: ${prefs.clothing_preferences.join(', ')}`)
          if (prefs.preferred_occasions?.length > 0) console.log(`         Occasions: ${prefs.preferred_occasions.join(', ')}`)
        } else {
          console.log('      ⚠️  No styling preferences set')
        }
      })
    }
    
    console.log('\n🎉 Verification completed!')
    
    if (matches?.length === 0) {
      console.log('\n💡 To fix the dashboard:')
      console.log('1. Run the create-test-data.sql script in your Supabase dashboard')
      console.log('2. Or create real matches by having users swipe on stylists')
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message)
  }
}

verifyDashboardData() 