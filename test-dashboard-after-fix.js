// Test dashboard after RLS fix
// This script simulates what happens when an authenticated stylist accesses the dashboard

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testDashboardAfterFix() {
  try {
    console.log('🔍 Testing Dashboard After RLS Fix...\n')
    
    // Note: This test will still show limited results because we're not authenticated
    // But it will help verify the policies are in place
    
    console.log('📋 Current Status:')
    console.log('   ⚠️  Running without authentication (anonymous access)')
    console.log('   ✅ Will test what data is accessible')
    console.log('   🎯 Real test requires signing in as stylist in the app\n')
    
    // Test 1: Check if RLS policies exist
    console.log('🔐 Test 1: Checking RLS policies...')
    
    try {
      // This query tests if the policies allow some level of access
      const { data: matchData, error: matchError } = await supabase
        .from('matches')
        .select('id')
        .limit(1)
      
      if (matchError) {
        if (matchError.message.includes('policy')) {
          console.log('   ✅ RLS policies are active (expected for anonymous access)')
        } else {
          console.log('   ❌ Unexpected error:', matchError.message)
        }
      } else {
        console.log('   ⚠️  Unexpected: Got data without authentication')
      }
    } catch (err) {
      console.log('   ❌ Error:', err.message)
    }
    
    // Test 2: Explain what should happen when stylist signs in
    console.log('\n✅ What should happen after fix:')
    console.log(`
🚀 EXPECTED FLOW AFTER APPLYING THE FIX:

1️⃣ Apply RLS Fix:
   - Run fix-stylist-dashboard-rls.sql in Supabase SQL Editor
   - This adds policies allowing stylists to see matched user data

2️⃣ Sign in as Stylist:
   - Email: (stylist account email)
   - The auth.uid() will match the stylist_id in matches table

3️⃣ Dashboard Will Show:
   👤 User abb22f (or the user from your matches table)
   📅 Matched: [match date]
   🎯 Preferences:
      Gender: [from user_preferences.gender]
      Style: [from user_preferences.style_preferences]  
      Budget: [from user_preferences.budget_range]
      Clothing: [from user_preferences.clothing_preferences]
      Occasions: [from user_preferences.preferred_occasions]

📝 TROUBLESHOOTING:
   ❌ Still shows "No matches"? 
      → Check if you're signed in as the correct stylist user
      → Verify stylist_id in matches table matches your auth user ID
   
   ❌ Shows "No styling preferences"?
      → Check if user_id in matches exists in user_preferences table
      → Verify RLS policies were applied correctly
    `)
    
    console.log('\n💡 IMMEDIATE NEXT STEPS:')
    console.log('   1. Copy fix-stylist-dashboard-rls.sql content')
    console.log('   2. Paste in Supabase Dashboard → SQL Editor')
    console.log('   3. Execute the SQL')
    console.log('   4. Sign in to your app as stylist "Manish M"')
    console.log('   5. Navigate to /stylist-dashboard')
    console.log('   6. You should now see the matched user with preferences!')
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message)
  }
}

testDashboardAfterFix() 