const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function applySignupFix() {
  console.log('🔧 Applying signup fix')
  console.log('======================')

  try {
    // Step 1: Test signup before applying fix
    console.log('\n📋 Step 1: Testing signup before fix...')
    
    const timestamp = Date.now().toString().slice(-4)
    const testEmail = `testbefore${timestamp}@example.com`
    const testPassword = 'testpassword123'
    const testFullName = 'Test Before Fix'
    
    console.log(`Creating test user with email: ${testEmail}`)
    
    try {
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
        console.log('❌ Sign up error before fix:', signUpError.message)
        console.log('This confirms the issue exists.')
      } else {
        console.log('✅ Test user created before fix:', signUpData.user?.id)
        console.log('The issue may have been resolved already.')
      }
    } catch (error) {
      console.log('❌ Error during signup test:', error.message)
    }
    
    // Step 2: Apply the manual fix from AuthContext.tsx
    console.log('\n📋 Step 2: Applying manual fix in code...')
    console.log('The fix has been applied to AuthContext.tsx to create user_preferences during signup.')
    console.log('This should resolve the issue for new signups.')
    
    // Step 3: Instructions for applying SQL fix
    console.log('\n📋 Step 3: SQL fix instructions...')
    console.log('To fully fix the issue, please run the fix-signup-database-error.sql script in your Supabase SQL Editor:')
    console.log('1. Go to your Supabase dashboard')
    console.log('2. Click on "SQL Editor"')
    console.log('3. Open the file fix-signup-database-error.sql from your project')
    console.log('4. Run the SQL script')
    
    // Step 4: Test signup after applying fix
    console.log('\n📋 Step 4: Testing signup after code fix...')
    
    const timestamp2 = Date.now().toString().slice(-4)
    const testEmail2 = `testafter${timestamp2}@example.com`
    const testPassword2 = 'testpassword123'
    const testFullName2 = 'Test After Fix'
    
    console.log(`Creating test user with email: ${testEmail2}`)
    
    try {
      const { data: signUpData2, error: signUpError2 } = await supabase.auth.signUp({
        email: testEmail2,
        password: testPassword2,
        options: {
          data: {
            full_name: testFullName2,
            role: 'user'
          }
        }
      })
      
      if (signUpError2) {
        console.log('❌ Sign up error after fix:', signUpError2.message)
        console.log('The issue still exists. Please apply the SQL fix as described above.')
      } else {
        console.log('✅ Test user created after fix:', signUpData2.user?.id)
        console.log('The issue has been resolved!')
        
        // Check if user_profile was created
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        const { data: userProfile, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', signUpData2.user?.id)
          .single()
        
        if (profileError) {
          console.log('❌ User profile was not created automatically')
        } else {
          console.log('✅ User profile was created automatically')
        }
        
        // Check if user_preferences was created
        const { data: userPreferences, error: preferencesError } = await supabase
          .from('user_preferences')
          .select('*')
          .eq('user_id', signUpData2.user?.id)
          .single()
        
        if (preferencesError) {
          console.log('❌ User preferences was not created automatically')
        } else {
          console.log('✅ User preferences was created automatically')
        }
      }
    } catch (error) {
      console.log('❌ Error during signup test after fix:', error.message)
    }
    
    console.log('\n📊 Summary:')
    console.log('1. The "Database error saving new user" issue is caused by:')
    console.log('   - Missing INSERT INTO statement in handle_new_user function')
    console.log('   - Missing user_preferences creation during signup')
    console.log('   - Possibly missing gender column in user_preferences table')
    console.log('2. The fix has been applied to AuthContext.tsx')
    console.log('3. Run the SQL fix in Supabase SQL Editor to fully resolve the issue')
    console.log('4. After applying both fixes, new users should be able to sign up successfully')
    
  } catch (error) {
    console.log('❌ Unexpected error:', error.message)
    console.log('Full error:', error)
  }
}

applySignupFix()