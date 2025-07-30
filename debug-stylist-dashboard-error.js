const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://znrbomzifktbqfygowfl.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpucmJvbXppZmt0YnFmeWdvd2ZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ2NjIxMzEsImV4cCI6MjA1MDIzODEzMX0.0WUK-tGb_gS-JRFCG50MRdX3tCAAm-yQPhk0XmCFdE0'

const supabase = createClient(supabaseUrl, supabaseKey)

async function debugStylistDashboardError() {
  try {
    console.log('🔍 Debugging Stylist Dashboard Error\n')

    // Test basic connectivity
    console.log('1️⃣ Testing basic Supabase connectivity...')
    try {
      const { data, error } = await supabase.from('stylists').select('count').limit(1)
      if (error) throw error
      console.log('✅ Basic connectivity works')
    } catch (error) {
      console.error('❌ Basic connectivity failed:', error.message)
      return
    }

    // Check if stylists table exists and has data
    console.log('\n2️⃣ Checking stylists table...')
    try {
      const { data: stylists, error } = await supabase
        .from('stylists')
        .select('id, name')
        .limit(5)
      
      if (error) throw error
      console.log(`✅ Found ${stylists?.length || 0} stylists`)
      if (stylists && stylists.length > 0) {
        console.log('Sample stylist:', stylists[0])
      }
    } catch (error) {
      console.error('❌ Error checking stylists:', error.message)
    }

    // Check matches table
    console.log('\n3️⃣ Checking matches table...')
    try {
      const { data: matches, error } = await supabase
        .from('matches')
        .select('id, user_id, stylist_id, matched_at')
        .limit(5)
      
      if (error) throw error
      console.log(`✅ Found ${matches?.length || 0} matches`)
      if (matches && matches.length > 0) {
        console.log('Sample match:', matches[0])
      }
    } catch (error) {
      console.error('❌ Error checking matches:', error.message)
      console.log('This might be due to RLS policies blocking access')
    }

    // Test the exact query that getMatchedUsers uses
    console.log('\n4️⃣ Testing getMatchedUsers query...')
    
    // First, get a sample stylist ID
    const { data: sampleStylist, error: stylistError } = await supabase
      .from('stylists')
      .select('id')
      .limit(1)
      .single()

    if (stylistError || !sampleStylist) {
      console.log('⚠️ No stylists found to test with')
      return
    }

    const testStylistId = sampleStylist.id
    console.log(`Testing with stylist ID: ${testStylistId}`)

    try {
      const { data, error } = await supabase
        .from('matches')
        .select(`
          *,
          user_profile:user_profiles!matches_user_id_fkey(
            full_name,
            role
          )
        `)
        .eq('stylist_id', testStylistId)
        .order('matched_at', { ascending: false })

      if (error) throw error
      console.log(`✅ Query successful, found ${data?.length || 0} matches for this stylist`)
      
    } catch (error) {
      console.error('❌ getMatchedUsers query failed:', error.message)
      console.log('Error details:', error)
    }

    // Check user_profiles table structure
    console.log('\n5️⃣ Checking user_profiles table...')
    try {
      const { data: profiles, error } = await supabase
        .from('user_profiles')
        .select('user_id, full_name, role')
        .limit(3)
      
      if (error) throw error
      console.log(`✅ Found ${profiles?.length || 0} user profiles`)
      if (profiles && profiles.length > 0) {
        console.log('Sample profiles:', profiles)
      }
    } catch (error) {
      console.error('❌ Error checking user_profiles:', error.message)
    }

    console.log('\n📋 Diagnosis complete!')
    console.log('\n🔧 Likely solutions:')
    console.log('1. Run the fix-stylist-matches-policy-simple.sql script in Supabase SQL Editor')
    console.log('2. Make sure you are logged in as a stylist (role = "stylist")')
    console.log('3. Ensure the stylists table has an entry for your user ID')
    console.log('4. Check that matches exist in the database')

  } catch (error) {
    console.error('❌ Unexpected error during debugging:', error)
  }
}

debugStylistDashboardError() 