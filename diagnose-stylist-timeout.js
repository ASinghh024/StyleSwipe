// Comprehensive diagnostic script for stylist profile timeout issue
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function diagnoseStylistTimeout() {
  try {
    console.log('🔍 Comprehensive Stylist Timeout Diagnosis...')
    
    // Step 1: Check environment variables
    console.log('\n📋 Step 1: Checking environment variables...')
    console.log('Supabase URL:', supabaseUrl ? '✅ Set' : '❌ Missing')
    console.log('Supabase Key:', supabaseAnonKey ? '✅ Set' : '❌ Missing')
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.log('❌ Environment variables are missing. Check your .env.local file.')
      return
    }
    
    // Step 2: Test basic connection
    console.log('\n📋 Step 2: Testing basic connection...')
    const startTime = Date.now()
    
    try {
      const { data: testData, error: testError } = await supabase
        .from('stylists')
        .select('count')
        .limit(1)
      
      const endTime = Date.now()
      const responseTime = endTime - startTime
      
      if (testError) {
        console.log('❌ Connection test failed:', testError.message)
        console.log('Response time:', responseTime + 'ms')
        return
      }
      
      console.log('✅ Connection successful')
      console.log('Response time:', responseTime + 'ms')
      
      if (responseTime > 5000) {
        console.log('⚠️  Slow response time detected - this might cause timeouts')
      }
      
    } catch (error) {
      console.log('❌ Connection error:', error.message)
      return
    }
    
    // Step 3: Check stylists table structure
    console.log('\n📋 Step 3: Checking stylists table structure...')
    const { data: stylists, error: stylistsError } = await supabase
      .from('stylists')
      .select('*')
      .limit(3)
    
    if (stylistsError) {
      console.log('❌ Error accessing stylists table:', stylistsError.message)
      return
    }
    
    console.log(`✅ Stylists table accessible - Found ${stylists?.length || 0} stylists`)
    
    if (stylists && stylists.length > 0) {
      const sampleStylist = stylists[0]
      console.log('Sample stylist structure:')
      console.log('- id:', sampleStylist.id)
      console.log('- name:', sampleStylist.name)
      console.log('- bio:', sampleStylist.bio?.substring(0, 50) + '...')
      console.log('- specialties:', sampleStylist.specialties)
      console.log('- catalog_urls:', sampleStylist.catalog_urls)
    }
    
    // Step 4: Test RLS policies
    console.log('\n📋 Step 4: Testing RLS policies...')
    
    // Test read policy
    const { data: readTest, error: readError } = await supabase
      .from('stylists')
      .select('id')
      .limit(1)
    
    if (readError) {
      console.log('❌ Read policy issue:', readError.message)
    } else {
      console.log('✅ Read policy working')
    }
    
    // Step 5: Check authentication
    console.log('\n📋 Step 5: Checking authentication...')
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError) {
      console.log('❌ Authentication error:', authError.message)
    } else if (!user) {
      console.log('❌ No user logged in')
      console.log('\n📝 To test stylist profile updates:')
      console.log('1. Go to your app and sign up/sign in as a stylist')
      console.log('2. Make sure your user profile has role = "stylist"')
      console.log('3. Try to update your stylist profile')
      console.log('4. Check the browser console for detailed logs')
      return
    } else {
      console.log('✅ User authenticated:', user.id)
      
      // Step 6: Check user profile
      console.log('\n📋 Step 6: Checking user profile...')
      const { data: userProfile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()
      
      if (profileError && profileError.code === 'PGRST116') {
        console.log('❌ No user profile found')
        console.log('Please create a user profile first')
        return
      } else if (profileError) {
        console.log('❌ Error fetching user profile:', profileError.message)
        return
      }
      
      console.log('✅ User profile found:', userProfile.role)
      
      if (userProfile.role !== 'stylist') {
        console.log('❌ User is not a stylist. Current role:', userProfile.role)
        console.log('Please update your user profile to have role = "stylist"')
        return
      }
      
      // Step 7: Test stylist profile operations
      console.log('\n📋 Step 7: Testing stylist profile operations...')
      
      const testStylistData = {
        id: user.id,
        name: 'Test Stylist Diagnosis',
        bio: 'Professional test stylist for diagnosis',
        specialties: ['Test Styling', 'Diagnosis'],
        catalog_urls: ['https://example.com/test-diagnosis.jpg']
      }
      
      console.log('Test data:', testStylistData)
      
      // Test with timeout
      const timeoutId = setTimeout(() => {
        console.log('❌ Request timed out after 20 seconds')
        console.log('This indicates a serious database or network issue')
      }, 20000)
      
      try {
        // Check if stylist exists
        console.log('Checking if stylist exists...')
        const { data: existingStylist, error: checkError } = await supabase
          .from('stylists')
          .select('id')
          .eq('id', user.id)
          .single()
        
        console.log('Check result:', { existingStylist, checkError })
        
        let result
        if (existingStylist) {
          console.log('Testing update operation...')
          const { error: updateError } = await supabase
            .from('stylists')
            .update(testStylistData)
            .eq('id', user.id)
          
          if (updateError) {
            console.error('❌ Update failed:', updateError)
            throw updateError
          }
          result = 'updated'
          console.log('✅ Stylist profile updated successfully')
        } else {
          console.log('Testing insert operation...')
          const { error: insertError } = await supabase
            .from('stylists')
            .insert(testStylistData)
          
          if (insertError) {
            console.error('❌ Insert failed:', insertError)
            throw insertError
          }
          result = 'created'
          console.log('✅ Stylist profile created successfully')
        }
        
        clearTimeout(timeoutId)
        
        // Verify the result
        console.log('\n📋 Step 8: Verifying the result...')
        const { data: finalStylist, error: verifyError } = await supabase
          .from('stylists')
          .select('*')
          .eq('id', user.id)
          .single()
        
        if (verifyError) {
          console.log('❌ Error verifying result:', verifyError.message)
        } else {
          console.log('✅ Verification successful:')
          console.log('- name:', finalStylist.name)
          console.log('- bio:', finalStylist.bio)
          console.log('- specialties:', finalStylist.specialties)
          console.log('- catalog_urls:', finalStylist.catalog_urls)
        }
        
        console.log('\n🎉 SUCCESS: Stylist profile operations are working!')
        console.log(`- Profile ${result}: ✅`)
        console.log(`- Verification: ${verifyError ? '❌' : '✅'}`)
        
        // If we get here, the database operations are working
        console.log('\n🔍 DIAGNOSIS: The timeout in your app might be due to:')
        console.log('1. Network issues between your app and Supabase')
        console.log('2. Browser-specific issues')
        console.log('3. React component state management problems')
        console.log('4. Authentication token issues in the browser')
        
        console.log('\n📝 Next steps:')
        console.log('1. Check your browser console for detailed error logs')
        console.log('2. Try refreshing the page and logging in again')
        console.log('3. Check your internet connection')
        console.log('4. Try in a different browser')
        
      } catch (error) {
        clearTimeout(timeoutId)
        console.error('❌ Error during test:', error.message)
        console.error('Error details:', error)
        
        if (error.code === '42501') {
          console.log('\n🔧 SOLUTION: RLS Policy Issue')
          console.log('Run the fix-stylist-profile-update.sql script in your Supabase SQL editor')
        } else if (error.code === '23505') {
          console.log('\n🔧 SOLUTION: Unique Constraint Issue')
          console.log('There is a unique constraint violation')
        } else {
          console.log('\n🔧 SOLUTION: Check the error details above')
        }
      }
    }
    
  } catch (error) {
    console.log('❌ Diagnosis error:', error.message)
  }
}

diagnoseStylistTimeout() 