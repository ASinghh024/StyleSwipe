-- Create stylists table
CREATE TABLE IF NOT EXISTS stylists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  bio TEXT NOT NULL,
  specialties TEXT[] DEFAULT '{}',
  catalog_urls TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create swipes table
CREATE TABLE IF NOT EXISTS swipes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  stylist_id UUID REFERENCES stylists(id) ON DELETE CASCADE,
  direction TEXT CHECK (direction IN ('left', 'right')) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, stylist_id)
);

-- Create matches table
CREATE TABLE IF NOT EXISTS matches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  stylist_id UUID REFERENCES stylists(id) ON DELETE CASCADE,
  matched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, stylist_id)
);

-- Enable Row Level Security (RLS)
ALTER TABLE stylists ENABLE ROW LEVEL SECURITY;
ALTER TABLE swipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

-- Create policies for stylists (public read access)
CREATE POLICY "Stylists are viewable by everyone" ON stylists
  FOR SELECT USING (true);

-- Add policies for stylists to manage their own records
CREATE POLICY "Stylists can insert their own profile" ON stylists
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Stylists can update their own profile" ON stylists
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Stylists can delete their own profile" ON stylists
  FOR DELETE USING (auth.uid() = id);

-- Create policies for swipes (users can only see their own swipes)
CREATE POLICY "Users can insert their own swipes" ON swipes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own swipes" ON swipes
  FOR SELECT USING (auth.uid() = user_id);

-- Create policies for matches (users can only see their own matches)
CREATE POLICY "Users can insert their own matches" ON matches
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own matches" ON matches
  FOR SELECT USING (auth.uid() = user_id);

-- Insert some sample stylists
INSERT INTO stylists (name, bio, specialties, catalog_urls) VALUES
(
  'Sarah Johnson',
  'Fashion-forward stylist with 8 years of experience in contemporary fashion. Specializes in creating personalized looks that reflect your unique personality.',
  ARRAY['Contemporary Fashion', 'Personal Styling', 'Color Analysis'],
  ARRAY['https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400']
),
(
  'Michael Chen',
  'Luxury fashion expert and former runway stylist. Known for creating sophisticated, timeless looks that make a statement.',
  ARRAY['Luxury Fashion', 'Runway Styling', 'Evening Wear'],
  ARRAY['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400', 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400']
),
(
  'Emma Rodriguez',
  'Sustainable fashion advocate and street style expert. Helps clients build conscious wardrobes that are both stylish and ethical.',
  ARRAY['Sustainable Fashion', 'Street Style', 'Wardrobe Building'],
  ARRAY['https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400', 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400']
),
(
  'David Kim',
  'Minimalist fashion specialist with a focus on capsule wardrobes. Expert in creating versatile, high-quality pieces that last.',
  ARRAY['Minimalist Fashion', 'Capsule Wardrobes', 'Quality Investment'],
  ARRAY['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400']
),
(
  'Aisha Patel',
  'Bridal and special occasion specialist. Creates dream wedding looks and memorable event styling that captures your vision perfectly.',
  ARRAY['Bridal Styling', 'Special Occasions', 'Event Styling'],
  ARRAY['https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400']
),
(
  'James Wilson',
  'Vintage fashion curator and retro style expert. Specializes in finding unique vintage pieces and creating authentic retro looks.',
  ARRAY['Vintage Fashion', 'Retro Styling', 'Thrift Shopping'],
  ARRAY['https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400', 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400']
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_swipes_user_id ON swipes(user_id);
CREATE INDEX IF NOT EXISTS idx_swipes_stylist_id ON swipes(stylist_id);
CREATE INDEX IF NOT EXISTS idx_matches_user_id ON matches(user_id);
CREATE INDEX IF NOT EXISTS idx_matches_stylist_id ON matches(stylist_id); 