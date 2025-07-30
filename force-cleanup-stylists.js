const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function forceCleanupStylists() {
  console.log('🧹 Force Cleaning up All Sample Stylists...\n')

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

    if (!stylists || stylists.length === 0) {
      console.log('✅ No stylists to clean up!')
      return
    }

    // Step 2: Get all stylist IDs
    const stylistIds = stylists.map(stylist => stylist.id)
    console.log(`📋 Stylist IDs to remove: ${stylistIds.join(', ')}`)

    // Step 3: Remove all catalog images
    console.log('\n2. Removing all catalog images...')
    const { error: deleteImagesError } = await supabase
      .from('catalog_images')
      .delete()
      .in('stylist_id', stylistIds)

    if (deleteImagesError) {
      console.log('❌ Error deleting catalog images:', deleteImagesError.message)
    } else {
      console.log('✅ Deleted all catalog images')
    }

    // Step 4: Remove all swipes
    console.log('\n3. Removing all swipes...')
    const { error: deleteSwipesError } = await supabase
      .from('swipes')
      .delete()
      .in('stylist_id', stylistIds)

    if (deleteSwipesError) {
      console.log('❌ Error deleting swipes:', deleteSwipesError.message)
    } else {
      console.log('✅ Deleted all swipes')
    }

    // Step 5: Remove all matches
    console.log('\n4. Removing all matches...')
    const { error: deleteMatchesError } = await supabase
      .from('matches')
      .delete()
      .in('stylist_id', stylistIds)

    if (deleteMatchesError) {
      console.log('❌ Error deleting matches:', deleteMatchesError.message)
    } else {
      console.log('✅ Deleted all matches')
    }

    // Step 6: Remove all stylists
    console.log('\n5. Removing all stylists...')
    const { error: deleteStylistsError } = await supabase
      .from('stylists')
      .delete()
      .in('id', stylistIds)

    if (deleteStylistsError) {
      console.log('❌ Error deleting stylists:', deleteStylistsError.message)
      console.log('💡 Trying alternative approach...')
      
      // Try deleting one by one
      for (const stylistId of stylistIds) {
        const { error: singleDeleteError } = await supabase
          .from('stylists')
          .delete()
          .eq('id', stylistId)
        
        if (singleDeleteError) {
          console.log(`❌ Error deleting stylist ${stylistId}:`, singleDeleteError.message)
        } else {
          console.log(`✅ Deleted stylist ${stylistId}`)
        }
      }
    } else {
      console.log(`✅ Successfully deleted ${stylistIds.length} stylists`)
    }

    // Step 7: Verify cleanup
    console.log('\n6. Verifying cleanup...')
    const { data: remainingStylists, error: remainingError } = await supabase
      .from('stylists')
      .select('*')

    if (remainingError) {
      console.log('❌ Error checking remaining stylists:', remainingError.message)
    } else {
      console.log(`✅ Remaining stylists: ${remainingStylists?.length || 0}`)
      if (remainingStylists && remainingStylists.length > 0) {
        console.log('Stylists still remaining:')
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

    // Step 9: Check swipes
    const { data: remainingSwipes, error: swipesRemainingError } = await supabase
      .from('swipes')
      .select('*')

    if (swipesRemainingError) {
      console.log('❌ Error checking remaining swipes:', swipesRemainingError.message)
    } else {
      console.log(`✅ Remaining swipes: ${remainingSwipes?.length || 0}`)
    }

    // Step 10: Check matches
    const { data: remainingMatches, error: matchesRemainingError } = await supabase
      .from('matches')
      .select('*')

    if (matchesRemainingError) {
      console.log('❌ Error checking remaining matches:', matchesRemainingError.message)
    } else {
      console.log(`✅ Remaining matches: ${remainingMatches?.length || 0}`)
    }

    console.log('\n🎉 Force cleanup completed!')
    console.log('\n📋 Final Summary:')
    console.log(`- Stylists removed: ${stylistIds.length}`)
    console.log(`- Stylists remaining: ${remainingStylists?.length || 0}`)
    console.log(`- Catalog images remaining: ${remainingImages?.length || 0}`)
    console.log(`- Swipes remaining: ${remainingSwipes?.length || 0}`)
    console.log(`- Matches remaining: ${remainingMatches?.length || 0}`)

  } catch (error) {
    console.error('❌ Force cleanup failed:', error)
  }
}

forceCleanupStylists() 