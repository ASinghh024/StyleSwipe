# Catalog Images Feature Setup

This document provides a complete guide for setting up the catalog images feature for stylists.

## 🎯 Overview

The catalog images feature allows stylists to:
- Upload up to 10 catalog images (max 5MB each)
- View their uploaded images in a responsive gallery
- Delete images from their catalog
- Images are stored in Supabase Storage and metadata in the database

## 📋 Setup Steps

### 1. Database Setup

Run the SQL script in your Supabase SQL Editor:

```sql
-- Run catalog-images-setup.sql in Supabase SQL Editor
```

This creates:
- `catalog_images` table with proper structure
- RLS policies for security
- Indexes for performance
- Triggers for `updated_at` timestamps

### 2. Storage Bucket Setup

In your Supabase Dashboard:

1. Go to **Storage**
2. Click **Create a new bucket**
3. Name it `catalog-images`
4. Set it to **Public**
5. Add the following policies:

#### Storage Policies

**SELECT Policy (Public Read):**
- Name: "Public read access"
- Policy: `(bucket_id = 'catalog-images')`

**INSERT Policy (Authenticated Upload):**
- Name: "Authenticated users can upload"
- Policy: `(bucket_id = 'catalog-images' AND auth.role() = 'authenticated')`

**UPDATE Policy (Own Files):**
- Name: "Users can update own files"
- Policy: `(bucket_id = 'catalog-images' AND auth.uid()::text = (storage.foldername(name))[1])`

**DELETE Policy (Own Files):**
- Name: "Users can delete own files"
- Policy: `(bucket_id = 'catalog-images' AND auth.uid()::text = (storage.foldername(name))[1])`

### 3. Test the Setup

Run the test script to verify everything is working:

```bash
node test-catalog-images.js
```

## 🏗️ Architecture

### Database Schema

```sql
catalog_images (
  id UUID PRIMARY KEY,
  stylist_id UUID REFERENCES auth.users(id),
  image_url TEXT NOT NULL,
  file_name TEXT,
  file_size INTEGER,
  mime_type TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

### File Structure

```
├── hooks/
│   └── useCatalogImages.ts          # Custom hook for catalog images
├── contexts/
│   └── ToastContext.tsx             # Toast notifications
├── app/components/
│   ├── CatalogImages.tsx            # Main catalog images component
│   └── Toast.tsx                    # Toast component
└── app/components/auth/
    └── StylistProfileModal.tsx      # Updated with catalog tab
```

## 🎨 Features

### Upload Functionality
- Drag & drop support
- File validation (5MB limit, image types only)
- Progress indicators
- Error handling with toast notifications

### Gallery Features
- Responsive grid layout
- Image thumbnails with hover effects
- Delete confirmation
- File info display (name, size)

### Security
- RLS policies ensure users can only access their own images
- File path validation prevents unauthorized access
- Authentication required for all operations

## 🚀 Usage

### In StylistProfileModal

The catalog images feature is integrated as a tab in the stylist profile modal:

```tsx
// The modal now has two tabs:
// 1. Profile Details (existing form)
// 2. Catalog Images (new upload gallery)
```

### Standalone Component

You can also use the CatalogImages component independently:

```tsx
import CatalogImages from '@/components/CatalogImages'

function MyPage() {
  return (
    <div>
      <h1>My Catalog</h1>
      <CatalogImages />
    </div>
  )
}
```

## 🔧 Customization

### Styling
The components use Tailwind CSS classes and can be customized by:
- Modifying the className props
- Updating the color scheme (currently purple theme)
- Adjusting the responsive breakpoints

### Configuration
Key configuration options in `useCatalogImages.ts`:
- `MAX_IMAGES = 10` - Maximum images per stylist
- `MAX_FILE_SIZE = 5 * 1024 * 1024` - Maximum file size (5MB)
- `ALLOWED_TYPES = ['image/']` - Allowed file types

## 🐛 Troubleshooting

### Common Issues

1. **"Table doesn't exist" error**
   - Run the `catalog-images-setup.sql` script

2. **"Permission denied" error**
   - Check that RLS policies are properly set
   - Verify user is authenticated

3. **Upload fails**
   - Check storage bucket exists and is public
   - Verify storage policies are set correctly
   - Check file size and type restrictions

4. **Images not displaying**
   - Check that storage bucket is public
   - Verify image URLs are accessible

### Debug Commands

```bash
# Test database setup
node test-catalog-images.js

# Check storage bucket
# Go to Supabase Dashboard > Storage > catalog-images
```

## 📱 Responsive Design

The gallery is fully responsive:
- **Mobile**: 2 columns
- **Tablet**: 3 columns  
- **Desktop**: 4 columns
- **Large screens**: 4+ columns

## 🔒 Security Considerations

- All operations require authentication
- Users can only access their own images
- File uploads are validated for type and size
- Storage paths include user ID for isolation
- RLS policies prevent unauthorized access

## 🚀 Performance

- Images are lazy loaded
- Thumbnails are optimized
- Database queries are indexed
- Storage operations are batched where possible

## 📝 Future Enhancements

Potential improvements:
- Image compression/optimization
- Bulk upload functionality
- Image editing capabilities
- CDN integration
- Advanced filtering and search 