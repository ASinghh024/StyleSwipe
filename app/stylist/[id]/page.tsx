'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { User, Camera, Heart, X, Loader2, Shirt, ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'

interface Stylist {
  id: string
  name: string
  bio?: string
  specialties?: string[]
  catalog_urls?: string[]
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

interface Match {
  id: string
  user_id: string
  stylist_id: string
  matched_at: string
}

export default function StylistCatalogPage() {
  const params = useParams()
  const stylistId = params.id as string
  const { user } = useAuth()
  
  const [stylist, setStylist] = useState<Stylist | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isMatched, setIsMatched] = useState(false)
  const [matchLoading, setMatchLoading] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0)

  useEffect(() => {
    if (stylistId) {
      fetchStylist()
      if (user) {
        checkIfMatched()
      }
    }
  }, [stylistId, user])

  const fetchStylist = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch stylist data
      const { data: stylistData, error: stylistError } = await supabase
        .from('stylists')
        .select('*')
        .eq('id', stylistId)
        .single()

      if (stylistError) {
        throw stylistError
      }

      // Fetch catalog images
      const { data: catalogImages, error: imagesError } = await supabase
        .from('catalog_images')
        .select('*')
        .eq('stylist_id', stylistId)
        .order('created_at', { ascending: true })

      if (imagesError) {
        console.error('Error fetching catalog images:', imagesError)
      }

      setStylist({
        ...stylistData,
        catalog_images: catalogImages || []
      })
    } catch (err) {
      console.error('Error fetching stylist:', err)
      setError('Failed to load stylist profile')
    } finally {
      setLoading(false)
    }
  }

  const checkIfMatched = async () => {
    try {
      const { data, error } = await supabase
        .from('matches')
        .select('*')
        .eq('user_id', user?.id)
        .eq('stylist_id', stylistId)

      if (error) {
        throw error
      }

      setIsMatched(data && data.length > 0)
    } catch (err) {
      console.error('Error checking match status:', err)
    }
  }

  const handleMatch = async () => {
    if (!user) return
    
    // Prevent stylists from matching with themselves
    if (user.id === stylistId) {
      console.error('Error: Stylists cannot match with themselves')
      return
    }
    
    try {
      setMatchLoading(true)
      
      const { error } = await supabase
        .from('matches')
        .insert({
          user_id: user.id,
          stylist_id: stylistId,
          matched_at: new Date().toISOString()
        })

      if (error) throw error
      
      setIsMatched(true)
    } catch (err) {
      console.error('Error creating match:', err)
    } finally {
      setMatchLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 text-accent-blue animate-spin" />
          <span className="text-dark-text-secondary">Loading stylist profile...</span>
        </div>
      </div>
    )
  }

  if (error || !stylist) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center w-12 h-12 mx-auto bg-system-red/10 rounded-full">
            <X className="h-6 w-6 text-system-red" />
          </div>
          <h2 className="text-xl font-semibold text-dark-text-primary">
            {error || 'Stylist not found'}
          </h2>
          {user?.id === stylistId ? (
            <Link href="/" className="apple-button-primary inline-flex">
              Back to Home
            </Link>
          ) : (
            <Link href="/matches" className="apple-button-primary inline-flex">
              Back to matches
            </Link>
          )}
        </div>
      </div>
    )
  }

  const hasCatalogImages = stylist.catalog_images && stylist.catalog_images.length > 0
  const hasCatalogUrls = stylist.catalog_urls && stylist.catalog_urls.length > 0
  const hasNoImages = !hasCatalogImages && !hasCatalogUrls

  return (
    <div className="min-h-screen bg-dark-bg">
      {/* Header */}
      <div className="bg-dark-surface/80 backdrop-blur-apple border-b border-dark-border/50 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              {user?.id === stylistId ? (
                <>
                  <Camera className="h-5 w-5 text-accent-blue" />
                  <span className="text-lg font-semibold text-dark-text-primary">
                    Your Catalog
                  </span>
                </>
              ) : (
                <>
                  <Shirt className="h-5 w-5 text-accent-blue" />
                  <span className="text-lg font-semibold text-dark-text-primary">
                    StyleSwipe
                  </span>
                </>
              )}
            </div>
            {user?.id === stylistId ? (
              <Link href="/" className="apple-button-secondary text-sm">
                Back to Home
              </Link>
            ) : (
              <Link href="/matches" className="apple-button-secondary text-sm">
                Back to matches
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Stylist Profile Header */}
      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-12">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-12">
          {/* Avatar */}
          <div className="w-24 h-24 bg-dark-card rounded-full flex items-center justify-center border border-dark-border">
            <User className="w-12 h-12 text-dark-text-tertiary" />
          </div>
          
          {/* Info */}
          <div className="flex-1">
            <h1 className="text-3xl font-semibold text-dark-text-primary mb-2">
              {stylist.name}
            </h1>
            
            {stylist.bio && (
              <p className="text-dark-text-secondary mb-4 max-w-2xl">
                {stylist.bio}
              </p>
            )}
            
            {stylist.specialties && stylist.specialties.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {stylist.specialties.map((specialty, index) => (
                  <span 
                    key={index}
                    className="bg-dark-card px-3 py-1 rounded-full text-sm text-dark-text-secondary border border-dark-border"
                  >
                    {specialty}
                  </span>
                ))}
              </div>
            )}
          </div>
          
          {/* Match Button - Only shown when user is not the stylist */}
          {user && user.id !== stylistId && !isMatched ? (
            <button
              onClick={handleMatch}
              disabled={matchLoading}
              className="apple-button-primary flex items-center space-x-2 disabled:opacity-50"
            >
              {matchLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Matching...</span>
                </>
              ) : (
                <>
                  <Heart className="w-4 h-4" />
                  <span>Match with Stylist</span>
                </>
              )}
            </button>
          ) : isMatched && user?.id !== stylistId ? (
            <div className="bg-accent-green/10 text-accent-green px-4 py-2 rounded-xl flex items-center space-x-2">
              <Heart className="w-4 h-4 fill-accent-green" />
              <span>Matched</span>
            </div>
          ) : null}
        </div>

        {/* Catalog Grid */}
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-dark-text-primary">
              Stylist Catalog
            </h2>
            
            {(hasCatalogImages || hasCatalogUrls) && (
              <div className="flex items-center space-x-2">
                <button 
                  className="bg-dark-card p-2 rounded-full hover:bg-dark-card/70 transition-colors"
                  onClick={() => {
                    const images = stylist.catalog_images || [];
                    const urls = stylist.catalog_urls || [];
                    const allImages = [...images.map(img => img.image_url), ...urls];
                    if (allImages.length > 0) {
                      const prevIndex = (currentImageIndex - 1 + allImages.length) % allImages.length;
                      setCurrentImageIndex(prevIndex);
                      setSelectedImage(allImages[prevIndex]);
                    }
                  }}
                >
                  <ChevronLeft className="h-5 w-5 text-dark-text-secondary" />
                </button>
                <button 
                  className="bg-dark-card p-2 rounded-full hover:bg-dark-card/70 transition-colors"
                  onClick={() => {
                    const images = stylist.catalog_images || [];
                    const urls = stylist.catalog_urls || [];
                    const allImages = [...images.map(img => img.image_url), ...urls];
                    if (allImages.length > 0) {
                      const nextIndex = (currentImageIndex + 1) % allImages.length;
                      setCurrentImageIndex(nextIndex);
                      setSelectedImage(allImages[nextIndex]);
                    }
                  }}
                >
                  <ChevronRight className="h-5 w-5 text-dark-text-secondary" />
                </button>
              </div>
            )}
          </div>
          
          {hasCatalogImages ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {stylist.catalog_images?.map((image, index) => (
                <div
                  key={image.id}
                  onClick={() => {
                    setCurrentImageIndex(index);
                    setSelectedImage(image.image_url);
                  }}
                  className="aspect-square bg-dark-card rounded-xl overflow-hidden apple-card cursor-pointer transition-transform duration-300 hover:scale-105"
                >
                  <img
                    src={image.image_url}
                    alt={image.file_name || 'Catalog image'}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          ) : hasCatalogUrls ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {stylist.catalog_urls?.map((url, index) => (
                <div
                  key={index}
                  onClick={() => {
                    setCurrentImageIndex(index);
                    setSelectedImage(url);
                  }}
                  className="aspect-square bg-dark-card rounded-xl overflow-hidden apple-card cursor-pointer transition-transform duration-300 hover:scale-105"
                >
                  <img
                    src={url}
                    alt={`Catalog image ${index + 1}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-dark-card/50 rounded-xl border border-dark-border">
              <div className="mx-auto w-16 h-16 bg-dark-card rounded-full flex items-center justify-center mb-4">
                <Camera className="h-8 w-8 text-dark-text-tertiary" />
              </div>
              <h3 className="text-lg font-medium text-dark-text-primary mb-2">
                No catalog images yet
              </h3>
              <p className="text-dark-text-secondary">
                Stylist hasn't uploaded their catalog yet.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Image Lightbox */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-full">
            <img 
              src={selectedImage} 
              alt="Catalog image full view" 
              className="max-w-full max-h-[90vh] object-contain"
            />
            <button 
              className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
              onClick={(e) => {
                e.stopPropagation()
                setSelectedImage(null)
              }}
            >
              <X className="h-6 w-6" />
            </button>
            
            {/* Navigation Arrows */}
            <div className="absolute inset-x-0 bottom-4 flex justify-center space-x-4">
              <button 
                className="bg-black/50 text-white p-3 rounded-full hover:bg-black/70 transition-colors"
                onClick={(e) => {
                  e.stopPropagation()
                  const images = stylist.catalog_images || [];
                  const urls = stylist.catalog_urls || [];
                  const allImages = [...images.map(img => img.image_url), ...urls];
                  const currentIndex = allImages.findIndex(img => img === selectedImage);
                  const prevIndex = (currentIndex - 1 + allImages.length) % allImages.length;
                  setSelectedImage(allImages[prevIndex]);
                }}
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button 
                className="bg-black/50 text-white p-3 rounded-full hover:bg-black/70 transition-colors"
                onClick={(e) => {
                  e.stopPropagation()
                  const images = stylist.catalog_images || [];
                  const urls = stylist.catalog_urls || [];
                  const allImages = [...images.map(img => img.image_url), ...urls];
                  const currentIndex = allImages.findIndex(img => img === selectedImage);
                  const nextIndex = (currentIndex + 1) % allImages.length;
                  setSelectedImage(allImages[nextIndex]);
                }}
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}