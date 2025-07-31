'use client'
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

interface CatalogImage {
  id: string
  stylist_id: string
  image_url: string
  file_name?: string
  file_size?: number
  mime_type?: string
  created_at: string
  updated_at: string
}

interface UseCatalogImagesReturn {
  images: CatalogImage[]
  loading: boolean
  error: string | null
  uploadImage: (file: File) => Promise<void>
  deleteImage: (imageId: string) => Promise<void>
  refreshImages: () => Promise<void>
}

export function useCatalogImages(): UseCatalogImagesReturn {
  const { user } = useAuth()
  const [images, setImages] = useState<CatalogImage[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchImages = useCallback(async () => {
    if (!user) return

    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('catalog_images')
        .select('*')
        .eq('stylist_id', user.id)
        .order('created_at', { ascending: true })

      if (fetchError) {
        throw fetchError
      }

      setImages(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch images')
    } finally {
      setLoading(false)
    }
  }, [user])

  const uploadImage = useCallback(async (file: File) => {
    if (!user) {
      setError('User not authenticated')
      return
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB')
      return
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('File must be an image')
      return
    }

    // Check if we've reached the 10 image limit
    if (images.length >= 10) {
      setError('Maximum 10 images allowed')
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Upload to Supabase Storage
      const fileName = `${user.id}/${Date.now()}-${file.name}`
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

      // Save to catalog_images table
      const { error: dbError } = await supabase
        .from('catalog_images')
        .insert({
          stylist_id: user.id,
          image_url: urlData.publicUrl,
          file_name: file.name,
          file_size: file.size,
          mime_type: file.type
        })

      if (dbError) {
        // If database insert fails, delete the uploaded file
        await supabase.storage
          .from('catalog-images')
          .remove([fileName])
        throw dbError
      }

      // Refresh the images list
      await fetchImages()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload image')
    } finally {
      setLoading(false)
    }
  }, [user, images.length, fetchImages])

  const deleteImage = useCallback(async (imageId: string) => {
    if (!user) {
      setError('User not authenticated')
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Get the image to find the file path
      const imageToDelete = images.find(img => img.id === imageId)
      if (!imageToDelete) {
        throw new Error('Image not found')
      }

      // Delete from database first
      const { error: dbError } = await supabase
        .from('catalog_images')
        .delete()
        .eq('id', imageId)
        .eq('stylist_id', user.id)

      if (dbError) {
        throw dbError
      }

      // Extract file path from URL and delete from storage
      const url = new URL(imageToDelete.image_url)
      const filePath = url.pathname.split('/').slice(-2).join('/') // Get user_id/filename
      
      await supabase.storage
        .from('catalog-images')
        .remove([filePath])

      // Update local state
      setImages(prev => prev.filter(img => img.id !== imageId))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete image')
    } finally {
      setLoading(false)
    }
  }, [user, images])

  const refreshImages = useCallback(async () => {
    await fetchImages()
  }, [fetchImages])

  useEffect(() => {
    fetchImages()
  }, [fetchImages])

  return {
    images,
    loading,
    error,
    uploadImage,
    deleteImage,
    refreshImages
  }
}