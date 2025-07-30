import { supabase } from './supabase'

export interface ChatRoom {
  id: string
  match_id: string
  user_id: string
  stylist_id: string
  created_at: string
  updated_at: string
}

export interface Message {
  id: string
  chat_room_id: string
  sender_id: string
  content: string
  message_type: 'text' | 'image' | 'system'
  is_read: boolean
  created_at: string
  updated_at: string
}

export interface ChatParticipant {
  id: string
  name: string
  role: 'user' | 'stylist'
}

// Create or get existing chat room for a match
export const createOrGetChatRoom = async (
  matchId: string,
  userId: string,
  stylistId: string
): Promise<{ chatRoom: ChatRoom | null; error?: string }> => {
  try {
    console.log('🔍 Creating/getting chat room for match:', matchId)
    
    // First try to find existing chat room
    const { data: existingRoom, error: findError } = await supabase
      .from('chat_rooms')
      .select('*')
      .eq('match_id', matchId)
      .single()

    if (existingRoom && !findError) {
      console.log('✅ Found existing chat room:', existingRoom.id)
      return { chatRoom: existingRoom }
    }

    console.log('🆕 Creating new chat room...')
    
    // If no room exists, create one
    const { data: newRoom, error: createError } = await supabase
      .from('chat_rooms')
      .insert({
        match_id: matchId,
        user_id: userId,
        stylist_id: stylistId
      })
      .select()
      .single()

    if (createError) {
      console.error('❌ Error creating chat room:', createError)
      throw createError
    }

    console.log('✅ Created new chat room:', newRoom.id)
    return { chatRoom: newRoom }
  } catch (error) {
    console.error('❌ Error creating/getting chat room:', error)
    return { 
      chatRoom: null, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

// Send a message
export const sendMessage = async (
  chatRoomId: string,
  senderId: string,
  content: string,
  messageType: 'text' | 'image' | 'system' = 'text'
): Promise<{ message: Message | null; error?: string }> => {
  try {
    console.log('📤 Sending message to room:', chatRoomId)
    
    const { data, error } = await supabase
      .from('messages')
      .insert({
        chat_room_id: chatRoomId,
        sender_id: senderId,
        content,
        message_type: messageType
      })
      .select()
      .single()

    if (error) {
      console.error('❌ Error sending message:', error)
      throw error
    }

    console.log('✅ Message sent successfully')
    return { message: data }
  } catch (error) {
    console.error('❌ Error sending message:', error)
    return { 
      message: null, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

// Get messages for a chat room
export const getChatMessages = async (
  chatRoomId: string
): Promise<{ messages: Message[]; error?: string }> => {
  try {
    console.log('📥 Loading messages for room:', chatRoomId)
    
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('chat_room_id', chatRoomId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('❌ Error fetching messages:', error)
      throw error
    }

    console.log(`✅ Loaded ${data?.length || 0} messages`)
    return { messages: data || [] }
  } catch (error) {
    console.error('❌ Error fetching messages:', error)
    return { 
      messages: [], 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

// Mark messages as read
export const markMessagesAsRead = async (
  chatRoomId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('chat_room_id', chatRoomId)
      .neq('sender_id', userId) // Don't mark own messages as read

    if (error) {
      console.error('❌ Error marking messages as read:', error)
      throw error
    }

    return { success: true }
  } catch (error) {
    console.error('❌ Error marking messages as read:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

// Get chat participant info
export const getChatParticipants = async (
  userId: string,
  stylistId: string
): Promise<{ participants: ChatParticipant[]; error?: string }> => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('user_id, full_name, role')
      .in('user_id', [userId, stylistId])

    if (error) {
      console.error('❌ Error fetching participants:', error)
      throw error
    }

    const participants = data.map(profile => ({
      id: profile.user_id,
      name: profile.full_name || 'Anonymous',
      role: profile.role as 'user' | 'stylist'
    }))

    return { participants }
  } catch (error) {
    console.error('❌ Error fetching participants:', error)
    return { 
      participants: [], 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

// Get user's chat rooms with latest message info
export const getUserChatRooms = async (
  userId: string
): Promise<{ chatRooms: any[]; error?: string }> => {
  try {
    const { data, error } = await supabase
      .from('chat_rooms')
      .select(`
        *,
        user_profiles!chat_rooms_user_id_fkey(user_id, full_name, role),
        stylist_profiles:user_profiles!chat_rooms_stylist_id_fkey(user_id, full_name, role),
        latest_message:messages(
          content,
          created_at,
          sender_id
        )
      `)
      .or(`user_id.eq.${userId},stylist_id.eq.${userId}`)
      .order('updated_at', { ascending: false })

    if (error) {
      throw error
    }

    return { chatRooms: data || [] }
  } catch (error) {
    console.error('❌ Error fetching chat rooms:', error)
    return { 
      chatRooms: [], 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

// Get unread message count for a user
export const getUnreadMessageCount = async (
  userId: string
): Promise<{ count: number; error?: string }> => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('id', { count: 'exact', head: true })
      .neq('sender_id', userId)
      .eq('is_read', false)
      .in('chat_room_id', 
        supabase
          .from('chat_rooms')
          .select('id')
          .or(`user_id.eq.${userId},stylist_id.eq.${userId}`)
      )

    if (error) {
      throw error
    }

    return { count: data || 0 }
  } catch (error) {
    console.error('❌ Error getting unread count:', error)
    return { 
      count: 0, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}