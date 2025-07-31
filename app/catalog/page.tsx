'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { Camera, Search, Loader2, X, MessageCircle } from 'lucide-react'
import Link from 'next/link'
import ChatModal from '../components/ChatModal'

interface Stylist {
  id: string
  name: string
  bio?: string
  specialties?: string[]
  catalog_urls?: string[]
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

export default function CatalogPage() {
  const { user, userProfile } = useAuth()
  const [stylists, setStylists] = useState<Stylist[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [matchedStylists, setMatchedStylists] = useState<string[]>([])
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
    otherUserRole: 'stylist'
  })

  useEffect(() => {
    fetchStylists()
    if (user) {
      fetchMatchedStylists()
    }
  }, [user])

  const fetchStylists = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch all stylists
      const { data: stylistsData, error: stylistsError } = await supabase
        .from('stylists')
        .select('*')
        .order('name')

      if (stylistsError) {
        throw stylistsError
      }

      // Fetch catalog images for each stylist
      const stylistsWithImages = await Promise.all(
        stylistsData?.map(async (stylist) => {
          const { data: catalogImages, error: imagesError } = await supabase
            .from('catalog_images')
            .select('*')
            .eq('stylist_id', stylist.id)
            .order('created_at', { ascending: true })

          if (imagesError) {
            console.error('Error fetching catalog images for stylist:', stylist.id, imagesError)
            return { ...stylist, catalog_images: [] }
          }

          return { ...stylist, catalog_images: catalogImages || [] }
        }) || []
      )

