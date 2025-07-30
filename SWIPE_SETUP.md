# Swipeable Stylist Interface Setup

This guide will help you set up the swipeable stylist card interface for your StyleSwipe application.

## Prerequisites

- Next.js project with Supabase integration
- Supabase project with authentication enabled
- TailwindCSS configured
- Framer Motion installed

## Database Setup

1. **Run the SQL script** in your Supabase SQL editor:
   - Copy the contents of `database-setup.sql`
   - Paste it into your Supabase SQL editor
   - Execute the script

This will create:
- `stylists` table with sample data
- `swipes` table to track user interactions
- `matches` table to store successful matches
- Proper Row Level Security (RLS) policies
- Performance indexes

## Environment Variables

Make sure you have these environment variables in your `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Features Implemented

### ✅ Swipe Interface (`/swipe`)
- **Stylist Cards**: Display one stylist at a time with image, name, bio, and specialties
- **Swipe Actions**: Like (heart) and Pass (X) buttons
- **Animations**: Smooth card transitions using Framer Motion
- **Progress Indicator**: Shows current position in the stylist queue
- **Mobile Responsive**: Optimized for mobile devices

### ✅ Matches Page (`/matches`)
- **Match Display**: Shows all successful matches with stylist details
- **Match History**: Displays when matches were created
- **Empty State**: Encourages users to start swiping when no matches exist

### ✅ Navigation
- **Navbar Integration**: Added "Swipe" and "Matches" buttons for authenticated users
- **Authentication Required**: Both pages require user login

## Database Schema

### Stylists Table
```sql
- id (UUID, Primary Key)
- name (TEXT)
- bio (TEXT)
- specialties (TEXT[])
- catalog_urls (TEXT[])
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### Swipes Table
```sql
- id (UUID, Primary Key)
- user_id (UUID, Foreign Key to auth.users)
- stylist_id (UUID, Foreign Key to stylists)
- direction (TEXT: 'left' or 'right')
- created_at (TIMESTAMP)
```

### Matches Table
```sql
- id (UUID, Primary Key)
- user_id (UUID, Foreign Key to auth.users)
- stylist_id (UUID, Foreign Key to stylists)
- matched_at (TIMESTAMP)
```

## Usage Flow

1. **User Authentication**: Users must sign in to access the swipe interface
2. **Stylist Discovery**: Users see one stylist card at a time
3. **Swipe Actions**: 
   - **Like (Right)**: Creates a match and logs the swipe
   - **Pass (Left)**: Only logs the swipe
4. **Match Tracking**: Successful likes create entries in the matches table
5. **Match Review**: Users can view all their matches on the matches page

## Styling

The interface uses a modern Gen Z aesthetic with:
- **Gradient Backgrounds**: Purple to pink gradients
- **Rounded Cards**: Modern card design with shadows
- **Smooth Animations**: Framer Motion transitions
- **Mobile-First**: Responsive design for all screen sizes
- **Color Scheme**: Purple and pink theme with white cards

## Security

- **Row Level Security (RLS)**: Enabled on all tables
- **User Isolation**: Users can only see their own swipes and matches
- **Authentication Required**: All sensitive operations require login

## Customization

### Adding More Stylists
Add new stylists to the `stylists` table:
```sql
INSERT INTO stylists (name, bio, specialties, catalog_urls) VALUES
('Stylist Name', 'Bio description', ARRAY['Specialty 1', 'Specialty 2'], ARRAY['image_url_1', 'image_url_2']);
```

### Modifying Card Design
Edit the card components in:
- `app/swipe/page.tsx` for the swipe interface
- `app/matches/page.tsx` for the matches display

### Changing Animations
Modify Framer Motion animations in both pages to customize the transition effects.

## Troubleshooting

### Common Issues

1. **Stylists not loading**: Check if the `stylists` table exists and has data
2. **Authentication errors**: Verify RLS policies are correctly set up
3. **Image loading issues**: Ensure `catalog_urls` contain valid image URLs
4. **Swipe not working**: Check browser console for Supabase connection errors

### Debug Steps

1. Check browser console for JavaScript errors
2. Verify Supabase connection in Network tab
3. Test database queries directly in Supabase SQL editor
4. Ensure environment variables are correctly set

## Performance Considerations

- **Image Optimization**: Consider using Next.js Image component for better performance
- **Pagination**: For large stylist databases, implement pagination
- **Caching**: Consider implementing client-side caching for stylist data
- **Lazy Loading**: Implement lazy loading for match history

## Future Enhancements

- **Real-time Updates**: Add real-time notifications for new matches
- **Stylist Filtering**: Add filters by specialty, location, etc.
- **Chat Integration**: Add messaging between users and matched stylists
- **Profile Management**: Allow users to edit their preferences
- **Analytics**: Track swipe patterns and match success rates 