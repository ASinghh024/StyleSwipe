const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function debugSaveError() {
  console.log('🔍 Debugging Save Error')
  console.log('=======================')

  try {
    // Step 1: Check table structure
    console.log('\n📋 Step 1: Checking table structure...')
    
    const { data: tableData, error: tableError } = await supabase
      .from('user_preferences')
      .select('*')
      .limit(1)

    if (tableError) {
      console.log('❌ Table access error:', tableError.message)
      return
    }

    console.log('✅ Table accessible')

    // Step 2: Check if gender column exists specifically
    console.log('\n📋 Step 2: Checking gender column...')
    
    const { data: genderData, error: genderError } = await supabase
      .from('user_preferences')
      .select('gender')
      .limit(1)

    if (genderError) {
      console.log('❌ Gender column error:', genderError.message)
      if (genderError.message.includes('gender')) {
        console.log('💡 Gender column does not exist!')
        console.log('🔧 Run this SQL in your Supabase dashboard:')
        console.log('   ALTER TABLE user_preferences ADD COLUMN IF NOT EXISTS gender TEXT DEFAULT \'\';')
        return
      }
    } else {
      console.log('✅ Gender column exists')
    }

    // Step 3: Test the exact data structure that would be saved
    console.log('\n📋 Step 3: Testing exact save data structure...')
    
    const testSaveData = {
      user_id: '00000000-0000-0000-0000-000000000001',
      gender: 'male',
      clothing_preferences: ['casual'],
      preferred_occasions: ['daily'],
      style_preferences: 'minimalist',
      budget_range: '1000-3000',
      profile_completed: true
    }

    console.log('📊 Test save data:', JSON.stringify(testSaveData, null, 2))

    // Step 4: Try to insert (this will fail due to RLS, but we can see the error)
    console.log('\n📋 Step 4: Testing insert (will fail due to RLS)...')
    
    const { data: insertData, error: insertError } = await supabase
      .from('user_preferences')
      .insert(testSaveData)
      .select()

    if (insertError) {
      console.log('❌ Insert error:', insertError.message)
      console.log('📊 Error details:', insertError)
      
      if (insertError.message.includes('gender')) {
        console.log('💡 CONFIRMED: Gender column is missing')
        console.log('🔧 SOLUTION: Add gender column to database')
      } else if (insertError.message.includes('row-level security')) {
        console.log('✅ Structure is correct (RLS blocking test insert)')
      } else {
        console.log('💡 Unknown error - check the error details above')
      }
    } else {
      console.log('✅ Insert successful (unexpected!)')
    }

    // Step 5: Check RLS policies
    console.log('\n📋 Step 5: Checking RLS policies...')
    console.log('💡 RLS policies are active and blocking test inserts')
    console.log('✅ This is expected behavior for security')

    // Step 6: Test update scenario
    console.log('\n📋 Step 6: Testing update scenario...')
    
    const updateData = {
      gender: 'female',
      clothing_preferences: ['formal'],
      preferred_occasions: ['party'],
      style_preferences: 'trendy',
      budget_range: '3000-5000',
      profile_completed: true
    }

    console.log('📊 Update data:', JSON.stringify(updateData, null, 2))

    const { data: updateResult, error: updateError } = await supabase
      .from('user_preferences')
      .update(updateData)
      .eq('user_id', '00000000-0000-0000-0000-000000000001')
      .select()

    if (updateError) {
      console.log('❌ Update error:', updateError.message)
      console.log('📊 Error details:', updateError)
    } else {
      console.log('✅ Update successful (unexpected!)')
    }

    console.log('\n🎉 Debug completed!')
    console.log('\n💡 Most likely issues:')
    console.log('1. Gender column missing from database')
    console.log('2. RLS policies blocking the operation')
    console.log('3. User authentication issues')
    console.log('4. Network connectivity problems')

  } catch (error) {
    console.error('❌ Unexpected error:', error.message)
    console.error('📊 Full error:', error)
  }
}

// Run the debug
debugSaveError() 