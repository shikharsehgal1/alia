/*
  # Initial Schema Setup for Alia

  1. Tables
    - profiles: User profiles with personal information
    - locations: Real-time user locations
    - interests: User interests and hobbies
    - matches: Connections between users
    - check_ins: User check-ins at places

  2. Security
    - Enable RLS on all tables
    - Set up policies for secure data access
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  name text NOT NULL,
  age int NOT NULL CHECK (age >= 18),
  bio text,
  image_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Locations table for real-time tracking
CREATE TABLE IF NOT EXISTS locations (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  latitude double precision NOT NULL,
  longitude double precision NOT NULL,
  last_updated timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Interests table
CREATE TABLE IF NOT EXISTS interests (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  category text NOT NULL CHECK (category IN ('hobby', 'sport')),
  name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Matches table
CREATE TABLE IF NOT EXISTS matches (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user1_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  user2_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user1_id, user2_id)
);

-- Check-ins table
CREATE TABLE IF NOT EXISTS check_ins (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  place_id text NOT NULL,
  latitude double precision NOT NULL,
  longitude double precision NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE check_ins ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view locations of matched users" ON locations;
DROP POLICY IF EXISTS "Users can update own location" ON locations;
DROP POLICY IF EXISTS "Users can insert own location" ON locations;
DROP POLICY IF EXISTS "Interests are viewable by everyone" ON interests;
DROP POLICY IF EXISTS "Users can manage own interests" ON interests;
DROP POLICY IF EXISTS "Users can view own matches" ON matches;
DROP POLICY IF EXISTS "Users can create matches" ON matches;
DROP POLICY IF EXISTS "Users can update own matches" ON matches;
DROP POLICY IF EXISTS "Users can view check-ins of matched users" ON check_ins;
DROP POLICY IF EXISTS "Users can manage own check-ins" ON check_ins;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Locations policies
CREATE POLICY "Users can view locations of matched users"
  ON locations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM matches
      WHERE (user1_id = auth.uid() AND user2_id = locations.user_id
             AND status = 'accepted')
      OR (user2_id = auth.uid() AND user1_id = locations.user_id
          AND status = 'accepted')
    )
    OR user_id = auth.uid()
  );

CREATE POLICY "Users can update own location"
  ON locations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own location"
  ON locations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Interests policies
CREATE POLICY "Interests are viewable by everyone"
  ON interests FOR SELECT
  USING (true);

CREATE POLICY "Users can manage own interests"
  ON interests FOR ALL
  USING (auth.uid() = user_id);

-- Matches policies
CREATE POLICY "Users can view own matches"
  ON matches FOR SELECT
  USING (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Users can create matches"
  ON matches FOR INSERT
  WITH CHECK (auth.uid() = user1_id);

CREATE POLICY "Users can update own matches"
  ON matches FOR UPDATE
  USING (auth.uid() IN (user1_id, user2_id));

-- Check-ins policies
CREATE POLICY "Users can view check-ins of matched users"
  ON check_ins FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM matches
      WHERE (user1_id = auth.uid() AND user2_id = check_ins.user_id
             AND status = 'accepted')
      OR (user2_id = auth.uid() AND user1_id = check_ins.user_id
          AND status = 'accepted')
    )
    OR user_id = auth.uid()
  );

CREATE POLICY "Users can manage own check-ins"
  ON check_ins FOR ALL
  USING (auth.uid() = user_id);

-- Functions
CREATE OR REPLACE FUNCTION nearby_users(
  lat double precision,
  lng double precision,
  radius_km double precision
)
RETURNS TABLE (
  id uuid,
  name text,
  age int,
  bio text,
  image_url text,
  distance double precision,
  last_active timestamptz
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.name,
    p.age,
    p.bio,
    p.image_url,
    (
      6371 * acos(
        cos(radians(lat)) * cos(radians(l.latitude)) *
        cos(radians(l.longitude) - radians(lng)) +
        sin(radians(lat)) * sin(radians(l.latitude))
      )
    ) as distance,
    l.last_updated as last_active
  FROM profiles p
  JOIN locations l ON l.user_id = p.id
  WHERE (
    6371 * acos(
      cos(radians(lat)) * cos(radians(l.latitude)) *
      cos(radians(l.longitude) - radians(lng)) +
      sin(radians(lat)) * sin(radians(l.latitude))
    )
  ) <= radius_km
  AND p.id != auth.uid()
  ORDER BY distance;
END;
$$;