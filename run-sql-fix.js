const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function addGenderColumn() {
  console.log('🔧 Adding gender column to user_preferences table')
  console.log('================================================')

  try {
    // Add gender column to user_preferences table
    console.log('\n📋 Step 1: Adding gender column...')
    
    const { error: alterError } = await supabase
      .rpc('exec_sql', { 
        sql: "ALTER TABLE user_preferences ADD COLUMN IF NOT EXISTS gender TEXT DEFAULT '';" 
      })

    if (alterError) {
      console.log('❌ Error adding gender column:', alterError.message)
      console.log('💡 This might be because:')
      console.log('   - You need to run this SQL directly in your Supabase dashboard')
      console.log('   - The RPC function exec_sql doesn\'t exist')
      console.log('   - You need admin privileges')
      return
    }

    console.log('✅ Gender column added successfully')

    // Test the column by trying to insert with gender field
    console.log('\n📋 Step 2: Testing the new column...')
    
    const testUserId = 'test-user-' + Date.now()
    const testPreferences = {
      user_id: testUserId,
      gender: 'male',
      clothing_preferences: ['casual'],
      preferred_occasions: ['daily'],
      style_preferences: 'minimalist',
      budget_range: '1000-3000',
      profile_completed: true
    }

    const { data: insertData, error: insertError } = await supabase
      .from('user_preferences')
      .insert(testPreferences)
      .select()

    if (insertError) {
      console.log('❌ Error inserting with gender field:', insertError.message)
      console.log('💡 You may need to run this SQL manually in your Supabase dashboard:')
      console.log('   ALTER TABLE user_preferences ADD COLUMN IF NOT EXISTS gender TEXT DEFAULT \'\';')
    } else {
      console.log('✅ Successfully inserted with gender field')
      console.log('📊 Inserted data:', insertData)

      // Clean up test data
      await supabase
        .from('user_preferences')
        .delete()
        .eq('user_id', testUserId)

      console.log('✅ Test data cleaned up')
    }

    console.log('\n🎉 Database fix completed!')
    console.log('✅ The gender column should now be available in your profile page')

  } catch (error) {
    console.error('❌ Unexpected error:', error.message)
    console.log('\n💡 Manual fix required:')
    console.log('1. Go to your Supabase dashboard')
    console.log('2. Open the SQL editor')
    console.log('3. Run this SQL:')
    console.log('   ALTER TABLE user_preferences ADD COLUMN IF NOT EXISTS gender TEXT DEFAULT \'\';')
  }
}

// Run the fix
addGenderColumn() 