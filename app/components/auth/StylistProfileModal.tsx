'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { X, User, Camera, Plus, Trash2, Save, Upload } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import CatalogImages from '../CatalogImages'
import { useToast } from '@/contexts/ToastContext'

interface StylistProfileModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function StylistProfileModal({ isOpen, onClose }: StylistProfileModalProps) {
  const { user, userProfile } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [activeTab, setActiveTab] = useState<'profile' | 'catalog'>('profile')
  
  // Form fields
  const [name, setName] = useState('')
  const [bio, setBio] = useState('')
  const [specialties, setSpecialties] = useState<string[]>([''])
  const [catalogUrls, setCatalogUrls] = useState<string[]>([''])
  const [newSpecialty, setNewSpecialty] = useState('')
  const [newCatalogUrl, setNewCatalogUrl] = useState('')
  const [profilePicture, setProfilePicture] = useState<string | null>(null)
  const [uploadingProfilePic, setUploadingProfilePic] = useState(false)
  const profilePicInputRef = useRef<HTMLInputElement>(null)
  const { showToast } = useToast()

  // Load existing data if stylist already exists
  useEffect(() => {
    if (isOpen && user) {
      loadExistingStylistData()
    }
  }, [isOpen, user])
  
  // Handle profile picture upload
  const handleProfilePicUpload = async (file: File) => {
    if (!user) return
    
    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      showToast('File size must be less than 5MB', 'error')
      return
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showToast('File must be an image', 'error')
      return
    }
    
