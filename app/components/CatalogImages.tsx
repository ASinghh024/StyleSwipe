'use client'
import { useState, useRef } from 'react'
import { Camera, Upload, Trash2, X, Plus } from 'lucide-react'
import { useCatalogImages } from '../../hooks/useCatalogImages'
import { useToast } from '../../contexts/ToastContext'

interface CatalogImagesProps {
  className?: string
}

export default function CatalogImages({ className = '' }: CatalogImagesProps) {
  const { images, loading, error, uploadImage, deleteImage } = useCatalogImages()
  const { showToast } = useToast()
  const [dragActive, setDragActive] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await handleFileUpload(e.dataTransfer.files[0])
    }
  }

  const handleFileUpload = async (file: File) => {
    try {
      setUploadProgress(0)
      await uploadImage(file)
      setUploadProgress(null)
      showToast('Image uploaded successfully!', 'success')
    } catch (error) {
      setUploadProgress(null)
      showToast(error instanceof Error ? error.message : 'Failed to upload image', 'error')
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0])
    }
  }

  const handleDelete = async (imageId: string) => {
    if (confirm('Are you sure you want to delete this image?')) {
      try {
        await deleteImage(imageId)
        showToast('Image deleted successfully!', 'success')
      } catch (error) {
        showToast(error instanceof Error ? error.message : 'Failed to delete image', 'error')
      }
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-dark-text-primary">Catalog Images</h3>
        <div className="text-sm text-dark-text-tertiary">
          {images.length}/10 images
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-system-red/10 border border-system-red/20 rounded-xl p-4">
          <div className="flex items-center">
            <X className="h-5 w-5 text-system-red mr-2" />
            <p className="text-system-red">{error}</p>
          </div>
        </div>
      )}

      {/* Upload Area */}
      {images.length < 10 && (
        <div
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
            dragActive
              ? 'border-accent-blue bg-accent-blue/5'
              : 'border-dark-border hover:border-accent-blue/30'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          
          <div className="space-y-4">
            <div className="mx-auto w-12 h-12 bg-accent-blue/10 rounded-full flex items-center justify-center">
              <Camera className="h-6 w-6 text-accent-blue" />
            </div>
            
            <div>
              <p className="text-lg font-medium text-dark-text-primary">
                Upload your catalog images
              </p>
              <p className="text-sm text-dark-text-tertiary mt-1">
                Drag and drop images here, or click to browse
              </p>
            </div>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
              className="apple-button-primary inline-flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Upload className="h-4 w-4 mr-2" />
              Choose Files
            </button>

            <div className="text-xs text-dark-text-tertiary">
              Maximum 5MB per image • JPG, PNG, GIF supported
            </div>
          </div>
        </div>
      )}

      {/* Upload Progress */}
      {uploadProgress !== null && (
        <div className="bg-accent-blue/5 border border-accent-blue/20 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-accent-blue">Uploading...</span>
            <span className="text-sm text-accent-blue-muted">{uploadProgress}%</span>
          </div>
          <div className="w-full bg-accent-blue/20 rounded-full h-2">
            <div
              className="bg-accent-blue h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Images Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image) => (
            <div
              key={image.id}
              className="group relative aspect-square bg-dark-card rounded-xl overflow-hidden apple-card"
            >
              <img
                src={image.image_url}
                alt={image.file_name || 'Catalog image'}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              
              {/* Overlay with delete button */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                <button
                  onClick={() => handleDelete(image.id)}
                  disabled={loading}
                  className="opacity-0 group-hover:opacity-100 bg-system-red text-white p-2 rounded-full hover:bg-system-red/80 transition-all duration-200 disabled:opacity-50"
                  title="Delete image"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              {/* File info */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                <p className="text-white text-xs truncate">
                  {image.file_name}
                </p>
                {image.file_size && (
                  <p className="text-white/70 text-xs">
                    {(image.file_size / 1024 / 1024).toFixed(1)}MB
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {images.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="mx-auto w-16 h-16 bg-dark-card rounded-full flex items-center justify-center mb-4">
            <Camera className="h-8 w-8 text-dark-text-tertiary" />
          </div>
          <h3 className="text-lg font-medium text-dark-text-primary mb-2">
            No catalog images yet
          </h3>
          <p className="text-dark-text-secondary">
            Upload images to showcase your work to potential clients
          </p>
        </div>
      )}

      {/* Loading State */}
      {loading && images.length === 0 && (
        <div className="text-center py-12">
          <div className="mx-auto w-16 h-16 bg-dark-card rounded-full flex items-center justify-center mb-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-blue"></div>
          </div>
          <p className="text-dark-text-secondary">Loading images...</p>
        </div>
      )}
    </div>
  )
}