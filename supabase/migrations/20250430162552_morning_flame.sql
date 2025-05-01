/*
  # Add Location Matching and Activity Tracking

  1. New Tables
    - activities: Track user activities (check-ins, matches, etc.)
    - notifications: Store user notifications
    - user_locations: Real-time user location tracking with PostGIS

  2. Functions
    - nearby_users: Find users within a radius with similarity scoring
    - update_user_location: Update user's location with PostGIS point

  3. Security
    - RLS policies for all new tables
    - Secure function execution
*/

-- Enable PostGIS extension for location data
CREATE EXTENSION IF NOT EXISTS postgis;

-- Activities table
CREATE TABLE IF NOT EXISTS activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('check_in', 'match', 'rating', 'nearby')),
  data jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('match', 'message', 'nearby', 'check_in')),
  title text NOT NULL,
  body text NOT NULL,
  data jsonb,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- User locations table for real-time tracking
CREATE TABLE IF NOT EXISTS user_locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  location geometry(Point, 4326) NOT NULL,
  accuracy float,
  last_updated timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_locations ENABLE ROW LEVEL SECURITY;

-- Activities policies
CREATE POLICY "Users can view activities of matched users"
  ON activities FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM matches
      WHERE (
        (matches.user1_id = auth.uid() AND matches.user2_id = activities.user_id AND matches.status = 'accepted') OR
        (matches.user2_id = auth.uid() AND matches.user1_id = activities.user_id AND matches.status = 'accepted')
      )
    ) OR user_id = auth.uid()
  );

CREATE POLICY "Users can create own activities"
  ON activities FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Notifications policies
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- User locations policies
CREATE POLICY "Users can view locations of matched users"
  ON user_locations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM matches
      WHERE (
        (matches.user1_id = auth.uid() AND matches.user2_id = user_locations.user_id AND matches.status = 'accepted') OR
        (matches.user2_id = auth.uid() AND matches.user1_id = user_locations.user_id AND matches.status = 'accepted')
      )
    ) OR user_id = auth.uid()
  );

CREATE POLICY "Users can update own location"
  ON user_locations FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own location"
  ON user_locations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Function to update user location
CREATE OR REPLACE FUNCTION update_user_location(
  lat double precision,
  lng double precision,
  accuracy float DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO user_locations (user_id, location, accuracy, last_updated)
  VALUES (
    auth.uid(),
    ST_SetSRID(ST_MakePoint(lng, lat), 4326),
    accuracy,
    now()
  )
  ON CONFLICT (user_id)
  DO UPDATE SET
    location = ST_SetSRID(ST_MakePoint(lng, lat), 4326),
    accuracy = EXCLUDED.accuracy,
    last_updated = now();
END;
$$;

-- Function to find nearby users with similarity scoring
CREATE OR REPLACE FUNCTION nearby_users(
  lat double precision,
  lng double precision,
  radius_km double precision DEFAULT 5,
  max_results integer DEFAULT 50
)
RETURNS TABLE (
  id uuid,
  name text,
  age integer,
  bio text,
  image_url text,
  interests text[],
  activities text[],
  education text,
  occupation text,
  distance double precision,
  similarity double precision
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_interests text[];
  user_activities text[];
BEGIN
  -- Get current user's interests and activities
  SELECT 
    p.interests,
    p.activities
  INTO 
    user_interests,
    user_activities
  FROM profiles p
  WHERE p.id = auth.uid();

  RETURN QUERY
  WITH user_distances AS (
    SELECT
      p.*,
      ST_Distance(
        ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography,
        ul.location::geography
      ) / 1000 as distance
    FROM profiles p
    JOIN user_locations ul ON ul.user_id = p.id
    WHERE p.id != auth.uid()
  )
  SELECT
    ud.id,
    ud.name,
    ud.age,
    ud.bio,
    ud.image_url,
    ud.interests,
    ud.activities,
    ud.education,
    ud.occupation,
    ud.distance,
    COALESCE(
      (
        array_length(ARRAY(
          SELECT UNNEST(ud.interests) 
          INTERSECT 
          SELECT UNNEST(user_interests)
        ), 1)::float / 
        GREATEST(
          array_length(ud.interests, 1), 
          array_length(user_interests, 1)
        ) * 0.5 +
        array_length(ARRAY(
          SELECT UNNEST(ud.activities) 
          INTERSECT 
          SELECT UNNEST(user_activities)
        ), 1)::float / 
        GREATEST(
          array_length(ud.activities, 1), 
          array_length(user_activities, 1)
        ) * 0.5
      ),
      0
    ) as similarity
  FROM user_distances ud
  WHERE ud.distance <= radius_km
  ORDER BY similarity DESC, distance ASC
  LIMIT max_results;
END;
$$;