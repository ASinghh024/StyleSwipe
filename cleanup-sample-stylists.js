const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function cleanupSampleStylists() {
  console.log('🧹 Cleaning up Sample Stylists...\n')

  try {
    // Step 1: Get all stylists
    console.log('1. Fetching all stylists...')
    const { data: stylists, error: stylistsError } = await supabase
      .from('stylists')
      .select('*')

    if (stylistsError) {
      console.log('❌ Error fetching stylists:', stylistsError.message)
      return
    }

    console.log(`✅ Found ${stylists?.length || 0} stylists`)

    // Step 2: Identify sample stylists (those not in auth.users)
    console.log('\n2. Identifying sample stylists...')
    const sampleStylistIds = []
    
    for (const stylist of stylists || []) {
      try {
        const { data: user, error: userError } = await supabase.auth.admin.getUserById(stylist.id)
        if (userError) {
          console.log(`❌ Sample stylist: ${stylist.name} (ID: ${stylist.id})`)
          sampleStylistIds.push(stylist.id)
        } else {
          console.log(`✅ Real stylist: ${stylist.name} (ID: ${stylist.id})`)
        }
      } catch (error) {
        console.log(`❌ Sample stylist: ${stylist.name} (ID: ${stylist.id})`)
        sampleStylistIds.push(stylist.id)
      }
    }

    console.log(`\n📊 Summary:`)
    console.log(`- Total stylists: ${stylists?.length || 0}`)
    console.log(`- Sample stylists to remove: ${sampleStylistIds.length}`)
    console.log(`- Real stylists to keep: ${(stylists?.length || 0) - sampleStylistIds.length}`)

    if (sampleStylistIds.length === 0) {
      console.log('\n✅ No sample stylists found to remove!')
      return
    }

    // Step 3: Remove catalog images for sample stylists
    console.log('\n3. Removing catalog images for sample stylists...')
    for (const stylistId of sampleStylistIds) {
      const { data: catalogImages, error: imagesError } = await supabase
        .from('catalog_images')
        .select('*')
        .eq('stylist_id', stylistId)

      if (imagesError) {
        console.log(`❌ Error fetching catalog images for ${stylistId}:`, imagesError.message)
      } else if (catalogImages && catalogImages.length > 0) {
        const { error: deleteImagesError } = await supabase
          .from('catalog_images')
          .delete()
          .eq('stylist_id', stylistId)

        if (deleteImagesError) {
          console.log(`❌ Error deleting catalog images for ${stylistId}:`, deleteImagesError.message)
        } else {
          console.log(`✅ Deleted ${catalogImages.length} catalog images for stylist ${stylistId}`)
        }
      }
    }

    // Step 4: Remove swipes for sample stylists
    console.log('\n4. Removing swipes for sample stylists...')
    for (const stylistId of sampleStylistIds) {
      const { data: swipes, error: swipesError } = await supabase
        .from('swipes')
        .select('*')
        .eq('stylist_id', stylistId)

      if (swipesError) {
        console.log(`❌ Error fetching swipes for ${stylistId}:`, swipesError.message)
      } else if (swipes && swipes.length > 0) {
        const { error: deleteSwipesError } = await supabase
          .from('swipes')
          .delete()
          .eq('stylist_id', stylistId)

        if (deleteSwipesError) {
          console.log(`❌ Error deleting swipes for ${stylistId}:`, deleteSwipesError.message)
        } else {
          console.log(`✅ Deleted ${swipes.length} swipes for stylist ${stylistId}`)
        }
      }
    }

    // Step 5: Remove matches for sample stylists
    console.log('\n5. Removing matches for sample stylists...')
    for (const stylistId of sampleStylistIds) {
      const { data: matches, error: matchesError } = await supabase
        .from('matches')
        .select('*')
        .eq('stylist_id', stylistId)

      if (matchesError) {
        console.log(`❌ Error fetching matches for ${stylistId}:`, matchesError.message)
      } else if (matches && matches.length > 0) {
        const { error: deleteMatchesError } = await supabase
          .from('matches')
          .delete()
          .eq('stylist_id', stylistId)

        if (deleteMatchesError) {
          console.log(`❌ Error deleting matches for ${stylistId}:`, deleteMatchesError.message)
        } else {
          console.log(`✅ Deleted ${matches.length} matches for stylist ${stylistId}`)
        }
      }
    }

    // Step 6: Remove sample stylists
    console.log('\n6. Removing sample stylists...')
    const { error: deleteStylistsError } = await supabase
      .from('stylists')
      .delete()
      .in('id', sampleStylistIds)

    if (deleteStylistsError) {
      console.log('❌ Error deleting sample stylists:', deleteStylistsError.message)
    } else {
      console.log(`✅ Successfully deleted ${sampleStylistIds.length} sample stylists`)
    }

    // Step 7: Verify cleanup
    console.log('\n7. Verifying cleanup...')
    const { data: remainingStylists, error: remainingError } = await supabase
      .from('stylists')
      .select('*')

    if (remainingError) {
      console.log('❌ Error checking remaining stylists:', remainingError.message)
    } else {
      console.log(`✅ Remaining stylists: ${remainingStylists?.length || 0}`)
      if (remainingStylists && remainingStylists.length > 0) {
        console.log('Real stylists remaining:')
        remainingStylists.forEach((stylist, index) => {
          console.log(`   ${index + 1}. ${stylist.name} (ID: ${stylist.id})`)
        })
      }
    }

    // Step 8: Check catalog images
    const { data: remainingImages, error: imagesRemainingError } = await supabase
      .from('catalog_images')
      .select('*')

    if (imagesRemainingError) {
      console.log('❌ Error checking remaining catalog images:', imagesRemainingError.message)
    } else {
      console.log(`✅ Remaining catalog images: ${remainingImages?.length || 0}`)
    }

    console.log('\n🎉 Sample stylists cleanup completed!')
    console.log('\n📋 Summary:')
    console.log(`- Sample stylists removed: ${sampleStylistIds.length}`)
    console.log(`- Real stylists remaining: ${remainingStylists?.length || 0}`)
    console.log(`- Catalog images remaining: ${remainingImages?.length || 0}`)

  } catch (error) {
    console.error('❌ Cleanup failed:', error)
  }
}

cleanupSampleStylists() 