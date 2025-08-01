'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Calendar, User, ArrowLeft, ArrowRight, RotateCcw, MessageCircle, TrendingUp } from 'lucide-react'
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
    profile_picture?: string
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
  const [currentImageIndices, setCurrentImageIndices] = useState<{[matchId: string]: number}>({})
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

            // Fetch profile picture if not already included
            let profilePicture = match.stylist.profile_picture;
            if (!profilePicture) {
              const { data: stylistData, error: stylistError } = await supabase
                .from('stylists')
                .select('profile_picture')
                .eq('id', match.stylist.id)
                .single();
              
              if (!stylistError && stylistData) {
                profilePicture = stylistData.profile_picture;
              }
            }

            return { 
              ...match, 
              stylist: { 
                ...match.stylist, 
                catalog_images: catalogImages || [],
                profile_picture: profilePicture
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
                className={`apple-card overflow-hidden hover:shadow-apple-lg transition-all flex flex-col ${!isStylist ? 'cursor-pointer hover:scale-[1.02] hover:border-accent-blue/30' : ''}`}
                onClick={() => {
                  if (!isStylist) {
                    window.location.href = `/stylist/${match.stylist_id}`;
                  }
                }}
              >
                {/* Image with Navigation */}
                <div className="relative h-80 bg-dark-card flex-grow">
                  {isStylist ? (
                    // Stylist view - show user icon
                    <div className="w-full h-full flex items-center justify-center bg-dark-surface/50">
                      <div className="text-center">
                        <div className="w-20 h-20 bg-dark-surface rounded-full flex items-center justify-center mx-auto mb-4 border border-dark-border">
                          <User className="w-8 h-8 text-dark-text-tertiary" />
                        </div>
                        <p className="text-base text-dark-text-secondary font-medium">Client Profile</p>
                      </div>
                    </div>
                  ) : (
                    // User view - show stylist images with navigation
                    <div className="w-full h-full relative">
                      {/* Current image display with transition */}
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={`image-${match.id}-${currentImageIndices[match.id] || 0}`}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="w-full h-full"
                        >
                          {/* Show profile picture as first image if available */}
                          {(currentImageIndices[match.id] || 0) === 0 && match.stylist?.profile_picture ? (
                            <img
                              src={match.stylist.profile_picture}
                              alt={match.stylist.name}
                              className="w-full h-full object-cover object-center transition-transform duration-300 hover:scale-105"
                            />
                          ) : match.stylist?.catalog_images && match.stylist.catalog_images.length > 0 ? (
                            <img
                              src={match.stylist.catalog_images[(currentImageIndices[match.id] || 0) - (match.stylist.profile_picture ? 1 : 0)]?.image_url || ''}
                              alt={`${match.stylist.name} - ${(currentImageIndices[match.id] || 0) + 1}`}
                              className="w-full h-full object-cover object-center transition-transform duration-300 hover:scale-105"
                            />
                          ) : match.stylist?.catalog_urls && match.stylist.catalog_urls.length > 0 ? (
                            <img
                              src={match.stylist.catalog_urls[(currentImageIndices[match.id] || 0) - (match.stylist.profile_picture ? 1 : 0)] || ''}
                              alt={`${match.stylist.name} - ${(currentImageIndices[match.id] || 0) + 1}`}
                              className="w-full h-full object-cover object-center transition-transform duration-300 hover:scale-105"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-dark-surface/50">
                              <div className="text-center">
                                <div className="w-20 h-20 bg-dark-surface rounded-full flex items-center justify-center mx-auto mb-4 border border-dark-border">
                                  <User className="w-8 h-8 text-dark-text-tertiary" />
                                </div>
                                <p className="text-sm text-dark-text-secondary">No image available</p>
                              </div>
                            </div>
                          )}
                        </motion.div>
                      </AnimatePresence>
                      
                      {/* Bubble navigation - only show if multiple images */}
                      {((match.stylist?.profile_picture ? 1 : 0) + 
                        (match.stylist?.catalog_images?.length || 0) + 
                        (match.stylist?.catalog_urls?.length || 0)) > 1 && (
                        <>
                          {/* Left/Right Navigation Arrows */}
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              const totalImages = (match.stylist?.profile_picture ? 1 : 0) + 
                                (match.stylist?.catalog_images?.length || 0) + 
                                (match.stylist?.catalog_urls?.length || 0);
                              setCurrentImageIndices(prev => ({
                                ...prev,
                                [match.id]: ((prev[match.id] || 0) - 1 + totalImages) % totalImages
                              }));
                            }}
                            className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/60 transition-all z-10"
                            aria-label="Previous image"
                          >
                            <ArrowLeft size={18} />
                          </button>
                          
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              const totalImages = (match.stylist?.profile_picture ? 1 : 0) + 
                                (match.stylist?.catalog_images?.length || 0) + 
                                (match.stylist?.catalog_urls?.length || 0);
                              setCurrentImageIndices(prev => ({
                                ...prev,
                                [match.id]: ((prev[match.id] || 0) + 1) % totalImages
                              }));
                            }}
                            className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/60 transition-all z-10"
                            aria-label="Next image"
                          >
                            <ArrowRight size={18} />
                          </button>
                          
                          {/* Bubble Indicators */}
                          <div className="absolute bottom-5 left-0 right-0 flex justify-center space-x-2.5 z-10">
                            {Array.from({ length: (match.stylist?.profile_picture ? 1 : 0) + 
                              (match.stylist?.catalog_images?.length || 0) + 
                              (match.stylist?.catalog_urls?.length || 0) }).map((_, index) => (
                              <button
                                key={`bubble-${match.id}-${index}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setCurrentImageIndices(prev => ({
                                    ...prev,
                                    [match.id]: index
                                  }));
                                }}
                                aria-label={`View image ${index + 1}`}
                                className={`rounded-full transition-all duration-300 hover:scale-125 focus:outline-none focus:ring-2 focus:ring-accent-blue ${index === (currentImageIndices[match.id] || 0) ? 'bg-white w-3.5 h-3.5' : 'bg-white/40 w-3 h-3'}`}
                              />
                            ))}
                          </div>
                        </>
                      )}
                      
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
                    </div>
                  )}
                  <div className="absolute top-3 right-3 bg-accent-green/90 backdrop-blur-sm text-white px-3 py-1 rounded-xl text-xs font-medium">
                    {isStylist ? 'Match' : 'Matched'}
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 space-y-2 flex-shrink-0 max-h-[calc(33%-1rem)] overflow-y-auto">
                  {isStylist ? (
                    // Stylist view - show user information
                    <>
                      <div>
                        <h3 className="text-lg font-semibold text-dark-text-primary">
                          {match.user_profile?.full_name || 'Anonymous User'}
                        </h3>
                        <p className="text-dark-text-secondary text-xs">
                          Your potential client
                        </p>
                      </div>

                      {/* User Preferences */}
                      {match.user_preferences && (
                        <div className="space-y-2">
                          <div className="grid grid-cols-2 gap-2">
                            {match.user_preferences.gender && (
                              <div>
                                <h4 className="text-xs font-medium text-dark-text-tertiary mb-0.5">Gender</h4>
                                <p className="text-xs text-dark-text-primary">{match.user_preferences.gender}</p>
                              </div>
                            )}
                            
                            {match.user_preferences.style_preferences && (
                              <div>
                                <h4 className="text-xs font-medium text-dark-text-tertiary mb-0.5">Style</h4>
                                <p className="text-xs text-dark-text-primary">{match.user_preferences.style_preferences}</p>
                              </div>
                            )}
                            
                            {match.user_preferences.budget_range && (
                              <div>
                                <h4 className="text-xs font-medium text-dark-text-tertiary mb-0.5">Budget</h4>
                                <p className="text-xs text-dark-text-primary">{match.user_preferences.budget_range}</p>
                              </div>
                            )}
                          </div>
                          
                          {match.user_preferences.clothing_preferences && match.user_preferences.clothing_preferences.length > 0 && (
                            <div>
                              <h4 className="text-xs font-medium text-dark-text-tertiary mb-1">Clothing</h4>
                              <div className="flex flex-wrap gap-1.5">
                                {match.user_preferences.clothing_preferences.slice(0, 3).map((pref, idx) => (
                                  <span
                                    key={idx}
                                    className="px-1.5 py-0.5 bg-accent-blue/20 text-accent-blue text-xs rounded-md font-medium border border-accent-blue/30"
                                  >
                                    {pref}
                                  </span>
                                ))}
                                {match.user_preferences.clothing_preferences.length > 3 && (
                                  <span className="px-1.5 py-0.5 bg-dark-surface text-dark-text-tertiary text-xs rounded-md border border-dark-border">
                                    +{match.user_preferences.clothing_preferences.length - 3}
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
                      <div>
                        <h3 className="text-lg font-semibold text-dark-text-primary">
                          {match.stylist?.name}
                        </h3>
                        <p className="text-dark-text-secondary text-xs line-clamp-2">
                          {match.stylist?.bio}
                        </p>
                      </div>

                      {/* Specialties */}
                      {match.stylist?.specialties && match.stylist.specialties.length > 0 && (
                        <div>
                          <h4 className="text-xs font-medium text-dark-text-tertiary mb-1">Specialties</h4>
                          <div className="flex flex-wrap gap-1.5">
                            {match.stylist.specialties.slice(0, 3).map((specialty, idx) => (
                              <span
                                key={idx}
                                className="px-1.5 py-0.5 bg-accent-green/20 text-accent-green text-xs rounded-md font-medium border border-accent-green/30"
                              >
                                {specialty}
                              </span>
                            ))}
                            {match.stylist.specialties.length > 3 && (
                              <span className="px-1.5 py-0.5 bg-dark-surface text-dark-text-tertiary text-xs rounded-md border border-dark-border">
                                +{match.stylist.specialties.length - 3}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {/* Match Date and Actions */}
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center text-dark-text-tertiary">
                      <Calendar className="w-3 h-3 mr-1" />
                      <span>
                        {new Date(match.matched_at).toLocaleDateString()}
                      </span>
                    </div>

                    {isStylist ? (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          openChat(
                            match.id,
                            match.user_id,
                            match.user_profile?.full_name || 'User',
                            'user'
                          );
                        }}
                        className="px-2 py-1 bg-accent-blue text-white rounded-md text-xs font-medium flex items-center space-x-1 hover:bg-accent-blue/90 transition-colors"
                      >
                        <MessageCircle className="w-3 h-3" />
                        <span>Message</span>
                      </button>
                    ) : (
                      <div className="text-dark-text-tertiary text-xs italic">
                        Tap to view catalog
                      </div>
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