# Stylist Profile Timeout Troubleshooting Guide

## 🚨 **Current Issue**
Stylist profile updates are timing out with the error: "Request timed out. Please try again. This might be due to database connection issues or RLS policy problems."

## 🔍 **Diagnosis Steps**

### Step 1: Check Browser Console
1. **Open Developer Tools** (F12)
2. **Go to Console tab**
3. **Try to save a stylist profile**
4. **Look for detailed logs** starting with "=== STYLIST PROFILE SAVE DEBUG ==="

### Step 2: Run Diagnostic Scripts
```bash
# Test basic database connection
node verify-sql-fix.js

# Test URL handling
node test-url-handling.js

# Test React timeout simulation
node test-react-timeout.js
```

### Step 3: Check Network Tab
1. **In Developer Tools, go to Network tab**
2. **Try to save the stylist profile**
3. **Look for failed requests or slow responses**
4. **Check if requests are being made to Supabase**

## 🛠️ **Solutions Implemented**

### ✅ **1. Extended Timeout**
- Increased timeout from 20 to 30 seconds
- Added retry logic with 2 retry attempts
- Better error handling for network issues

### ✅ **2. Retry Logic**
```javascript
// Added retry mechanism
let retryCount = 0
const maxRetries = 2

while (retryCount <= maxRetries) {
  try {
    // Database operation
    break // Success
  } catch (error) {
    if (retryCount >= maxRetries) {
      throw error // Final failure
    } else {
      retryCount++
      await new Promise(resolve => setTimeout(resolve, 2000))
    }
  }
}
```

### ✅ **3. Better Error Messages**
- Specific error codes for different issues
- Clear instructions for fixing RLS policies
- Detailed timing information in console logs

### ✅ **4. Optimized URL Handling**
- URL validation before saving
- Debounced input handling
- Filtered out invalid URLs

## 🔧 **Manual Fixes to Try**

### Fix 1: Clear Browser Cache
1. **Hard refresh** the page (Ctrl+Shift+R or Cmd+Shift+R)
2. **Clear browser cache** completely
3. **Try in incognito/private mode**

### Fix 2: Check Authentication
1. **Sign out completely**
2. **Sign back in as a stylist**
3. **Verify your user profile has `role = 'stylist'`**

### Fix 3: Check Network
1. **Test your internet connection**
2. **Try a different browser**
3. **Disable browser extensions** temporarily

### Fix 4: Database Permissions
1. **Run the SQL fix script again** in Supabase SQL Editor
2. **Check RLS policies** are properly applied
3. **Verify user permissions**

## 📊 **Expected Console Output**

### ✅ **Successful Save**
```
=== STYLIST PROFILE SAVE DEBUG ===
1. Starting to save stylist profile for user: [user-id]
2. Stylist data to save: {id, name, bio, specialties, catalog_urls}
3. Verifying authentication...
4. Authentication successful: [user-id]
5. Performing database operation...
5a. Attempt 1: Starting upsert operation...
6. Upsert time: 500ms
7. Stylist profile saved successfully
Total database operation time: 800ms
✅ Database operation time is acceptable
```

### ❌ **Failed Save**
```
=== STYLIST PROFILE SAVE DEBUG ===
1. Starting to save stylist profile for user: [user-id]
2. Stylist data to save: {id, name, bio, specialties, catalog_urls}
3. Verifying authentication...
4. Authentication successful: [user-id]
5. Performing database operation...
5a. Attempt 1: Starting upsert operation...
6. Upsert error (attempt 1): [error details]
Upsert time: 15000ms
⚠️  WARNING: Database operation is very slow
```

## 🎯 **Quick Test**

### Test 1: Minimal Data
Try saving with minimal data:
- **Name**: "Test Stylist"
- **Bio**: "Test bio"
- **Specialties**: ["Test"]
- **No URLs**

### Test 2: With URLs
Try saving with URLs:
- **Name**: "Test Stylist"
- **Bio**: "Test bio"
- **Specialties**: ["Test"]
- **URLs**: ["https://example.com/test.jpg"]

### Test 3: Large Data
Try saving with larger data:
- **Multiple specialties**
- **Multiple URLs**
- **Long bio**

## 📝 **Next Steps**

1. **Check browser console** for detailed logs
2. **Run diagnostic scripts** to identify the issue
3. **Try the fixes** listed above
4. **Report specific error messages** if the issue persists

## 🔍 **Common Issues and Solutions**

### Issue 1: "Permission denied" error
**Solution**: Run the SQL fix script in Supabase SQL Editor

### Issue 2: "Network error" or "fetch failed"
**Solution**: Check internet connection and try different browser

### Issue 3: "Authentication failed"
**Solution**: Sign out and sign back in as a stylist

### Issue 4: "Request timed out"
**Solution**: The retry logic should handle this automatically

## 📞 **If Issue Persists**

1. **Copy the console logs** and share them
2. **Note the specific timing** of each operation
3. **Try the diagnostic scripts** and share results
4. **Check if the issue occurs** with minimal data vs large data

The improved error handling and retry logic should resolve most timeout issues. If you're still experiencing problems, the detailed console logs will help identify the exact cause. 