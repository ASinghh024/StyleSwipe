const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function debugCatalogUpload() {
  console.log('🔍 Debugging Catalog Upload Process...\n')

  try {
    // Step 1: Check if we can access catalog_images table
    console.log('1. Testing catalog_images table access...')
    const { data: catalogImages, error: catalogError } = await supabase
      .from('catalog_images')
      .select('*')

    if (catalogError) {
      console.log('❌ Error accessing catalog_images table:', catalogError.message)
      console.log('💡 This suggests RLS policies need to be updated')
      return
    }

    console.log('✅ Can access catalog_images table')
    console.log(`📸 Found ${catalogImages?.length || 0} catalog images`)

    // Step 2: Check if we can insert into catalog_images table
    console.log('\n2. Testing catalog_images table insert...')
    const testImageData = {
      stylist_id: '86d0106b-74d7-4b03-90f7-f32a9eecde51', // Sarah Johnson's ID
      image_url: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop',
      file_name: 'debug-test-image.jpg',
      file_size: 1024000,
      mime_type: 'image/jpeg'
    }

    const { data: insertedImage, error: insertError } = await supabase
      .from('catalog_images')
      .insert(testImageData)
      .select()

    if (insertError) {
      console.log('❌ Error inserting into catalog_images table:', insertError.message)
      console.log('💡 This suggests INSERT policy needs to be updated')
      return
    }

    console.log('✅ Can insert into catalog_images table')
    console.log('Inserted image ID:', insertedImage[0].id)

    // Step 3: Verify the insert worked
    console.log('\n3. Verifying insert...')
    const { data: verifyImages, error: verifyError } = await supabase
      .from('catalog_images')
      .select('*')
      .eq('stylist_id', '86d0106b-74d7-4b03-90f7-f32a9eecde51')

    if (verifyError) {
      console.log('❌ Error verifying insert:', verifyError.message)
    } else {
      console.log(`✅ Found ${verifyImages?.length || 0} images for stylist`)
      if (verifyImages && verifyImages.length > 0) {
        console.log('Sample image:', {
          id: verifyImages[0].id,
          image_url: verifyImages[0].image_url,
          file_name: verifyImages[0].file_name
        })
      }
    }

    // Step 4: Test fetching stylist with catalog images
    console.log('\n4. Testing stylist with catalog images...')
    const { data: stylist, error: stylistError } = await supabase
      .from('stylists')
      .select('*')
      .eq('id', '86d0106b-74d7-4b03-90f7-f32a9eecde51')
      .single()

    if (stylistError) {
      console.log('❌ Error fetching stylist:', stylistError.message)
    } else {
      console.log('✅ Found stylist:', stylist.name)
      
      // Fetch catalog images separately
      const { data: catalogImagesForStylist, error: imagesError } = await supabase
        .from('catalog_images')
        .select('*')
        .eq('stylist_id', stylist.id)
        .order('created_at', { ascending: false })

      if (imagesError) {
        console.log('❌ Error fetching catalog images for stylist:', imagesError.message)
      } else {
        console.log(`✅ Found ${catalogImagesForStylist?.length || 0} catalog images for stylist`)
        
        const stylistWithImages = {
          ...stylist,
          catalog_images: catalogImagesForStylist || []
        }

        console.log('Stylist with images:', {
          name: stylistWithImages.name,
          catalog_images_count: stylistWithImages.catalog_images.length,
          first_image_url: stylistWithImages.catalog_images[0]?.image_url || 'None'
        })
      }
    }

    // Step 5: Clean up test data
    console.log('\n5. Cleaning up test data...')
    const { error: deleteError } = await supabase
      .from('catalog_images')
      .delete()
      .eq('file_name', 'debug-test-image.jpg')

    if (deleteError) {
      console.log('❌ Error cleaning up test data:', deleteError.message)
    } else {
      console.log('✅ Test data cleaned up successfully')
    }

    console.log('\n🎉 Debug completed!')
    console.log('\n📋 Summary:')
    console.log('- Database access: ✅')
    console.log('- Insert capability: ✅')
    console.log('- Fetch capability: ✅')
    console.log('- Stylist integration: ✅')

  } catch (error) {
    console.error('❌ Debug failed:', error)
  }
}

debugCatalogUpload() 