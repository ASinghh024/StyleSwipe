# Profile Picture Upload Fix

## Issue

Users were encountering an "Invalid key" error when attempting to upload profile pictures. The specific error message was:

```
Invalid key: 99333eb6-5e87-4955-9069-e108ca40df75/1753965555401-Manish-Malhotra-New-Trending-Collection-–-Redefining-Couture-by-Ajmera-Fashion-Limited-1-thumbs-600X825.jpg
```

## Root Cause

The issue was caused by two main factors:

1. **Invalid Characters in File Names**: Supabase Storage has restrictions on valid characters in file paths. The error occurred because the file name contained special characters, spaces, or other characters that are not allowed in Supabase Storage keys.

2. **Missing RLS Policy for Profile Folder**: The storage bucket RLS (Row Level Security) policies were not properly configured to allow uploads to the `profile/{user_id}/` folder structure.

## Solution

The fix includes two parts:

### 1. Code Changes

In `StylistProfileModal.tsx`, we added file name sanitization to remove special characters and spaces from the file name before uploading, and changed the file path structure to match the working structure used in catalog images:

```typescript
// Sanitize file name to prevent 'Invalid key' error
// Remove special characters and spaces from the file name
const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')

// Upload to Supabase Storage - use the same structure as catalog images
// Direct user.id as first folder instead of profile/user.id
const fileName = `${user.id}/${Date.now()}-${sanitizedFileName}`
```

This ensures that only alphanumeric characters, periods, and hyphens are used in the file name, which are allowed by Supabase Storage.

### 2. Storage RLS Policy Changes

The SQL script `fix-profile-picture-upload-rls.sql` includes instructions for updating the storage bucket policies to allow uploads to the user's folder directly.

The key changes to the storage policies are:

```sql
-- For INSERT policy:
(bucket_id = 'catalog-images' AND auth.role() = 'authenticated' AND 
 (storage.foldername(name))[1] = auth.uid()::text)
```

This policy allows uploads when:
- The bucket is 'catalog-images' AND
- The user is authenticated AND
- The first folder matches the user's ID

Similar simplified policies are applied for the UPDATE and DELETE operations.

## Implementation Steps

1. Code changes have been applied to:
   - `StylistProfileModal.tsx`: Added file name sanitization and changed the file path structure to match catalog images
   - `hooks/useCatalogImages.ts`: Added file name sanitization to prevent similar issues
2. The SQL script `fix-profile-picture-upload-rls.sql` needs to be run in the Supabase SQL Editor.
3. The storage policies need to be manually updated in the Supabase Dashboard as described in the SQL script, using the simplified policy that only checks if the first folder matches the user's ID.

## Testing

After implementing these changes, test the profile picture upload functionality to ensure that:

1. Files with special characters in their names can be uploaded successfully.
2. The uploaded files are stored in the correct location in the storage bucket (directly in the user's folder, e.g., `{user_id}/{timestamp}-{sanitized_filename}`).
3. The profile picture URL is correctly saved in the `profile_picture` column of the `stylists` table.
4. The same file path structure works consistently across both profile pictures and catalog images.