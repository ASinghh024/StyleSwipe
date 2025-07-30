'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Send, Loader2, User } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { 
  createOrGetChatRoom, 
  sendMessage, 
  getChatMessages, 
  markMessagesAsRead,
  Message,
  ChatRoom 
} from '@/lib/chat-utils'
import { supabase } from '@/lib/supabase'

interface ChatModalProps {
  isOpen: boolean
  onClose: () => void
  matchId: string
  otherUserId: string
  otherUserName: string
  otherUserRole: 'user' | 'stylist'
}

export default function ChatModal({ 
  isOpen, 
  onClose, 
  matchId, 
  otherUserId, 
  otherUserName,
  otherUserRole 
}: ChatModalProps) {
  const { user, userProfile } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [chatRoom, setChatRoom] = useState<ChatRoom | null>(null)
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // Initialize chat room and load messages
  useEffect(() => {
    if (isOpen && user) {
      initializeChat()
    }
  }, [isOpen, user, matchId])

  // Set up realtime subscription
  useEffect(() => {
    if (!chatRoom || !user) return

    console.log('🔗 Setting up realtime subscription for room:', chatRoom.id)

    const channel = supabase
      .channel(`chat_${chatRoom.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `chat_room_id=eq.${chatRoom.id}`
        },
        (payload) => {
          console.log('📨 New message received:', payload.new)
          const newMessage = payload.new as Message
          setMessages(prev => [...prev, newMessage])
          
          // Mark as read if not sent by current user
          if (newMessage.sender_id !== user.id) {
            markMessagesAsRead(chatRoom.id, user.id)
          }
        }
      )
      .subscribe((status) => {
        console.log('🔔 Subscription status:', status)
      })

    return () => {
      console.log('🔌 Cleaning up realtime subscription')
      supabase.removeChannel(channel)
    }
  }, [chatRoom, user])

  // Auto-scroll when messages change
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const initializeChat = async () => {
    if (!user || !userProfile) return

    setLoading(true)
    try {
      console.log('🚀 Initializing chat...')
      console.log('Match ID:', matchId)
      console.log('Other user:', otherUserId, otherUserName, otherUserRole)
      console.log('Current user:', user.id, userProfile.role)

      // Determine user and stylist IDs based on roles
      const userId = otherUserRole === 'user' ? otherUserId : user.id
      const stylistId = otherUserRole === 'stylist' ? otherUserId : user.id

      console.log('Chat participants - User:', userId, 'Stylist:', stylistId)

      // Create or get chat room
      const { chatRoom: room, error: roomError } = await createOrGetChatRoom(
        matchId,
        userId,
        stylistId
      )

      if (roomError || !room) {
        console.error('❌ Error initializing chat:', roomError)
        return
      }

      setChatRoom(room)

      // Load existing messages
      const { messages: existingMessages, error: messagesError } = await getChatMessages(room.id)
      
      if (messagesError) {
        console.error('❌ Error loading messages:', messagesError)
        return
      }

      setMessages(existingMessages)

      // Mark messages as read
      await markMessagesAsRead(room.id, user.id)

      console.log('✅ Chat initialized successfully')

    } catch (error) {
      console.error('❌ Error initializing chat:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newMessage.trim() || !chatRoom || !user || sending) return

    setSending(true)
    try {
      const { error } = await sendMessage(
        chatRoom.id,
        user.id,
        newMessage.trim()
      )

      if (error) {
        console.error('❌ Error sending message:', error)
        return
      }

      setNewMessage('')
    } catch (error) {
      console.error('❌ Error sending message:', error)
    } finally {
      setSending(false)
    }
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return 'Today'
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday'
    } else {
      return date.toLocaleDateString()
    }
  }

  const isMyMessage = (senderId: string) => senderId === user?.id

  // Group messages by date
  const groupMessagesByDate = (messages: Message[]) => {
    const groups: { [key: string]: Message[] } = {}
    
    messages.forEach(message => {
      const dateKey = new Date(message.created_at).toDateString()
      if (!groups[dateKey]) {
        groups[dateKey] = []
      }
      groups[dateKey].push(message)
    })
    
    return groups
  }

  const messageGroups = groupMessagesByDate(messages)

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="apple-modal w-full max-w-md h-[600px] flex flex-col animate-scale-in"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-dark-border">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-accent-blue/20 rounded-full flex items-center justify-center">
                  <span className="text-accent-blue font-semibold text-sm">
                    {otherUserName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-dark-text-primary">{otherUserName}</h3>
                  <p className="text-xs text-dark-text-tertiary capitalize flex items-center">
                    <User className="w-3 h-3 mr-1" />
                    {otherUserRole}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-dark-card/50 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-dark-text-tertiary" />
              </button>
            </div>

            {/* Messages */}
            <div 
              ref={messagesContainerRef}
              className="flex-1 overflow-y-auto p-6 space-y-4"
            >
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center space-y-3">
                    <Loader2 className="w-6 h-6 animate-spin text-accent-blue mx-auto" />
                    <p className="text-sm text-dark-text-secondary">Loading conversation...</p>
                  </div>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-dark-card rounded-full flex items-center justify-center mx-auto border border-dark-border">
                      <Send className="w-6 h-6 text-dark-text-tertiary" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-dark-text-primary">Start the conversation</p>
                      <p className="text-xs text-dark-text-tertiary">Send a message to {otherUserName}</p>
                    </div>
                  </div>
                </div>
              ) : (
                Object.entries(messageGroups).map(([dateKey, dayMessages]) => (
                  <div key={dateKey}>
                    {/* Date separator */}
                    <div className="flex items-center justify-center my-6">
                      <div className="bg-dark-card px-3 py-1 rounded-full border border-dark-border">
                        <span className="text-xs text-dark-text-tertiary font-medium">
                          {formatDate(dayMessages[0].created_at)}
                        </span>
                      </div>
                    </div>
                    
                    {/* Messages for this date */}
                    <div className="space-y-3">
                      {dayMessages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${isMyMessage(message.sender_id) ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[80%] px-4 py-3 rounded-2xl ${
                              isMyMessage(message.sender_id)
                                ? 'bg-accent-blue text-white rounded-br-md'
                                : 'bg-dark-card text-dark-text-primary rounded-bl-md border border-dark-border'
                            }`}
                          >
                            <p className="text-sm leading-relaxed">{message.content}</p>
                            <p className={`text-xs mt-1 ${
                              isMyMessage(message.sender_id) ? 'text-white/70' : 'text-dark-text-tertiary'
                            }`}>
                              {formatTime(message.created_at)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <form onSubmit={handleSendMessage} className="p-6 border-t border-dark-border">
              <div className="flex items-center space-x-3">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={`Message ${otherUserName}...`}
                  className="apple-input flex-1 text-sm"
                  disabled={sending || loading}
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim() || sending || loading}
                  className="p-3 bg-accent-blue text-white rounded-full hover:bg-accent-blue-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0 shadow-apple"
                >
                  {sending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}