'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Heart, Calendar, User, ArrowLeft, RotateCcw, MessageCircle, TrendingUp } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import ChatModal from '../components/ChatModal'
import Link from 'next/link'

interface Match {
  id: string
  user_id: string
  stylist_id: string
  matched_at: string
  stylist?: {
    id: string
    name: string
    bio: string
    specialties: string[]
    catalog_urls: string[]
    catalog_images?: Array<{
      id: string
      stylist_id: string
      image_url: string
      file_name?: string
      file_size?: number
      mime_type?: string
      created_at: string
      updated_at: string
    }>
  }
  user_profile?: {
    full_name: string
  }
  user_preferences?: {
    gender: string
    clothing_preferences: string[]
    preferred_occasions: string[]
    style_preferences: string
    budget_range: string
  }
}

export default function MatchesPage() {
  const { user, userProfile } = useAuth()
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
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
    if (user) {
      fetchMatches()
    }
  }, [user])

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

  const fetchMatches = async () => {
    try {
      const isStylist = userProfile?.role === 'stylist'
      
      if (isStylist) {
        // Fetch matches where current user is the stylist
        const { data, error } = await supabase
          .from('matches')
          .select(`
            *,
            user_profile:user_profiles!matches_user_id_fkey(
              full_name
            )
          `)
          .eq('stylist_id', user?.id)
          .order('matched_at', { ascending: false })

        if (error) throw error

        // Get user preferences for each match
        const matchesWithPreferences = await Promise.all(
          (data || []).map(async (match) => {
            const { data: preferences, error: prefError } = await supabase
              .from('user_preferences')
              .select('user_id, clothing_preferences, preferred_occasions, style_preferences, budget_range, gender')
              .eq('user_id', match.user_id)
              .single()

            if (prefError) {
              console.error('Error fetching user preferences:', prefError)
            }

            return {
              ...match,
              user_preferences: preferences
            }
          })
        )

        setMatches(matchesWithPreferences)
      } else {
        // Fetch matches where current user is the user (original logic)
        const { data, error } = await supabase
          .from('matches')
          .select(`
            *,
            stylist:stylists(*)
          `)
          .eq('user_id', user?.id)
          .order('matched_at', { ascending: false })

        if (error) throw error

        // Fetch catalog images for each stylist
        const matchesWithImages = await Promise.all(
          (data || []).map(async (match) => {
            const { data: catalogImages, error: imagesError } = await supabase
              .from('catalog_images')
              .select('*')
              .eq('stylist_id', match.stylist.id)
              .order('created_at', { ascending: true })

            if (imagesError) {
              console.error('Error fetching catalog images for stylist:', match.stylist.id, imagesError)
              return { ...match, stylist: { ...match.stylist, catalog_images: [] } }
            }

            return { 
              ...match, 
              stylist: { 
                ...match.stylist, 
                catalog_images: catalogImages || [] 
              } 
            }
          })
        )

        setMatches(matchesWithImages)
      }
    } catch (error) {
      console.error('Error fetching matches:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Please sign in to view matches</h1>
          <p className="text-gray-600">You need to be logged in to see your matches.</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-lg text-gray-700">Loading matches...</span>
        </div>
      </div>
    )
  }

  const isStylist = userProfile?.role === 'stylist'

  return (
    <div className="min-h-screen bg-dark-bg p-4">
      {/* Back to Landing Page Button */}
      <div className="absolute top-6 left-6 z-10">
        <Link
          href="/"
          className="apple-button-secondary flex items-center space-x-2 text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Home</span>
        </Link>
      </div>
      
      <div className="max-w-5xl mx-auto px-6 pt-8">
        <div className="text-center mb-12 space-y-4">
          <h1 className="text-3xl font-semibold text-dark-text-primary">
            {isStylist ? 'Client Matches' : 'Your Matches'}
          </h1>
          <p className="text-dark-text-secondary text-lg max-w-2xl mx-auto">
            {isStylist 
              ? "Clients interested in your styling services"
              : "Stylists you've connected with"
            }
          </p>
          {!isStylist && (
            <div className="mt-6">
              <button
                onClick={async () => {
                  if (!user || !confirm('Are you sure you want to start over? This will delete all your matches and swipes, allowing you to rematch with all stylists.')) {
                    return
                  }
                  
                  try {
                    // Delete all swipes for the user
                    const { error: swipesError } = await supabase
                      .from('swipes')
                      .delete()
                      .eq('user_id', user.id)

                    if (swipesError) throw swipesError

                    // Delete all matches for the user
                    const { error: matchesError } = await supabase
                      .from('matches')
                      .delete()
                      .eq('user_id', user.id)

                    if (matchesError) throw matchesError

                    // Refresh the page to show updated matches
                    window.location.reload()
                  } catch (error) {
                    console.error('Error starting over:', error)
                    alert('Failed to start over. Please try again.')
                  }
                }}
                className="apple-button-secondary flex items-center space-x-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Start Over</span>
              </button>
            </div>
          )}
        </div>

        {matches.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-dark-card rounded-full flex items-center justify-center mx-auto mb-6 border border-dark-border">
              <Heart className="w-6 h-6 text-dark-text-tertiary" />
            </div>
            <div className="space-y-3 mb-8">
              <h2 className="text-xl font-semibold text-dark-text-primary">
                {isStylist ? 'No matches yet' : 'No matches yet'}
              </h2>
              <p className="text-dark-text-secondary text-sm max-w-md mx-auto leading-relaxed">
                {isStylist 
                  ? "When clients match with you, they'll appear here."
                  : "Start swiping to find your perfect stylist."
                }
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {isStylist ? (
                // Stylist actions when no matches
                <>
                  <Link
                    href="/stylist-dashboard"
                    className="apple-button-primary flex items-center space-x-2"
                  >
                    <TrendingUp className="w-4 h-4" />
                    <span>Dashboard</span>
                  </Link>
                  <button
                    onClick={() => window.location.href = '/stylist-dashboard'}
                    className="apple-button-secondary flex items-center space-x-2"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Manage Profile</span>
                  </button>
                </>
              ) : (
                // Regular user actions when no matches
                <>
                  <Link
                    href="/swipe"
                    className="apple-button-primary"
                  >
                    Start Swiping
                  </Link>
                  <button
                    onClick={() => window.location.href = '/swipe'}
                    className="apple-button-secondary"
                  >
                    Find Stylists
                  </button>
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {matches.map((match, index) => (
              <motion.div
                key={match.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className={`apple-card overflow-hidden hover:shadow-apple-lg transition-all ${!isStylist ? 'cursor-pointer hover:scale-[1.02] hover:border-accent-blue/30' : ''}`}
                onClick={() => {
                  if (!isStylist) {
                    window.location.href = `/stylist/${match.stylist_id}`;
                  }
                }}
              >
                {/* Image */}
                <div className="relative h-48 bg-dark-card">
                  {isStylist ? (
                    // Stylist view - show user icon
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-dark-surface rounded-full flex items-center justify-center mx-auto mb-3 border border-dark-border">
                          <User className="w-6 h-6 text-dark-text-tertiary" />
                        </div>
                        <p className="text-sm text-dark-text-secondary">Client</p>
                      </div>
                    </div>
                  ) : (
                    // User view - show stylist images
                    match.stylist?.catalog_images && match.stylist.catalog_images.length > 0 ? (
                      <img
                        src={match.stylist.catalog_images[0].image_url}
                        alt={match.stylist.name}
                        className="w-full h-full object-cover"
                      />
                    ) : match.stylist?.catalog_urls && match.stylist.catalog_urls.length > 0 ? (
                      <img
                        src={match.stylist.catalog_urls[0]}
                        alt={match.stylist.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="text-center">
                          <div className="w-16 h-16 bg-dark-surface rounded-full flex items-center justify-center mx-auto mb-3 border border-dark-border">
                            <User className="w-6 h-6 text-dark-text-tertiary" />
                          </div>
                          <p className="text-sm text-dark-text-secondary">No image</p>
                        </div>
                      </div>
                    )
                  )}
                  <div className="absolute top-3 right-3 bg-accent-green/90 backdrop-blur-sm text-white px-3 py-1 rounded-xl text-xs font-medium">
                    {isStylist ? 'Match' : 'Matched'}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                  {isStylist ? (
                    // Stylist view - show user information
                    <>
                      <h3 className="text-lg font-semibold text-dark-text-primary">
                        {match.user_profile?.full_name || 'Anonymous User'}
                      </h3>
                      
                      <p className="text-dark-text-secondary text-sm">
                        Your potential client
                      </p>

                      {/* User Preferences */}
                      {match.user_preferences && (
                        <div className="space-y-3">
                          {match.user_preferences.gender && (
                            <div>
                              <h4 className="text-xs font-medium text-dark-text-tertiary mb-1">Gender</h4>
                              <p className="text-sm text-dark-text-primary">{match.user_preferences.gender}</p>
                            </div>
                          )}
                          
                          {match.user_preferences.style_preferences && (
                            <div>
                              <h4 className="text-xs font-medium text-dark-text-tertiary mb-1">Style</h4>
                              <p className="text-sm text-dark-text-primary">{match.user_preferences.style_preferences}</p>
                            </div>
                          )}
                          
                          {match.user_preferences.budget_range && (
                            <div>
                              <h4 className="text-xs font-medium text-dark-text-tertiary mb-1">Budget</h4>
                              <p className="text-sm text-dark-text-primary">{match.user_preferences.budget_range}</p>
                            </div>
                          )}
                          
                          {match.user_preferences.clothing_preferences && match.user_preferences.clothing_preferences.length > 0 && (
                            <div>
                              <h4 className="text-xs font-medium text-dark-text-tertiary mb-2">Clothing</h4>
                              <div className="flex flex-wrap gap-2">
                                {match.user_preferences.clothing_preferences.slice(0, 3).map((pref, idx) => (
                                  <span
                                    key={idx}
                                    className="px-2 py-1 bg-accent-blue/20 text-accent-blue text-xs rounded-lg font-medium border border-accent-blue/30"
                                  >
                                    {pref}
                                  </span>
                                ))}
                                {match.user_preferences.clothing_preferences.length > 3 && (
                                  <span className="px-2 py-1 bg-dark-surface text-dark-text-tertiary text-xs rounded-lg border border-dark-border">
                                    +{match.user_preferences.clothing_preferences.length - 3} more
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  ) : (
                    // User view - show stylist information
                    <>
                      <h3 className="text-lg font-semibold text-dark-text-primary">
                        {match.stylist?.name}
                      </h3>
                      
                      <p className="text-dark-text-secondary text-sm leading-relaxed">
                        {match.stylist?.bio}
                      </p>

                      {/* Specialties */}
                      {match.stylist?.specialties && match.stylist.specialties.length > 0 && (
                        <div>
                          <h4 className="text-xs font-medium text-dark-text-tertiary mb-2">Specialties</h4>
                          <div className="flex flex-wrap gap-2">
                            {match.stylist.specialties.slice(0, 3).map((specialty, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-1 bg-accent-green/20 text-accent-green text-xs rounded-lg font-medium border border-accent-green/30"
                              >
                                {specialty}
                              </span>
                            ))}
                            {match.stylist.specialties.length > 3 && (
                              <span className="px-2 py-1 bg-dark-surface text-dark-text-tertiary text-xs rounded-lg border border-dark-border">
                                +{match.stylist.specialties.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {/* Match Date */}
                  <div className="flex items-center text-xs text-dark-text-tertiary">
                    <Calendar className="w-3 h-3 mr-1" />
                    <span>
                      Matched {new Date(match.matched_at).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Action Buttons */}  
                  <div className="mt-4 space-y-2">
                    {isStylist ? (
                      <button 
                        onClick={() => openChat(
                          match.id,
                          match.user_id,
                          match.user_profile?.full_name || 'User',
                          'user'
                        )}
                        className="apple-button-primary w-full flex items-center justify-center space-x-2 text-sm"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>Contact Client</span>
                      </button>
                    ) : (
                      <>
                        <button 
                          onClick={() => openChat(
                            match.id,
                            match.stylist_id,
                            match.stylist?.name || 'Stylist',
                            'stylist'
                          )}
                          className="apple-button-primary w-full flex items-center justify-center space-x-2 text-sm"
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span>Contact Stylist</span>
                        </button>
                        <div className="text-center text-xs text-dark-text-tertiary">
                          Click on card to view stylist catalog
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
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