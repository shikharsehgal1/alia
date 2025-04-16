import { useState, useEffect } from 'react';
import { MapPin, Users, Settings, Search, LogOut } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { AuthForm } from '@/components/auth-form';
import { ProfileForm } from '@/components/profile-form';
import { supabase } from '@/lib/supabase';
import { calculateDistance } from '@/lib/supabase';
import type { Database } from '@/lib/database.types';
import type { Session } from '@supabase/supabase-js';

type Profile = Database['public']['Tables']['profiles']['Row'];
type Location = Database['public']['Tables']['locations']['Row'];

interface NearbyUser extends Profile {
  distance: number;
  location: Location;
}

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [nearbyUsers, setNearbyUsers] = useState<NearbyUser[]>([]);
  const [userLocation, setUserLocation] = useState<GeolocationCoordinates | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isUpdatingLocation, setIsUpdatingLocation] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        fetchProfile(session.user.id);
      }
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchProfile(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Set up real-time subscription for location updates
  useEffect(() => {
    if (!session?.user.id) return;

    const locationSubscription = supabase
      .channel('location-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'locations',
        },
        (payload) => {
          console.log('Location update received:', payload);
          if (userLocation) {
            fetchNearbyUsers(userLocation);
          }
        }
      )
      .subscribe();

    return () => {
      locationSubscription.unsubscribe();
    };
  }, [session?.user.id, userLocation]);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error, status } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error && status !== 406) {
        throw error;
      }

      if (data) {
        setProfile(data);
        startLocationTracking();
      } else {
        setProfile(null);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch profile",
      });
      console.error('Error fetching profile:', error);
    }
  };

  const startLocationTracking = () => {
    if (!navigator.geolocation) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Geolocation is not supported by your browser",
      });
      return;
    }

    // Get initial position
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        console.log('Got initial position:', position.coords);
        setUserLocation(position.coords);
        await updateLocation(position.coords);
        await fetchNearbyUsers(position.coords);
      },
      (error) => {
        toast({
          variant: "destructive",
          title: "Location error",
          description: error.message,
        });
      }
    );

    // Watch for position changes
    const watchId = navigator.geolocation.watchPosition(
      async (position) => {
        console.log('Position updated:', position.coords);
        setUserLocation(position.coords);
        await updateLocation(position.coords);
        await fetchNearbyUsers(position.coords);
      },
      (error) => {
        toast({
          variant: "destructive",
          title: "Location error",
          description: error.message,
        });
      },
      { 
        enableHighAccuracy: true,
        maximumAge: 30000, // 30 seconds
        timeout: 27000 // 27 seconds
      }
    );

    // Cleanup function to stop watching location
    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  };

  const updateLocation = async (coords: GeolocationCoordinates) => {
    if (!session?.user.id || isUpdatingLocation) return;

    try {
      setIsUpdatingLocation(true);
      console.log('Updating location for user:', session.user.id);
      const { error } = await supabase
        .from('locations')
        .upsert(
          {
            user_id: session.user.id,
            lat: coords.latitude,
            lng: coords.longitude,
            last_updated: new Date().toISOString(),
          },
          {
            onConflict: 'user_id',
          }
        );

      if (error) throw error;
      console.log('Location updated successfully');
    } catch (error) {
      console.error('Error updating location:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update location",
      });
    } finally {
      setIsUpdatingLocation(false);
    }
  };

  const fetchNearbyUsers = async (coords: GeolocationCoordinates) => {
    if (!session?.user.id) return;

    try {
      console.log('Fetching nearby users...');
      const { data: locations, error } = await supabase
        .from('locations')
        .select(`
          *,
          profiles (*)
        `);

      if (error) throw error;

      console.log('Found locations:', locations);

      const nearby = locations
        .filter(loc => {
          const isValid = loc.user_id !== session.user.id && loc.profiles;
          if (!isValid) {
            console.log('Filtered out location:', loc);
          }
          return isValid;
        })
        .map(loc => {
          const distance = calculateDistance(
            coords.latitude,
            coords.longitude,
            loc.lat,
            loc.lng
          );
          console.log(`Distance to ${loc.profiles?.username}: ${distance} miles`);
          return {
            ...loc.profiles!,
            distance,
            location: loc
          };
        })
        .filter(user => {
          const isNearby = user.distance <= 50;
          if (!isNearby) {
            console.log(`User ${user.username} filtered out - too far (${user.distance} miles)`);
          }
          return isNearby;
        })
        .sort((a, b) => a.distance - b.distance);

      console.log('Nearby users:', nearby);
      setNearbyUsers(nearby);
    } catch (error) {
      console.error('Error fetching nearby users:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch nearby users",
      });
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      setSession(null);
      setProfile(null);
      setNearbyUsers([]);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to sign out",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-lg">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <AuthForm />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="p-6 w-full max-w-sm">
          <h2 className="text-2xl font-bold mb-6">Complete Your Profile</h2>
          <ProfileForm userId={session.user.id} onComplete={() => fetchProfile(session.user.id)} />
        </Card>
      </div>
    );
  }

  const filteredUsers = nearbyUsers.filter(user => 
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.interests?.some(interest => 
      interest.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <div className="fixed top-0 left-0 right-0 bg-background border-b z-50">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-xl font-bold">Alia</h1>
          <Button variant="ghost" size="icon" onClick={handleSignOut}>
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
        <div className="px-4 pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Search by name or interests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-32 pb-20 px-4">
        {/* Location Status */}
        <div className="flex items-center gap-2 mb-6 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span>
            {userLocation ? (
              <>
                Your location is active
                <span className="ml-2 text-xs">
                  ({nearbyUsers.length} nearby)
                </span>
              </>
            ) : (
              'Enable location to see people nearby'
            )}
          </span>
        </div>

        {/* Nearby Users */}
        <div className="space-y-4">
          {filteredUsers.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              No users found nearby
            </div>
          ) : (
            filteredUsers.map((user) => (
              <Card key={user.id} className="p-4">
                <div className="flex items-start gap-4">
                  <Avatar className="h-12 w-12">
                    <img 
                      src={user.avatar_url || `https://api.dicebear.com/7.x/avatars/svg?seed=${user.username}`} 
                      alt={user.full_name || ''} 
                      className="object-cover"
                    />
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">{user.full_name}</h3>
                      <span className="text-sm text-muted-foreground">
                        {user.distance.toFixed(1)} mi
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{user.bio}</p>
                    <div className="flex flex-wrap gap-2">
                      {user.interests?.map((interest, index) => (
                        <span
                          key={index}
                          className="bg-secondary text-secondary-foreground px-2 py-1 rounded-full text-xs"
                        >
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t">
        <div className="flex justify-around p-4">
          <Button variant="ghost" className="flex-1">
            <Users className="h-5 w-5" />
          </Button>
          <Button variant="ghost" className="flex-1">
            <MapPin className="h-5 w-5" />
          </Button>
          <Button variant="ghost" className="flex-1">
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default App;