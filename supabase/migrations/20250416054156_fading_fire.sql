/*
  # Fix location visibility and policies

  1. Changes
    - Drop existing location policies
    - Add new policies for better location visibility
    - Fix location update handling

  2. Security
    - Maintain proper access control while allowing visibility
    - Keep row-level security enabled
*/

-- Drop existing location policies
DROP POLICY IF EXISTS "Users can view all locations" ON public.locations;
DROP POLICY IF EXISTS "Users can update own location" ON public.locations;
DROP POLICY IF EXISTS "Users can insert own location" ON public.locations;

-- Create new location policies with better visibility
CREATE POLICY "Anyone can view locations"
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

CREATE POLICY "Users can delete own location"
ON public.locations
FOR DELETE
TO public
USING (auth.uid() = user_id);