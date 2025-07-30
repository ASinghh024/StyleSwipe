# User Profile System

This document describes the user profile system that allows normal users to input their style preferences and clothing information.

## Overview

The user profile system consists of:
1. A new `user_preferences` table for detailed user preferences
2. Updated `user_profiles` table with additional columns
3. Automatic triggers to sync data between tables
4. A comprehensive profile page UI

## Database Setup

### 1. Run the SQL Setup Script

Execute the `user-profile-setup.sql` script in your Supabase SQL editor. This will:

- Add new columns to the `user_profiles` table
- Create a new `user_preferences` table
- Set up Row Level Security (RLS) policies
- Create triggers for automatic data synchronization

### 2. Database Schema

#### user_preferences Table
```sql
- id (UUID, Primary Key)
- user_id (UUID, Foreign Key to auth.users)
- clothing_preferences (TEXT[]) - Types of clothing preferred
- preferred_occasions (TEXT[]) - Occasions they dress for
- style_preferences (TEXT) - Overall style preference
- budget_range (TEXT) - Budget range preference
- size_preferences (TEXT) - Size preference
- color_preferences (TEXT[]) - Color preferences
- fit_preferences (TEXT[]) - Fit style preferences
- fabric_preferences (TEXT[]) - Fabric preferences
- brand_preferences (TEXT[]) - Brand preferences
- seasonal_preferences (TEXT[]) - Seasonal preferences
- profile_completed (BOOLEAN) - Whether profile is complete
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

#### Updated user_profiles Table
The existing `user_profiles` table now includes these additional columns:
```sql
- clothing_preferences (TEXT[])
- preferred_occasions (TEXT[])
- style_preferences (TEXT)
- budget_range (TEXT)
- size_preferences (TEXT)
- color_preferences (TEXT[])
```

## Features

### 1. Profile Page (`/profile`)
- **Comprehensive Form**: Collects all user preferences
- **Multi-select Options**: For clothing types, occasions, colors, etc.
- **Single-select Options**: For style, budget, size
- **Real-time Validation**: Ensures data is properly formatted
- **Auto-save**: Preferences are saved automatically
- **Responsive Design**: Works on all device sizes

### 2. Navigation Integration
- **Profile Link**: Added to navbar for normal users
- **Green Button**: Distinct styling to differentiate from other nav items
- **Authentication Required**: Only accessible to logged-in users

### 3. Data Synchronization
- **Automatic Triggers**: When user_preferences are updated, user_profiles is automatically updated
- **Bidirectional Sync**: Changes in either table are reflected in the other
- **Real-time Updates**: Changes are immediately visible

## User Interface

### Profile Form Sections

1. **Clothing Preferences**
   - Casual, Formal, Business, Athletic, Evening, Streetwear, Vintage, Bohemian

2. **Preferred Occasions**
   - Work, Date, Party, Wedding, Casual, Travel, Interview, Gym, Dinner, Shopping

3. **Style Preferences**
   - Minimalist, Bohemian, Classic, Trendy, Vintage, Streetwear, Preppy, Gothic, Romantic, Edgy

4. **Budget Range**
   - Budget-friendly, Mid-range, Luxury, High-end

5. **Size Preferences**
   - XS, S, M, L, XL, XXL, Plus Size

6. **Color Preferences**
   - Black, White, Blue, Red, Green, Yellow, Pink, Purple, Orange, Brown, Gray, Navy, Beige

7. **Fit Preferences**
   - Loose, Fitted, Oversized, Tailored, Relaxed, Slim

8. **Fabric Preferences**
   - Cotton, Silk, Wool, Denim, Synthetic, Linen, Cashmere, Polyester, Rayon

9. **Seasonal Preferences**
   - Spring, Summer, Fall, Winter, All-season

### UI Features

- **Modern Design**: Purple and pink gradient theme
- **Interactive Buttons**: Toggle selection with visual feedback
- **Loading States**: Shows progress during save operations
- **Success/Error Messages**: Clear feedback for user actions
- **Back to Home**: Consistent navigation
- **Mobile Responsive**: Optimized for all screen sizes

## Security

### Row Level Security (RLS)
- Users can only view and edit their own preferences
- All operations require authentication
- Proper policies prevent unauthorized access

### Data Validation
- Server-side validation of all inputs
- Type checking for arrays and strings
- Required field validation

## Testing

### Test Script
Run `test-user-profile-system.js` to verify:
- Database tables exist and are accessible
- Triggers are working correctly
- Data synchronization is functioning
- RLS policies are properly configured

### Manual Testing
1. Create a new user account
2. Navigate to `/profile`
3. Fill out the profile form
4. Save and verify data is stored
5. Check that data appears in both tables

## Integration with Existing System

### AuthContext Updates
- Updated `UserProfile` interface to include new fields
- Maintains backward compatibility with existing code

### Navigation Updates
- Added Profile link to navbar for normal users
- Consistent styling with existing navigation

### Database Triggers
- Automatic creation of user_preferences on signup
- Synchronization between user_preferences and user_profiles
- Profile completion tracking

## Future Enhancements

1. **Profile Completion Tracking**: Show progress percentage
2. **Preference Matching**: Use preferences to improve stylist recommendations
3. **Profile Analytics**: Track how preferences affect matching success
4. **Import/Export**: Allow users to backup their preferences
5. **Social Features**: Share style preferences with friends

## Troubleshooting

### Common Issues

1. **Table Not Found**: Run the SQL setup script
2. **RLS Policy Errors**: Check that policies are correctly configured
3. **Trigger Not Working**: Verify trigger functions are created
4. **Sync Issues**: Check that both tables have the correct structure

### Debug Commands

```sql
-- Check if tables exist
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

-- Check trigger functions
SELECT routine_name FROM information_schema.routines WHERE routine_schema = 'public';

-- Check RLS policies
SELECT schemaname, tablename, policyname FROM pg_policies WHERE schemaname = 'public';
```

## File Structure

```
├── app/
│   └── profile/
│       └── page.tsx              # Main profile page
├── contexts/
│   └── AuthContext.tsx           # Updated with new fields
├── app/components/
│   └── Navbar.tsx               # Updated with profile link
├── user-profile-setup.sql       # Database setup script
├── test-user-profile-system.js  # Test script
└── USER_PROFILE_SYSTEM.md       # This documentation
``` 