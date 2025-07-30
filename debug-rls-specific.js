// Debug RLS issue for specific user ID
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function debugRLSSpecific() {
  try {
    console.log('🔍 DEBUGGING RLS FOR SPECIFIC USER\n')
    
    const targetUserId = 'ef8455c4-6ce7-4a94-bf84-7c1a15abb22f'
    const stylistId = '99333eb6-5e87-4955-9069-e108ca40df75'
    
    console.log(`🎯 Target User ID: ${targetUserId}`)
    console.log(`👨‍💼 Stylist ID: ${stylistId}\n`)
    
    // Test 1: Check current auth status
    console.log('👤 STEP 1: Authentication Status')
    console.log('=================================')
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError) {
      console.log('❌ Auth Error:', authError.message)
      return
    }
    
    if (user) {
      console.log('✅ Authenticated as:', user.email)
      console.log('🆔 User ID:', user.id)
      console.log('🔍 Matches stylist ID?', user.id === stylistId ? '✅ YES' : '❌ NO')
    } else {
      console.log('❌ Not authenticated - this is the problem!')
      console.log('💡 Sign in to your app first, then rerun this test')
      return
    }
    
    // Test 2: Direct query for the specific user profile (should fail with RLS)
    console.log('\n📊 STEP 2: Direct User Profile Query')
    console.log('=====================================')
    try {
      const { data: directProfile, error: directProfileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', targetUserId)
        .single()
      
      if (directProfileError) {
        console.log('❌ Direct profile query failed:', directProfileError.message)
        if (directProfileError.message.includes('policy') || directProfileError.message.includes('RLS')) {
          console.log('💡 This confirms RLS is blocking direct access (expected)')
        }
      } else {
        console.log('✅ Direct profile query succeeded:', directProfile.full_name)
        console.log('⚠️  Unexpected - RLS should block this unless policies are incorrect')
      }
    } catch (err) {
      console.log('❌ Direct profile query error:', err.message)
    }
    
    // Test 3: Check if match exists and is accessible
    console.log('\n🔗 STEP 3: Match Accessibility Check')
    console.log('====================================')
    try {
      const { data: matchCheck, error: matchError } = await supabase
        .from('matches')
        .select('*')
        .eq('stylist_id', user.id)
        .eq('user_id', targetUserId)
        .single()
      
      if (matchError) {
        console.log('❌ Match query failed:', matchError.message)
      } else {
        console.log('✅ Match found and accessible:')
        console.log('   Match ID:', matchCheck.id)
        console.log('   User ID:', matchCheck.user_id)
        console.log('   Stylist ID:', matchCheck.stylist_id)
      }
    } catch (err) {
      console.log('❌ Match query error:', err.message)
    }
    
    // Test 4: Test the RLS policy logic manually
    console.log('\n🔐 STEP 4: RLS Policy Logic Test')
    console.log('=================================')
    
    // This tests if the stylist can see user profiles via the RLS policy
    try {
      const { data: policyTest, error: policyError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', targetUserId)
      
      if (policyError) {
        console.log('❌ RLS policy test failed:', policyError.message)
        console.log('💡 The RLS policy is not working correctly')
        console.log('💡 You need to check/reapply the stylist dashboard RLS policies')
      } else {
        console.log('✅ RLS policy test passed:', policyTest.length, 'profiles found')
        if (policyTest.length > 0) {
          console.log('   Profile name:', policyTest[0].full_name)
        }
      }
    } catch (err) {
      console.log('❌ RLS policy test error:', err.message)
    }
    
    // Test 5: Check user preferences with RLS
    console.log('\n🎯 STEP 5: User Preferences RLS Test')
    console.log('====================================')
    try {
      const { data: prefsTest, error: prefsError } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', targetUserId)
      
      if (prefsError) {
        console.log('❌ User preferences RLS test failed:', prefsError.message)
        console.log('💡 The user_preferences RLS policy is not working correctly')
      } else {
        console.log('✅ User preferences RLS test passed:', prefsTest.length, 'preferences found')
        if (prefsTest.length > 0) {
          const prefs = prefsTest[0]
          console.log('   Gender:', prefs.gender)
          console.log('   Style:', prefs.style_preferences)
          console.log('   Budget:', prefs.budget_range)
        }
      }
    } catch (err) {
      console.log('❌ User preferences RLS test error:', err.message)
    }
    
    // Test 6: Check what RLS policies exist
    console.log('\n📋 STEP 6: RLS Policy Information')
    console.log('==================================')
    console.log('If the tests above failed, you need to reapply RLS policies.')
    console.log('Run this SQL in Supabase Dashboard:')
    console.log('')
    console.log('-- Check existing policies')
    console.log('SELECT schemaname, tablename, policyname, cmd, qual')
    console.log('FROM pg_policies')
    console.log("WHERE tablename IN ('user_profiles', 'user_preferences', 'matches');")
    console.log('')
    console.log('If you see missing policies, rerun the fix-stylist-dashboard-rls.sql script')
    
    // Final diagnosis
    console.log('\n🏁 DIAGNOSIS:')
    console.log('=============')
    if (user.id === stylistId) {
      console.log('✅ Authentication: Correct stylist signed in')
      console.log('🎯 Issue: RLS policies are blocking access to user data')
      console.log('💡 Solution: Reapply the stylist dashboard RLS policies')
      console.log('📄 File: fix-stylist-dashboard-rls.sql')
    } else {
      console.log('❌ Authentication: Wrong user signed in')
      console.log('💡 Solution: Sign in as the correct stylist')
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message)
  }
}

debugRLSSpecific() 