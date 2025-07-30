# Catalog Images Display Setup

This guide will help you set up the catalog images display system so that when stylists upload catalog images, they appear on their stylist cards.

## 🎯 Overview

The catalog images system now works as follows:
1. Stylists upload catalog images through the CatalogImages component
2. Images are stored in the `catalog_images` table with public read access
3. Stylist cards (swipe page and matches page) display these images
4. The system falls back to the old `catalog_urls` field if no catalog images are available

## 📋 Setup Steps

### Step 1: Update Database Policies

Run the following SQL in your Supabase SQL Editor:

```sql
-- Fix Catalog Images Public Access
-- Run this in your Supabase SQL Editor

-- Step 1: Drop the existing restrictive SELECT policy
DROP POLICY IF EXISTS "Users can view own catalog images" ON catalog_images;

-- Step 2: Create a new public SELECT policy that allows everyone to view catalog images
CREATE POLICY "Public can view catalog images" ON catalog_images
  FOR SELECT USING (true);

-- Step 3: Drop the existing restrictive INSERT policy
DROP POLICY IF EXISTS "Users can insert own catalog images" ON catalog_images;

-- Step 4: Create a new public INSERT policy for testing (you can make this more restrictive later)
CREATE POLICY "Public can insert catalog images" ON catalog_images
  FOR INSERT WITH CHECK (true);

-- Step 5: Keep the existing restrictive policies for UPDATE, DELETE
-- (These should already exist from the catalog-images-setup.sql)

-- Step 6: Verify the policies
-- You can check the policies in Supabase Dashboard > Authentication > Policies > catalog_images

-- Step 7: Test the public access
-- This will allow users to view and insert catalog images without authentication
-- while still maintaining security for update/delete operations
```

### Step 2: Verify the Setup

Run the test script to verify everything is working:

```bash
node test-catalog-images-display.js
```

### Step 3: Test Upload Functionality

Run the upload test to verify catalog images can be created:

```bash
node test-catalog-upload.js
```

## 🏗️ Architecture

### Database Schema

**catalog_images table:**
```sql
- id (UUID, Primary Key)
- stylist_id (UUID, Foreign Key to auth.users)
- image_url (TEXT, Public URL to the image)
- file_name (TEXT, Original filename)
- file_size (INTEGER, File size in bytes)
- mime_type (TEXT, File MIME type)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

**stylists table:**
```sql
- id (UUID, Primary Key)
- name (TEXT)
- bio (TEXT)
- specialties (TEXT[])
- catalog_urls (TEXT[]) - Legacy field, still used as fallback
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### File Structure

```
├── app/swipe/page.tsx                    # Updated to use catalog_images
├── app/matches/page.tsx                  # Updated to use catalog_images
├── app/components/CatalogImages.tsx      # Upload component
├── app/components/auth/StylistProfileModal.tsx # Profile modal with catalog tab
├── hooks/useCatalogImages.ts             # Custom hook for catalog images
├── lib/stylist-utils.ts                  # Utility functions
└── test-catalog-images-display.js        # Test script
```

## 🎨 Features

### Image Display Priority
The stylist cards now display images in this order:
1. **catalog_images** (new system) - First image from uploaded catalog
2. **catalog_urls** (legacy system) - First URL from the legacy field
3. **Default placeholder** - If no images are available

### Updated Components

#### Swipe Page (`/swipe`)
- Fetches stylists with their catalog images
- Displays the first catalog image on each stylist card
- Falls back to legacy catalog_urls if no catalog images exist

#### Matches Page (`/matches`)
- Fetches matches with stylist catalog images
- Displays catalog images in match cards
- Falls back to legacy catalog_urls if no catalog images exist

#### StylistProfileModal
- Has a "Catalog Images" tab for uploading
- Uses the CatalogImages component for upload functionality

## 🚀 Usage

### For Stylists
1. Go to your profile (StylistProfileModal)
2. Click on the "Catalog Images" tab
3. Upload up to 10 catalog images (max 5MB each)
4. Images will automatically appear on your stylist card

### For Users
1. Browse stylists on the swipe page
2. See stylist catalog images displayed on cards
3. View matches with stylist images on the matches page

## 🔧 Testing

### Test Commands

```bash
# Test the display system
node test-catalog-images-display.js

# Test the upload system
node test-catalog-upload.js

# Test the full catalog images setup
node test-catalog-images.js
```

### Manual Testing

1. **Upload Test:**
   - Log in as a stylist
   - Go to profile modal
   - Upload a catalog image
   - Verify it appears in the catalog tab

2. **Display Test:**
   - Log in as a user
   - Go to swipe page
   - Verify stylist cards show catalog images
   - Check matches page for stylist images

## 🔒 Security

### Public Access
- **SELECT**: Public read access to catalog images
- **INSERT**: Public insert access (for testing, can be restricted later)
- **UPDATE/DELETE**: Restricted to authenticated users

### Storage Security
- Images are stored in Supabase Storage bucket
- Public read access for display
- Authenticated upload/delete operations

## 🐛 Troubleshooting

### Common Issues

1. **"Images not displaying"**
   - Check that catalog_images table exists
   - Verify RLS policies are set correctly
   - Run `node test-catalog-images-display.js`

2. **"Upload fails"**
   - Check storage bucket permissions
   - Verify file size limits (5MB)
   - Check file type restrictions

3. **"Permission denied"**
   - Run the SQL script to update policies
   - Check Supabase Dashboard > Authentication > Policies

### Debug Commands

```bash
# Check database connection
node test-connection.js

# Check catalog images setup
node test-catalog-images.js

# Check display functionality
node test-catalog-images-display.js
```

## 📱 Responsive Design

The catalog images are displayed responsively:
- **Mobile**: Full-width images on cards
- **Tablet**: Optimized image sizing
- **Desktop**: High-quality image display

## 🚀 Performance

- Images are lazy loaded for better performance
- Database queries are optimized with proper indexing
- Storage URLs are cached for faster loading

## 📝 Future Enhancements

Potential improvements:
- Image compression/optimization
- Multiple image carousel on stylist cards
- Image categories (portfolio, before/after, etc.)
- Advanced filtering by image content
- CDN integration for faster loading

## ✅ Verification Checklist

- [ ] SQL policies updated in Supabase
- [ ] Catalog images table exists and accessible
- [ ] Storage bucket configured correctly
- [ ] Swipe page displays catalog images
- [ ] Matches page displays catalog images
- [ ] Upload functionality works
- [ ] Fallback to legacy catalog_urls works
- [ ] Test scripts pass successfully

## 🎉 Success!

Once you've completed these steps, stylists will be able to upload catalog images that will automatically appear on their stylist cards when users browse the app. The system provides a seamless experience with proper fallbacks and responsive design. 