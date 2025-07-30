// Script to check matches in Supabase
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function checkMatches() {
  try {
    console.log('🔍 Checking Supabase Database...')
    
    // Check if tables exist
    console.log('\n📊 Checking tables...')
    
    // Check stylists table
    const { data: stylists, error: stylistsError } = await supabase
      .from('stylists')
      .select('count')
      .limit(1)
    
    if (stylistsError) {
      console.log('❌ Stylists table error:', stylistsError.message)
    } else {
      console.log('✅ Stylists table exists')
    }
    
    // Check swipes table
    const { data: swipes, error: swipesError } = await supabase
      .from('swipes')
      .select('count')
      .limit(1)
    
    if (swipesError) {
      console.log('❌ Swipes table error:', swipesError.message)
    } else {
      console.log('✅ Swipes table exists')
    }
    
    // Check matches table
    const { data: matches, error: matchesError } = await supabase
      .from('matches')
      .select('count')
      .limit(1)
    
    if (matchesError) {
      console.log('❌ Matches table error:', matchesError.message)
    } else {
      console.log('✅ Matches table exists')
    }
    
    // Get actual data counts
    console.log('\n📈 Data counts:')
    
    const { count: stylistsCount } = await supabase
      .from('stylists')
      .select('*', { count: 'exact', head: true })
    
    console.log(`👥 Stylists: ${stylistsCount || 0}`)
    
    const { count: swipesCount } = await supabase
      .from('swipes')
      .select('*', { count: 'exact', head: true })
    
    console.log(`👆 Swipes: ${swipesCount || 0}`)
    
    const { count: matchesCount } = await supabase
      .from('matches')
      .select('*', { count: 'exact', head: true })
    
    console.log(`💕 Matches: ${matchesCount || 0}`)
    
    // Show sample data
    console.log('\n📋 Sample data:')
    
    const { data: sampleStylists } = await supabase
      .from('stylists')
      .select('id, name')
      .limit(3)
    
    if (sampleStylists && sampleStylists.length > 0) {
      console.log('Sample stylists:')
      sampleStylists.forEach(stylist => {
        console.log(`  - ${stylist.name} (${stylist.id})`)
      })
    }
    
    const { data: sampleSwipes } = await supabase
      .from('swipes')
      .select('direction, created_at')
      .limit(3)
    
    if (sampleSwipes && sampleSwipes.length > 0) {
      console.log('Sample swipes:')
      sampleSwipes.forEach(swipe => {
        console.log(`  - ${swipe.direction} on ${new Date(swipe.created_at).toLocaleDateString()}`)
      })
    }
    
    const { data: sampleMatches } = await supabase
      .from('matches')
      .select('matched_at')
      .limit(3)
    
    if (sampleMatches && sampleMatches.length > 0) {
      console.log('Sample matches:')
      sampleMatches.forEach(match => {
        console.log(`  - Matched on ${new Date(match.matched_at).toLocaleDateString()}`)
      })
    }
    
  } catch (error) {
    console.log('❌ Error:', error.message)
  }
}

checkMatches() 