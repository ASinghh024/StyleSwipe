'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, MessageCircle, Loader2, User } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { getUserChatRooms } from '@/lib/chat-utils'
import ChatModal from './ChatModal'
import { formatDistanceToNow } from 'date-fns'

interface ChatRoomsModalProps {
  isOpen: boolean
  onClose: () => void
}

interface ChatRoom {
  id: string
  match_id: string
  user_id: string
  stylist_id: string
  created_at: string
  updated_at: string
  user_profiles: {
    user_id: string
    full_name: string
    role: 'user' | 'stylist'
  }
  stylist_profiles: {
    user_id: string
    full_name: string
    role: 'user' | 'stylist'
  }
  latest_message: {
    content: string
    created_at: string
    sender_id: string
  }[]
}

export default function ChatRoomsModal({ isOpen, onClose }: ChatRoomsModalProps) {
  const { user, userProfile } = useAuth()
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedChat, setSelectedChat] = useState<{
    isOpen: boolean
    matchId: string
    otherUserId: string
    otherUserName: string
    otherUserRole: 'user' | 'stylist'
  } | null>(null)

  useEffect(() => {
    if (isOpen && user) {
      fetchChatRooms()
    }
  }, [isOpen, user])

  const fetchChatRooms = async () => {
    if (!user) return

    setLoading(true)
    try {
      const { chatRooms, error } = await getUserChatRooms(user.id)
      if (error) throw new Error(error)
      
      console.log('Fetched chat rooms:', chatRooms)
      setChatRooms(chatRooms)
    } catch (error) {
      console.error('Error fetching chat rooms:', error)
    } finally {
      setLoading(false)
    }
  }

  const openChat = (chatRoom: ChatRoom) => {
    const otherUser = userProfile?.role === 'stylist' 
      ? { id: chatRoom.user_id, name: chatRoom.user_profiles.full_name, role: 'user' as const }
      : { id: chatRoom.stylist_id, name: chatRoom.stylist_profiles.full_name, role: 'stylist' as const }

    setSelectedChat({
      isOpen: true,
      matchId: chatRoom.match_id,
      otherUserId: otherUser.id,
      otherUserName: otherUser.name,
      otherUserRole: otherUser.role
    })
  }

  const closeChat = () => {
    setSelectedChat(null)
    // Refresh chat rooms list when returning from a chat
    fetchChatRooms()
  }

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          >
            <motion.div
              className="bg-dark-card w-full max-w-md rounded-2xl shadow-xl overflow-hidden"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-dark-border">
                <h2 className="text-lg font-semibold text-dark-text-primary flex items-center">
                  <MessageCircle className="h-5 w-5 mr-2 text-accent-blue" />
                  Messages
                </h2>
                <button
                  onClick={onClose}
                  className="text-dark-text-tertiary hover:text-dark-text-secondary transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Chat Rooms List */}
              <div className="h-96 overflow-y-auto p-2">
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-8 w-8 text-accent-blue animate-spin" />
                  </div>
                ) : chatRooms.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-dark-text-tertiary">
                    <MessageCircle className="h-12 w-12 mb-2 opacity-50" />
                    <p>No messages yet</p>
                    <p className="text-sm">Your conversations will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {chatRooms.map((chatRoom) => {
                      const otherUser = userProfile?.role === 'stylist' 
                        ? { id: chatRoom.user_id, name: chatRoom.user_profiles.full_name, role: 'user' as const }
                        : { id: chatRoom.stylist_id, name: chatRoom.stylist_profiles.full_name, role: 'stylist' as const }
                      
                      const latestMessage = chatRoom.latest_message?.[0]
                      
                      return (
                        <button
                          key={chatRoom.id}
                          className="w-full text-left p-3 rounded-xl hover:bg-dark-surface transition-colors flex items-start space-x-3"
                          onClick={() => openChat(chatRoom)}
                        >
                          <div className="w-10 h-10 bg-dark-surface rounded-full flex items-center justify-center flex-shrink-0">
                            <User className="h-5 w-5 text-dark-text-secondary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-baseline">
                              <h3 className="font-medium text-dark-text-primary truncate">
                                {otherUser.name || 'User'}
                              </h3>
                              {latestMessage && (
                                <span className="text-xs text-dark-text-tertiary">
                                  {formatDistanceToNow(new Date(latestMessage.created_at), { addSuffix: true })}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-dark-text-secondary truncate">
                              {latestMessage ? latestMessage.content : 'No messages yet'}
                            </p>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {selectedChat && (
        <ChatModal
          isOpen={selectedChat.isOpen}
          onClose={closeChat}
          matchId={selectedChat.matchId}
          otherUserId={selectedChat.otherUserId}
          otherUserName={selectedChat.otherUserName}
          otherUserRole={selectedChat.otherUserRole}
        />
      )}
    </>
  )
}