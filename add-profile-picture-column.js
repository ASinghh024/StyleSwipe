const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function addProfilePictureColumn() {
  console.log('🔧 Adding profile_picture column to stylists table')
  console.log('================================================')

  try {
    // Add profile_picture column to stylists table
    console.log('\n📋 Step 1: Adding profile_picture column...')
    
    const { error: alterError } = await supabase
      .rpc('exec_sql', { 
        sql: "ALTER TABLE stylists ADD COLUMN IF NOT EXISTS profile_picture TEXT DEFAULT NULL;" 
      })

    if (alterError) {
      console.log('❌ Error adding profile_picture column:', alterError.message)
      console.log('💡 This might be because:')
      console.log('   - You need to run this SQL directly in your Supabase dashboard')
      console.log('   - The RPC function exec_sql doesn\'t exist')
      console.log('   - You need admin privileges')
      return
    }

    console.log('✅ profile_picture column added successfully')

    // Create index for better performance
    console.log('\n📋 Step 2: Creating index for profile_picture column...')
    
    const { error: indexError } = await supabase
      .rpc('exec_sql', { 
        sql: "CREATE INDEX IF NOT EXISTS idx_stylists_profile_picture ON stylists(profile_picture) WHERE profile_picture IS NOT NULL;" 
      })

    if (indexError) {
      console.log('❌ Error creating index:', indexError.message)
      console.log('💡 You may need to run this SQL manually in your Supabase dashboard')
      return
    }

    console.log('✅ Index created successfully')

    // Verify the column was added
    console.log('\n📋 Step 3: Verifying the column was added...')
    
    const { data: verifyData, error: verifyError } = await supabase
      .rpc('exec_sql', { 
        sql: "SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'stylists' AND column_name = 'profile_picture') as column_exists;" 
      })

    if (verifyError) {
      console.log('❌ Error verifying column:', verifyError.message)
    } else {
      console.log('✅ Verification result:', verifyData)
    }

    console.log('\n🎉 Database fix completed!')
    console.log('✅ The profile_picture column should now be available in the stylists table')

  } catch (error) {
    console.error('❌ Unexpected error:', error.message)
    console.log('\n💡 Manual fix required:')
    console.log('1. Go to your Supabase dashboard')
    console.log('2. Open the SQL editor')
    console.log('3. Run this SQL:')
    console.log('   ALTER TABLE stylists ADD COLUMN IF NOT EXISTS profile_picture TEXT DEFAULT NULL;')
    console.log('   CREATE INDEX IF NOT EXISTS idx_stylists_profile_picture ON stylists(profile_picture) WHERE profile_picture IS NOT NULL;')
  }
}

// Run the fix
addProfilePictureColumn()