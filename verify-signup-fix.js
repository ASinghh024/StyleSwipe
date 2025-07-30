require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false
  }
});

async function verifySignupFix() {
  try {
    console.log('🔍 Checking if tables exist...');
    
    // Check user_profiles table
    const { data: profilesData, error: profilesError } = await supabase
      .from('user_profiles')
      .select('count')
      .limit(1);
    
    if (profilesError) {
      console.error('❌ Error checking user_profiles table:', profilesError);
    } else {
      console.log('✅ user_profiles table exists');
    }
    
    // Check user_preferences table
    const { data: prefsData, error: prefsError } = await supabase
      .from('user_preferences')
      .select('count')
      .limit(1);
    
    if (prefsError) {
      console.error('❌ Error checking user_preferences table:', prefsError);
    } else {
      console.log('✅ user_preferences table exists');
    }
    
    // Check if gender column exists in user_preferences
    const { data: genderData, error: genderError } = await supabase
      .from('user_preferences')
      .select('gender')
      .limit(1);
    
    if (genderError) {
      if (genderError.message.includes('column "gender" does not exist')) {
        console.error('❌ gender column does not exist in user_preferences');
      } else {
        console.error('❌ Error checking gender column:', genderError);
      }
    } else {
      console.log('✅ gender column exists in user_preferences');
    }
    
    // Try to create a test user
    console.log('\n🧪 Attempting to create a test user...');
    const testEmail = `test${Math.floor(Math.random() * 10000)}@example.com`;
    const { data: user, error: userError } = await supabase.auth.signUp({
      email: testEmail,
      password: 'Test123456!',
      options: {
        data: {
          full_name: 'Test User',
          role: 'user'
        }
      }
    });
    
    if (userError) {
      console.error('❌ Error creating test user:', userError);
      console.log('\n🔍 Possible issues:');
      console.log('1. The handle_new_user function might not be properly created or has errors');
      console.log('2. The trigger on_auth_user_created might not be properly set up');
      console.log('3. The SQL script might not have been executed with the correct permissions');
      console.log('\n📋 Recommended actions:');
      console.log('1. Verify that you ran the SQL script in the Supabase SQL Editor with admin privileges');
      console.log('2. Check for any error messages in the Supabase SQL Editor when running the script');
      console.log('3. Try running the script again, ensuring all statements execute successfully');
      console.log('4. Check the Supabase logs for any errors related to the trigger execution');
    } else {
      console.log('✅ Test user created successfully:', user.user.email);
      
      // Wait a moment for triggers to execute
      console.log('⏳ Waiting for triggers to execute...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Check if user_profiles was created
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.user.id)
        .single();
      
      if (profileError) {
        console.error('❌ Error checking user profile:', profileError);
        console.log('❌ user_profiles record was NOT created automatically');
      } else {
        console.log('✅ user_profiles record was created automatically:', profile);
      }
      
      // Check if user_preferences was created
      const { data: prefs, error: prefsError } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.user.id)
        .single();
      
      if (prefsError) {
        console.error('❌ Error checking user preferences:', prefsError);
        console.log('❌ user_preferences record was NOT created automatically');
      } else {
        console.log('✅ user_preferences record was created automatically:', prefs);
      }
      
      console.log('\n🎉 The fix appears to be working! New users can now be created successfully.');
    }
    
  } catch (err) {
    console.error('❌ Verification failed:', err);
  }
}

verifySignupFix();