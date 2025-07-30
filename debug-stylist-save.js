// Detailed debug script to identify stylist profile save timeout
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function debugStylistSave() {
  try {
    console.log('🔍 Detailed Stylist Save Debug...')
    
    // Step 1: Check environment
    console.log('\n📋 Step 1: Environment check...')
    console.log('Supabase URL:', supabaseUrl ? '✅ Set' : '❌ Missing')
    console.log('Supabase Key:', supabaseAnonKey ? '✅ Set' : '❌ Missing')
    
    // Step 2: Test basic connection with timing
    console.log('\n📋 Step 2: Connection test with timing...')
    const startTime = Date.now()
    
    const { data: testData, error: testError } = await supabase
      .from('stylists')
      .select('count')
      .limit(1)
    
    const endTime = Date.now()
    const responseTime = endTime - startTime
    
    if (testError) {
      console.log('❌ Connection failed:', testError.message)
      console.log('Response time:', responseTime + 'ms')
      return
    }
    
    console.log('✅ Connection successful')
    console.log('Response time:', responseTime + 'ms')
    
    if (responseTime > 3000) {
      console.log('⚠️  Slow response detected - this might cause timeouts')
    }
    
    // Step 3: Test authentication
    console.log('\n📋 Step 3: Authentication test...')
    const authStartTime = Date.now()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    const authEndTime = Date.now()
    const authResponseTime = authEndTime - authStartTime
    
    if (authError) {
      console.log('❌ Authentication error:', authError.message)
      console.log('Auth response time:', authResponseTime + 'ms')
      return
    }
    
    if (!user) {
      console.log('❌ No user logged in')
      console.log('Auth response time:', authResponseTime + 'ms')
      console.log('\n📝 To test stylist profile save:')
      console.log('1. Go to your app and sign up/sign in as a stylist')
      console.log('2. Make sure your user profile has role = "stylist"')
      console.log('3. Try to save your stylist profile')
      console.log('4. Check the browser console for detailed logs')
      return
    }
    
    console.log('✅ User authenticated:', user.id)
    console.log('Auth response time:', authResponseTime + 'ms')
    
    // Step 4: Check user profile
    console.log('\n📋 Step 4: User profile check...')
    const profileStartTime = Date.now()
    
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()
    
    const profileEndTime = Date.now()
    const profileResponseTime = profileEndTime - profileStartTime
    
    if (profileError && profileError.code === 'PGRST116') {
      console.log('❌ No user profile found')
      console.log('Profile response time:', profileResponseTime + 'ms')
      return
    } else if (profileError) {
      console.log('❌ Error fetching user profile:', profileError.message)
      console.log('Profile response time:', profileResponseTime + 'ms')
      return
    }
    
    console.log('✅ User profile found:', userProfile.role)
    console.log('Profile response time:', profileResponseTime + 'ms')
    
    if (userProfile.role !== 'stylist') {
      console.log('❌ User is not a stylist. Current role:', userProfile.role)
      return
    }
    
    // Step 5: Test stylist profile operations with detailed timing
    console.log('\n📋 Step 5: Stylist profile operations test...')
    
    const testStylistData = {
      id: user.id,
      name: 'Test Stylist Debug',
      bio: 'Professional test stylist for debugging',
      specialties: ['Test Styling', 'Debugging'],
      catalog_urls: ['https://example.com/test-debug.jpg']
    }
    
    console.log('Test data:', testStylistData)
    
    // Test with detailed timing
    const operationStartTime = Date.now()
    
    try {
      // Step 5a: Check if stylist exists
      console.log('\n📋 Step 5a: Checking if stylist exists...')
      const checkStartTime = Date.now()
      
      const { data: existingStylist, error: checkError } = await supabase
        .from('stylists')
        .select('id')
        .eq('id', user.id)
        .single()
      
      const checkEndTime = Date.now()
      const checkResponseTime = checkEndTime - checkStartTime
      
      console.log('Check result:', { existingStylist, checkError })
      console.log('Check response time:', checkResponseTime + 'ms')
      
      // Step 5b: Perform upsert operation
      console.log('\n📋 Step 5b: Performing upsert operation...')
      const upsertStartTime = Date.now()
      
      const { error: upsertError } = await supabase
        .from('stylists')
        .upsert(testStylistData)
      
      const upsertEndTime = Date.now()
      const upsertResponseTime = upsertEndTime - upsertStartTime
      
      if (upsertError) {
        console.error('❌ Upsert failed:', upsertError)
        console.log('Upsert response time:', upsertResponseTime + 'ms')
        throw upsertError
      }
      
      console.log('✅ Upsert successful')
      console.log('Upsert response time:', upsertResponseTime + 'ms')
      
      // Step 5c: Verify the result
      console.log('\n📋 Step 5c: Verifying result...')
      const verifyStartTime = Date.now()
      
      const { data: finalStylist, error: verifyError } = await supabase
        .from('stylists')
        .select('*')
        .eq('id', user.id)
        .single()
      
      const verifyEndTime = Date.now()
      const verifyResponseTime = verifyEndTime - verifyStartTime
      
      if (verifyError) {
        console.log('❌ Error verifying result:', verifyError.message)
        console.log('Verify response time:', verifyResponseTime + 'ms')
      } else {
        console.log('✅ Verification successful')
        console.log('Verify response time:', verifyResponseTime + 'ms')
        console.log('- name:', finalStylist.name)
        console.log('- bio:', finalStylist.bio)
        console.log('- specialties:', finalStylist.specialties)
        console.log('- catalog_urls:', finalStylist.catalog_urls)
      }
      
      const totalOperationTime = Date.now() - operationStartTime
      
      console.log('\n📊 Timing Summary:')
      console.log('- Basic connection:', responseTime + 'ms')
      console.log('- Authentication:', authResponseTime + 'ms')
      console.log('- Profile fetch:', profileResponseTime + 'ms')
      console.log('- Stylist check:', checkResponseTime + 'ms')
      console.log('- Upsert operation:', upsertResponseTime + 'ms')
      console.log('- Verification:', verifyResponseTime + 'ms')
      console.log('- Total operation time:', totalOperationTime + 'ms')
      
      if (totalOperationTime > 10000) {
        console.log('\n⚠️  WARNING: Total operation time is very slow')
        console.log('This could cause timeouts in the browser')
      } else if (totalOperationTime > 5000) {
        console.log('\n⚠️  WARNING: Total operation time is slow')
        console.log('Consider optimizing database queries')
      } else {
        console.log('\n✅ Total operation time is acceptable')
      }
      
      console.log('\n🎉 SUCCESS: All operations completed successfully!')
      console.log('The database operations are working correctly.')
      console.log('If you still get timeouts in the browser, it might be:')
      console.log('1. Network issues between browser and Supabase')
      console.log('2. Browser-specific problems')
      console.log('3. React component state management issues')
      
    } catch (error) {
      const totalOperationTime = Date.now() - operationStartTime
      console.error('❌ Error during operation:', error.message)
      console.error('Total operation time:', totalOperationTime + 'ms')
      console.error('Error details:', error)
      
      if (error.code === '42501') {
        console.log('\n🔧 SOLUTION: RLS Policy Issue')
        console.log('Run the fix-stylist-profile-update.sql script again')
      } else if (error.code === '23505') {
        console.log('\n🔧 SOLUTION: Unique Constraint Issue')
        console.log('There is a unique constraint violation')
      } else {
        console.log('\n🔧 SOLUTION: Check the error details above')
      }
    }
    
  } catch (error) {
    console.log('❌ Debug error:', error.message)
  }
}

debugStylistSave() 