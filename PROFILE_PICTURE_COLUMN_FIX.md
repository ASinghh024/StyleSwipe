# Profile Picture Column Fix

## Issue

The application is encountering the following error when trying to save a profile picture:

```
Database error after 3 attempts: Could not find the 'profile_picture' column of 'stylists' in the schema cache.
```

This error occurs because the `profile_picture` column is missing from the `stylists` table in your Supabase database.

## Solution

You need to run the SQL script to add the `profile_picture` column to the `stylists` table. Since the automated script couldn't run due to missing RPC function, you'll need to run the SQL directly in your Supabase dashboard.

### Steps to Fix:

1. **Log in to your Supabase Dashboard**
   - Go to [https://app.supabase.io/](https://app.supabase.io/)
   - Select your project

2. **Open the SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Create a new query

3. **Run the following SQL commands:**

```sql
-- Add profile_picture column to stylists table
ALTER TABLE stylists ADD COLUMN IF NOT EXISTS profile_picture TEXT DEFAULT NULL;

-- Create index for better performance when querying by profile_picture
CREATE INDEX IF NOT EXISTS idx_stylists_profile_picture ON stylists(profile_picture) WHERE profile_picture IS NOT NULL;

-- Verify the column was added
SELECT 
  'profile_picture column exists' as check_item,
  EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'stylists' AND column_name = 'profile_picture'
  ) as result;
```

4. **Click "Run" to execute the SQL commands**

5. **Verify the Result**
   - You should see a result showing `profile_picture column exists` with a value of `true`

6. **Restart Your Application**
   - After adding the column, restart your application to refresh the schema cache:
   ```bash
   npm run dev
   ```

## Testing the Fix

After applying the fix, you should test that the profile picture upload works correctly:

1. Open your application
2. Navigate to the stylist profile modal
3. Upload a profile picture
4. Save the profile
5. Verify that the profile picture is saved without errors

## Explanation

The error occurred because the application was trying to save data to a column that doesn't exist in the database. The SQL commands above will:

1. Add the missing `profile_picture` column to the `stylists` table
2. Create an index for better performance when querying by this column
3. Verify that the column was successfully added

Once these steps are completed, the application should be able to save profile pictures without encountering the schema cache error.

## Why This Happened

This issue likely occurred because:

1. The `add-profile-picture-field.sql` script was not executed in your Supabase database
2. Or the script execution failed partially
3. The database schema cache in the application was out of sync with the actual database schema

## Prevention

To prevent similar issues in the future:

1. Always run database migration scripts when setting up a new environment
2. Verify that all required database columns exist before deploying updates
3. Consider implementing a database migration system to track and apply schema changes