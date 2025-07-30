import { supabase } from './supabase'

export async function addStylistToStylistsTable(userId: string, userProfile: any) {
  try {
    console.log('Adding stylist to stylists table:', userId)

    // Check if stylist already exists
    const { data: existingStylist, error: checkError } = await supabase
      .from('stylists')
      .select('id')
      .eq('id', userId)
      .single()

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking existing stylist:', checkError)
      return { success: false, error: checkError }
    }

    if (existingStylist) {
      console.log('Stylist already exists in stylists table')
      return { success: true, message: 'Stylist already exists' }
    }

    // Add stylist to stylists table
    const { error: insertError } = await supabase
      .from('stylists')
      .insert({
        id: userId,
        name: userProfile.full_name,
        bio: userProfile.bio || `Professional stylist ${userProfile.full_name} ready to help you look your best!`,
        specialties: userProfile.specialties || ['Personal Styling', 'Fashion Consultation'],
        catalog_urls: userProfile.catalog_urls || []
      })

    if (insertError) {
      console.error('Error adding stylist to stylists table:', insertError)
      return { success: false, error: insertError }
    }

    console.log('Successfully added stylist to stylists table')
    return { success: true, message: 'Stylist added successfully' }
  } catch (error) {
    console.error('Error adding stylist to stylists table:', error)
    return { success: false, error }
  }
}

export async function getStylistCatalogImages(stylistId: string) {
  try {
    console.log('Fetching catalog images for stylist:', stylistId)

    const { data: catalogImages, error } = await supabase
      .from('catalog_images')
      .select('*')
      .eq('stylist_id', stylistId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching catalog images:', error)
      return { success: false, error, images: [] }
    }

    console.log('Successfully fetched catalog images:', catalogImages?.length || 0)
    return { success: true, images: catalogImages || [] }
  } catch (error) {
    console.error('Error fetching catalog images:', error)
    return { success: false, error, images: [] }
  }
}

export async function getStylistsWithCatalogImages() {
  try {
    console.log('Fetching stylists with catalog images')

    // First, get all stylists
    const { data: stylists, error: stylistsError } = await supabase
      .from('stylists')
      .select('*')
      .order('created_at', { ascending: false })

    if (stylistsError) {
      console.error('Error fetching stylists:', stylistsError)
      return { success: false, error: stylistsError, stylists: [] }
    }

    // For each stylist, fetch their catalog images
    const stylistsWithImages = await Promise.all(
      stylists?.map(async (stylist) => {
        const { images } = await getStylistCatalogImages(stylist.id)
        return {
          ...stylist,
          catalog_images: images
        }
      }) || []
    )

    console.log('Successfully fetched stylists with catalog images:', stylistsWithImages.length)
    return { success: true, stylists: stylistsWithImages }
  } catch (error) {
    console.error('Error fetching stylists with catalog images:', error)
    return { success: false, error, stylists: [] }
  }
} 