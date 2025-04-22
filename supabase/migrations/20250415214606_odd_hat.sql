/*
  # Fix RLS policies for profiles table

  1. Security Changes
    - Drop existing policies to avoid conflicts
    - Add policy to allow users to insert their own profile
    - Add policy to allow users to update their own profile
    - Add policy to allow users to read all profiles

  Note: This migration ensures clean policy creation by first removing any existing policies
*/

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can read all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;

-- Create new policies
CREATE POLICY "Users can insert own profile"
ON public.profiles
FOR INSERT
TO public
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
TO public
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "Anyone can read all profiles"
ON public.profiles
FOR SELECT
TO public
USING (true);