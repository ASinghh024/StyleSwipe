# Resolving the "Database error saving new user" Issue

## Problem Summary

Users are unable to sign up for accounts due to a database error. The error message "Database error saving new user" appears during the signup process. Our investigation has identified several issues:

1. The database trigger `handle_new_user` that should automatically create a user profile when a new user signs up is not functioning correctly
2. There is no automatic creation of a record in the `user_preferences` table
3. The `gender` column might be missing from the `user_preferences` table

## Applied Fixes

### 1. Code Fix (Already Applied)

We've already updated `AuthContext.tsx` to include a fallback mechanism that manually creates both a user profile and user preferences record if the database triggers fail. This change has been applied but is not sufficient on its own.

### 2. Database Fix (Needs to be Applied)

We've created two SQL scripts to fix the database issues:

- `fix-signup-database-error.sql`: The comprehensive fix that addresses all issues
- `simplified-signup-fix.sql`: A simplified version with better error handling and verification

## Step-by-Step Resolution

### 1. Apply the Database Fix

1. Log in to your [Supabase Dashboard](https://app.supabase.io/)
2. Select your project
3. Click on "SQL Editor" in the left sidebar
4. Create a new query
5. Copy and paste the **entire content** of the `simplified-signup-fix.sql` file
6. Click "Run" to execute the script
7. Check the output for any error messages

### 2. Verify the Fix

After applying the database fix, you can verify that it worked by:

1. Running the `verify-signup-fix.js` script:
   ```
   node verify-signup-fix.js
   ```

2. Trying to create a new user through the application

## Troubleshooting

If you're still experiencing issues after following these steps:

1. Check the Supabase SQL Editor output for any error messages
2. Make sure you're running the SQL script with admin privileges
3. Try running the script again, ensuring all statements execute successfully
4. Check the Supabase logs for any errors related to the trigger execution

For more detailed troubleshooting steps, refer to the `SUPABASE_SQL_FIX_GUIDE.md` file.

## Technical Details

### Root Cause Analysis

The signup error is caused by a combination of issues:

1. **Missing INSERT Statement**: The `handle_new_user` function in the database was missing the proper INSERT statement to create a user profile
2. **Missing User Preferences Creation**: There was no automatic creation of a record in the `user_preferences` table
3. **Possibly Missing Gender Column**: The `gender` column might be missing from the `user_preferences` table

### Fix Details

Our solution addresses these issues by:

1. Recreating the `handle_new_user` function with the correct INSERT statement
2. Creating a new `handle_new_user_preferences` function to automatically create user preferences
3. Setting up triggers to call these functions when a new user is created
4. Adding the `gender` column to the `user_preferences` table if it doesn't exist
5. Creating a function and trigger to sync preferences to the user profile

## Additional Resources

- `SUPABASE_SQL_FIX_GUIDE.md`: Detailed guide for fixing Supabase SQL issues
- `verify-signup-fix.js`: Script to verify that the tables and columns exist
- `simplified-signup-fix.sql`: Simplified SQL script with better error handling
- `fix-signup-database-error.sql`: Comprehensive SQL fix for all issues