'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ShoppingBag, 
  Calendar, 
  Palette, 
  DollarSign, 
  Save, 
  CheckCircle, 
  ArrowLeft,
  ArrowRight,
  Loader2,
  AlertCircle,
  User
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

interface UserPreferences {
  id: string
  user_id: string
  gender: string
  clothing_preferences: string[]
  preferred_occasions: string[]
  style_preferences: string
  budget_range: string
  profile_completed: boolean
  created_at: string
  updated_at: string
}

const PREFERENCES = [
  {
    id: 'gender',
    title: 'What best describes you?',
    description: 'This helps us match you with the right stylist',
    icon: <User className="w-5 h-5 text-white" />,
    options: [
      { value: 'male', label: 'Male' },
      { value: 'female', label: 'Female' },
      { value: 'non-binary', label: 'Non-binary' },
      { value: 'prefer-not-to-say', label: 'Prefer not to say' }
    ]
  },
  {
    id: 'clothing',
    title: 'Type of Clothing',
    description: 'What type of clothing do you prefer?',
    icon: <ShoppingBag className="w-5 h-5 text-white" />,
    options: [
      { value: 'casual', label: 'Casual' },
      { value: 'formal', label: 'Formal' },
      { value: 'ethnic', label: 'Ethnic' },
      { value: 'streetwear', label: 'Streetwear' }
    ]
  },
  {
    id: 'occasion',
    title: 'Occasion',
    description: 'What occasion do you dress for most?',
    icon: <Calendar className="w-5 h-5 text-white" />,
    options: [
      { value: 'daily', label: 'Daily Wear' },
      { value: 'party', label: 'Party' },
      { value: 'wedding', label: 'Wedding' },
      { value: 'office', label: 'Office' }
    ]
  },
  {
    id: 'style',
    title: 'Style',
    description: 'What style best describes you?',
    icon: <Palette className="w-5 h-5 text-white" />,
    options: [
      { value: 'minimalist', label: 'Minimalist' },
      { value: 'trendy', label: 'Trendy' },
      { value: 'classic', label: 'Classic' },
      { value: 'bold', label: 'Bold' }
    ]
  },
  {
    id: 'budget',
    title: 'Budget',
    description: 'What\'s your typical budget range?',
    icon: <DollarSign className="w-5 h-5 text-white" />,
    options: [
      { value: '0-1000', label: '₹0–1000' },
      { value: '1000-3000', label: '₹1000–3000' },
      { value: '3000-5000', label: '₹3000–5000' },
      { value: '5000+', label: '₹5000+' }
    ]
  }
]

