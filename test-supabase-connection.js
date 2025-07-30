require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key exists:', !!supabaseKey);

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    console.log('Testing connection to Supabase...');
    const { data, error } = await supabase.from('user_profiles').select('count');
    
    if (error) {
      console.error('Error connecting to Supabase:', error);
    } else {
      console.log('Connection successful!');
      console.log('Data:', data);
      
      // Check if the handle_new_user function exists
      const { data: functions, error: funcError } = await supabase.rpc('check_function_exists', { 
        function_name: 'handle_new_user' 
      }).single();
      
      if (funcError) {
        console.error('Error checking function:', funcError);
      } else {
        console.log('Function check result:', functions);
      }
    }
  } catch (err) {
    console.error('Connection failed:', err);
  }
}

testConnection();