// Debug script to diagnose profile save issues
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function debugProfileSave() {
  try {
    console.log('🔍 Debugging Profile Save Issues...')
    
    // Step 1: Check if user_preferences table exists and has correct structure
    console.log('\n📋 Step 1: Checking user_preferences table structure...')
    const { data: tableInfo, error: tableError } = await supabase
      .from('user_preferences')
      .select('*')
      .limit(1)
    
    if (tableError) {
      console.log('❌ Error accessing user_preferences table:', tableError.message)
      console.log('This might indicate the table doesn\'t exist or RLS issues')
      return
    }
    
    console.log('✅ user_preferences table accessible')
    
    // Step 2: Check if user_profiles table has the new columns
    console.log('\n📋 Step 2: Checking user_profiles table structure...')
    const { data: profileInfo, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .limit(1)
    
    if (profileError) {
      console.log('❌ Error accessing user_profiles table:', profileError.message)
      return
    }
    
    console.log('✅ user_profiles table accessible')
    if (profileInfo && profileInfo.length > 0) {
      const sample = profileInfo[0]
      console.log('Sample profile columns:')
      console.log('- clothing_preferences:', sample.clothing_preferences)
      console.log('- preferred_occasions:', sample.preferred_occasions)
      console.log('- style_preferences:', sample.style_preferences)
      console.log('- budget_range:', sample.budget_range)
      console.log('- size_preferences:', sample.size_preferences)
      console.log('- color_preferences:', sample.color_preferences)
    }
    
    // Step 3: Test creating a user and preferences
    console.log('\n📝 Step 3: Testing user creation and preferences...')
    const timestamp = Date.now().toString().slice(-4)
    const testEmail = `debugtest${timestamp}@gmail.com`
    const testPassword = 'testpassword123'
    const testFullName = 'Debug Test User'
    const testRole = 'user'
    
    console.log(`Creating test user with email: ${testEmail}`)
    
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          full_name: testFullName,
          role: testRole
        }
      }
    })
    
    if (signUpError) {
      console.log('❌ Sign up error:', signUpError.message)
      return
    }
    
    console.log('✅ Test user created:', signUpData.user?.id)
    
    // Step 4: Wait for triggers and check if preferences were created
    console.log('\n🔍 Step 4: Checking if preferences were created by trigger...')
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    const { data: autoPreferences, error: autoPrefError } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', signUpData.user?.id)
      .single()
    
    if (autoPrefError && autoPrefError.code === 'PGRST116') {
      console.log('❌ No preferences found - trigger is NOT working')
      console.log('This is likely the main issue!')
    } else if (autoPrefError) {
      console.log('❌ Error checking auto-created preferences:', autoPrefError.message)
    } else if (autoPreferences) {
      console.log('✅ Preferences created automatically by trigger:', autoPreferences)
    }
    
    // Step 5: Test manual preferences creation
    console.log('\n🔧 Step 5: Testing manual preferences creation...')
    const testPreferences = {
      user_id: signUpData.user?.id,
      full_name: testFullName,
      clothing_preferences: ['Casual', 'Business'],
      preferred_occasions: ['Work', 'Casual'],
      style_preferences: 'Minimalist',
      budget_range: 'Mid-range',
      size_preferences: 'M',
      color_preferences: ['Black', 'White', 'Blue'],
      fit_preferences: ['Fitted', 'Relaxed'],
      fabric_preferences: ['Cotton', 'Denim'],
      brand_preferences: ['Nike', 'Zara'],
      seasonal_preferences: ['Spring', 'Summer'],
      profile_completed: true
    }
    
    console.log('Attempting to insert preferences:', testPreferences)
    
    const { data: insertData, error: insertError } = await supabase
      .from('user_preferences')
      .insert(testPreferences)
      .select()
    
    if (insertError) {
      console.log('❌ Error inserting preferences:', insertError.message)
      console.log('Error details:', insertError)
      console.log('This is likely an RLS policy issue')
    } else {
      console.log('✅ Preferences inserted successfully:', insertData)
    }
    
    // Step 6: Test updating existing preferences
    console.log('\n🔄 Step 6: Testing preferences update...')
    if (autoPreferences || insertData) {
      const updateData = {
        full_name: 'Updated Test User',
        clothing_preferences: ['Casual', 'Formal'],
        style_preferences: 'Classic',
        profile_completed: true
      }
      
      const { data: updateResult, error: updateError } = await supabase
        .from('user_preferences')
        .update(updateData)
        .eq('user_id', signUpData.user?.id)
        .select()
      
      if (updateError) {
        console.log('❌ Error updating preferences:', updateError.message)
        console.log('Error details:', updateError)
      } else {
        console.log('✅ Preferences updated successfully:', updateResult)
      }
    }
    
    // Step 7: Check RLS policies
    console.log('\n🔒 Step 7: Checking RLS policies...')
    console.log('Note: RLS policies can only be checked via SQL editor')
    console.log('Run this in your Supabase SQL editor:')
    console.log(`
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE schemaname = 'public' AND tablename IN ('user_preferences', 'user_profiles');
    `)
    
    console.log('\n📊 Summary:')
    console.log(`- Test user created: ${signUpData.user?.id}`)
    console.log(`- Preferences auto-created: ${autoPreferences ? 'Yes' : 'No'}`)
    console.log(`- Manual insert worked: ${insertError ? 'No' : 'Yes'}`)
    console.log(`- Update worked: ${updateError ? 'No' : 'Yes'}`)
    
    if (!autoPreferences && insertError) {
      console.log('\n🔧 LIKELY SOLUTIONS:')
      console.log('1. Run the user-profile-setup.sql script in your Supabase SQL editor')
      console.log('2. Check that RLS policies are correctly configured')
      console.log('3. Verify the user_preferences table exists with correct structure')
      console.log('4. Ensure triggers are working properly')
    }
    
  } catch (error) {
    console.log('❌ Debug error:', error.message)
    console.log('Full error:', error)
  }
}

debugProfileSave() 