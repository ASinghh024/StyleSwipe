'use client'

/*
 * STYLIST DASHBOARD - MATCHED USERS DISPLAY
 * 
 * ✅ IMPLEMENTED FEATURES:
 * 1. Fetches matched users from 'matches' table where stylist_id = current user
 * 2. Displays user names (fetched from 'user_profiles' table) instead of just IDs
 * 3. Shows styling preferences as visual tags/badges:
 *    - Gender (blue pill)
 *    - Style (green pill) 
 *    - Budget (yellow pill)
 *    - Clothing types (indigo chips)
 *    - Occasions (purple chips)
 * 4. Sorts matches by most recent (matched_at DESC)
 * 5. Card structure as requested:
 *    - User name as prominent title
 *    - Visual preference tags/chips
 *    - "Start Chat" and "View Profile" action buttons
 * 6. Handles missing data gracefully with fallback names and helpful messages
 * 7. Modern UI with gradients, shadows, and smooth transitions
 * 
 * 📊 DATA FLOW:
 * matches table → user_profiles table (for names) → user_preferences table (for styling data)
 */

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { getMatchedUsers } from '@/lib/match-utils'
import ChatModal from '../components/ChatModal'
import { 
  ArrowLeft, 
  Heart, 
  Users, 
  Calendar,
  Loader2,
  MessageCircle
} from 'lucide-react'
import Link from 'next/link'

interface MatchedUser {
  id: string
  user_id: string
  stylist_id: string
  matched_at: string
  user_name: string
  user_profile?: {
    full_name: string
  }
  styling_preferences: {
    gender: string | null
    clothing_type: string[]
    occasion: string[]
    style: string | null
    budget: string | null
  }
  raw_preferences?: any // For backward compatibility
}

