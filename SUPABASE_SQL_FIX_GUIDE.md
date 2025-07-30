# Fixing the "Database error saving new user" Issue

## Problem Summary

We've identified that new user signups are failing with the error message "Database error saving new user". Our investigation shows that:

1. The tables (`user_profiles` and `user_preferences`) exist in the database
2. The `gender` column exists in the `user_preferences` table
3. The code fix in `AuthContext.tsx` has been applied to manually create user preferences
4. Despite running the SQL script, the database triggers are still not working correctly

## Detailed Fix Instructions

Follow these steps carefully to fix the issue:

### 1. Access Supabase SQL Editor with Admin Privileges

1. Go to your [Supabase Dashboard](https://app.supabase.io/)
2. Select your project
3. Click on "SQL Editor" in the left sidebar
4. Make sure you're logged in with an account that has admin privileges

### 2. Run the SQL Script with Proper Execution

1. Create a new SQL query by clicking "New Query"
2. Copy and paste the **entire content** of the `fix-signup-database-error.sql` file
3. **Important**: Make sure to run the entire script at once, not just parts of it
4. Click "Run" to execute the script
5. Check for any error messages in the results panel

### 3. Verify Each Component of the Fix

After running the script, verify that each component was created correctly:

#### Check Functions

Run this SQL to verify the functions exist:

```sql
SELECT routine_name, routine_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('handle_new_user', 'handle_new_user_preferences', 'sync_user_preferences_to_profile');
```

#### Check Triggers

Run this SQL to verify the triggers exist:

```sql
SELECT trigger_name, event_manipulation, action_statement
FROM information_schema.triggers
WHERE trigger_name IN ('on_auth_user_created', 'on_auth_user_created_preferences', 'on_user_preferences_updated');
```

#### Check Gender Column

Run this SQL to verify the gender column exists:

```sql
SELECT column_name 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'user_preferences' 
AND column_name = 'gender';
```

### 4. Troubleshooting Common Issues

If you're still experiencing issues after running the script, try these troubleshooting steps:

#### Issue: SQL Script Execution Errors

- Make sure you're running the script with admin privileges
- Check for any syntax errors in the SQL script
- Try running each section of the script separately to identify which part is failing

#### Issue: Triggers Not Working

- Verify that the triggers are properly associated with the `auth.users` table
- Check if there are any conflicting triggers on the same table
- Try dropping and recreating the triggers

#### Issue: Function Errors

- Check the function definitions for any syntax errors
- Verify that the functions have the correct security context (`SECURITY DEFINER`)
- Make sure the functions are referencing the correct tables and columns

### 5. Testing the Fix

After applying the fixes, test the signup process:

1. Run the `verify-signup-fix.js` script to check if the tables and columns exist
2. Try creating a new user through the application
3. Verify that both `user_profiles` and `user_preferences` records are created

## Additional Resources

- The code fix in `AuthContext.tsx` provides a fallback mechanism to create user preferences manually
- The SQL script `fix-signup-database-error.sql` contains all the necessary database fixes
- The verification script `verify-signup-fix.js` can help diagnose issues

## Need Further Assistance?

If you continue to experience issues after following these steps, consider:

1. Checking the Supabase logs for any errors related to the triggers or functions
2. Reviewing the database structure to ensure all tables and relationships are correct
3. Consulting the Supabase documentation on triggers and functions