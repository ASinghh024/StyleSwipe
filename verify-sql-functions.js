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

async function verifyFunctions() {
  try {
    console.log('Checking database functions...');
    
    // Use raw SQL query to check functions
    const { data: functions, error: funcError } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT routine_name, routine_type
        FROM information_schema.routines 
        WHERE routine_schema = 'public' 
        AND routine_name IN ('handle_new_user', 'handle_new_user_preferences', 'sync_user_preferences_to_profile');
      `
    });
    
    if (funcError) {
      console.error('Error checking functions:', funcError);
      
      // Try alternative approach with direct SQL
      console.log('Trying alternative approach...');
      const { data: altFuncs, error: altError } = await supabase.rpc('exec_sql', {
        sql: `SELECT proname FROM pg_proc WHERE pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public') AND proname IN ('handle_new_user', 'handle_new_user_preferences', 'sync_user_preferences_to_profile');`
      });
      
      if (altError) {
        console.error('Alternative approach failed:', altError);
      } else {
        console.log('Functions found (alternative):', altFuncs);
      }
    } else {
      console.log('Functions found:', functions);
    }
    
    // Check triggers using raw SQL
    console.log('\nChecking database triggers...');
    const { data: triggers, error: trigError } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT trigger_name, event_manipulation, action_statement
        FROM information_schema.triggers
        WHERE trigger_name IN ('on_auth_user_created', 'on_auth_user_created_preferences', 'on_user_preferences_updated');
      `
    });
    
    if (trigError) {
      console.error('Error checking triggers:', trigError);
    } else {
      console.log('Triggers found:', triggers);
    }
    
    // Check if tables exist
    console.log('\nChecking if tables exist...');
    const { data: tables, error: tablesError } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name IN ('user_profiles', 'user_preferences');
      `
    });
    
    if (tablesError) {
      console.error('Error checking tables:', tablesError);
    } else {
      console.log('Tables found:', tables);
    }
    
    // Check if gender column exists in user_preferences
    console.log('\nChecking if gender column exists in user_preferences...');
    const { data: columns, error: columnsError } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'user_preferences' 
        AND column_name = 'gender';
      `
    });
    
    if (columnsError) {
      console.error('Error checking columns:', columnsError);
    } else {
      console.log('Gender column found:', columns);
    }
    
    // Try to create a test user
    console.log('\nAttempting to create a test user...');
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
      console.error('Error creating test user:', userError);
      console.log('\nTrying to diagnose the issue...');
      
      // Check if the handle_new_user function has the correct implementation
      const { data: funcDef, error: funcDefError } = await supabase.rpc('exec_sql', {
        sql: `
          SELECT pg_get_functiondef(oid) 
          FROM pg_proc 
          WHERE pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public') 
          AND proname = 'handle_new_user';
        `
      });
      
      if (funcDefError) {
        console.error('Error getting function definition:', funcDefError);
      } else {
        console.log('handle_new_user function definition:', funcDef);
      }
    } else {
      console.log('Test user creation response:', user);
      
      // Wait a moment for triggers to execute
      console.log('Waiting for triggers to execute...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Check if user_profiles was created
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.user.id)
        .single();
      
      if (profileError) {
        console.error('Error checking user profile:', profileError);
      } else {
        console.log('User profile created:', profile);
      }
      
      // Check if user_preferences was created
      const { data: prefs, error: prefsError } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.user.id)
        .single();
      
      if (prefsError) {
        console.error('Error checking user preferences:', prefsError);
      } else {
        console.log('User preferences created:', prefs);
      }
    }
    
  } catch (err) {
    console.error('Verification failed:', err);
  }
}

verifyFunctions();