      setStylists(stylistsWithImages)
    } catch (err) {
      console.error('Error fetching stylists:', err)
      setError('Failed to load stylists')
    } finally {
      setLoading(false)
    }
  }

  const fetchMatchedStylists = async () => {
    if (!user) return
    
    try {
      const { data, error } = await supabase
        .from('matches')
        .select('stylist_id, id')
        .eq('user_id', user.id)
      
      if (error) {
        console.error('Error fetching matched stylists:', error)
        return
      }
      
      setMatchedStylists(data.map(match => match.stylist_id))
    } catch (err) {
      console.error('Error checking match status:', err)
    }
  }

  const openChat = (matchId: string, stylistId: string, stylistName: string) => {
    setChatModal({
      isOpen: true,
      matchId,
      otherUserId: stylistId,
      otherUserName: stylistName,
      otherUserRole: 'stylist'
    })
  }

  const closeChatModal = () => {
    setChatModal(prev => ({ ...prev, isOpen: false }))
  }

  const filteredStylists = stylists.filter(stylist => 
    stylist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (stylist.specialties && stylist.specialties.some(specialty => 
      specialty.toLowerCase().includes(searchQuery.toLowerCase())
    ))
  )

  return (
    <div className="min-h-screen bg-dark-bg">
      {/* Header */}
      <div className="bg-dark-surface/80 backdrop-blur-apple border-b border-dark-border/50 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <Camera className="h-5 w-5 text-accent-blue" />
                <span className="text-lg font-semibold text-dark-text-primary">
                  Stylist Catalogs
                </span>
              </div>
            </div>
            <Link
              href="/"
              className="apple-button-secondary text-sm"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-12">
        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-md mx-auto">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-dark-text-tertiary" />
            </div>
            <input
              type="text"
              placeholder="Search stylists by name or specialty..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-dark-card border border-dark-border rounded-xl text-dark-text-primary focus:border-accent-blue focus:ring-1 focus:ring-accent-blue transition-colors"
            />
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 text-accent-blue animate-spin" />
            <span className="ml-3 text-dark-text-secondary">Loading stylists...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-20">
            <div className="flex items-center justify-center w-16 h-16 mx-auto bg-system-red/10 rounded-full mb-4">
              <X className="h-8 w-8 text-system-red" />
            </div>
            <h2 className="text-xl font-semibold text-dark-text-primary mb-2">
              {error}
            </h2>
            <button
              onClick={fetchStylists}
              className="apple-button-primary mt-4"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Stylists Grid */}
        {!loading && !error && (
          <>
            {filteredStylists.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredStylists.map((stylist) => {
                  const hasCatalogImages = stylist?.catalog_images && stylist?.catalog_images.length > 0
                  const hasCatalogUrls = stylist?.catalog_urls && stylist?.catalog_urls.length > 0
                  const featuredImage = hasCatalogImages 
                    ? stylist?.catalog_images?.[0]?.image_url 
                    : hasCatalogUrls 
                      ? stylist?.catalog_urls?.[0] 
                      : null

                  return (
                    <div key={stylist.id} className="block group">
                      <div className="apple-card overflow-hidden transition-all duration-300 group-hover:shadow-apple-lg">
                        {/* Featured Image */}
                        <div className="aspect-square bg-dark-card relative overflow-hidden">
                          {featuredImage ? (
                            <img
                              src={featuredImage}
                              alt={`${stylist.name}'s catalog`}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <div className="text-center">
                                <div className="w-16 h-16 bg-dark-surface rounded-full flex items-center justify-center mx-auto mb-3 border border-dark-border">
                                  <Camera className="w-6 h-6 text-dark-text-tertiary" />
                                </div>
                                <p className="text-sm text-dark-text-secondary">No images yet</p>
                              </div>
                            </div>
                          )}
                          
                          {/* Image Count Badge */}
                          {(hasCatalogImages || hasCatalogUrls) && (
                            <div className="absolute bottom-3 right-3 bg-dark-surface/80 backdrop-blur-apple px-3 py-1 rounded-full text-xs font-medium text-dark-text-secondary border border-dark-border/50">
                              {hasCatalogImages 
                                ? `${stylist?.catalog_images?.length || 0} images` 
                                : `${stylist?.catalog_urls?.length || 0} images`}
                            </div>
                          )}
                        </div>
                        
                        {/* Stylist Info */}
                        <div className="p-5">
                          <Link href={`/stylist/${stylist.id}`}>
                            <h3 className="text-lg font-semibold text-dark-text-primary group-hover:text-accent-blue transition-colors">
                              {stylist.name}
                            </h3>
                          </Link>
                          
                          {stylist.specialties && stylist.specialties.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-3">
                              {stylist.specialties.slice(0, 3).map((specialty, index) => (
                                <span 
                                  key={index}
                                  className="bg-dark-card px-2 py-1 rounded-full text-xs text-dark-text-secondary border border-dark-border"
                                >
                                  {specialty}
                                </span>
                              ))}
                              {stylist.specialties.length > 3 && (
                                <span className="text-xs text-dark-text-tertiary self-center">+{stylist.specialties.length - 3} more</span>
                              )}
                            </div>
                          )}
                          
                          <div className="mt-4 flex space-x-2">
                            <Link 
                              href={`/stylist/${stylist.id}`}
                              className="apple-button-secondary flex-1 text-center text-sm py-2"
                            >
                              View Profile
                            </Link>
                            
                            {user && matchedStylists.includes(stylist.id) && (
                              <button
                                onClick={(e) => {
                                  e.preventDefault()
                                  e.stopPropagation()
                                  // Find the match ID
                                  const matchId = supabase
                                    .from('matches')
                                    .select('id')
                                    .eq('user_id', user.id)
                                    .eq('stylist_id', stylist.id)
                                    .single()
                                    .then(({ data }) => {
                                      if (data) {
                                        openChat(data.id, stylist.id, stylist.name)
                                      }
                                    })
                                }}
                                className="apple-button-primary flex items-center justify-center space-x-1 px-3 py-2"
                              >
                                <MessageCircle className="w-4 h-4" />
                                <span className="text-sm">Chat</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="w-16 h-16 bg-dark-card rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="h-8 w-8 text-dark-text-tertiary" />
                </div>
                <h2 className="text-xl font-semibold text-dark-text-primary mb-2">
                  No stylists found
                </h2>
                <p className="text-dark-text-secondary">
                  {searchQuery 
                    ? `No stylists match "${searchQuery}". Try a different search term.` 
                    : 'There are no stylists available at the moment.'}
                </p>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="apple-button-secondary mt-4"
                  >
                    Clear Search
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Chat Modal */}
      {chatModal.isOpen && (
        <ChatModal
          isOpen={chatModal.isOpen}
          onClose={closeChatModal}
          matchId={chatModal.matchId}
          otherUserId={chatModal.otherUserId}
          otherUserName={chatModal.otherUserName}
          otherUserRole={chatModal.otherUserRole}
        />
      )}
    </div>
  )
}