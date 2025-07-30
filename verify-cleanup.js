const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function verifyCleanup() {
  console.log('🔍 Verifying Cleanup Status...\n')

  try {
    // Check stylists
    console.log('1. Checking stylists...')
    const { data: stylists, error: stylistsError } = await supabase
      .from('stylists')
      .select('*')

    if (stylistsError) {
      console.log('❌ Error fetching stylists:', stylistsError.message)
    } else {
      console.log(`✅ Found ${stylists?.length || 0} stylists`)
      if (stylists && stylists.length > 0) {
        console.log('Remaining stylists:')
        stylists.forEach((stylist, index) => {
          console.log(`   ${index + 1}. ${stylist.name} (ID: ${stylist.id})`)
        })
      }
    }

    // Check catalog images
    console.log('\n2. Checking catalog images...')
    const { data: catalogImages, error: imagesError } = await supabase
      .from('catalog_images')
      .select('*')

    if (imagesError) {
      console.log('❌ Error fetching catalog images:', imagesError.message)
    } else {
      console.log(`✅ Found ${catalogImages?.length || 0} catalog images`)
      if (catalogImages && catalogImages.length > 0) {
        console.log('Remaining catalog images:')
        catalogImages.forEach((image, index) => {
          console.log(`   ${index + 1}. ${image.file_name} (stylist_id: ${image.stylist_id})`)
        })
      }
    }

    // Check swipes
    console.log('\n3. Checking swipes...')
    const { data: swipes, error: swipesError } = await supabase
      .from('swipes')
      .select('*')

    if (swipesError) {
      console.log('❌ Error fetching swipes:', swipesError.message)
    } else {
      console.log(`✅ Found ${swipes?.length || 0} swipes`)
    }

    // Check matches
    console.log('\n4. Checking matches...')
    const { data: matches, error: matchesError } = await supabase
      .from('matches')
      .select('*')

    if (matchesError) {
      console.log('❌ Error fetching matches:', matchesError.message)
    } else {
      console.log(`✅ Found ${matches?.length || 0} matches`)
    }

    console.log('\n🎉 Verification completed!')
    console.log('\n📋 Summary:')
    console.log(`- Stylists: ${stylists?.length || 0}`)
    console.log(`- Catalog images: ${catalogImages?.length || 0}`)
    console.log(`- Swipes: ${swipes?.length || 0}`)
    console.log(`- Matches: ${matches?.length || 0}`)

    if ((stylists?.length || 0) === 0) {
      console.log('\n✅ SUCCESS: All sample stylists have been removed!')
      console.log('💡 Now you can:')
      console.log('   1. Sign up as a real stylist')
      console.log('   2. Upload catalog images')
      console.log('   3. Test the catalog images display')
    } else {
      console.log('\n⚠️  Sample stylists still exist')
      console.log('💡 Run the SQL script in Supabase SQL Editor to remove them')
    }

  } catch (error) {
    console.error('❌ Verification failed:', error)
  }
}

verifyCleanup() 