export default function ProfilePage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [preferences, setPreferences] = useState<UserPreferences | null>(null)
  const [showCompletion, setShowCompletion] = useState(false)

  // Form state - now includes gender
  const [gender, setGender] = useState('')
  const [clothingType, setClothingType] = useState('')
  const [occasion, setOccasion] = useState('')
  const [style, setStyle] = useState('')
  const [budget, setBudget] = useState('')

  // Step navigation
  const [currentStep, setCurrentStep] = useState(0)

  useEffect(() => {
    if (user) {
      loadUserPreferences()
    }
  }, [user])

  const loadUserPreferences = async () => {
    try {
      setLoading(true)
      setError('')

      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user?.id)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading preferences:', error)
        setError('Failed to load your preferences')
        return
      }

      if (data) {
        setPreferences(data)
        // Map the first preference from arrays to single values for simplified UI
        setGender(data.gender || '')
        setClothingType(data.clothing_preferences?.[0] || '')
        setOccasion(data.preferred_occasions?.[0] || '')
        setStyle(data.style_preferences || '')
        setBudget(data.budget_range || '')
      }
    } catch (error) {
      console.error('Error loading preferences:', error)
      setError('Failed to load your preferences')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    console.log('🔄 Starting save process...')
    
    if (!user) {
      console.error('❌ No user found')
      setError('Please sign in to save preferences')
      return
    }

    console.log('✅ User found:', user.id)
    console.log('🔗 Supabase client:', supabase ? 'Available' : 'Not available')

    try {
      setSaving(true)
      setError('')
      setSuccess(false)

      console.log('📊 Current form values:')
      console.log('- gender:', gender)
      console.log('- clothingType:', clothingType)
      console.log('- occasion:', occasion)
      console.log('- style:', style)
      console.log('- budget:', budget)

      const preferencesData = {
        user_id: user.id,
        gender: gender,
        clothing_preferences: clothingType ? [clothingType] : [],
        preferred_occasions: occasion ? [occasion] : [],
        style_preferences: style,
        budget_range: budget,
        profile_completed: true
      }

      console.log('📤 Saving preferences data:', JSON.stringify(preferencesData, null, 2))

      // First, check if a record already exists for this user
      console.log('🔄 Checking if preferences exist for user:', user.id)
      const { data: existingData, error: checkError } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('❌ Error checking existing preferences:', checkError)
        throw checkError
      }

      let result
      if (existingData) {
        // Update existing preferences
        console.log('🔄 Updating existing preferences for user:', user.id)
        const { data, error } = await supabase
          .from('user_preferences')
          .update(preferencesData)
          .eq('user_id', user.id)
          .select()

        if (error) {
          console.error('❌ Update error:', error)
          console.error('❌ Error details:', JSON.stringify(error, null, 2))
          throw error
        }
        console.log('✅ Update successful:', data)
      } else {
        // Insert new preferences (after clearing any existing ones)
        console.log('🔄 Clearing any existing preferences for user:', user.id)
        
        // First, delete any existing preferences
        const { error: deleteError } = await supabase
          .from('user_preferences')
          .delete()
          .eq('user_id', user.id)

        if (deleteError) {
          console.error('❌ Error deleting existing preferences:', deleteError)
          // Continue anyway, as the insert might still work
        } else {
          console.log('✅ Cleared existing preferences')
        }

        // Now insert new preferences
        console.log('🔄 Inserting new preferences for user:', user.id)
        const { data, error } = await supabase
          .from('user_preferences')
          .insert(preferencesData)
          .select()

        if (error) {
          console.error('❌ Insert error:', error)
          console.error('❌ Error details:', JSON.stringify(error, null, 2))
          throw error
        }
        console.log('✅ Insert successful:', data)
      }

      console.log('✅ Save operation completed successfully')
      setSuccess(true)
      setShowCompletion(true)
      setTimeout(() => setSuccess(false), 3000)
      
      // Reload preferences to get updated data
      console.log('🔄 Reloading preferences...')
      await loadUserPreferences()
    } catch (error) {
      console.error('Error saving preferences:', error)
      console.error('Full error object:', JSON.stringify(error, null, 2))
      
      let errorMessage = 'Unknown error'
      if (error instanceof Error) {
        errorMessage = error.message
      } else if (typeof error === 'object' && error !== null) {
        errorMessage = JSON.stringify(error)
      }
      
      setError(`Failed to save your preferences: ${errorMessage}`)
    } finally {
      setSaving(false)
    }
  }

  const getCurrentValue = () => {
    switch (currentStep) {
      case 0: return gender
      case 1: return clothingType
      case 2: return occasion
      case 3: return style
      case 4: return budget
      default: return ''
    }
  }

  const setCurrentValue = (value: string) => {
    switch (currentStep) {
      case 0: setGender(value); break
      case 1: setClothingType(value); break
      case 2: setOccasion(value); break
      case 3: setStyle(value); break
      case 4: setBudget(value); break
    }
  }

  const handleOptionSelect = (value: string) => {
    setCurrentValue(value)
    // Auto-advance to next step after a short delay
    setTimeout(() => {
      if (currentStep < PREFERENCES.length - 1) {
        setCurrentStep(currentStep + 1)
      }
    }, 500)
  }

  const goToPreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const goToNextStep = () => {
    if (currentStep < PREFERENCES.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const renderPreferenceCard = () => {
    const preference = PREFERENCES[currentStep]
    const currentValue = getCurrentValue()

    return (
      <motion.div
        key={currentStep}
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -50 }}
        transition={{ duration: 0.3 }}
        className="apple-card p-8 max-w-md mx-auto"
      >
        {/* Progress indicator */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex space-x-2">
            {PREFERENCES.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full ${
                  index === currentStep
                    ? 'bg-accent-blue'
                    : index < currentStep
                    ? 'bg-accent-green'
                    : 'bg-dark-border'
                }`}
              />
            ))}
          </div>
          <span className="text-sm text-dark-text-tertiary">
            {currentStep + 1} of {PREFERENCES.length}
          </span>
        </div>

        {/* Header */}
        <div className="text-center mb-8 space-y-4">
          <div className="w-12 h-12 bg-accent-blue/20 rounded-2xl flex items-center justify-center mx-auto">
            <div className="w-5 h-5 text-accent-blue">{preference.icon}</div>
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-dark-text-primary">{preference.title}</h3>
            <p className="text-dark-text-secondary text-sm">{preference.description}</p>
          </div>
        </div>
        
        {/* Options */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          {preference.options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleOptionSelect(option.value)}
              className={`p-4 rounded-2xl text-sm font-medium transition-all duration-200 border ${
                currentValue === option.value
                  ? 'bg-accent-blue text-white border-accent-blue shadow-apple transform scale-105'
                  : 'bg-dark-card text-dark-text-primary border-dark-border hover:bg-dark-surface hover:border-dark-text-tertiary'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={goToPreviousStep}
            disabled={currentStep === 0}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-200 ${
              currentStep === 0
                ? 'text-dark-text-tertiary cursor-not-allowed'
                : 'text-dark-text-secondary hover:text-dark-text-primary hover:bg-dark-surface'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back</span>
          </button>

          {currentStep < PREFERENCES.length - 1 && (
            <button
              onClick={goToNextStep}
              disabled={!currentValue}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-200 ${
                !currentValue
                  ? 'text-dark-text-tertiary cursor-not-allowed'
                  : 'text-accent-blue hover:text-accent-blue-muted hover:bg-accent-blue/10'
              }`}
            >
              <span className="text-sm">Next</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </motion.div>
    )
  }

  // Authentication required
  if (!user) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="text-center max-w-md mx-4 space-y-6">
          <h1 className="text-2xl font-semibold text-dark-text-primary">Please sign in</h1>
          <p className="text-dark-text-secondary">You need to be logged in to customize your style preferences.</p>
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

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-accent-blue" />
          <span className="text-lg text-dark-text-secondary">Loading preferences...</span>
        </div>
      </div>
    )
  }

  // Show existing preferences if user has already completed them
  if (preferences?.profile_completed && !showCompletion) {
    return (
      <div className="min-h-screen bg-dark-bg">
        {/* Back to Home Button */}
        <div className="fixed top-6 left-6 z-20">
          <Link
            href="/"
            className="apple-button-secondary flex items-center space-x-2 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Home</span>
          </Link>
        </div>

        <div className="max-w-4xl mx-auto px-6 py-8 pt-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12 space-y-4"
          >
            <h1 className="text-3xl font-semibold text-dark-text-primary">Your Style Profile</h1>
            <p className="text-dark-text-secondary text-lg">Your preferences are set and ready</p>
          </motion.div>

          {/* Existing Preferences Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto"
          >
            <div className="apple-card p-8">
              <div className="w-16 h-16 bg-accent-green/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-6 h-6 text-accent-green" />
              </div>
              <h2 className="text-xl font-semibold text-dark-text-primary mb-4 text-center">Profile Complete</h2>
              <p className="text-dark-text-secondary text-center mb-8 leading-relaxed text-sm">
                We're using your preferences to match you with the perfect stylists.
              </p>
              
              {/* Current Preferences Summary */}
              <div className="bg-dark-card rounded-2xl p-6 mb-8 border border-dark-border">
                <h3 className="text-lg font-medium text-dark-text-primary mb-6">Current Preferences</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {preferences.gender && (
                    <div className="flex items-center space-x-3">
                      <User className="w-4 h-4 text-dark-text-tertiary" />
                      <div>
                        <p className="text-xs text-dark-text-tertiary">Gender</p>
                        <p className="font-medium text-dark-text-primary capitalize text-sm">{preferences.gender}</p>
                      </div>
                    </div>
                  )}
                  {preferences.clothing_preferences?.length > 0 && (
                    <div className="flex items-center space-x-3">
                      <ShoppingBag className="w-4 h-4 text-dark-text-tertiary" />
                      <div>
                        <p className="text-xs text-dark-text-tertiary">Clothing Type</p>
                        <p className="font-medium text-dark-text-primary capitalize text-sm">{preferences.clothing_preferences[0]}</p>
                      </div>
                    </div>
                  )}
                  {preferences.preferred_occasions?.length > 0 && (
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-4 h-4 text-dark-text-tertiary" />
                      <div>
                        <p className="text-xs text-dark-text-tertiary">Occasion</p>
                        <p className="font-medium text-dark-text-primary capitalize text-sm">{preferences.preferred_occasions[0]}</p>
                      </div>
                    </div>
                  )}
                  {preferences.style_preferences && (
                    <div className="flex items-center space-x-3">
                      <Palette className="w-4 h-4 text-dark-text-tertiary" />
                      <div>
                        <p className="text-xs text-dark-text-tertiary">Style</p>
                        <p className="font-medium text-dark-text-primary capitalize text-sm">{preferences.style_preferences}</p>
                      </div>
                    </div>
                  )}
                  {preferences.budget_range && (
                    <div className="flex items-center space-x-3">
                      <DollarSign className="w-4 h-4 text-dark-text-tertiary" />
                      <div>
                        <p className="text-xs text-dark-text-tertiary">Budget</p>
                        <p className="font-medium text-dark-text-primary text-sm">{preferences.budget_range}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => {
                    setShowCompletion(false)
                    setPreferences(null)
                    setGender('')
                    setClothingType('')
                    setOccasion('')
                    setStyle('')
                    setBudget('')
                    setCurrentStep(0)
                  }}
                  className="flex-1 apple-button-secondary"
                >
                  Update Preferences
                </button>
                <Link
                  href="/swipe"
                  className="flex-1 apple-button-primary text-center"
                >
                  Start Styling
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-bg">
      {/* Back to Home Button */}
      <div className="fixed top-6 left-6 z-20">
        <Link
          href="/"
          className="apple-button-secondary flex items-center space-x-2 text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Home</span>
        </Link>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8 pt-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12 space-y-4"
        >
          <h1 className="text-3xl font-semibold text-dark-text-primary">Style Preferences</h1>
          <p className="text-dark-text-secondary text-lg">Tell us about your style for better recommendations</p>
        </motion.div>

        {/* Success Message */}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-accent-green/10 border border-accent-green/20 rounded-2xl"
          >
            <div className="flex items-center justify-center space-x-2">
              <CheckCircle className="w-5 h-5 text-accent-green" />
              <span className="text-accent-green font-medium text-sm">Preferences saved successfully!</span>
            </div>
          </motion.div>
        )}

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-system-red/10 border border-system-red/20 rounded-2xl"
          >
            <div className="flex items-center justify-center space-x-2">
              <AlertCircle className="w-5 h-5 text-system-red" />
              <span className="text-system-red font-medium text-sm">{error}</span>
            </div>
          </motion.div>
        )}

        {/* Step-by-step preference cards */}
        {!showCompletion ? (
          <AnimatePresence mode="wait">
            {renderPreferenceCard()}
          </AnimatePresence>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-md mx-auto"
          >
            <div className="apple-card p-12">
              <div className="w-16 h-16 bg-accent-green/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-6 h-6 text-accent-green" />
              </div>
              <div className="space-y-6">
                <div className="space-y-3">
                  <h2 className="text-2xl font-semibold text-dark-text-primary">All Set!</h2>
                  <p className="text-dark-text-secondary leading-relaxed">
                    We'll help you find the perfect stylist for your style.
                  </p>
                </div>
                <Link
                  href="/swipe"
                  className="apple-button-primary inline-flex items-center space-x-2"
                >
                  <span>Start Styling</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </motion.div>
        )}

        {/* Save Button - only show on last step */}
        {!showCompletion && currentStep === PREFERENCES.length - 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center mt-8"
          >
            <button
              onClick={handleSave}
              disabled={saving}
              className="apple-button-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Preferences</span>
                </>
              )}
            </button>
          </motion.div>
        )}



        {/* Profile Completion Status */}
        {preferences?.profile_completed && (
          <div className="mt-8 p-4 bg-accent-blue/10 border border-accent-blue/20 rounded-2xl">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-accent-blue" />
              <span className="text-accent-blue font-medium text-sm">Profile completed! Your preferences help provide better recommendations.</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 