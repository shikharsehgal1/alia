import { create } from 'zustand';
import { UserProfile } from '@/types';
import { calculateDistance, calculateSimilarityScore } from '@/utils/locationUtils';

// Default location (can be changed to any default coordinates)
const DEFAULT_LOCATION = {
  latitude: 37.7749,
  longitude: -122.4194
};

type UserState = {
  users: UserProfile[];
  nearbyUsers: UserProfile[];
  isLoading: boolean;
  error: string | null;
  searchRadius: number;
  lastLocation: { latitude: number; longitude: number };
};

type UserActions = {
  fetchNearbyUsers: (latitude: number, longitude: number) => Promise<void>;
  updateSearchRadius: (radius: number) => void;
  rateUser: (userId: string, rating: number) => Promise<void>;
  updateUserLocation: (latitude: number, longitude: number) => Promise<void>;
};

export const useUserStore = create<UserState & UserActions>((set, get) => ({
  users: [],
  nearbyUsers: [],
  isLoading: false,
  error: null,
  searchRadius: 5,
  lastLocation: DEFAULT_LOCATION,

  fetchNearbyUsers: async (latitude, longitude) => {
    const state = get();
    
    // If we have a last location and it's close to the current location, skip update
    if (state.lastLocation) {
      const distance = calculateDistance(
        latitude,
        longitude,
        state.lastLocation.latitude,
        state.lastLocation.longitude
      );
      
      // Only update if moved more than 100 meters
      if (distance < 0.1) {
        return;
      }
    }

    set({ isLoading: true, error: null });
    try {
      // Mock API call - replace with actual API integration
      const mockUsers: UserProfile[] = [
        {
          id: '1',
          name: 'Alex Johnson',
          age: 28,
          bio: 'Photography enthusiast and coffee lover',
          image: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg',
          interests: ['Photography', 'Coffee', 'Hiking'],
          activities: ['Running', 'Yoga'],
          location: {
            latitude: latitude + 0.01,
            longitude: longitude - 0.01,
          },
          rating: { average: 4.8, count: 12 },
          lastActive: new Date().toISOString(),
        },
        // Add more mock users...
      ];

      // Calculate distance and sort by proximity
      const usersWithDistance = mockUsers.map(user => ({
        ...user,
        distance: calculateDistance(
          latitude,
          longitude,
          user.location.latitude,
          user.location.longitude
        )
      }));

      const nearbyUsers = usersWithDistance
        .filter(user => user.distance <= state.searchRadius)
        .sort((a, b) => a.distance - b.distance);

      set({ 
        users: mockUsers,
        nearbyUsers,
        lastLocation: { latitude, longitude },
        isLoading: false 
      });
    } catch (error) {
      set({ 
        isLoading: false, 
        error: (error as Error).message 
      });
    }
  },

  updateSearchRadius: (radius) => {
    set({ searchRadius: radius });
  },

  rateUser: async (userId, rating) => {
    set({ isLoading: true });
    try {
      // Mock API call - replace with actual API integration
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      set(state => ({
        users: state.users.map(user => 
          user.id === userId 
            ? {
                ...user,
                rating: {
                  average: (user.rating.average * user.rating.count + rating) / (user.rating.count + 1),
                  count: user.rating.count + 1
                }
              }
            : user
        ),
        isLoading: false
      }));
    } catch (error) {
      set({ 
        isLoading: false, 
        error: (error as Error).message 
      });
    }
  },

  updateUserLocation: async (latitude, longitude) => {
    try {
      // Mock API call - replace with actual API integration
      await new Promise(resolve => setTimeout(resolve, 500));
      
      set({ lastLocation: { latitude, longitude } });
      
      // Fetch nearby users with new location
      await get().fetchNearbyUsers(latitude, longitude);
    } catch (error) {
      console.error('Error updating user location:', error);
      // If location update fails, use default location
      set({ lastLocation: DEFAULT_LOCATION });
    }
  }
}));