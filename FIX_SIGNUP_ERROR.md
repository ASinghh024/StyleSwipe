# Fix for "Database error saving new user" During Signup

This document provides a comprehensive solution to fix the "Database error saving new user" error that occurs during signup.

## 🔍 Root Cause Analysis

After investigating the issue, we've identified the following problems:

1. **Database Trigger Error**: The `handle_new_user` function in the database has a syntax error.
2. **Missing User Preferences**: The system doesn't create a record in the `user_preferences` table during signup.
3. **Possibly Missing Gender Column**: The `gender` column might be missing from the `user_preferences` table.

## 🔧 Solution

To fix this issue, you need to apply both a code fix and a database fix:

### 1. Code Fix (Already Applied)

We've updated the `AuthContext.tsx` file to manually create a `user_preferences` record during signup. This change has been applied to your codebase.

### 2. Database Fix (Required)

You need to run the SQL script we've created to fix the database triggers and functions. Follow these steps:

1. Go to your Supabase dashboard
2. Click on "SQL Editor"
3. Copy the contents of the `fix-signup-database-error.sql` file from your project
4. Paste it into the SQL Editor and run the script

## 📋 Verification

After applying both fixes, you can verify that the issue is resolved by:

1. Trying to sign up a new user through your application
2. Running the `apply-signup-fix.js` script again to test the signup process

```bash
node apply-signup-fix.js
```

## 📊 Technical Details

### What the SQL Fix Does:

1. Fixes the `handle_new_user` function to properly insert into the `user_profiles` table
2. Fixes the `handle_new_user_preferences` function to create a record in the `user_preferences` table
3. Ensures the triggers are properly set up to call these functions
4. Adds the `gender` column to the `user_preferences` table if it doesn't exist
5. Fixes the `sync_user_preferences_to_profile` function to properly sync data between tables

### What the Code Fix Does:

1. Adds a fallback mechanism in `AuthContext.tsx` to create a `user_preferences` record if the database trigger fails
2. Provides better error handling during the signup process

## 🔄 If Issues Persist

If you still encounter issues after applying these fixes, please check:

1. That the SQL script ran successfully without errors
2. That the database triggers are properly set up (you can verify this in the Supabase dashboard)
3. That the `user_profiles` and `user_preferences` tables have the correct structure
4. That the Row Level Security (RLS) policies are correctly configured

## 📚 Additional Resources

- `debug-save-error.js`: A script to debug issues with saving user data
- `check-gender-column.js`: A script to check if the gender column exists in the user_preferences table
- `USER_PROFILE_SYSTEM.md`: Documentation about the user profile system