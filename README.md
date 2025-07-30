# Styl - Fashion Stylist Matching Platform

A modern platform where users can match with fashion stylists using a swipe-based interface, similar to dating apps but for fashion styling services.

## Features

- 🎨 **Modern Apple-style UI**: Clean, minimal interface with Apple design principles
- 👤 **User Profiles**: Complete profile system with preferences and gender information
- 💅 **Stylist Profiles**: Stylists can create profiles with professional details and catalog images
- 🔄 **Swipe Interface**: Tinder-style swiping to match with stylists
- 💬 **Matching System**: Connect users with stylists based on preferences
- 🔐 **Authentication**: Secure login and signup system
- 📱 **Responsive**: Works perfectly on all devices
- ⚡ **Fast**: Built with Next.js and optimized for performance

## Tech Stack

- **Frontend**: Next.js, React, TypeScript, TailwindCSS
- **Backend**: Supabase (PostgreSQL, Authentication, Storage)
- **Styling**: TailwindCSS with custom Apple-style design system
- **State Management**: React Context API
- **Database**: PostgreSQL with RLS policies

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account and project

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/styl.git
cd styl
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file with your Supabase credentials:
```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Database Setup

The project requires several database tables and functions to be set up in Supabase:

- `users`: Authentication users
- `user_profiles`: Extended user information
- `user_preferences`: User styling preferences including gender
- `stylists`: Stylist profiles
- `catalog_images`: Portfolio images for stylists
- `matches`: Connection between users and stylists

Refer to the SQL scripts in the project root for detailed schema information.

## Project Structure

```
├── app/
│   ├── components/
│   │   ├── auth/
│   │   │   ├── LoginModal.tsx
│   │   │   ├── SignUpModal.tsx
│   │   │   └── StylistProfileModal.tsx
│   │   ├── CatalogImages.tsx
│   │   ├── Navbar.tsx
│   │   └── ... other components
│   ├── matches/
│   │   └── page.tsx
│   ├── profile/
│   │   └── page.tsx
│   ├── swipe/
│   │   └── page.tsx
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── contexts/
│   ├── AuthContext.tsx
│   └── ToastContext.tsx
├── lib/
│   ├── supabase.ts
│   └── ... utility functions
├── tailwind.config.js
└── ... configuration files
```

## License

MIT