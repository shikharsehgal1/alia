import { useEffect, useState } from 'react';
import { useLocation } from './useLocation';
import { supabase } from '@/lib/supabase';
import { UserProfile } from '@/types';

export function useLocationMatching(radius: number = 5) {
  const { location } = useLocation();
  const [matches, setMatches] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!location) return;

    const fetchNearbyUsers = async () => {
      setLoading(true);
      try {
        // Update user's location
        const { error: locationError } = await supabase.rpc('update_user_location', {
          lat: location.coords.latitude,
          lng: location.coords.longitude,
          accuracy: location.coords.accuracy,
        });

        if (locationError) throw locationError;

        // Fetch nearby users
        const { data, error } = await supabase.rpc('nearby_users', {
          lat: location.coords.latitude,
          lng: location.coords.longitude,
          radius_km: radius,
        });

        if (error) throw error;

        setMatches(data);
        setError(null);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchNearbyUsers();
  }, [location, radius]);

  return {
    matches,
    loading,
    error,
  };
}