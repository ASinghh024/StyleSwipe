const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkDatabaseTables() {
  console.log('🔍 Checking Database Tables')
  console.log('==========================')

  try {
    // Test connection with stylists table (which we know works)
    console.log('\n📋 Step 1: Testing stylists table...')
    
    const { data: stylistsData, error: stylistsError } = await supabase
      .from('stylists')
      .select('count')
      .limit(1)

    if (stylistsError) {
      console.log('❌ Stylists table error:', stylistsError.message)
    } else {
      console.log('✅ Stylists table accessible')
    }

    // Test user_profiles table
    console.log('\n📋 Step 2: Testing user_profiles table...')
    
    const { data: profilesData, error: profilesError } = await supabase
      .from('user_profiles')
      .select('count')
      .limit(1)

    if (profilesError) {
      console.log('❌ User_profiles table error:', profilesError.message)
    } else {
      console.log('✅ User_profiles table accessible')
    }

    // Test user_preferences table
    console.log('\n📋 Step 3: Testing user_preferences table...')
    
    const { data: preferencesData, error: preferencesError } = await supabase
      .from('user_preferences')
      .select('count')
      .limit(1)

    if (preferencesError) {
      console.log('❌ User_preferences table error:', preferencesError.message)
      console.log('\n💡 This means the user_preferences table might not exist')
      console.log('🔧 Solution:')
      console.log('1. Run the user-profile-setup.sql file in your Supabase dashboard')
      console.log('2. Or create the table manually')
    } else {
      console.log('✅ User_preferences table accessible')
      
      // Try to get actual data to see structure
      const { data: sampleData, error: sampleError } = await supabase
        .from('user_preferences')
        .select('*')
        .limit(1)

      if (sampleError) {
        console.log('❌ Error getting sample data:', sampleError.message)
      } else {
        console.log('✅ Sample data retrieved')
        if (sampleData && sampleData.length > 0) {
          console.log('📊 Table columns:', Object.keys(sampleData[0]))
          
          // Check if gender column exists
          if ('gender' in sampleData[0]) {
            console.log('✅ Gender column exists in the table')
          } else {
            console.log('❌ Gender column does NOT exist in the table')
            console.log('🔧 Solution:')
            console.log('1. Go to your Supabase dashboard')
            console.log('2. Open the SQL Editor')
            console.log('3. Run this SQL:')
            console.log('   ALTER TABLE user_preferences ADD COLUMN IF NOT EXISTS gender TEXT DEFAULT \'\';')
          }
        } else {
          console.log('📊 Table is empty, cannot determine structure')
        }
      }
    }

    console.log('\n🎉 Database check completed!')

  } catch (error) {
    console.error('❌ Unexpected error:', error.message)
  }
}

// Run the check
checkDatabaseTables() 