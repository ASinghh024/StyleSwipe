# Stylist Profile Update Fix

## Problem
Stylists are experiencing a "Request timed out. Please try again." error when trying to update their profile details (bio, specialties, portfolio images) in the StylistProfileModal.

## Root Cause
The timeout issue is typically caused by:
1. **RLS (Row Level Security) Policy Issues**: The stylists table may not have proper RLS policies configured
2. **Database Connection Issues**: Network or authentication problems
3. **Missing Permissions**: Users don't have the right permissions to update stylist profiles

## Solution

### Step 1: Apply Database Fixes

1. **Open your Supabase Dashboard**
   - Go to your Supabase project dashboard
   - Navigate to the SQL Editor

2. **Run the Fix Script**
   - Copy and paste the contents of `fix-stylist-profile-update.sql` into the SQL Editor
   - Execute the script

   This script will:
   - Ensure the stylists table exists with correct structure
   - Enable RLS on the stylists table
   - Create proper RLS policies for stylist profile management
   - Add necessary indexes for performance
   - Grant proper permissions

### Step 2: Test the Fix

1. **Run the Test Script**
   ```bash
   node test-stylist-profile-fix.js
   ```

2. **Check the Results**
   - If the test passes, the fix is working
   - If it fails, follow the error messages to resolve any remaining issues

### Step 3: Test in Your App

1. **Log in as a Stylist**
   - Sign up or sign in with a stylist account
   - Make sure your user profile has `role = 'stylist'`

2. **Try Updating Profile**
   - Open the stylist profile modal
   - Update bio, specialties, and portfolio images
   - Save the profile

3. **Check Browser Console**
   - Open browser developer tools
   - Look for detailed debug logs in the console
   - The logs will show exactly what's happening during the save process

## What the Fix Does

### Database Structure
- Ensures the `stylists` table has the correct structure
- Adds proper indexes for performance
- Creates triggers for automatic timestamp updates

### RLS Policies
- **Public Read Access**: Everyone can view stylist profiles
- **Stylist Insert**: Stylists can create their own profile
- **Stylist Update**: Stylists can update their own profile
- **Stylist Delete**: Stylists can delete their own profile

### Error Handling
The updated `StylistProfileModal.tsx` now includes:
- Better timeout handling (15 seconds instead of 10)
- More detailed error messages
- Specific error codes for different issues
- Authentication verification before database operations

## Troubleshooting

### If You Still Get Timeouts

1. **Check Network Connection**
   - Ensure you have a stable internet connection
   - Try refreshing the page

2. **Verify Authentication**
   - Make sure you're logged in as a stylist
   - Check that your user profile has `role = 'stylist'`

3. **Check Database Permissions**
   - Run the test script to verify database access
   - Look for RLS policy errors in the console

4. **Review Console Logs**
   - Open browser developer tools
   - Look for detailed error messages
   - The logs will show exactly where the process is failing

### Common Error Codes

- **42501**: Permission denied - RLS policy issue
- **23505**: Unique constraint violation
- **PGRST116**: No rows returned
- **Timeout**: Network or database connection issue

## Verification

After applying the fix, you should be able to:

1. ✅ Create a stylist profile
2. ✅ Update stylist bio and specialties
3. ✅ Add portfolio images
4. ✅ Save changes without timeouts
5. ✅ See the changes reflected in the database

## Files Modified

- `fix-stylist-profile-update.sql`: Database fixes
- `app/components/auth/StylistProfileModal.tsx`: Improved error handling
- `test-stylist-profile-fix.js`: Test script to verify the fix

## Next Steps

1. Apply the database fixes using the SQL script
2. Test the functionality with the test script
3. Try updating a stylist profile in your app
4. Monitor the browser console for any remaining issues

If you continue to experience issues, check the browser console logs for specific error messages and refer to the troubleshooting section above. 