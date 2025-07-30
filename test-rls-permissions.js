// Test RLS permissions and suggest solutions
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testRLSPermissions() {
  try {
    console.log('🔍 Testing RLS Permissions...\n')
    
    console.log('🔧 Environment Check:')
    console.log('   Supabase URL:', supabaseUrl ? 'Set' : 'Missing')
    console.log('   Supabase Key:', supabaseAnonKey ? 'Set' : 'Missing')
    
    // Test 1: Try to access tables with count() which sometimes bypasses RLS
    console.log('\n📊 Test 1: Count queries (may bypass some RLS)...')
    
    const tables = ['matches', 'user_preferences', 'user_profiles', 'stylists']
    
    for (const table of tables) {
      try {
        const { count, error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true })
        
        if (error) {
          console.log(`   ❌ ${table}: ${error.message}`)
        } else {
          console.log(`   ✅ ${table}: ${count} records`)
        }
      } catch (err) {
        console.log(`   ❌ ${table}: ${err.message}`)
      }
    }
    
    // Test 2: Check current auth status
    console.log('\n👤 Test 2: Current auth status...')
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError) {
      console.log(`   ❌ Auth error: ${authError.message}`)
    } else if (user) {
      console.log(`   ✅ Authenticated as: ${user.email}`)
      console.log(`   ✅ User ID: ${user.id}`)
    } else {
      console.log(`   ⚠️  Not authenticated (using anonymous access)`)
    }
    
    // Test 3: Try to access specific records
    console.log('\n🎯 Test 3: Direct record access...')
    
    // Try to get matches without filtering
    try {
      const { data, error } = await supabase
        .from('matches')
        .select('id')
        .limit(1)
      
      if (error) {
        console.log(`   ❌ Matches access: ${error.message}`)
        if (error.message.includes('RLS') || error.message.includes('policy')) {
          console.log(`   💡 This confirms RLS is blocking access`)
        }
      } else {
        console.log(`   ✅ Matches accessible: ${data?.length || 0} records`)
      }
    } catch (err) {
      console.log(`   ❌ Matches access error: ${err.message}`)
    }
    
    // Test 4: Check if we need to sign in as the stylist
    console.log('\n🔐 Test 4: Solutions...')
    
    console.log(`
💡 SOLUTIONS TO FIX THE DASHBOARD:

🚀 Option 1: Sign in as the stylist user
   - The dashboard needs to be accessed by an authenticated stylist
   - RLS policies require auth.uid() to match the stylist's user_id
   - Make sure to sign in as the stylist "Manish M" before viewing dashboard

🔧 Option 2: Update RLS policies (if needed)
   - Current policies might be too restrictive
   - May need to allow stylists to see their matches

🛠️ Option 3: Service role access (for debugging only)
   - Use service role key instead of anon key
   - This bypasses RLS entirely (dangerous for production)

📝 Immediate Steps:
   1. Sign in to your app as the stylist "Manish M"
   2. Navigate to /stylist-dashboard
   3. The data should now be visible

🔍 Current Issue:
   - Your database HAS data (confirmed from screenshots)
   - RLS policies are blocking anonymous/unauthenticated access
   - The dashboard will work when accessed by an authenticated stylist
    `)
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message)
  }
}

testRLSPermissions() 