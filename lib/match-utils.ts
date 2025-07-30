import { supabase } from './supabase'

export interface MatchData {
  id: string
  user_id: string
  stylist_id: string
  matched_at: string
  status: 'pending' | 'mutual' | 'declined'
  stylist_response: boolean | null
  user_response: boolean
}

export interface UserPreferences {
  gender: string
  clothing_preferences: string[]
  preferred_occasions: string[]
  style_preferences: string
  budget_range: string
}

export interface UserProfile {
  full_name: string
  role: string
}

/**
 * Create a match when a user likes a stylist
 */
export const createMatch = async (userId: string, stylistId: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from('matches')
      .insert({
        user_id: userId,
        stylist_id: stylistId,
        matched_at: new Date().toISOString(),
        user_response: true,
        status: 'pending'
      })

    if (error) {
      throw error
    }

    // Create notification for the stylist
    await createMatchNotification(stylistId, userId, 'new_match')

    return { success: true }
  } catch (error) {
    console.error('Error creating match:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Update stylist response to a match
 */
export const updateStylistResponse = async (
  matchId: string, 
  response: boolean
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { data, error } = await supabase
      .from('matches')
      .update({ stylist_response: response })
      .eq('id', matchId)
      .select('user_id, stylist_id')
      .single()

    if (error) {
      throw error
    }

    // Create notification for the user
    const notificationType = response ? 'match_accepted' : 'match_declined'
    await createMatchNotification(data.user_id, data.stylist_id, notificationType)

    return { success: true }
  } catch (error) {
    console.error('Error updating stylist response:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Get matches for a user (as a user)
 */
export const getUserMatches = async (userId: string): Promise<{ matches: MatchData[]; error?: string }> => {
  try {
    const { data, error } = await supabase
      .from('matches')
      .select(`
        *,
        stylist:stylists(*)
      `)
      .eq('user_id', userId)
      .order('matched_at', { ascending: false })

    if (error) {
      throw error
    }

    return { matches: data || [] }
  } catch (error) {
    console.error('Error fetching user matches:', error)
    return { 
      matches: [], 
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Get matches for a stylist following the exact workflow:
 * 1. Get all user_ids from matches table where stylist_id = current stylist
 * 2. Using those user_ids, get full_name from user_profiles table  
 * 3. Using those user_ids, get preferences from user_preferences table
 */
export const getStylistMatches = async (stylistId: string): Promise<{ matches: any[]; error?: string }> => {
  try {
    console.log(`🔍 STEP 1: Getting user_ids from matches table for stylist: ${stylistId}`)

    // STEP 1: Get all user_ids from matches table which have matched with the stylist
    const { data: matchesData, error: matchesError } = await supabase
      .from('matches')
      .select('id, user_id, stylist_id, matched_at')
      .eq('stylist_id', stylistId)
      .order('matched_at', { ascending: false })

    if (matchesError) {
      console.error('❌ Error fetching matches:', matchesError)
      throw matchesError
    }

    if (!matchesData || matchesData.length === 0) {
      console.log('📝 No matches found for this stylist')
      return { matches: [] }
    }

    console.log(`📊 Found ${matchesData.length} matches with user_ids:`, matchesData.map(m => m.user_id))

    // Extract all user_ids for batch queries
    const userIds = matchesData.map(match => match.user_id)

    console.log(`🔍 STEP 2: Getting full_name from user_profiles for user_ids:`, userIds)

    // STEP 2: Using these user_ids, get full_name from user_profiles table
    const { data: userProfiles, error: profilesError } = await supabase
      .from('user_profiles')
      .select('user_id, full_name')
      .in('user_id', userIds)

    if (profilesError) {
      console.error('❌ Error fetching user profiles:', profilesError)
      // Don't throw here, continue with empty profiles
    }

    console.log(`👤 Found ${userProfiles?.length || 0} user profiles`)

    console.log(`🔍 STEP 3: Getting preferences from user_preferences for user_ids:`, userIds)

    // STEP 3: Using those same user_ids, get specific data from user_preferences table
    const { data: userPreferences, error: preferencesError } = await supabase
      .from('user_preferences')
      .select(`
        user_id,
        clothing_preferences,
        preferred_occasions,
        style_preferences,
        budget_range,
        gender
      `)
      .in('user_id', userIds)

    if (preferencesError) {
      console.error('❌ Error fetching user preferences:', preferencesError)
      // Don't throw here, continue with empty preferences
    }

    console.log(`🎯 Found ${userPreferences?.length || 0} user preferences`)

    console.log(`🔍 STEP 4: Combining all data for each match`)

    // Debug: Log the user_ids we're working with
    console.log('📋 Available user_ids from matches:', matchesData.map(m => m.user_id))
    console.log('📋 Available user_ids from profiles:', userProfiles?.map(p => p.user_id) || [])

    // STEP 4: Combine all the data for each match
    const enrichedMatches = matchesData.map((match) => {
      console.log(`🔍 Processing match with user_id: ${match.user_id}`)
      
      // Find the user profile for this user_id
      const userProfile = userProfiles?.find(profile => profile.user_id === match.user_id)
      
      // Debug: Log the profile search result
      if (userProfile) {
        console.log(`✅ Found profile for ${match.user_id}: full_name="${userProfile.full_name}"`)
      } else {
        console.warn(`❌ NO PROFILE FOUND for ${match.user_id}`)
        console.log(`Available profiles:`, userProfiles?.map(p => ({ 
          user_id: p.user_id, 
          full_name: p.full_name,
          matches_current: p.user_id === match.user_id
        })))
      }
      
      // Find the user preferences for this user_id
      const userPrefs = userPreferences?.find(prefs => prefs.user_id === match.user_id)

      // Get the user name with improved fallback logic
      let userName = 'Anonymous User'
      
      if (userProfile?.full_name && userProfile.full_name.trim() !== '') {
        // Use the full name if it exists and is not empty
        userName = userProfile.full_name.trim()
        console.log(`✅ Using full_name: "${userName}" for user ${match.user_id}`)
      } else {
        // Better fallback: create a more readable name
        const shortId = match.user_id.slice(-6)
        userName = `User ${shortId}`
        
        console.warn(`⚠️ User ${match.user_id} has no full_name, using fallback: ${userName}`)
        if (userProfile) {
          console.warn(`⚠️ Profile exists but full_name is: "${userProfile.full_name}"`)
        }
      }

      console.log(`✅ Processing match for user ${userName} (${match.user_id})`)

      return {
        // Original match data
        ...match,
        
        // User name from user_profiles (with improved fallback)
        user_name: userName,
        user_profile: userProfile,
        
        // Styling preferences from user_preferences (mapped to requested field names)
        styling_preferences: {
          gender: userPrefs?.gender || null,
          clothing_type: userPrefs?.clothing_preferences || [],
          occasion: userPrefs?.preferred_occasions || [],
          style: userPrefs?.style_preferences || null,
          budget: userPrefs?.budget_range || null
        },
        
        // Keep raw preferences for backward compatibility
        raw_preferences: userPrefs,
        
        // Add a flag to indicate if profile is missing/incomplete
        profile_complete: !!(userProfile?.full_name && userProfile.full_name.trim() !== '')
      }
    })

    console.log(`✅ Successfully processed ${enrichedMatches.length} matches with user data`)
    
    return { matches: enrichedMatches }

  } catch (error) {
    console.error('❌ Error in getStylistMatches workflow:', error)
    return { 
      matches: [], 
      error: error instanceof Error ? error.message : 'Failed to fetch matches'
    }
  }
}

/**
 * Create a notification for a match event
 */
export const createMatchNotification = async (
  userId: string, 
  relatedUserId: string, 
  type: 'new_match' | 'match_accepted' | 'match_declined'
): Promise<void> => {
  try {
    // First, get the match ID
    const { data: match, error: matchError } = await supabase
      .from('matches')
      .select('id')
      .or(`and(user_id.eq.${userId},stylist_id.eq.${relatedUserId}),and(user_id.eq.${relatedUserId},stylist_id.eq.${userId})`)
      .single()

    if (matchError || !match) {
      console.error('Error finding match for notification:', matchError)
      return
    }

    const { error } = await supabase
      .from('match_notifications')
      .insert({
        match_id: match.id,
        user_id: userId,
        notification_type: type,
        is_read: false
      })

    if (error) {
      console.error('Error creating notification:', error)
    }
  } catch (error) {
    console.error('Error creating match notification:', error)
  }
}

/**
 * Get unread notifications for a user
 */
export const getUnreadNotifications = async (userId: string): Promise<{ notifications: any[]; error?: string }> => {
  try {
    const { data, error } = await supabase
      .from('match_notifications')
      .select(`
        *,
        match:matches(
          *,
          stylist:stylists(name),
          user_profile:user_profiles!matches_user_id_fkey(full_name)
        )
      `)
      .eq('user_id', userId)
      .eq('is_read', false)
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    return { notifications: data || [] }
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return { 
      notifications: [], 
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Mark notifications as read
 */
export const markNotificationsAsRead = async (notificationIds: string[]): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from('match_notifications')
      .update({ is_read: true })
      .in('id', notificationIds)

    if (error) {
      throw error
    }

    return { success: true }
  } catch (error) {
    console.error('Error marking notifications as read:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Get match statistics for a stylist
 */
export const getStylistMatchStats = async (stylistId: string): Promise<{
  total: number
  pending: number
  mutual: number
  declined: number
  error?: string
}> => {
  try {
    const { data, error } = await supabase
      .from('matches')
      .select('status')
      .eq('stylist_id', stylistId)

    if (error) {
      throw error
    }

    const matches = data || []
    const total = matches.length
    const pending = matches.filter(m => m.status === 'pending').length
    const mutual = matches.filter(m => m.status === 'mutual').length
    const declined = matches.filter(m => m.status === 'declined').length

    return { total, pending, mutual, declined }
  } catch (error) {
    console.error('Error fetching stylist match stats:', error)
    return { 
      total: 0, 
      pending: 0, 
      mutual: 0, 
      declined: 0,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
} 

/**
 * Get matched users for a stylist (alias for getStylistMatches)
 * This function fetches all users who have swiped right on the given stylist
 */
export const getMatchedUsers = async (stylistId: string): Promise<{ 
  users: any[]; 
  total: number; 
  error?: string 
}> => {
  try {
    const result = await getStylistMatches(stylistId)
    
    if (result.error) {
      return { 
        users: [], 
        total: 0, 
        error: result.error 
      }
    }

    return { 
      users: result.matches, 
      total: result.matches.length 
    }
  } catch (error) {
    console.error('Error fetching matched users:', error)
    return { 
      users: [], 
      total: 0, 
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
} 