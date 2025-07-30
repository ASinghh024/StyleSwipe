const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function fixSignupError() {
  console.log('🔧 Fixing signup error')
  console.log('======================')

  try {
    // Step 1: Check if the handle_new_user function is working correctly
    console.log('\n📋 Step 1: Testing user creation...')
    
    const timestamp = Date.now().toString().slice(-4)
    const testEmail = `testfix${timestamp}@example.com`
    const testPassword = 'testpassword123'
    const testFullName = 'Test Fix User'
    
    console.log(`Creating test user with email: ${testEmail}`)
    
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          full_name: testFullName,
          role: 'user'
        }
      }
    })
    
    if (signUpError) {
      console.log('❌ Sign up error:', signUpError.message)
      return
    }
    
    console.log('✅ Test user created:', signUpData.user?.id)
    
    // Step 2: Wait for triggers and check if user_profile was created
    console.log('\n🔍 Step 2: Checking if user_profile was created...')
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', signUpData.user?.id)
      .single()
    
    if (profileError) {
      console.log('❌ Error fetching user profile:', profileError.message)
      console.log('Creating user profile manually...')
      
      const { error: createProfileError } = await supabase
        .from('user_profiles')
        .insert({
          user_id: signUpData.user?.id,
          full_name: testFullName,
          role: 'user'
        })
      
      if (createProfileError) {
        console.log('❌ Error creating user profile:', createProfileError.message)
      } else {
        console.log('✅ User profile created manually')
      }
    } else {
      console.log('✅ User profile was created automatically:', userProfile.id)
    }
    
    // Step 3: Check if user_preferences was created
    console.log('\n🔍 Step 3: Checking if user_preferences was created...')
    
    const { data: userPreferences, error: preferencesError } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', signUpData.user?.id)
      .single()
    
    if (preferencesError) {
      console.log('❌ Error fetching user preferences:', preferencesError.message)
      console.log('Creating user preferences manually...')
      
      const { error: createPreferencesError } = await supabase
        .from('user_preferences')
        .insert({
          user_id: signUpData.user?.id
        })
      
      if (createPreferencesError) {
        console.log('❌ Error creating user preferences:', createPreferencesError.message)
      } else {
        console.log('✅ User preferences created manually')
      }
    } else {
      console.log('✅ User preferences was created automatically:', userPreferences.id)
    }
    
    // Step 4: Check if gender column exists in user_preferences
    console.log('\n🔍 Step 4: Checking if gender column exists in user_preferences...')
    
    const { data: genderData, error: genderError } = await supabase
      .from('user_preferences')
      .select('gender')
      .limit(1)
    
    if (genderError && genderError.message.includes('gender')) {
      console.log('❌ Gender column does not exist')
      console.log('Please run this SQL in your Supabase dashboard:')
      console.log("ALTER TABLE user_preferences ADD COLUMN IF NOT EXISTS gender TEXT DEFAULT ''")
    } else if (genderError) {
      console.log('❌ Error checking gender column:', genderError.message)
    } else {
      console.log('✅ Gender column exists in user_preferences table')
    }
    
    console.log('\n📊 Summary:')
    console.log(`- Test user created: ${signUpData.user?.id}`)
    console.log(`- User profile created: ${userProfile ? 'Yes' : 'No'}`)
    console.log(`- User preferences created: ${userPreferences ? 'Yes' : 'No'}`)
    console.log(`- Gender column exists: ${!genderError || !genderError.message.includes('gender') ? 'Yes' : 'No'}`)
    
    console.log('\n🔧 RECOMMENDATIONS:')
    console.log('1. Make sure the handle_new_user function in user-profiles-setup.sql is correct')
    console.log('2. Make sure the handle_new_user_preferences function in user-profile-setup.sql is correct')
    console.log('3. Run the add-gender-field.sql script in your Supabase dashboard')
    console.log('4. Check that the AuthContext.tsx file creates both user_profiles and user_preferences')
    
  } catch (error) {
    console.log('❌ Unexpected error:', error.message)
    console.log('Full error:', error)
  }
}

fixSignupError()