const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkTableStructure() {
  console.log('🔍 Checking user_preferences table structure')
  console.log('==========================================')

  try {
    // Try to select from the table to see what columns exist
    console.log('\n📋 Step 1: Checking table accessibility...')
    
    const { data: tableData, error: tableError } = await supabase
      .from('user_preferences')
      .select('*')
      .limit(1)

    if (tableError) {
      console.log('❌ Error accessing user_preferences table:', tableError.message)
      return
    }

    console.log('✅ user_preferences table accessible')

    // Try to insert a minimal record to test gender field
    console.log('\n📋 Step 2: Testing gender field...')
    
    // Create a test record with only required fields
    const testRecord = {
      user_id: '00000000-0000-0000-0000-000000000001',
      clothing_preferences: [],
      preferred_occasions: [],
      style_preferences: '',
      budget_range: '',
      profile_completed: false
    }

    // First try without gender
    const { error: insertError1 } = await supabase
      .from('user_preferences')
      .insert(testRecord)

    if (insertError1) {
      console.log('❌ Basic insert failed:', insertError1.message)
      console.log('💡 This suggests RLS policies are blocking the insert')
      return
    }

    console.log('✅ Basic insert successful')

    // Now try with gender field
    const testRecordWithGender = {
      ...testRecord,
      gender: 'male'
    }

    const { error: insertError2 } = await supabase
      .from('user_preferences')
      .insert(testRecordWithGender)

    if (insertError2) {
      console.log('❌ Insert with gender failed:', insertError2.message)
      console.log('💡 This means the gender column does NOT exist')
      console.log('\n🔧 Solution:')
      console.log('1. Go to your Supabase dashboard')
      console.log('2. Open the SQL Editor')
      console.log('3. Run this SQL:')
      console.log('   ALTER TABLE user_preferences ADD COLUMN IF NOT EXISTS gender TEXT DEFAULT \'\';')
    } else {
      console.log('✅ Insert with gender successful')
      console.log('✅ Gender column exists in the table')
      
      // Clean up test data
      await supabase
        .from('user_preferences')
        .delete()
        .eq('user_id', '00000000-0000-0000-0000-000000000001')
      
      console.log('✅ Test data cleaned up')
    }

    console.log('\n🎉 Table structure check completed!')

  } catch (error) {
    console.error('❌ Unexpected error:', error.message)
  }
}

// Run the check
checkTableStructure() 