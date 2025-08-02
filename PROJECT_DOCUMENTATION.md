# Styl - Fashion Stylist Matching Platform Documentation

This document provides a comprehensive overview of the Styl project, its architecture, functionality, and technical details. It serves as a guide for developers working with the codebase.

## Project Overview

Styl is a modern platform where users can match with fashion stylists using a swipe-based interface, similar to dating apps but for fashion styling services. The application features a clean, Apple-style UI with a focus on user experience.

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript, TailwindCSS
- **Backend**: Supabase (PostgreSQL, Authentication, Storage)
- **State Management**: React Context API
- **Animation**: Framer Motion
- **Icons**: Lucide React

## Project Structure

```
├── app/                      # Next.js app directory (App Router)
│   ├── components/           # Shared UI components
│   │   ├── auth/             # Authentication components
│   │   ├── CatalogImages.tsx # Stylist catalog display
│   │   ├── ChatModal.tsx     # Chat interface
│   │   └── ...               # Other UI components
│   ├── catalog/              # Catalog browsing page
│   ├── matches/              # User matches page
│   ├── profile/              # User profile management
│   ├── swipe/                # Swipe interface for matching
│   ├── stylist-dashboard/    # Dashboard for stylists
│   ├── stylist/              # Stylist profile pages
│   └── ...                   # Other app pages
├── contexts/                 # React Context providers
│   ├── AuthContext.tsx       # Authentication state management
│   └── ToastContext.tsx      # Toast notifications
├── hooks/                    # Custom React hooks
│   └── useCatalogImages.ts   # Hook for catalog image management
├── lib/                      # Utility functions and services
│   ├── chat-utils.ts         # Chat functionality
│   ├── match-utils.ts        # Matching system logic
│   ├── stylist-utils.ts      # Stylist profile management
│   └── supabase.ts           # Supabase client configuration
└── ...                       # Configuration files
```

## Database Schema

### Tables

1. **auth.users** - Supabase Auth users table
   - Standard Supabase auth fields

2. **user_profiles** - Extended user information
   - `id`: UUID (Primary Key)
   - `user_id`: UUID (Foreign Key to auth.users)
   - `full_name`: TEXT
   - `role`: TEXT ('admin', 'user', 'stylist')
   - `bio`: TEXT (optional)
   - `specialties`: TEXT[] (optional)
   - `catalog_urls`: TEXT[] (optional)
   - `profile_picture`: TEXT (optional)
   - `clothing_preferences`: TEXT[] (optional)
   - `preferred_occasions`: TEXT[] (optional)
   - `style_preferences`: TEXT (optional)
   - `budget_range`: TEXT (optional)
   - `size_preferences`: TEXT (optional)
   - `color_preferences`: TEXT[] (optional)
   - `is_verified`: BOOLEAN
   - `created_at`: TIMESTAMP
   - `updated_at`: TIMESTAMP

3. **user_preferences** - User styling preferences
   - `user_id`: UUID (Foreign Key to auth.users)
   - `gender`: TEXT
   - `clothing_preferences`: TEXT[]
   - `preferred_occasions`: TEXT[]
   - `style_preferences`: TEXT
   - `budget_range`: TEXT
   - `profile_completed`: BOOLEAN

4. **stylists** - Stylist profiles
   - `id`: UUID (Primary Key, matches user_id for stylists)
   - `name`: TEXT
   - `bio`: TEXT
   - `specialties`: TEXT[]
   - `catalog_urls`: TEXT[]
   - `profile_picture`: TEXT (optional)
   - `created_at`: TIMESTAMP
   - `updated_at`: TIMESTAMP

5. **catalog_images** - Portfolio images for stylists
   - `id`: UUID (Primary Key)
   - `stylist_id`: UUID (Foreign Key to stylists)
   - `image_url`: TEXT
   - `file_name`: TEXT (optional)
   - `file_size`: INTEGER (optional)
   - `mime_type`: TEXT (optional)
   - `created_at`: TIMESTAMP
   - `updated_at`: TIMESTAMP

6. **swipes** - User swipe actions
   - `id`: UUID (Primary Key)
   - `user_id`: UUID (Foreign Key to auth.users)
   - `stylist_id`: UUID (Foreign Key to stylists)
   - `direction`: TEXT ('left' or 'right')
   - `created_at`: TIMESTAMP
   - Unique constraint on (user_id, stylist_id)