    try {
      setUploadingProfilePic(true)
      setError('')
      
      // Sanitize file name to prevent 'Invalid key' error
      // Remove special characters and spaces from the file name
      const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
      
      // Upload to Supabase Storage - use the same structure as catalog images
      // Direct user.id as first folder instead of profile/user.id
      const fileName = `${user.id}/${Date.now()}-${sanitizedFileName}`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('catalog-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        throw uploadError
      }

      // Get the public URL
      const { data: urlData } = supabase.storage
        .from('catalog-images')
        .getPublicUrl(fileName)

      setProfilePicture(urlData.publicUrl)
      showToast('Profile picture uploaded successfully!', 'success')
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to upload profile picture', 'error')
    } finally {
      setUploadingProfilePic(false)
    }
  }
  
  const handleProfilePicSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleProfilePicUpload(e.target.files[0])
    }
  }

  const loadExistingStylistData = async () => {
    try {
      const { data: existingStylist, error } = await supabase
        .from('stylists')
        .select('*')
        .eq('id', user?.id)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading existing stylist:', error)
        return
      }

      if (existingStylist) {
        setName(existingStylist.name || '')
        setBio(existingStylist.bio || '')
        setSpecialties(existingStylist.specialties || [''])
        setCatalogUrls(existingStylist.catalog_urls || [''])
        setProfilePicture(existingStylist.profile_picture || null)
      } else {
        // Set default values for new stylist
        setName(userProfile?.full_name || '')
        setBio(`Professional stylist ${userProfile?.full_name || 'Stylist'} ready to help you look your best!`)
        setSpecialties(['Personal Styling', 'Fashion Consultation'])
        setCatalogUrls([])
        setProfilePicture(null)
      }
    } catch (error) {
      console.error('Error loading stylist data:', error)
    }
  }

  const addSpecialty = () => {
    if (newSpecialty.trim()) {
      setSpecialties([...specialties, newSpecialty.trim()])
      setNewSpecialty('')
    }
  }

  const removeSpecialty = (index: number) => {
    setSpecialties(specialties.filter((_, i) => i !== index))
  }

  const addCatalogUrl = () => {
    let trimmedUrl = newCatalogUrl.trim()
    if (trimmedUrl) {
      // Clean up common URL issues
      if (trimmedUrl.startsWith('@')) {
        trimmedUrl = trimmedUrl.substring(1) // Remove @ symbol
      }
      if (trimmedUrl.startsWith('http://')) {
        trimmedUrl = trimmedUrl.replace('http://', 'https://') // Convert to HTTPS
      }
      
      // Basic URL validation
      try {
        new URL(trimmedUrl) // This will throw if URL is invalid
        setCatalogUrls([...catalogUrls, trimmedUrl])
        setNewCatalogUrl('')
        setError('') // Clear any previous errors
      } catch (error) {
        setError(`Invalid URL: "${trimmedUrl}". Please enter a valid URL starting with https:// (e.g., https://example.com/image.jpg)`)
        // Clear error after 5 seconds
        setTimeout(() => setError(''), 5000)
      }
    }
  }

  const removeCatalogUrl = (index: number) => {
    setCatalogUrls(catalogUrls.filter((_, i) => i !== index))
  }

  const handleUrlChange = (index: number, value: string) => {
    const newUrls = [...catalogUrls]
    newUrls[index] = value
    setCatalogUrls(newUrls)
  }

  const handleNewUrlChange = (value: string) => {
    setNewCatalogUrl(value)
    // Clear any previous URL validation errors
    if (error && error.includes('valid URL')) {
      setError('')
    }
  }

  // Debounced URL validation to prevent excessive processing
  const validateUrl = useCallback((url: string) => {
    if (!url.trim()) return true
    
    let cleanUrl = url.trim()
    // Clean up common URL issues
    if (cleanUrl.startsWith('@')) {
      cleanUrl = cleanUrl.substring(1) // Remove @ symbol
    }
    if (cleanUrl.startsWith('http://')) {
      cleanUrl = cleanUrl.replace('http://', 'https://') // Convert to HTTPS
    }
    
    try {
      new URL(cleanUrl)
      return true
    } catch {
      return false
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!name.trim()) {
      setError('Name is required')
      setLoading(false)
      return
    }

    if (!bio.trim()) {
      setError('Bio is required')
      setLoading(false)
      return
    }

    if (specialties.length === 0 || (specialties.length === 1 && specialties[0] === '')) {
      setError('At least one specialty is required')
      setLoading(false)
      return
    }

    // Add timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      setLoading(false)
      setError('Request timed out. Please try again. This might be due to database connection issues or RLS policy problems.')
    }, 30000) // 30 second timeout

    try {
      console.log('=== STYLIST PROFILE SAVE DEBUG ===')
      console.log('1. Starting to save stylist profile for user:', user?.id)
      
      // Filter out empty specialties and validate URLs
      const filteredSpecialties = specialties.filter(s => s.trim() !== '')
      const filteredCatalogUrls = catalogUrls.filter(url => {
        const trimmedUrl = url.trim()
        if (trimmedUrl === '') return false
        
        // Clean up URL before validation
        let cleanUrl = trimmedUrl
        if (cleanUrl.startsWith('@')) {
          cleanUrl = cleanUrl.substring(1)
        }
        if (cleanUrl.startsWith('http://')) {
          cleanUrl = cleanUrl.replace('http://', 'https://')
        }
        
        return validateUrl(cleanUrl)
      }).map(url => {
        // Clean up URLs before saving
        let cleanUrl = url.trim()
        if (cleanUrl.startsWith('@')) {
          cleanUrl = cleanUrl.substring(1)
        }
        if (cleanUrl.startsWith('http://')) {
          cleanUrl = cleanUrl.replace('http://', 'https://')
        }
        return cleanUrl
      })

      const stylistData = {
        id: user?.id,
        name: name.trim(),
        bio: bio.trim(),
        specialties: filteredSpecialties,
        catalog_urls: filteredCatalogUrls,
        profile_picture: profilePicture
      }

      console.log('2. Stylist data to save:', stylistData)

      // Step 1: Verify authentication
      console.log('3. Verifying authentication...')
      const { data: { user: currentUser }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !currentUser) {
        throw new Error('Authentication failed. Please log in again.')
      }
      
      console.log('4. Authentication successful:', currentUser.id)

      // Step 2: Robust database operation with retry logic
      console.log('5. Performing database operation...')
      const dbStartTime = Date.now()
      
      let result
      let retryCount = 0
      const maxRetries = 2
      
      while (retryCount <= maxRetries) {
        try {
          console.log(`5a. Attempt ${retryCount + 1}: Starting upsert operation...`)
          const upsertStartTime = Date.now()
          
          const { error: updateError } = await supabase
            .from('stylists')
            .upsert(stylistData) // upsert will insert if not exists, update if exists

          const upsertEndTime = Date.now()
          const upsertTime = upsertEndTime - upsertStartTime
          
          if (updateError) {
            console.error(`6. Upsert error (attempt ${retryCount + 1}):`, updateError)
            console.log('Upsert time:', upsertTime + 'ms')
            
            if (updateError.code === '42501') {
              throw new Error('Permission denied. Please run the fix-stylist-profile-update.sql script in your Supabase SQL editor.')
            } else if (updateError.code === '23505') {
              throw new Error('A profile with this information already exists.')
            } else if (retryCount < maxRetries) {
              console.log(`Retrying in 1 second... (${retryCount + 1}/${maxRetries})`)
              await new Promise(resolve => setTimeout(resolve, 1000))
              retryCount++
              continue
            } else {
              throw updateError
            }
          }
          
          result = 'Profile saved successfully!'
          console.log('7. Stylist profile saved successfully')
          console.log('Upsert time:', upsertTime + 'ms')
          
          const totalDbTime = Date.now() - dbStartTime
          console.log('Total database operation time:', totalDbTime + 'ms')
          
          if (totalDbTime > 15000) {
            console.log('⚠️  WARNING: Database operation is very slow')
          } else if (totalDbTime > 8000) {
            console.log('⚠️  WARNING: Database operation is slow')
          } else {
            console.log('✅ Database operation time is acceptable')
          }
          
          break // Success, exit retry loop
          
        } catch (dbError: any) {
          const totalDbTime = Date.now() - dbStartTime
          console.error(`8. Database operation failed (attempt ${retryCount + 1}):`, dbError)
          console.log('Total database operation time:', totalDbTime + 'ms')
          
          if (retryCount >= maxRetries) {
            // Final attempt failed, throw error
            if (dbError.message.includes('Permission denied')) {
              throw dbError
            } else if (dbError.message.includes('already exists')) {
              throw dbError
            } else {
              throw new Error(`Database error after ${maxRetries + 1} attempts: ${dbError.message}`)
            }
          } else {
            retryCount++
            console.log(`Retrying in 2 seconds... (${retryCount}/${maxRetries})`)
            await new Promise(resolve => setTimeout(resolve, 2000))
          }
        }
      }

      clearTimeout(timeoutId)
      setSuccess(true)
      setTimeout(() => {
        setSuccess(false)
        onClose()
      }, 2000)

    } catch (error: any) {
      clearTimeout(timeoutId)
      console.error('=== ERROR IN STYLIST PROFILE SAVE ===')
      console.error('Error details:', error)
      console.error('Error message:', error.message)
      console.error('Error code:', error.code)
      
      // Provide specific error messages
      let errorMessage = error.message || 'Failed to save profile'
      
      if (error.message?.includes('timeout')) {
        errorMessage = 'Request timed out. Please check your internet connection and try again.'
      } else if (error.message?.includes('Permission denied')) {
        errorMessage = 'Permission denied. Please run the fix-stylist-profile-update.sql script in your Supabase SQL editor.'
      }
      
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
      <div className="apple-modal p-8 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto animate-scale-in">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-dark-text-primary">Stylist Profile</h2>
          <button
            onClick={onClose}
            className="text-dark-text-tertiary hover:text-dark-text-secondary transition-colors p-1"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-6">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'profile'
                ? 'bg-accent-blue/10 text-accent-blue'
                : 'text-dark-text-secondary hover:text-dark-text-primary'
            }`}
          >
            Profile Details
          </button>
          <button
            onClick={() => setActiveTab('catalog')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'catalog'
                ? 'bg-accent-blue/10 text-accent-blue'
                : 'text-dark-text-secondary hover:text-dark-text-primary'
            }`}
          >
            Catalog Images
          </button>
        </div>

        {success ? (
          <div className="text-center">
            <div className="w-16 h-16 bg-accent-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Save className="h-8 w-8 text-accent-green" />
            </div>
            <h3 className="text-xl font-semibold text-dark-text-primary mb-2">Profile Saved!</h3>
            <p className="text-dark-text-secondary">
              Your stylist profile has been saved and will now appear to users.
            </p>
          </div>
        ) : (
          <>
            {activeTab === 'profile' && (
              <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Picture */}
            <div>
              <label className="block text-sm font-medium text-dark-text-secondary mb-2">
                Profile Picture
              </label>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full overflow-hidden bg-dark-card flex items-center justify-center border border-dark-border">
                    {profilePicture ? (
                      <img 
                        src={profilePicture} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="h-12 w-12 text-dark-text-tertiary" />
                    )}
                  </div>
                  <input
                    ref={profilePicInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePicSelect}
                    className="hidden"
                  />
                </div>
                <div>
                  <button
                    type="button"
                    onClick={() => profilePicInputRef.current?.click()}
                    disabled={uploadingProfilePic}
                    className="apple-button-secondary inline-flex items-center text-sm disabled:opacity-50 disabled:cursor-not-allowed mb-2"
                  >
                    <Upload className="h-3 w-3 mr-1" />
                    {profilePicture ? 'Change Picture' : 'Upload Picture'}
                  </button>
                  {uploadingProfilePic && (
                    <div className="text-xs text-accent-blue">Uploading...</div>
                  )}
                  <div className="text-xs text-dark-text-tertiary">
                    Maximum 5MB • JPG, PNG, GIF supported
                  </div>
                </div>
              </div>
            </div>
            
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-dark-text-secondary mb-2">
                Professional Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="apple-input w-full"
                placeholder="Enter your professional name"
                required
              />
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-dark-text-secondary mb-2">
                Professional Bio *
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
                className="apple-input w-full"
                placeholder="Tell users about your styling expertise, experience, and approach..."
                required
              />
            </div>

            {/* Specialties */}
            <div>
              <label className="block text-sm font-medium text-dark-text-secondary mb-2">
                Specialties *
              </label>
              <div className="space-y-2">
                {specialties.map((specialty, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={specialty}
                      onChange={(e) => {
                        const newSpecialties = [...specialties]
                        newSpecialties[index] = e.target.value
                        setSpecialties(newSpecialties)
                      }}
                      className="flex-1 apple-input py-2"
                      placeholder="e.g., Personal Styling"
                    />
                    <button
                      type="button"
                      onClick={() => removeSpecialty(index)}
                      className="p-2 text-system-red hover:text-system-red/80 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={newSpecialty}
                    onChange={(e) => setNewSpecialty(e.target.value)}
                    className="flex-1 apple-input py-2"
                    placeholder="Add a new specialty"
                  />
                  <button
                    type="button"
                    onClick={addSpecialty}
                    className="p-2 bg-accent-blue text-white rounded-lg hover:bg-accent-blue-muted transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Portfolio Images */}
            <div>
              <label className="block text-sm font-medium text-dark-text-secondary mb-2">
                Portfolio Images
              </label>
              <div className="space-y-2">
                {catalogUrls.map((url, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="url"
                      value={url}
                      onChange={(e) => handleUrlChange(index, e.target.value)}
                      className="flex-1 apple-input py-2"
                      placeholder="https://example.com/image.jpg"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          // Validate and update the URL
                          try {
                            new URL(url)
                          } catch (error) {
                            setError('Please enter a valid URL')
                            setTimeout(() => setError(''), 3000)
                          }
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => removeCatalogUrl(index)}
                      className="p-2 text-system-red hover:text-system-red/80 transition-colors"
                      title="Remove URL"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                <div className="flex items-center space-x-2">
                  <input
                    type="url"
                    value={newCatalogUrl}
                    onChange={(e) => handleNewUrlChange(e.target.value)}
                    className="flex-1 apple-input py-2"
                    placeholder="Add portfolio image URL"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addCatalogUrl()
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={addCatalogUrl}
                    className="p-2 bg-accent-blue text-white rounded-lg hover:bg-accent-blue-muted transition-colors"
                    title="Add URL"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <p className="text-xs text-dark-text-tertiary mt-1">
                Add URLs to your portfolio images. These will be displayed to potential clients.
              </p>
            </div>

            {error && (
              <div className="text-system-red text-sm bg-system-red/10 p-3 rounded-xl border border-system-red/20">
                {error}
              </div>
            )}

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={onClose}
                className="apple-button-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="apple-button-primary disabled:opacity-50 flex items-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>Save Profile</span>
                  </>
                )}
              </button>
            </div>
          </form>
            )}

            {activeTab === 'catalog' && (
              <div className="space-y-6">
                <CatalogImages />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}