const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkGenderColumn() {
  console.log('🔍 Checking if gender column exists in user_preferences table')
  console.log('============================================================')

  try {
    // Try to select all columns to see what's available
    console.log('\n📋 Step 1: Checking table structure...')
    
    const { data: allData, error: allError } = await supabase
      .from('user_preferences')
      .select('*')
      .limit(1)

    if (allError) {
      console.log('❌ Error accessing table:', allError.message)
      return
    }

    console.log('✅ Table is accessible')

    // Try to select specific columns including gender
    console.log('\n📋 Step 2: Testing gender column specifically...')
    
    const { data: genderData, error: genderError } = await supabase
      .from('user_preferences')
      .select('gender, user_id, clothing_preferences, preferred_occasions, style_preferences, budget_range, profile_completed')
      .limit(1)

    if (genderError) {
      console.log('❌ Error selecting gender column:', genderError.message)
      
      if (genderError.message.includes('gender')) {
        console.log('💡 CONFIRMED: The gender column does NOT exist in the database')
        console.log('\n🔧 SOLUTION:')
        console.log('1. Go to your Supabase dashboard')
        console.log('2. Open the SQL Editor')
        console.log('3. Run this SQL command:')
        console.log('   ALTER TABLE user_preferences ADD COLUMN IF NOT EXISTS gender TEXT DEFAULT \'\';')
        console.log('4. Click "Run" to execute')
        console.log('\nAfter running this SQL, your profile page should work correctly!')
      } else {
        console.log('💡 Unknown error - might be a different issue')
      }
    } else {
      console.log('✅ Gender column exists and is accessible')
      console.log('✅ Your profile page should work correctly!')
    }

    // Also check what columns are actually available
    console.log('\n📋 Step 3: Available columns in user_preferences table...')
    
    const { data: sampleData, error: sampleError } = await supabase
      .from('user_preferences')
      .select('*')
      .limit(1)

    if (!sampleError && sampleData && sampleData.length > 0) {
      console.log('📊 Available columns:', Object.keys(sampleData[0]))
    } else {
      console.log('📊 Table is empty, but structure should be correct')
    }

    console.log('\n🎉 Gender column check completed!')

  } catch (error) {
    console.error('❌ Unexpected error:', error.message)
  }
}

// Run the check
checkGenderColumn() 