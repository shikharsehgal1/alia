/*
  # Fix location policies

  1. Changes
    - Drop existing policies
    - Add new policies for locations table
    - Ensure proper access control for location data

  2. Security
    - Enable proper access for location updates and queries
    - Maintain row-level security
*/

-- Drop existing location policies
DROP POLICY IF EXISTS "Users can view nearby locations" ON public.locations;
DROP POLICY IF EXISTS "Users can update own location" ON public.locations;
DROP POLICY IF EXISTS "Users can insert own location" ON public.locations;

-- Create new location policies
CREATE POLICY "Users can view all locations"
ON public.locations
FOR SELECT
TO public
USING (true);

CREATE POLICY "Users can update own location"
ON public.locations
FOR UPDATE
TO public
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert own location"
ON public.locations
FOR INSERT
TO public
WITH CHECK (auth.uid() = user_id);

-- Ensure RLS is enabled
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;