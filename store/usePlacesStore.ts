import { create } from 'zustand';
import { Place } from '@/types';

type PlacesState = {
  places: Place[];
  popularPlaces: Place[];
  isLoading: boolean;
  error: string | null;
};

type PlacesActions = {
  searchPlaces: (query: string, latitude: number, longitude: number) => Promise<void>;
  fetchNearbyPlaces: (latitude: number, longitude: number, radius?: number) => Promise<void>;
  fetchPopularPlaces: (latitude: number, longitude: number) => Promise<void>;
};

export const usePlacesStore = create<PlacesState & PlacesActions>((set) => ({
  places: [],
  popularPlaces: [],
  isLoading: false,
  error: null,

  searchPlaces: async (query, latitude, longitude) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/textsearch/json?` +
        `query=${encodeURIComponent(query)}&` +
        `location=${latitude},${longitude}&` +
        `key=AIzaSyBafJwGgZ9B10l6cH5x9wfJLv5ye6lTDMw`
      );

      if (!response.ok) {
        throw new Error('Failed to search places');
      }

      const data = await response.json();
      
      const places: Place[] = data.results.map((place: any) => ({
        id: place.place_id,
        name: place.name,
        category: place.types[0],
        location: {
          latitude: place.geometry.location.lat,
          longitude: place.geometry.location.lng,
        },
        userCount: Math.floor(Math.random() * 20), // Mock data
        rating: place.rating || 0,
        distance: 0, // Calculate this based on user location
        image: place.photos?.[0]?.photo_reference 
          ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${place.photos[0].photo_reference}&key=AIzaSyBafJwGgZ9B10l6cH5x9wfJLv5ye6lTDMw`
          : 'https://images.pexels.com/photos/260922/pexels-photo-260922.jpeg',
      }));

      set({ 
        places,
        isLoading: false 
      });
    } catch (error) {
      set({ 
        isLoading: false, 
        error: (error as Error).message 
      });
    }
  },

  fetchNearbyPlaces: async (latitude, longitude, radius = 5) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/nearbysearch/json?` +
        `location=${latitude},${longitude}&` +
        `radius=${radius * 1000}&` +
        `type=restaurant|bar|cafe&` +
        `key=AIzaSyBafJwGgZ9B10l6cH5x9wfJLv5ye6lTDMw`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch places');
      }

      const data = await response.json();
      
      const places: Place[] = data.results.map((place: any) => ({
        id: place.place_id,
        name: place.name,
        category: place.types[0],
        location: {
          latitude: place.geometry.location.lat,
          longitude: place.geometry.location.lng,
        },
        userCount: Math.floor(Math.random() * 20), // Mock data
        rating: place.rating || 0,
        distance: 0, // Calculate this based on user location
        image: place.photos?.[0]?.photo_reference 
          ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${place.photos[0].photo_reference}&key=AIzaSyBafJwGgZ9B10l6cH5x9wfJLv5ye6lTDMw`
          : 'https://images.pexels.com/photos/260922/pexels-photo-260922.jpeg',
      }));

      set({ 
        places,
        isLoading: false 
      });
    } catch (error) {
      set({ 
        isLoading: false, 
        error: (error as Error).message 
      });
    }
  },

  fetchPopularPlaces: async (latitude, longitude) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/nearbysearch/json?` +
        `location=${latitude},${longitude}&` +
        `rankby=rating&` +
        `type=restaurant|bar|cafe&` +
        `key=AIzaSyBafJwGgZ9B10l6cH5x9wfJLv5ye6lTDMw`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch popular places');
      }

      const data = await response.json();
      
      const places: Place[] = data.results.map((place: any) => ({
        id: place.place_id,
        name: place.name,
        category: place.types[0],
        location: {
          latitude: place.geometry.location.lat,
          longitude: place.geometry.location.lng,
        },
        userCount: Math.floor(Math.random() * 20), // Mock data
        rating: place.rating || 0,
        distance: 0, // Calculate this based on user location
        image: place.photos?.[0]?.photo_reference 
          ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${place.photos[0].photo_reference}&key=AIzaSyBafJwGgZ9B10l6cH5x9wfJLv5ye6lTDMw`
          : 'https://images.pexels.com/photos/260922/pexels-photo-260922.jpeg',
      }));

      set({ 
        popularPlaces: places,
        isLoading: false 
      });
    } catch (error) {
      set({ 
        isLoading: false, 
        error: (error as Error).message 
      });
    }
  }
}));