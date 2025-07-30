const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function checkUserIds() {
  console.log('🔍 Checking User IDs...\n')

  try {
    // Check stylists table
    console.log('1. Checking stylists table...')
    const { data: stylists, error: stylistsError } = await supabase
      .from('stylists')
      .select('*')

    if (stylistsError) {
      console.log('❌ Error fetching stylists:', stylistsError.message)
      return
    }

    console.log(`✅ Found ${stylists?.length || 0} stylists:`)
    stylists?.forEach((stylist, index) => {
      console.log(`   ${index + 1}. ${stylist.name} (ID: ${stylist.id})`)
    })

    // Check if these IDs exist in auth.users
    console.log('\n2. Checking if stylist IDs exist in auth.users...')
    for (const stylist of stylists || []) {
      const { data: user, error: userError } = await supabase.auth.admin.getUserById(stylist.id)
      
      if (userError) {
        console.log(`❌ Stylist ID ${stylist.id} (${stylist.name}) - Not found in auth.users`)
      } else {
        console.log(`✅ Stylist ID ${stylist.id} (${stylist.name}) - Found in auth.users`)
      }
    }

    // Alternative: Try to get users from auth.users directly
    console.log('\n3. Trying to get users from auth.users...')
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers()
    
    if (usersError) {
      console.log('❌ Cannot access auth.users directly:', usersError.message)
      console.log('💡 This is normal - auth.users is protected')
    } else {
      console.log(`✅ Found ${users?.length || 0} users in auth.users`)
      users?.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.email} (ID: ${user.id})`)
      })
    }

    console.log('\n🎉 User ID check completed!')

  } catch (error) {
    console.error('❌ Check failed:', error)
  }
}

checkUserIds() 