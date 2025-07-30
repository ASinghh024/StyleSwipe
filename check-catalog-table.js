const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function checkCatalogTable() {
  console.log('🔍 Checking Catalog Images Table...\n')

  try {
    // Test 1: Check if we can access any table
    console.log('1. Testing basic database access...')
    const { data: stylists, error: stylistsError } = await supabase
      .from('stylists')
      .select('count')
      .limit(1)

    if (stylistsError) {
      console.log('❌ Basic database access failed:', stylistsError.message)
      return
    }

    console.log('✅ Basic database access works')

    // Test 2: Check if catalog_images table exists
    console.log('\n2. Testing catalog_images table...')
    const { data: catalogImages, error: catalogError } = await supabase
      .from('catalog_images')
      .select('count')
      .limit(1)

    if (catalogError) {
      console.log('❌ Catalog images table access failed:', catalogError.message)
      console.log('💡 This could mean:')
      console.log('   - Table doesn\'t exist')
      console.log('   - RLS policies are blocking access')
      console.log('   - Network connectivity issue')
      return
    }

    console.log('✅ Catalog images table exists and is accessible')

    // Test 3: Try to get actual data
    console.log('\n3. Fetching catalog images data...')
    const { data: images, error: imagesError } = await supabase
      .from('catalog_images')
      .select('*')
      .limit(5)

    if (imagesError) {
      console.log('❌ Error fetching catalog images:', imagesError.message)
    } else {
      console.log(`✅ Found ${images?.length || 0} catalog images`)
      if (images && images.length > 0) {
        console.log('Sample image:', {
          id: images[0].id,
          stylist_id: images[0].stylist_id,
          image_url: images[0].image_url
        })
      }
    }

    // Test 4: Check stylists table
    console.log('\n4. Checking stylists table...')
    const { data: allStylists, error: stylistsError2 } = await supabase
      .from('stylists')
      .select('*')
      .limit(5)

    if (stylistsError2) {
      console.log('❌ Error fetching stylists:', stylistsError2.message)
    } else {
      console.log(`✅ Found ${allStylists?.length || 0} stylists`)
      if (allStylists && allStylists.length > 0) {
        console.log('Sample stylist:', {
          id: allStylists[0].id,
          name: allStylists[0].name,
          catalog_urls: allStylists[0].catalog_urls
        })
      }
    }

    console.log('\n🎉 Catalog table check completed!')

  } catch (error) {
    console.error('❌ Check failed:', error)
  }
}

checkCatalogTable() 