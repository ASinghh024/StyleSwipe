// Test script to verify signup functionality works correctly
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testSignupFunctionality() {
  console.log('🧪 Testing signup functionality...');
  
  // Generate a unique email for testing
  const testEmail = `test${Math.floor(Math.random() * 10000)}@example.com`;
  const testPassword = 'Password123!';
  const testFullName = 'Test User';
  
  try {
    // 1. Create a new user
    console.log(`📧 Attempting to create user with email: ${testEmail}`);
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          full_name: testFullName,
        },
      },
    });
    
    if (signUpError) {
      console.error('❌ Error during signup:', signUpError);
      return;
    }
    
    console.log('✅ User created successfully:', signUpData.user.id);
    
    // 2. Wait a moment for triggers to execute
    console.log('⏳ Waiting for triggers to execute...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 3. Check if user_profiles record was created
    const { data: profileData, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', signUpData.user.id)
      .single();
      
    if (profileError) {
      console.error('❌ Error fetching user profile:', profileError);
    } else {
      console.log('✅ user_profiles record created:', profileData);
    }
    
    // 4. Check if user_preferences record was created
    const { data: preferencesData, error: preferencesError } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', signUpData.user.id)
      .single();
      
    if (preferencesError) {
      console.error('❌ Error fetching user preferences:', preferencesError);
    } else {
      console.log('✅ user_preferences record created:', preferencesData);
    }
    
    // 5. Verify gender field exists in preferences
    if (preferencesData && 'gender' in preferencesData) {
      console.log('✅ gender field exists in user_preferences');
    } else if (preferencesData) {
      console.error('❌ gender field missing in user_preferences');
    }
    
    console.log('🎉 Signup functionality test completed!');
    
  } catch (error) {
    console.error('❌ Unexpected error during test:', error);
  }
}

testSignupFunctionality();