7. **matches** - Connections between users and stylists
   - `id`: UUID (Primary Key)
   - `user_id`: UUID (Foreign Key to auth.users)
   - `stylist_id`: UUID (Foreign Key to stylists)
   - `matched_at`: TIMESTAMP
   - `status`: TEXT ('pending', 'mutual', 'declined')
   - `stylist_response`: BOOLEAN (null if pending)
   - `user_response`: BOOLEAN
   - Unique constraint on (user_id, stylist_id)

8. **chat_rooms** - Chat rooms for matches
   - `id`: UUID (Primary Key)
   - `match_id`: UUID (Foreign Key to matches)
   - `user_id`: UUID (Foreign Key to auth.users)
   - `stylist_id`: UUID (Foreign Key to stylists)
   - `created_at`: TIMESTAMP
   - `updated_at`: TIMESTAMP

9. **messages** - Chat messages
   - `id`: UUID (Primary Key)
   - `chat_room_id`: UUID (Foreign Key to chat_rooms)
   - `sender_id`: UUID (Foreign Key to auth.users)
   - `content`: TEXT
   - `message_type`: TEXT ('text', 'image', 'system')
   - `is_read`: BOOLEAN
   - `created_at`: TIMESTAMP
   - `updated_at`: TIMESTAMP

### Row Level Security (RLS) Policies

The database uses Supabase RLS policies to secure data access:

- **Stylists Table**:
  - Public read access for all stylists
  - Stylists can only insert/update/delete their own profiles

- **Swipes Table**:
  - Users can only view and create their own swipes

- **Matches Table**:
  - Users can only view and create their own matches

## Core Features

### Authentication System

The authentication system is built using Supabase Auth and managed through the AuthContext provider. It handles:

- User sign-up and sign-in
- User profile creation and management
- Role-based access (user, stylist, admin)
- Session management

When a user signs up as a stylist, the system automatically creates entries in both the user_profiles and stylists tables.

### User Profile System

Users can create and manage their profiles with preferences including:

- Gender
- Clothing preferences
- Preferred occasions
- Style preferences
- Budget range

These preferences are used to improve the matching algorithm.

### Swipe Interface

The swipe interface allows users to:

- View stylist profiles one at a time
- Swipe right to like a stylist
- Swipe left to pass on a stylist
- See immediate match notifications when they match with a stylist

The system filters out stylists that have already been swiped on or matched with.

### Matching System

The matching system:

- Creates a match when a user swipes right on a stylist
- Allows stylists to accept or decline match requests
- Updates match status based on both parties' responses
- Sends notifications for match events

### Chat System

The chat system enables communication between matched users and stylists:

- Creates chat rooms for matches
- Supports text and image messages
- Tracks read/unread status
- Provides real-time updates

### Stylist Catalog

Stylists can manage their portfolio through the catalog system:

- Upload and manage portfolio images
- Showcase their work to potential clients
- Organize images by categories

## Environment Setup

The application requires the following environment variables:

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## Development Workflow

1. **Installation**:
   ```bash
   npm install
   ```

2. **Development Server**:
   ```bash
   npm run dev
   ```

3. **Build for Production**:
   ```bash
   npm run build
   ```

4. **Start Production Server**:
   ```bash
   npm start
   ```

## Database Setup

The database schema can be set up using the SQL scripts in the project root:

- `database-setup.sql` - Core tables and sample data
- `user-profiles-setup.sql` - User profile tables
- `catalog-images-setup.sql` - Catalog image system
- `chat-system-setup.sql` - Chat functionality
- `stylist-matches-setup.sql` - Matching system

## Common Issues and Fixes

The project includes several fix scripts for common issues:

- `fix-signup-database-error.sql` - Fixes for signup process
- `fix-profile-picture-upload-rls.sql` - RLS fixes for profile pictures
- `fix-stylist-matches-policy.sql` - Fixes for matching system policies
- `fix-catalog-images-public-access.sql` - Public access for catalog images

## Future Enhancements

Planned features for future development:

1. Advanced matching algorithm based on style preferences
2. In-app scheduling for styling sessions
3. Payment integration for booking stylists
4. Video chat consultations
5. Style recommendations and AI suggestions

## Conclusion

Styl is a modern, feature-rich platform that connects users with fashion stylists through an intuitive interface. The application leverages Next.js and Supabase to provide a seamless user experience with robust backend functionality.