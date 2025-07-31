'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, PanInfo } from 'framer-motion'
import { Heart, X, Loader2, ArrowLeft, AlertCircle, RotateCcw, CheckCircle, Lock, Image, MessageCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'

interface Stylist {
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

export default function SwipePage() {
  const { user, session } = useAuth()
  const [stylists, setStylists] = useState<Stylist[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [swiping, setSwiping] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resetting, setResetting] = useState(false)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  
  // Swipe state
  const [isDragging, setIsDragging] = useState(false)
  const [dragDirection, setDragDirection] = useState<'left' | 'right' | null>(null)
  const [dragDistance, setDragDistance] = useState(0)
  const [showMatch, setShowMatch] = useState(false)
  const [matchedStylist, setMatchedStylist] = useState<Stylist | null>(null)
  const [imageError, setImageError] = useState<string | null>(null)
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (user) {
      fetchAvailableStylists()
    }
  }, [user])

  const fetchAvailableStylists = async () => {
    try {
      setLoading(true)
      setError(null)
      setCurrentIndex(0)

      console.log('Fetching available stylists for user:', user?.id)

      // First, get all stylists
      const { data: allStylists, error: stylistsError } = await supabase
        .from('stylists')
        .select('*')
        .order('id')

      if (stylistsError) {
        console.error('Error fetching all stylists:', stylistsError)
        setError(`Failed to load stylists: ${stylistsError.message}`)
        return
      }

      console.log('All stylists fetched:', allStylists?.length || 0)

      // Fetch catalog images for each stylist
      const stylistsWithImages = await Promise.all(
        allStylists?.map(async (stylist) => {
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

      // Get user's swipes
      const { data: userSwipes, error: swipesError } = await supabase
        .from('swipes')
        .select('stylist_id')
        .eq('user_id', user?.id)

      if (swipesError) {
        console.error('Error fetching swipes:', swipesError)
        setError(`Failed to load swipes: ${swipesError.message}`)
        return
      }

      console.log('User swipes:', userSwipes)

      // Get user's matches
      const { data: userMatches, error: matchesError } = await supabase
        .from('matches')
        .select('stylist_id')
        .eq('user_id', user?.id)

      if (matchesError) {
        console.error('Error fetching matches:', matchesError)
        setError(`Failed to load matches: ${matchesError.message}`)
        return
      }

      console.log('User matches:', userMatches)

      // Create sets for efficient lookup
      const swipedStylistIds = new Set(userSwipes?.map(swipe => swipe.stylist_id) || [])
      const matchedStylistIds = new Set(userMatches?.map(match => match.stylist_id) || [])

      console.log('Swiped stylist IDs:', Array.from(swipedStylistIds))
      console.log('Matched stylist IDs:', Array.from(matchedStylistIds))

      // Filter out swiped and matched stylists
      const availableStylists = stylistsWithImages.filter(stylist => 
        !swipedStylistIds.has(stylist.id) && !matchedStylistIds.has(stylist.id)
      ) || []

      console.log(`Found ${stylistsWithImages.length} total stylists, ${availableStylists.length} available after filtering`)
      setStylists(availableStylists)
    } catch (error) {
      console.error('Error fetching stylists:', error)
      setError(`Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  const handleSwipe = async (direction: 'left' | 'right') => {
    if (!user || swiping || currentIndex >= stylists.length) {
      return
    }

    setSwiping(true)
    const currentStylist = stylists[currentIndex]

    try {
      console.log(`Processing ${direction} swipe for stylist:`, currentStylist.name)

      // Insert swipe record
      const { error: swipeError } = await supabase
        .from('swipes')
        .insert({
          user_id: user.id,
          stylist_id: currentStylist.id,
          direction
        })

      if (swipeError) {
        console.error('Swipe error:', swipeError)
        throw new Error(`Failed to record swipe: ${swipeError.message}`)
      }

      // If it's a like (right swipe), create a match
      if (direction === 'right') {
        const { error: matchError } = await supabase
          .from('matches')
          .insert({
            user_id: user.id,
            stylist_id: currentStylist.id,
            matched_at: new Date().toISOString()
          })

        if (matchError) {
          console.error('Match error:', matchError)
          throw new Error(`Failed to create match: ${matchError.message}`)
        }

        console.log('Match created successfully!')
        
        // Show match notification
        setMatchedStylist(currentStylist)
        setShowMatch(true)
        
        // Hide match notification after 3 seconds
        setTimeout(() => {
          setShowMatch(false)
          setMatchedStylist(null)
        }, 3000)
      }

      // Move to next stylist
      setCurrentIndex(prev => prev + 1)
      console.log('Moved to next stylist')
    } catch (error) {
      console.error('Error processing swipe:', error)
      setError(error instanceof Error ? error.message : 'Failed to process swipe')
    } finally {
      setSwiping(false)
    }
  }

  // Swipe gesture handlers
  const handleDragStart = () => {
    setIsDragging(true)
    setDragDirection(null)
    setDragDistance(0)
  }

  const handleDrag = (event: any, info: PanInfo) => {
    const distance = info.offset.x
    setDragDistance(distance)
    
    // Very sensitive direction detection for rotation-only approach
    if (Math.abs(distance) > 10) {
      setDragDirection(distance > 0 ? 'right' : 'left')
    } else {
      setDragDirection(null)
    }
  }

  const handleDragEnd = async (event: any, info: PanInfo) => {
    setIsDragging(false)
    const distance = info.offset.x
    const velocity = info.velocity.x

    // More sensitive swipe thresholds for restricted movement
    const shouldSwipe = Math.abs(distance) > 60 || Math.abs(velocity) > 200
    
    if (shouldSwipe) {
      const direction = distance > 0 ? 'right' : 'left'
      await handleSwipe(direction)
    }

    // Reset drag state
    setDragDirection(null)
    setDragDistance(0)
  }

  // Handle image loading errors
  const handleImageError = (stylistId: string) => {
    setImageError(stylistId)
  }

  // Reset image error when stylist changes
  useEffect(() => {
    setImageError(null)
  }, [currentIndex])

  const handleStartOver = async () => {
    if (!user || !confirm('Are you sure you want to start over? This will delete all your matches and swipes, allowing you to rematch with all stylists.')) {
      return
    }

    setResetting(true)
    setError(null)
    
    try {
      console.log('Starting over for user:', user.id)

      // Delete all swipes for the user
      const { error: swipesError } = await supabase
        .from('swipes')
        .delete()
        .eq('user_id', user.id)

      if (swipesError) {
        console.error('Error deleting swipes:', swipesError)
        throw new Error(`Failed to delete swipes: ${swipesError.message}`)
      }

      // Delete all matches for the user
      const { error: matchesError } = await supabase
        .from('matches')
        .delete()
        .eq('user_id', user.id)

      if (matchesError) {
        console.error('Error deleting matches:', matchesError)
        throw new Error(`Failed to delete matches: ${matchesError.message}`)
      }

      console.log('Successfully reset all matches and swipes')
      
      // Reset current index to 0
      setCurrentIndex(0)
      
      // Refresh the stylists list
      await fetchAvailableStylists()
      
      // Show success message
      setShowSuccessMessage(true)
      setTimeout(() => setShowSuccessMessage(false), 3000)
      
    } catch (error) {
      console.error('Error starting over:', error)
      setError(`Error starting over: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setResetting(false)
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        {/* Background Elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-1/2 h-1/2 bg-accent-blue/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-1/2 h-1/2 bg-accent-green/5 rounded-full blur-3xl"></div>
        </div>
        
        {/* Back to Home Button */}
        <div className="fixed top-6 left-6 z-20">
          <Link
            href="/"
            className="flex items-center space-x-2 bg-dark-surface/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-apple-sm hover:shadow-apple-md transition-all duration-200 text-dark-text-secondary hover:text-dark-text-primary"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-medium">Back to Home</span>
          </Link>
        </div>
        
        <div className="flex flex-col items-center space-y-4">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-4 border-dark-border opacity-20"></div>
            <div className="absolute inset-0 rounded-full border-4 border-t-accent-blue border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
          </div>
          <span className="text-lg text-dark-text-primary">Loading stylists...</span>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        {/* Background Elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-1/2 h-1/2 bg-system-red/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-1/2 h-1/2 bg-dark-surface/10 rounded-full blur-3xl"></div>
        </div>

        {/* Back to Home Button */}
        <div className="fixed top-6 left-6 z-20">
          <Link
            href="/"
            className="flex items-center space-x-2 bg-dark-surface/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-apple-sm hover:shadow-apple-md transition-all duration-200 text-dark-text-secondary hover:text-dark-text-primary"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-medium">Back to Home</span>
          </Link>
        </div>
        
        <div className="text-center max-w-md mx-auto px-6">
          <div className="w-20 h-20 bg-system-red/10 backdrop-blur-sm rounded-full mx-auto mb-6 flex items-center justify-center shadow-apple-lg">
            <AlertCircle className="w-10 h-10 text-system-red" />
          </div>
          <h1 className="text-3xl font-medium text-dark-text-primary mb-4">Something went wrong</h1>
          <p className="text-dark-text-secondary mb-8 leading-relaxed">{error}</p>
          <button
            onClick={fetchAvailableStylists}
            className="apple-button-primary px-6 py-3 rounded-full font-medium transition-all"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  // Authentication required
  if (!user) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        {/* Background Elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-1/2 h-1/2 bg-accent-blue/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-1/2 h-1/2 bg-accent-green/5 rounded-full blur-3xl"></div>
        </div>

        {/* Back to Home Button */}
        <div className="fixed top-6 left-6 z-20">
          <Link
            href="/"
            className="flex items-center space-x-2 bg-dark-surface/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-apple-sm hover:shadow-apple-md transition-all duration-200 text-dark-text-secondary hover:text-dark-text-primary"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-medium">Back to Home</span>
          </Link>
        </div>
        
        <div className="text-center max-w-md mx-auto px-6">
          <div className="w-20 h-20 bg-dark-surface/80 backdrop-blur-sm rounded-full mx-auto mb-6 flex items-center justify-center shadow-apple-lg">
            <Lock className="w-10 h-10 text-dark-text-secondary" />
          </div>
          <h1 className="text-3xl font-medium text-dark-text-primary mb-4">Authentication Required</h1>
          <p className="text-dark-text-secondary mb-8 leading-relaxed">You need to be logged in to access the stylist matching feature.</p>
          <Link
            href="/"
            className="apple-button-primary px-6 py-3 rounded-full font-medium transition-all"
          >
            Go to Home
          </Link>
        </div>
      </div>
    )
  }

  // No more stylists to swipe
  if (currentIndex >= stylists.length) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        {/* Background Elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-1/2 h-1/2 bg-accent-blue/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-1/2 h-1/2 bg-accent-green/5 rounded-full blur-3xl"></div>
        </div>

        {/* Back to Home Button */}
        <div className="fixed top-6 left-6 z-20">
          <Link
            href="/"
            className="flex items-center space-x-2 bg-dark-surface/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-apple-sm hover:shadow-apple-md transition-all duration-200 text-dark-text-secondary hover:text-dark-text-primary"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-medium">Back to Home</span>
          </Link>
        </div>
        
        <div className="text-center max-w-md mx-auto px-6">
          <div className="w-20 h-20 bg-dark-surface/80 backdrop-blur-sm rounded-full mx-auto mb-6 flex items-center justify-center shadow-apple-lg">
            <Heart className="w-10 h-10 text-accent-green" />
          </div>
          <h1 className="text-3xl font-medium text-dark-text-primary mb-4">No More Stylists</h1>
          <p className="text-dark-text-secondary mb-8 leading-relaxed">
            {stylists.length === 0 
              ? "You've swiped on all available stylists in your area. Check back soon for new matches!" 
              : "You've seen all available stylists. We'll notify you when new stylists join."
            }
          </p>
          
          {/* Success Message */}
          {showSuccessMessage && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 p-6 bg-dark-card border border-dark-border/30 rounded-xl shadow-apple-sm backdrop-blur-sm"
            >
              <div className="flex flex-col items-center space-y-3">
                <div className="w-12 h-12 bg-accent-green/10 rounded-full flex items-center justify-center mb-2">
                  <CheckCircle className="w-6 h-6 text-accent-green" />
                </div>
                <span className="text-dark-text-primary font-medium text-lg">Successfully Reset</span>
                <p className="text-dark-text-secondary text-sm">All matches and swipes have been cleared. You can now start swiping again with all available stylists.</p>
              </div>
            </motion.div>
          )}
          
          <div className="flex flex-col sm:flex-row gap-5 justify-center">
            <button
              onClick={handleStartOver}
              disabled={resetting}
              className="apple-button-secondary px-6 py-3 rounded-full font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {resetting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Resetting...</span>
                </>
              ) : (
                <>
                  <RotateCcw className="w-4 h-4" />
                  <span>Start Over</span>
                </>
              )}
            </button>
            <Link
              href="/matches"
              className="apple-button-primary px-6 py-3 rounded-full font-medium transition-all flex items-center justify-center space-x-2"
            >
              View Matches
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const currentStylist = stylists[currentIndex]

  return (
    <div className="min-h-screen bg-dark-bg">
      {/* Subtle background elements - minimal and dark */}
      <div className="absolute inset-0 bg-gradient-to-b from-dark-bg via-dark-surface/20 to-dark-bg"></div>
      
      {/* Minimal floating elements */}
      <div className="absolute top-32 left-16 w-2 h-2 bg-dark-text-tertiary/40 rounded-full"></div>
      <div className="absolute top-48 right-24 w-1 h-1 bg-dark-text-tertiary/30 rounded-full"></div>
      <div className="absolute bottom-48 left-32 w-1.5 h-1.5 bg-dark-text-tertiary/20 rounded-full"></div>
      
      {/* Back to Landing Page Button */}
      <div className="fixed top-6 left-6 z-20">
        <Link
          href="/"
          className="apple-button-secondary flex items-center space-x-2 text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Home</span>
        </Link>
      </div>

      {/* Action Buttons - Fixed position in top right */}
      <div className="fixed top-6 right-6 z-20 flex space-x-3">
        <Link
          href="/matches"
          className="apple-button-secondary flex items-center space-x-2 text-sm"
        >
          <Heart className="w-4 h-4" />
          <span>Matches</span>
        </Link>
        <button
          onClick={handleStartOver}
          disabled={resetting}
          className="apple-button-secondary flex items-center space-x-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {resetting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Resetting...</span>
            </>
          ) : (
            <>
              <RotateCcw className="w-4 h-4" />
              <span>Reset</span>
            </>
          )}
        </button>
      </div>

      {/* Success Message Overlay */}
      {showSuccessMessage && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-20 left-1/2 transform -translate-x-1/2 z-30"
        >
          <div className="bg-dark-surface/90 backdrop-blur-apple border border-dark-border rounded-2xl p-5 shadow-apple-lg">
            <div className="flex flex-col items-center space-y-3">
              <div className="w-10 h-10 bg-accent-green/10 rounded-full flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-accent-green" />
              </div>
              <div className="text-center space-y-1">
                <span className="text-dark-text-primary font-medium">Successfully reset!</span>
                <p className="text-dark-text-secondary text-sm">All matches and swipes cleared. Start swiping again!</p>
              </div>
              <div className="pt-2">
                <Link
                  href="/matches"
                  className="text-accent-blue hover:text-accent-blue-muted text-sm font-medium"
                >
                  View Matches
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Match Notification Overlay */}
      {showMatch && matchedStylist && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-dark-bg/80 backdrop-blur-apple flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ y: 30, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 30, opacity: 0, scale: 0.95 }}
            className="apple-modal p-8 max-w-md mx-4 text-center shadow-apple-xl"
          >
            <div className="flex flex-col items-center space-y-6">
              <div className="w-20 h-20 bg-accent-blue/10 rounded-full flex items-center justify-center">
                <Heart className="w-10 h-10 text-accent-blue" />
              </div>
              
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold text-dark-text-primary">It's a Match!</h2>
                <p className="text-dark-text-secondary">You and {matchedStylist.name} liked each other!</p>
              </div>
              
              <div className="flex flex-col sm:flex-row w-full space-y-3 sm:space-y-0 sm:space-x-4 pt-4">
                <Link
                  href="/matches"
                  className="apple-button-primary flex-1 flex items-center justify-center space-x-2"
                >
                  <Heart className="w-4 h-4" />
                  <span>View Matches</span>
                </Link>
                <button
                  onClick={() => setShowMatch(false)}
                  className="apple-button-secondary flex-1"
                >
                  Continue Swiping
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
      
      <div className="max-w-sm mx-auto pt-20 px-4 relative z-10">
        <div className="text-center space-y-6 mb-12">
          {/* Minimal badge */}
          <div className="inline-flex items-center space-x-2 bg-dark-surface/60 backdrop-blur-apple px-4 py-2 rounded-2xl border border-dark-border/50">
            <Heart className="h-3 w-3 text-dark-text-tertiary" />
            <span className="text-sm font-medium text-dark-text-secondary">
              Stylist Matching
            </span>
          </div>
          
          {/* Clean, minimal headline */}
          <h1 className="text-3xl md:text-4xl font-semibold text-dark-text-primary leading-tight tracking-tight">
            Find Your Perfect <span className="text-accent-blue">Stylist</span>
          </h1>
          
          {/* Simplified subtext */}
          <p className="text-base text-dark-text-secondary max-w-xs mx-auto leading-relaxed">
            Swipe right on stylists you like, left to pass.
          </p>
        </div>

        {/* Stylist Card with Animation */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStylist.id}
            ref={cardRef}
            initial={{ opacity: 0, scale: 0.95, y: 20, x: 0, rotate: 0 }}
            animate={{ 
              opacity: 1, 
              scale: isDragging ? 1.02 : 1, 
              y: 0,
              // Card stays completely anchored - no x translation during drag
              x: 0,
              // Pure rotation effect - card tumbles left/right
              rotate: isDragging ? Math.max(Math.min(dragDistance * 0.15, 15), -15) : 0
            }}
            exit={{ 
              opacity: 0, 
              scale: 0.8, 
              y: dragDirection === 'right' ? -50 : 50,
              x: dragDirection === 'right' ? 300 : -300,
              rotate: dragDirection === 'right' ? 30 : -30
            }}
            transition={{ 
              type: "spring",
              stiffness: 400,
              damping: 35,
              duration: 0.3
            }}
            drag="x"
            dragConstraints={{ left: -200, right: 200 }}
            dragElastic={0.3}
            dragTransition={{ bounceStiffness: 1200, bounceDamping: 50 }}
            onDragStart={handleDragStart}
            onDrag={handleDrag}
            onDragEnd={handleDragEnd}
            onClick={() => {
              if (!isDragging) {
                window.location.href = `/stylist/${currentStylist.id}`;
              }
            }}
            className={`apple-card rounded-3xl overflow-hidden mb-8 cursor-grab active:cursor-grabbing transition-all duration-200 ${
              isDragging 
                ? dragDirection === 'right'
                  ? 'shadow-apple-lg border-accent-green/30'
                  : 'shadow-apple-lg border-system-red/30'
                : 'shadow-apple-lg'
            }`}
            style={{
              zIndex: isDragging ? 10 : 1,
              transformOrigin: "center center"
            }}
          >
            {/* Image */}
            <div className="relative h-96 bg-dark-card rounded-t-xl overflow-hidden">
              {currentStylist.catalog_images && currentStylist.catalog_images.length > 0 && imageError !== currentStylist.id ? (
                <div className="w-full h-full relative">
                  <img
                    src={currentStylist.catalog_images[0].image_url}
                    alt={currentStylist.name}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    onError={() => handleImageError(currentStylist.id)}
                    onLoad={() => setImageError(null)}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
                </div>
              ) : currentStylist.catalog_urls && currentStylist.catalog_urls.length > 0 && imageError !== currentStylist.id ? (
                <div className="w-full h-full relative">
                  <img
                    src={currentStylist.catalog_urls[0]}
                    alt={currentStylist.name}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    onError={() => handleImageError(currentStylist.id)}
                    onLoad={() => setImageError(null)}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-dark-card">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-dark-surface/80 backdrop-blur-sm rounded-full mx-auto mb-4 flex items-center justify-center shadow-apple-sm">
                      <Image className="w-10 h-10 text-dark-text-tertiary" />
                    </div>
                    <p className="text-sm font-medium text-dark-text-secondary">No photo available</p>
                  </div>
                </div>
              )}

              {/* Swipe Direction Overlays */}
              {isDragging && dragDirection && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ 
                    opacity: Math.min(Math.abs(dragDistance) / 100, 0.8)
                  }}
                  exit={{ opacity: 0 }}
                  className={`absolute inset-0 flex items-center justify-center backdrop-blur-apple ${
                    dragDirection === 'right' 
                      ? 'bg-accent-green/10' 
                      : 'bg-system-red/10'
                  }`}
                >
                  <motion.div 
                    className="flex flex-col items-center space-y-4"
                    animate={{
                      scale: [1, 1.05, 1]
                    }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                  >
                    <div className={`w-24 h-24 rounded-full flex items-center justify-center ${
                      dragDirection === 'right' 
                        ? 'bg-accent-green/20' 
                        : 'bg-system-red/20'
                    }`}>
                      {dragDirection === 'right' ? (
                        <Heart className="w-12 h-12 text-accent-green" />
                      ) : (
                        <X className="w-12 h-12 text-system-red" />
                      )}
                    </div>
                    <span className={`text-xl font-medium ${
                      dragDirection === 'right' ? 'text-accent-green' : 'text-system-red'
                    }`}>
                      {dragDirection === 'right' ? 'LIKE' : 'PASS'}
                    </span>
                  </motion.div>
                </motion.div>
              )}

              {/* Swipe Instructions */}
              {!isDragging && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.9 }}
                  className="absolute bottom-4 left-4 right-4 bg-dark-surface/80 backdrop-blur-apple text-dark-text-secondary text-center py-3 rounded-xl border border-dark-border/50"
                >
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <div className="flex items-center justify-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <X className="w-3 h-3 text-system-red" />
                        <span className="text-xs font-medium">Swipe left to pass</span>
                      </div>
                      <div className="h-3 w-px bg-dark-border"></div>
                      <div className="flex items-center space-x-1">
                        <Heart className="w-3 h-3 text-accent-green" />
                        <span className="text-xs font-medium">Swipe right to like</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 mt-1">
                      <MessageCircle className="w-3 h-3 text-accent-blue" />
                      <span className="text-xs font-medium">Tap card to view profile</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              <h2 className="text-2xl font-medium text-dark-text-primary">
                {currentStylist.name}
              </h2>
              
              <p className="text-dark-text-secondary text-sm leading-relaxed">
                {currentStylist.bio}
              </p>

              {/* Specialties */}
              {currentStylist.specialties && currentStylist.specialties.length > 0 && (
                <div>
                  <h3 className="text-xs font-medium text-dark-text-tertiary mb-3">Specialties</h3>
                  <div className="flex flex-wrap gap-2">
                    {currentStylist.specialties.map((specialty, index) => (
                      <span
                        key={index}
                        className="text-xs bg-dark-card/40 backdrop-blur-sm px-3 py-1 rounded-full border border-white/10 text-dark-text-secondary font-medium"
                      >
                        {specialty.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-10 mb-12">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleSwipe('left')}
            disabled={swiping}
            className="w-20 h-20 bg-dark-surface/80 backdrop-blur-sm border border-dark-border rounded-full shadow-apple-lg flex items-center justify-center hover:border-system-red/50 hover:bg-system-red/10 transition-all duration-300 disabled:opacity-50 cursor-pointer"
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            <X className="w-9 h-9 text-system-red" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleSwipe('right')}
            disabled={swiping}
            className="w-20 h-20 bg-dark-surface/80 backdrop-blur-sm border border-dark-border rounded-full shadow-apple-lg flex items-center justify-center hover:border-accent-green/50 hover:bg-accent-green/10 transition-all duration-300 disabled:opacity-50 cursor-pointer"
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            <Heart className="w-9 h-9 text-accent-green" />
          </motion.button>
        </div>

        {/* Swipe Status - Hidden since we already show this in the card overlay */}
        {/* {isDragging && dragDirection && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ 
              opacity: Math.min(Math.abs(dragDistance) / 150, 1),
              y: 0
            }}
            exit={{ opacity: 0, y: 20 }}
            className="text-center mb-4"
          >
            <motion.div 
              className={`inline-flex items-center px-6 py-3 rounded-xl text-white font-medium shadow-apple-lg ${
                dragDirection === 'right' 
                  ? 'bg-accent-green' 
                  : 'bg-system-red'
              }`}
              animate={{
                scale: [1, 1.02, 1],
                y: [0, -1, 0]
              }}
              transition={{ duration: 0.5, repeat: Infinity }}
            >
              {dragDirection === 'right' ? (
                <>
                  <Heart className="w-4 h-4 mr-2" />
                  <span>LIKE</span>
                </>
              ) : (
                <>
                  <X className="w-4 h-4 mr-2" />
                  <span>PASS</span>
                </>
              )}
            </motion.div>
          </motion.div>
        )} */}

        {/* Progress Indicator */}
        <div className="flex justify-center mb-8">
          <div className="flex space-x-3">
            {stylists.map((_, index) => (
              <motion.div
                key={index}
                initial={{ scale: 0.8, opacity: 0.5 }}
                animate={{ 
                  scale: index === currentIndex ? 1 : 0.8,
                  opacity: index === currentIndex ? 1 : 0.5
                }}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? 'bg-accent-blue'
                    : index < currentIndex
                    ? 'bg-dark-text-tertiary'
                    : 'bg-dark-border'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Debug Info (remove in production) */}
        <div className="text-center mt-4 text-xs text-gray-500">
          <p>Stylists available: {stylists.length}</p>
          <p>Current index: {currentIndex}</p>
          <p>User ID: {user?.id}</p>
          <p>User authenticated: {user ? 'Yes' : 'No'}</p>
          <p>Loading state: {loading ? 'Yes' : 'No'}</p>
          <p>Error state: {error ? 'Yes' : 'No'}</p>
          {error && <p className="text-red-500">Error: {error}</p>}
          {stylists.length > 0 && (
            <div className="mt-2 p-2 bg-gray-100 rounded">
              <p className="font-semibold">Current stylist:</p>
              <p>Name: {stylists[currentIndex]?.name}</p>
              <p>ID: {stylists[currentIndex]?.id}</p>
            </div>
          )}
          
          {/* Additional debug info */}
          <div className="mt-4 p-3 bg-blue-50 rounded text-left">
            <h4 className="font-semibold mb-2">Debug Information:</h4>
            <p><strong>Environment:</strong> {process.env.NODE_ENV}</p>
            <p><strong>Supabase URL:</strong> {process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing'}</p>
            <p><strong>Supabase Key:</strong> {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Missing'}</p>
            <p><strong>User Email:</strong> {user?.email || 'Not signed in'}</p>
            <p><strong>User Created:</strong> {user?.created_at || 'N/A'}</p>
            <p><strong>Session:</strong> {session ? 'Active' : 'None'}</p>
            
            <div className="mt-3">
              <button
                onClick={fetchAvailableStylists}
                className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700"
              >
                Refresh Stylists
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