export default function StylistDashboard() {
  const { user, userProfile } = useAuth()
  const [matchedUsers, setMatchedUsers] = useState<MatchedUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState({
    total: 0
  })
  const [chatModal, setChatModal] = useState<{
    isOpen: boolean
    matchId: string
    otherUserId: string
    otherUserName: string
    otherUserRole: 'user' | 'stylist'
  }>({
    isOpen: false,
    matchId: '',
    otherUserId: '',
    otherUserName: '',
    otherUserRole: 'user'
  })

  useEffect(() => {
    if (user && userProfile?.role === 'stylist') {
      fetchMatchedUsers()
    }
  }, [user, userProfile])

  const openChat = (
    matchId: string,
    otherUserId: string,
    otherUserName: string,
    otherUserRole: 'user' | 'stylist'
  ) => {
    setChatModal({
      isOpen: true,
      matchId,
      otherUserId,
      otherUserName,
      otherUserRole
    })
  }

  const closeChatModal = () => {
    setChatModal(prev => ({ ...prev, isOpen: false }))
  }

  const fetchMatchedUsers = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log('🔍 Fetching matched users for stylist:', user?.id)
      console.log('🔍 User profile:', userProfile)

      const result = await getMatchedUsers(user?.id || '')
      
      console.log('🔍 getMatchedUsers result:', result)
      
      if (result.error) {
        console.error('❌ Error from getMatchedUsers:', result.error)
        setError(`Failed to load matches: ${result.error}`)
        return
      }

      console.log('✅ Successfully fetched matched users:', result.users)
      setMatchedUsers(result.users)
      setStats({ total: result.total })

    } catch (error) {
      console.error('❌ Error fetching matched users:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      setError(`Failed to load matched users: ${errorMessage}`)
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Please sign in to access dashboard</h1>
          <p className="text-gray-600">You need to be logged in to view your stylist dashboard.</p>
        </div>
      </div>
    )
  }

  if (userProfile?.role !== 'stylist') {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="text-center space-y-6">
          <h1 className="text-2xl font-semibold text-dark-text-primary">Access Denied</h1>
          <p className="text-dark-text-secondary">This dashboard is only available for stylists.</p>
          <Link
            href="/"
            className="apple-button-primary inline-flex"
          >
            Go to Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-bg">
      {/* Header */}
      <div className="bg-dark-surface/80 backdrop-blur-apple border-b border-dark-border/50 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="flex justify-between items-center py-4">
            <Link
              href="/"
              className="apple-button-secondary flex items-center space-x-2 text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Home</span>
            </Link>
            
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-dark-card rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-dark-text-secondary">
                  {userProfile?.full_name?.charAt(0) || 'S'}
                </span>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-dark-text-primary">
                  {userProfile?.full_name || user.email}
                </div>
                <div className="text-xs text-accent-blue">
                  Stylist
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-12 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 space-y-2"
        >
          <h1 className="text-3xl font-semibold text-dark-text-primary">Dashboard</h1>
          <p className="text-dark-text-secondary text-lg">Manage your client connections</p>
        </motion.div>

        {/* Stats Cards */}
        <div className="mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="apple-card p-6 max-w-md"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-dark-card rounded-2xl flex items-center justify-center border border-dark-border">
                <Heart className="w-5 h-5 text-accent-green" />
              </div>
              <div>
                <p className="text-sm text-dark-text-tertiary">Client Connections</p>
                <p className="text-2xl font-semibold text-dark-text-primary">{stats.total}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-system-red/10 border border-system-red/20 rounded-2xl p-4 mb-8"
          >
            <p className="text-system-red text-sm">{error}</p>
            <button 
              onClick={fetchMatchedUsers}
              className="mt-3 text-system-red hover:text-system-red/80 font-medium text-sm transition-colors"
            >
              Try again
            </button>
          </motion.div>
        )}

        {/* Matched Users List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="apple-card"
        >
          <div className="p-4 border-b border-dark-border">
            <h2 className="text-lg font-semibold text-dark-text-primary mb-1">Your Matches</h2>
            <p className="text-dark-text-secondary text-xs">Clients who want to work with you</p>
          </div>

          {loading ? (
            <div className="p-16 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-accent-blue mx-auto mb-6" />
              <h3 className="text-lg font-medium text-dark-text-primary mb-2">Loading matches...</h3>
              <p className="text-dark-text-secondary text-sm">Finding your clients</p>
            </div>
          ) : matchedUsers.length === 0 ? (
            <div className="p-16 text-center space-y-6">
              <div className="w-16 h-16 bg-dark-card rounded-full flex items-center justify-center mx-auto border border-dark-border">
                <Heart className="w-6 h-6 text-dark-text-tertiary" />
              </div>
              <div className="space-y-3">
                <h3 className="text-xl font-semibold text-dark-text-primary">No matches yet</h3>
                <p className="text-dark-text-secondary text-sm max-w-md mx-auto leading-relaxed">
                  When users discover your work, they'll appear here as potential clients.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button className="apple-button-primary">
                  Update Portfolio
                </button>
                <button className="apple-button-secondary">
                  Profile Tips
                </button>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-dark-border">
              {matchedUsers.map((match) => (
                <div key={match.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* User Name as Title */}
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-9 h-9 bg-accent-blue/20 rounded-full flex items-center justify-center">
                          <span className="text-base font-semibold text-accent-blue">
                            {match.user_name?.charAt(0)?.toUpperCase() || 'U'}
                          </span>
                        </div>
                        <div>
                          <h3 className="text-base font-semibold text-dark-text-primary leading-tight">
                            {match.user_name}
                          </h3>
                          <div className="flex items-center space-x-1.5 text-[10px] text-dark-text-tertiary">
                            <Calendar className="w-2.5 h-2.5" />
                            <span>Matched {new Date(match.matched_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>

                      {/* Styling Preferences as Visual Tags/Badges */}
                      {match.styling_preferences && (
                        Object.values(match.styling_preferences).some(val => 
                          val !== null && val !== undefined && 
                          (Array.isArray(val) ? val.length > 0 : true)
                        )
                      ) ? (
                        <div className="bg-dark-card border border-dark-border rounded-xl p-3 mb-4">
                          <h4 className="font-medium text-dark-text-primary mb-2 flex items-center text-xs">
                            <span className="w-1.5 h-1.5 bg-accent-blue rounded-full mr-1.5"></span>
                            Preferences
                          </h4>
                          
                          <div className="grid grid-cols-2 gap-2 text-[10px]">
                            {/* Gender Tag */}
                            {match.styling_preferences.gender && (
                              <div className="flex items-center space-x-1.5">
                                <span className="text-dark-text-tertiary font-medium w-12">Gender</span>
                                <span className="inline-flex items-center px-2 py-0.5 rounded-lg font-medium bg-accent-blue/20 text-accent-blue border border-accent-blue/30">
                                  {match.styling_preferences.gender}
                                </span>
                              </div>
                            )}

                            {/* Style Tag */}
                            {match.styling_preferences.style && (
                              <div className="flex items-center space-x-1.5">
                                <span className="text-dark-text-tertiary font-medium w-12">Style</span>
                                <span className="inline-flex items-center px-2 py-0.5 rounded-lg font-medium bg-accent-green/20 text-accent-green border border-accent-green/30">
                                  {match.styling_preferences.style}
                                </span>
                              </div>
                            )}

                            {/* Budget Tag */}
                            {match.styling_preferences.budget && (
                              <div className="flex items-center space-x-1.5">
                                <span className="text-dark-text-tertiary font-medium w-12">Budget</span>
                                <span className="inline-flex items-center px-2 py-0.5 rounded-lg font-medium bg-system-yellow/20 text-system-yellow border border-system-yellow/30">
                                  ₹{match.styling_preferences.budget}
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="mt-2 space-y-1.5">
                            {/* Clothing Type Tags */}
                            {match.styling_preferences.clothing_type?.length > 0 && (
                              <div className="flex items-start space-x-1.5">
                                <span className="text-[10px] text-dark-text-tertiary font-medium w-12 mt-0.5">Clothing</span>
                                <div className="flex flex-wrap gap-1">
                                  {match.styling_preferences.clothing_type.map((clothing, index) => (
                                    <span 
                                      key={index} 
                                      className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-dark-surface text-dark-text-secondary border border-dark-border"
                                    >
                                      {clothing}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Occasion Tags */}
                            {match.styling_preferences.occasion?.length > 0 && (
                              <div className="flex items-start space-x-1.5">
                                <span className="text-[10px] text-dark-text-tertiary font-medium w-12 mt-0.5">Occasions</span>
                                <div className="flex flex-wrap gap-1">
                                  {match.styling_preferences.occasion.map((occasion, index) => (
                                    <span 
                                      key={index} 
                                      className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-dark-surface text-dark-text-secondary border border-dark-border"
                                    >
                                      {occasion}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="bg-system-orange/10 border border-system-orange/20 rounded-xl p-2.5 mb-4">
                          <h4 className="font-medium text-system-orange mb-1 flex items-center text-xs">
                            <span className="w-1.5 h-1.5 bg-system-orange rounded-full mr-1.5"></span>
                            No Preferences Set
                          </h4>
                          <p className="text-[10px] text-system-orange/80">
                            Contact them to learn about their style needs.
                          </p>
                        </div>
                      )}

                      {/* Profile Status Indicator */}
                      {!match.user_profile?.full_name && (
                        <div className="bg-system-orange/10 border border-system-orange/20 rounded-lg p-2 mb-3">
                          <p className="text-[10px] text-system-orange flex items-center">
                            <span className="w-1.5 h-1.5 bg-system-orange rounded-full mr-1.5"></span>
                            Profile may be incomplete
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="ml-4 flex flex-col space-y-2">
                      <button 
                        onClick={() => openChat(
                          match.id,
                          match.user_id,
                          match.user_name,
                          'user'
                        )}
                        className="apple-button-primary flex items-center space-x-1.5 text-xs px-3 py-1.5"
                      >
                        <MessageCircle className="w-3 h-3" />
                        <span>Chat</span>
                      </button>
                      
                      <button className="apple-button-secondary flex items-center space-x-1.5 text-xs px-3 py-1.5">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span>Profile</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Chat Modal */}
      <ChatModal
        isOpen={chatModal.isOpen}
        onClose={closeChatModal}
        matchId={chatModal.matchId}
        otherUserId={chatModal.otherUserId}
        otherUserName={chatModal.otherUserName}
        otherUserRole={chatModal.otherUserRole}
      />
    </div>
  )
}